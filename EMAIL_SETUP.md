# 📧 Production Email Setup Guide

This guide will help you set up production-ready email service for sending trainee invitations using **Nodemailer with SMTP**.

## 📋 Supported Email Providers

| Provider | Best For | Cost | Setup Difficulty |
|----------|----------|------|------------------|
| **Gmail** | Small-medium apps | Free (limited) | Easy ⭐⭐⭐ |
| **Brevo** | Professional apps | Free tier available | Medium ⭐⭐ |
| **Custom SMTP** | Enterprise/Custom | Varies | Advanced ⭐ |

---

## 🟢 Option 1: Gmail SMTP (Recommended for getting started)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification**
3. Follow the setup process

### Step 2: Generate App Password
1. In Security settings, click **App passwords**
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter: `Fitness Platform`
5. Copy the **16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables
Edit your `.env.local` file:

```env
EMAIL_SERVICE_TYPE=production
EMAIL_PROVIDER=gmail
FROM_NAME=Your Fitness Platform

# Replace with your actual credentials
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### Gmail Limitations
- ⚠️ **500 emails/day limit** for free accounts
- ⚠️ **Rate limiting** (avoid rapid sending)
- ✅ **Reliable delivery** to all major providers
- ✅ **Good reputation** (less likely to be marked as spam)

---

## 🔵 Option 2: Brevo SMTP (Recommended for production)

### Step 1: Create Brevo Account
1. Sign up at [Brevo.com](https://www.brevo.com/)
2. Verify your email address
3. Complete account setup

### Step 2: Get SMTP Credentials
1. Go to **Settings** → **SMTP & API**
2. Click **Generate a new SMTP key**
3. Copy your **SMTP key**

### Step 3: Configure Environment Variables
Edit your `.env.local` file:

```env
EMAIL_SERVICE_TYPE=production
EMAIL_PROVIDER=brevo
FROM_NAME=Your Fitness Platform

# Replace with your actual credentials
BREVO_EMAIL=your_verified_email@domain.com
BREVO_API_KEY=your_brevo_smtp_key
```

### Brevo Benefits
- ✅ **300 emails/day free** (9,000/month)
- ✅ **Professional deliverability**
- ✅ **Email analytics**
- ✅ **Transactional email focused**
- ✅ **EU-compliant** (GDPR)

---

## ⚫ Option 3: Custom SMTP

For advanced users with their own email server or enterprise SMTP:

```env
EMAIL_SERVICE_TYPE=production
EMAIL_PROVIDER=custom
FROM_NAME=Your Fitness Platform

SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_EMAIL=noreply@yourdomain.com
SMTP_PASSWORD=your_smtp_password
SMTP_SECURE=false
```

---

## 🧪 Testing Your Configuration

### Method 1: Test Script
```bash
# Make sure your .env.local is configured first
node scripts/test-email.js
```

### Method 2: Manual Test in App
1. Start your development server
2. Try adding a trainee with your own email
3. Check if you receive the invitation

### Method 3: Configuration Check
```javascript
// In browser console or Node.js
const { ProductionEmailService } = require('./apps/web/src/lib/productionEmailService');
console.log(ProductionEmailService.getConfigInfo());
```

---

## 🚀 Deployment Configurations

### Development Environment
```env
# .env.development or .env.local
EMAIL_SERVICE_TYPE=mock  # Uses console logging
```

### Production Environment
```env
# .env.production
EMAIL_SERVICE_TYPE=production
EMAIL_PROVIDER=brevo  # or gmail
# ... provider-specific credentials
```

---

## 🔧 Advanced Configuration

### Email Template Customization
The service uses your existing email templates from `emailService.ts`. To customize:

1. Edit the HTML template in `generateInvitationEmail()`
2. Add your branding, colors, and styling
3. Test with multiple email clients

### Error Handling
The service includes comprehensive error handling:

- ✅ Connection verification
- ✅ Credential validation
- ✅ Detailed error logging
- ✅ Fallback to mock in development

### Rate Limiting
To avoid hitting provider limits:

```javascript
// Add delays between emails if needed
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
```

---

## 🚨 Troubleshooting

### Common Issues

#### Gmail "Less Secure Apps" Error
- ❌ **Old solution**: Enable "Less secure apps"
- ✅ **Correct solution**: Use App Passwords (2FA required)

#### Brevo Authentication Failed
- Check your SMTP key (not API key)
- Verify email address is confirmed in Brevo
- Ensure sender email matches your Brevo account

#### Connection Timeout
- Check firewall settings
- Verify SMTP port (587 for TLS, 465 for SSL)
- Try different ports: 587, 465, 25

#### Emails Going to Spam
- Set up SPF records for your domain
- Configure DKIM signing (provider-specific)
- Use consistent sender name and email
- Avoid spam-trigger words in subject lines

### Debug Logs
Enable detailed logging:

```env
DEBUG=nodemailer:*
NODE_ENV=development
```

---

## 📊 Production Recommendations

### For Small Apps (< 100 users)
- **Use Gmail** with App Passwords
- **Monitor daily limits**
- **Plan upgrade path**

### For Growing Apps (100-1000 users)
- **Use Brevo** free tier
- **Set up domain authentication**
- **Monitor deliverability**

### For Enterprise Apps (1000+ users)
- **Upgrade to Brevo Pro** or enterprise SMTP
- **Implement email queues**
- **Add retry logic**
- **Monitor reputation**

---

## 🔐 Security Best Practices

1. **Never commit credentials** to git
2. **Use environment variables** only
3. **Rotate passwords** regularly
4. **Monitor failed attempts**
5. **Use HTTPS** for all web traffic
6. **Validate email addresses** before sending

---

## 📈 Monitoring

Track email performance:
- **Delivery rates**
- **Open rates** (if implemented)
- **Bounce rates**
- **Spam complaints**

---

## 🆘 Need Help?

1. **Check logs** in browser console or server
2. **Test configuration** with test script
3. **Verify credentials** in provider dashboard
4. **Review firewall** and network settings
5. **Contact provider support** if needed

---

## ✅ Quick Setup Checklist

- [ ] Choose email provider (Gmail/Brevo/Custom)
- [ ] Create account and get credentials
- [ ] Configure `.env.local` with credentials
- [ ] Test configuration: `node scripts/test-email.js`
- [ ] Try adding a trainee with your email
- [ ] Verify invitation email received
- [ ] Update production environment variables
- [ ] Deploy and test in production

**🎉 Ready to send professional trainee invitations!**