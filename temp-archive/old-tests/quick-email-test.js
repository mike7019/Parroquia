import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('🔍 Testing Gmail Configuration...');
console.log('Email:', process.env.SMTP_USER);
console.log('Password set:', process.env.SMTP_PASS ? 'YES' : 'NO');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

console.log('\n📡 Testing SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Go to https://myaccount.google.com/security');
    console.log('2. Sign in and complete any security verifications');
    console.log('3. Generate a NEW app password');
    console.log('4. Update the SMTP_PASS in your .env file');
  } else {
    console.log('✅ Connection successful!');
    console.log('🎉 Gmail SMTP is working correctly!');
  }
  process.exit(0);
});
