#!/usr/bin/env node

/**
 * Simple Email Service Test
 * Tests SMTP configuration directly without complex imports
 */

const { config } = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🔧 Email Configuration Check\n');

const emailServiceType = process.env.EMAIL_SERVICE_TYPE;
const emailProvider = process.env.EMAIL_PROVIDER;
const fromName = process.env.FROM_NAME;

console.log(`EMAIL_SERVICE_TYPE: ${emailServiceType}`);
console.log(`EMAIL_PROVIDER: ${emailProvider}`);
console.log(`FROM_NAME: ${fromName}\n`);

if (emailServiceType !== 'production') {
  console.log('❌ EMAIL_SERVICE_TYPE must be "production" to test real email sending');
  console.log('Current value:', emailServiceType);
  process.exit(1);
}

let smtpConfig;
let fromEmail;

if (emailProvider === 'gmail') {
  const gmailEmail = process.env.GMAIL_EMAIL;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  console.log(`Gmail Email: ${gmailEmail}`);
  console.log(`Gmail Password: ${gmailPassword ? '✓ Set (' + gmailPassword.substring(0, 4) + '...)' : '❌ Missing'}\n`);

  if (!gmailEmail || !gmailPassword || gmailEmail === 'your_email@gmail.com') {
    console.log('❌ Gmail configuration incomplete!');
    console.log('Please set real values in .env.local:');
    console.log('GMAIL_EMAIL=your_actual_email@gmail.com');
    console.log('GMAIL_APP_PASSWORD=your_16_character_app_password');
    console.log('\n📋 To get Gmail App Password:');
    console.log('1. Go to Google Account → Security');
    console.log('2. Enable 2-Factor Authentication');
    console.log('3. Generate App Password for Mail');
    process.exit(1);
  }

  smtpConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: gmailEmail,
      pass: gmailPassword,
    },
  };
  fromEmail = gmailEmail;

} else if (emailProvider === 'brevo') {
  const brevoEmail = process.env.BREVO_EMAIL;
  const brevoApiKey = process.env.BREVO_API_KEY;

  console.log(`Brevo Email: ${brevoEmail}`);
  console.log(`Brevo API Key: ${brevoApiKey ? '✓ Set (' + brevoApiKey.substring(0, 8) + '...)' : '❌ Missing'}\n`);

  if (!brevoEmail || !brevoApiKey || brevoEmail === 'your_email@domain.com') {
    console.log('❌ Brevo configuration incomplete!');
    console.log('Please set real values in .env.local:');
    console.log('BREVO_EMAIL=your_verified_email@domain.com');
    console.log('BREVO_API_KEY=your_brevo_smtp_key');
    console.log('\n📋 To get Brevo credentials:');
    console.log('1. Sign up at brevo.com');
    console.log('2. Go to Settings → SMTP & API');
    console.log('3. Generate SMTP key');
    process.exit(1);
  }

  smtpConfig = {
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: brevoEmail,
      pass: brevoApiKey,
    },
  };
  fromEmail = brevoEmail;

} else {
  console.log('❌ Unsupported email provider:', emailProvider);
  console.log('Supported providers: gmail, brevo');
  process.exit(1);
}

async function testEmailConnection() {
  try {
    console.log('🔌 Testing SMTP connection...');

    // Create transporter
    const transporter = nodemailer.createTransport(smtpConfig);

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    console.log('📧 Sending test email...');

    const mailOptions = {
      from: {
        name: fromName || 'Fitness Platform',
        address: fromEmail,
      },
      to: fromEmail, // Send to yourself
      subject: '🧪 Email Configuration Test - Success!',
      html: `
        <h2>🎉 Email Test Successful!</h2>
        <p>Your <strong>${emailProvider}</strong> email configuration is working correctly.</p>
        <p><strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: #666; font-size: 14px;">
          Your fitness platform is ready to send trainee invitations!
        </p>
      `,
      text: `
Email Configuration Test - SUCCESS!

Your ${emailProvider} email configuration is working correctly.

From: ${fromName} <${fromEmail}>
Time: ${new Date().toLocaleString()}

Your fitness platform is ready to send trainee invitations!
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Test email sent successfully!');
    console.log(`📨 Message ID: ${info.messageId}`);
    console.log(`📬 Check your inbox at: ${fromEmail}`);
    console.log('');
    console.log('🎉 Your email configuration is working perfectly!');
    console.log('🚀 Ready to send trainee invitations!');

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);

    if (error.code) {
      console.error('Error code:', error.code);
    }

    console.log('\n🔧 Common fixes:');

    if (emailProvider === 'gmail') {
      console.log('• Make sure 2FA is enabled on your Google account');
      console.log('• Use App Password, not your regular password');
      console.log('• Check if "Less secure app access" is disabled (it should be)');
    } else if (emailProvider === 'brevo') {
      console.log('• Verify your sender email in Brevo dashboard');
      console.log('• Use SMTP key, not API key');
      console.log('• Check your Brevo account status');
    }

    console.log('• Check your internet connection');
    console.log('• Verify firewall settings');

    process.exit(1);
  }
}

// Run the test
testEmailConnection();