import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('🔍 Testing Alternative Outlook Configuration...');

// Alternative Outlook SMTP configurations to try
const configs = [
  {
    name: 'Standard Outlook SMTP',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  {
    name: 'Legacy Outlook SMTP',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  {
    name: 'Secure Outlook SMTP',
    host: 'smtp.office365.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  }
];

async function testConfigs() {
  for (const config of configs) {
    console.log(`\n🔧 Testing: ${config.name}`);
    console.log(`   Host: ${config.host}:${config.port} (secure: ${config.secure})`);
    
    const transporter = nodemailer.createTransport(config);
    
    try {
      await transporter.verify();
      console.log(`✅ ${config.name} - Connection successful!`);
      
      // If connection successful, try sending test email
      const mailOptions = {
        from: `"Test Parroquia" <${process.env.SMTP_FROM_EMAIL}>`,
        to: 'miguel7019@yopmail.com',
        subject: 'Test Email - Working Configuration',
        text: `This email was sent using: ${config.name}`
      };
      
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ ${config.name} - Email sent successfully!`);
      console.log(`   Message ID: ${result.messageId}`);
      
      console.log(`\n🎉 WORKING CONFIGURATION FOUND: ${config.name}`);
      console.log('Update your .env file with:');
      console.log(`SMTP_HOST=${config.host}`);
      console.log(`SMTP_PORT=${config.port}`);
      if (config.secure) {
        console.log('SMTP_SECURE=true');
      }
      
      break; // Stop testing if this one works
      
    } catch (error) {
      console.log(`❌ ${config.name} - Failed: ${error.message}`);
    }
  }
}

testConfigs().then(() => {
  console.log('\n🏁 Testing completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error during testing:', error);
  process.exit(1);
});
