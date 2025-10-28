// OAuth2 Configuration for Gmail
// This is an alternative approach that may work better in some hosting environments

require('dotenv').config();

const oauthConfig = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    accessToken: process.env.GOOGLE_ACCESS_TOKEN // Optional - can be generated from refresh token
  },
  tls: {
    rejectUnauthorized: true,
    ciphers: 'SSLv3',
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3'
  },
  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000
};

module.exports = oauthConfig;