require('dotenv').config();

console.log('Environment Variables Check:');
console.log('============================');

console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
console.log('RECIPIENT_EMAIL:', process.env.RECIPIENT_EMAIL ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || '3000 (default)');
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS || 'Not set (using wildcard)');

console.log('\nDetailed Information:');
console.log('====================');

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log('✅ Environment variables appear to be set correctly.');
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
  console.log('🔐 EMAIL_PASS: ***PROTECTED***');
  
  if (process.env.RECIPIENT_EMAIL) {
    console.log('📩 RECIPIENT_EMAIL:', process.env.RECIPIENT_EMAIL);
  } else {
    console.log('📩 RECIPIENT_EMAIL: Not set (will use EMAIL_USER as recipient)');
  }
} else {
  console.log('❌ WARNING: Required environment variables are missing!');
  console.log('Please ensure you have a .env file with EMAIL_USER and EMAIL_PASS variables set.');
  console.log('\nTo fix this issue:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Edit .env and add your actual Gmail credentials');
  console.log('3. For Gmail, use an App Password, not your regular password');
  console.log('   (Enable 2FA on your Google account and generate an App Password)');
}

console.log('\nServer Configuration:');
console.log('====================');
console.log('Server will run on port:', process.env.PORT || 3000);