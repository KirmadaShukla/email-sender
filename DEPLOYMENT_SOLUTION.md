# Email Service Deployment Solution

## Problem
The email service works locally but fails on Render with "Connection timeout" error when trying to connect to Gmail's SMTP server.

## Root Cause
Cloud hosting platforms like Render often have network restrictions that block outbound connections to external SMTP servers for security reasons.

## Solutions

### 1. Immediate Fix - Environment Variables
Ensure your Render environment has the correct environment variables:
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASS` - Your Gmail App Password (not regular password)
- `PORT` - Set to 10000 (Render's required port)

### 2. Alternative Email Providers
If Gmail continues to have issues, consider using email services designed for cloud environments:
- SendGrid
- Mailgun
- AWS SES
- Render's built-in email service (if available)

### 3. Network Configuration
Contact Render support to verify if:
- Outbound SMTP connections are allowed
- There are specific IP addresses or ports that need to be whitelisted

### 4. Code Improvements
The updated server.js includes:
- Better timeout handling
- Improved error messages
- Fallback mechanisms
- Connection pooling
- Enhanced logging

## Testing
Use the new endpoints to test:
- `GET /test-transporter` - Check transporter configuration
- `POST /reinit-transporter` - Reinitialize transporter if needed

## Required Environment Variables
Create a .env file with:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
RECIPIENT_EMAIL=recipient@example.com
PORT=3000
```

On Render, set these as environment variables in your dashboard.