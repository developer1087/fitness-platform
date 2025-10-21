#!/usr/bin/env node

/**
 * Email Service Test Script
 *
 * This script tests the production email service configuration.
 * Run with: node scripts/test-email.js
 *
 * Make sure to set up your .env.local file with proper email credentials first!
 */

const { config } = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🔧 Loading environment variables...');
console.log('EMAIL_SERVICE_TYPE:', process.env.EMAIL_SERVICE_TYPE);
console.log('EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER);
console.log('FROM_NAME:', process.env.FROM_NAME);

if (process.env.EMAIL_PROVIDER === 'brevo') {
  console.log('BREVO_EMAIL:', process.env.BREVO_EMAIL ? '✓ Set' : '❌ Missing');
  console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✓ Set' : '❌ Missing');
} else if (process.env.EMAIL_PROVIDER === 'gmail') {
  console.log('GMAIL_EMAIL:', process.env.GMAIL_EMAIL ? '✓ Set' : '❌ Missing');
  console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✓ Set' : '❌ Missing');
}

console.log('');

async function testEmailService() {
  try {
    console.log('🧪 Testing Production Email Service...\n');

    // Check if production email service is enabled
    if (process.env.EMAIL_SERVICE_TYPE !== 'production') {
      console.log('❌ EMAIL_SERVICE_TYPE is not set to "production"');
      console.log('Please set EMAIL_SERVICE_TYPE=production in your .env.local file');
      process.exit(1);
    }

    // Email service is now in the web app repository (fitness-platform-web)
    console.log('❌ Email service is not available in this mobile-only repository');
    console.log('🌐 Email service is located in: fitness-platform-web repository');
    console.log('📧 Please run email tests from the web app repository');
    process.exit(1);

    console.log('📧 Email Provider:', process.env.EMAIL_PROVIDER);
    console.log('📨 From Name:', process.env.FROM_NAME);
    console.log('');

    // Test configuration
    console.log('🔧 Testing email configuration...');
    const success = await ProductionEmailService.testConfiguration();

    if (success) {
      console.log('');
      console.log('🎉 Email service test completed successfully!');
      console.log('✅ Your email configuration is working correctly.');
      console.log('📮 Check your email inbox for the test message.');
      console.log('');
      console.log('🚀 Ready for production use!');
    } else {
      console.log('');
      console.log('❌ Email service test failed.');
      console.log('Please check your configuration and credentials.');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Error testing email service:', error.message);
    console.log('');

    if (error.message.includes('environment variables')) {
      console.log('📋 Required environment variables:');

      if (process.env.EMAIL_PROVIDER === 'gmail') {
        console.log('  - GMAIL_EMAIL');
        console.log('  - GMAIL_APP_PASSWORD');
      } else if (process.env.EMAIL_PROVIDER === 'brevo') {
        console.log('  - BREVO_EMAIL');
        console.log('  - BREVO_API_KEY');
      } else if (process.env.EMAIL_PROVIDER === 'custom') {
        console.log('  - SMTP_HOST');
        console.log('  - SMTP_EMAIL');
        console.log('  - SMTP_PASSWORD');
      }

      console.log('');
      console.log('🔧 Please set these in your .env.local file and try again.');
    }

    process.exit(1);
  }
}

// Run the test
testEmailService();