require('dotenv').config();

console.log('Environment Variables Check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
console.log('RECIPIENT_EMAIL:', process.env.RECIPIENT_EMAIL ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || '3000 (default)');

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log('\\nEnvironment variables appear to be set correctly.');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
} else {
  console.log('\\nWARNING: Required environment variables are missing!');
  console.log('Please ensure you have a .env file with EMAIL_USER and EMAIL_PASS variables set.');
}