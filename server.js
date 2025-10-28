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

// Enhanced transporter creation with multiple provider support
function createTransporter() {
  try {
    // Check if required environment variables are present
    const emailUser = process.env.EMAIL_USER || 'abhiisheek1@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'kyqd ecvf avzp ayzo';
    
    console.log('EMAIL_USER:', emailUser ? `${emailUser.substring(0, 5)}...` : 'Not set');
    console.log('EMAIL_PASS:', emailPass ? 'SET' : 'Not set');
    
    // Try SendGrid first if API key is provided
    if (process.env.SENDGRID_API_KEY) {
      console.log('Using SendGrid transporter');
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    }
    
    // Try Mailgun if API key is provided
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      console.log('Using Mailgun transporter');
      return nodemailer.createTransport({
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAILGUN_DOMAIN,
          pass: process.env.MAILGUN_API_KEY
        }
      });
    }
    
    // Fallback to Gmail with optimized settings
    console.log('Using Gmail transporter with optimized settings');
    const gmailConfig = {
      service: "gmail",
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    };

    const transporter = nodemailer.createTransport(gmailConfig);
    
    return transporter;
  } catch (error) {
    console.error('Failed to create transporter:', error);
    return null;
  }
}

// Create transporter
let transporter = createTransporter();

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  try {
    const {email, password} = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required fields'
      });
    }
    
    console.log('Received request to send email to:', email);
    
    // Check if transporter exists
    if (!transporter) {
      console.error('Transporter not initialized');
      return res.status(500).json({
        success: false,
        message: 'Email service is not properly configured. Please check server logs and environment variables.'
      });
    }
    
    // Try to send email
    console.log('Attempting to send email...');
    let info;
    
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'abhiisheek1@gmail.com',
        to: email,
        subject: 'Login Credentials',
        text: 'Your login credentials are: \n Email: ' + email + '\n Password: ' + password
      };
      
      info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully, info:', info.messageId);
    } catch (sendError) {
      console.error('SendMail error:', sendError);
      
      // Provide specific error messages
      let errorMessage = 'Failed to send email';
      
      if (sendError.code === 'ECONNECTION' || sendError.code === 'ETIMEDOUT') {
        errorMessage = 'Connection to email server failed. This is a common issue in cloud hosting environments. Consider using SendGrid or Mailgun for reliable email delivery.';
      } else if (sendError.code === 'EAUTH') {
        errorMessage = 'Authentication failed. Please verify your email credentials are correct.';
      } else {
        errorMessage = 'Failed to send email: ' + sendError.message;
      }
      
      return res.status(500).json({
        success: false,
        message: errorMessage,
        code: sendError.code || 'SEND_ERROR'
      });
    }
    
    // Success response
    if (info) {
      console.log('Email sent successfully');
      res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully', 
        messageId: info.messageId
      });
    } else {
      console.log('Email function completed but no info object returned');
      res.status(200).json({ 
        success: true, 
        message: 'Email function completed successfully'
      });
    }
  } catch (error) {
    console.error('Unexpected error in send-email endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An unexpected error occurred while sending the email',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Email API is running!',
    timestamp: new Date().toISOString(),
    transporter: transporter ? 'configured' : 'not configured',
    env: {
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET',
      MAILGUN_API_KEY: process.env.MAILGUN_API_KEY ? 'SET' : 'NOT SET'
    }
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Log environment info
  console.log('Environment variables:');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 5)}...` : 'Not set');
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'Not set');
  console.log('- SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'Not set');
  console.log('- MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY ? 'SET' : 'Not set');
  console.log('- PORT:', PORT);
  
  // Test transporter availability
  if (transporter) {
    console.log('Transporter initialized successfully');
  } else {
    console.log('WARNING: Transporter failed to initialize');
  }
});