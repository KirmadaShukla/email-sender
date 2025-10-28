require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=== Email Configuration Diagnosis ===\n');

// Check environment variables
console.log('1. Environment Variables Check:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
console.log('   RECIPIENT_EMAIL:', process.env.RECIPIENT_EMAIL ? 'SET' : 'NOT SET');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('   ❌ ERROR: Required email credentials are missing!\n');
  console.log('   Solution:');
  console.log('   - Create a .env file in your project root');
  console.log('   - Add EMAIL_USER=your_email@gmail.com');
  console.log('   - Add EMAIL_PASS=your_app_password (not your regular password)');
  console.log('   - For Gmail, you need to use an App Password, not your regular password\n');
  process.exit(1);
}

console.log('\n2. Testing Transporter Configuration...\n');

// Create transporter with detailed configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  tls: {
    rejectUnauthorized: false
  },
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
});

// Test connection
async function testConnection() {
  try {
    console.log('   Attempting to verify transporter...');
    await transporter.verify();
    console.log('   ✅ Connection verified successfully!\n');
    
    // Test sending a dummy email to self
    console.log('   Attempting to send test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER,
      subject: 'Test Email from Diagnostics',
      text: 'This is a test email to confirm email functionality works correctly.'
    });
    
    console.log('   ✅ Test email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
  } catch (error) {
    console.log('   ❌ Connection failed with error:');
    console.log('   Error Name:', error.name);
    console.log('   Error Message:', error.message);
    console.log('   Error Code:', error.code);
    
    if (error.command) {
      console.log('   Failed Command:', error.command);
    }
    
    console.log('\n   Possible Solutions:');
    if (error.message.includes('timeout')) {
      console.log('   - Check your network connection');
      console.log('   - Verify firewall settings are not blocking SMTP traffic');
      console.log('   - Try using a different network connection');
    } else if (error.message.includes('auth') || error.message.includes('Authentication')) {
      console.log('   - Double-check your EMAIL_USER and EMAIL_PASS values');
      console.log('   - For Gmail, ensure you are using an App Password, not your regular password');
      console.log('   - Ensure 2-Factor Authentication is enabled on your Google account');
      console.log('   - Generate a new App Password if the current one is invalid');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   - The SMTP server refused the connection');
      console.log('   - Check if smtp.gmail.com is accessible from your network');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   - DNS resolution failed for smtp.gmail.com');
      console.log('   - Check your DNS settings or network connectivity');
    }
  }
}

testConnection().then(() => {
  console.log('\n=== Diagnosis Complete ===');
});