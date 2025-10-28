# Email Sender Service

A simple Node.js service for sending emails using Gmail SMTP.

## Setup Instructions

1. **Create Environment File**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. **Configure Gmail Credentials**
   Edit the `.env` file and add your Gmail credentials:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

   **Important**: For Gmail, you need to use an App Password, not your regular password:
   - Enable 2-Factor Authentication on your Google account
   - Generate an App Password specifically for this service
   - Use the App Password as the `EMAIL_PASS` value

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Service**
   ```bash
   # Production mode
   npm start
   
   # Development mode (with auto-reload)
   npm run dev
   ```

## Available Endpoints

- `POST /send-email` - Send an email with credentials
- `GET /` - Health check endpoint
- `POST /reinit-transporter` - Reinitialize the email transporter

## Troubleshooting

If you're experiencing connection timeout issues:

1. **Run Diagnostic Tool**
   ```bash
   npm run diagnose
   ```

2. **Common Issues and Solutions**
   
   **Connection Timeout**
   - Check your network connection
   - Verify firewall settings aren't blocking SMTP traffic on port 465
   - Try using a different network connection
   
   **Authentication Errors**
   - Double-check your EMAIL_USER and EMAIL_PASS values
   - Ensure you're using an App Password for Gmail, not your regular password
   - Make sure 2-Factor Authentication is enabled on your Google account
   - Generate a new App Password if the current one may be invalid
   
   **Network Issues**
   - Some corporate networks block SMTP traffic
   - Consider using a different email provider or service like SendGrid
   - Try connecting through a VPN if network restrictions are suspected

3. **Testing with cURL**
   ```bash
   curl -X POST http://localhost:3000/send-email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com", "password":"testpassword"}'
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| EMAIL_USER | Your Gmail address | Yes |
| EMAIL_PASS | Your Gmail App Password | Yes |
| RECIPIENT_EMAIL | Recipient email (defaults to EMAIL_USER) | No |
| PORT | Server port (defaults to 3000) | No |

## Security Notes

- Never commit your `.env` file to version control
- Use App Passwords for Gmail rather than your main account password
- Store credentials securely and rotate them periodically