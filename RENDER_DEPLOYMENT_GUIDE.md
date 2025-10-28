# Render Deployment Guide for Email Service

## Problem Summary
Your email service works locally but fails on Render with "Connection timeout" errors when connecting to Gmail's SMTP server.

## Root Cause
Cloud platforms like Render often restrict outbound SMTP connections for security reasons, which prevents direct connections to Gmail's SMTP servers.

## Solution Options

### Option 1: Environment Variables (Quick Fix)
Ensure your Render environment has the correct variables:
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASS` - Your Gmail App Password (not regular password)
- `PORT` - Set to 10000 (Render's required port)

### Option 2: Use Render's Email Service
Render provides an email service that works within their platform. Check their documentation for details.

### Option 3: Third-Party Email Services
Use email services designed for cloud environments:
- SendGrid (Recommended)
- Mailgun
- AWS SES

## Implementation Steps

### 1. Create Gmail App Password
1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification > App passwords
3. Generate a new app password for "Mail"
4. Use this password in your EMAIL_PASS variable

### 2. Configure Render Environment Variables
In your Render dashboard:
1. Go to your service settings
2. Navigate to "Environment Variables"
3. Add:
   - Key: `EMAIL_USER`, Value: your-email@gmail.com
   - Key: `EMAIL_PASS`, Value: your-app-password
   - Key: `PORT`, Value: 10000

### 3. Update Your Code for Better Error Handling
The updated server.js includes:
- Enhanced timeout handling
- Better error messages
- Fallback mechanisms
- Connection pooling
- Diagnostic endpoints

## Diagnostic Endpoints
- `GET /` - Health check
- `GET /test-transporter` - Test transporter configuration
- `POST /reinit-transporter` - Reinitialize transporter

## Troubleshooting

### If You Still Get Connection Timeouts
1. Try using SendGrid instead of Gmail:
   ```javascript
   const sendgridTransport = {
     host: 'smtp.sendgrid.net',
     port: 587,
     secure: false,
     auth: {
       user: 'apikey',
       pass: process.env.SENDGRID_API_KEY
     }
   };
   ```

2. Contact Render support about SMTP restrictions

### Common Issues
1. Using regular Gmail password instead of App Password
2. Not setting the PORT environment variable to 10000
3. Incorrect environment variable names
4. Network restrictions in cloud environment

## Testing Locally
1. Create a `.env` file:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   PORT=3000
   ```

2. Run the service:
   ```bash
   npm start
   ```

3. Test the endpoint:
   ```bash
   curl -X POST http://localhost:3000/send-email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com", "password":"test123"}'
   ```

## Security Best Practices
1. Never commit passwords to version control
2. Use environment variables for sensitive data
3. Rotate App Passwords regularly
4. Monitor email sending activity

## Alternative: Using SendGrid
If Gmail continues to have issues:

1. Sign up for SendGrid
2. Get an API key
3. Set environment variable:
   - Key: `SENDGRID_API_KEY`, Value: your-api-key
4. Update transporter configuration:
   ```javascript
   const transporter = nodemailer.createTransport({
     host: 'smtp.sendgrid.net',
     port: 587,
     secure: false,
     auth: {
       user: 'apikey',
       pass: process.env.SENDGRID_API_KEY
     }
   });
   ```