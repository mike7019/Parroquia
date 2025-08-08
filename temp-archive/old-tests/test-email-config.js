import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('🔍 Testing Email Configuration...');
console.log('Environment variables:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
console.log('SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

console.log('\n🔧 Transporter configuration:');
console.log('Host:', transporter.options.host);
console.log('Port:', transporter.options.port);
console.log('User:', transporter.options.auth.user);

// Test connection
console.log('\n📡 Testing SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection failed:', error.message);
  } else {
    console.log('✅ SMTP connection successful!');
  }
  
  // Test sending a simple email
  console.log('\n📧 Testing email sending...');
  const mailOptions = {
    from: `"Test Parroquia" <${process.env.SMTP_FROM_EMAIL}>`,
    to: 'miguel7019@yopmail.com',
    subject: 'Test Email - Configuration Check',
    text: 'This is a test email to verify SMTP configuration.'
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Email sending failed:', error.message);
    } else {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', info.messageId);
    }
    
    process.exit(0);
  });
});
