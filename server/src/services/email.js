import { Resend } from 'resend';
import crypto from 'crypto';

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'Candiez Dispensary <noreply@candiez.shop>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Check if email is enabled (API key present)
const EMAIL_ENABLED = !!process.env.RESEND_API_KEY;

// Initialize Resend only if API key is present
const resend = EMAIL_ENABLED ? new Resend(process.env.RESEND_API_KEY) : null;

// Verify email configuration
export const verifyEmailConfig = async () => {
  if (!EMAIL_ENABLED) {
    console.log('⚠️  Email service not configured (RESEND_API_KEY required)');
    console.log('   Get your API key at: https://resend.com/api-keys');
    console.log('   📧 Emails will be logged to console instead of sent');
    return false;
  }
  console.log('✅ Resend email service configured');
  return true;
};

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
export const sendVerificationEmail = async (userEmail, firstName, verificationToken) => {
  const verificationUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;

  // If email not configured, log to console and return success for testing
  if (!EMAIL_ENABLED) {
    console.log('\n📧 ===== VERIFICATION EMAIL (DEV MODE) =====');
    console.log(`To: ${userEmail}`);
    console.log(`Subject: 🍬 Verify Your Candiez Account`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('============================================\n');
    return { success: true, messageId: 'dev-mode', devMode: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: '🍬 Verify Your Candiez Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Account</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f0f7;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f0f7; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(123, 74, 158, 0.15); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #9b59b6 0%, #7b4a9e 100%); padding: 40px 30px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">🍬</div>
                      <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">Candiez</h1>
                      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0; letter-spacing: 1px;">DISPENSARY CRM & INVENTORY</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333; font-size: 24px; margin: 0 0 20px; font-weight: 600;">Welcome, ${firstName}! 👋</h2>
                      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                        Thank you for creating an account with Candiez. To complete your registration and access your account, please verify your email address by clicking the button below.
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 30px;">
                            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #9b59b6 0%, #7b4a9e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(155, 89, 182, 0.4);">
                              ✅ Verify My Email
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="color: #9b59b6; font-size: 14px; word-break: break-all; margin: 0 0 25px; padding: 15px; background: #f8f5fa; border-radius: 8px;">
                        ${verificationUrl}
                      </p>

                      <div style="border-top: 1px solid #eee; padding-top: 25px; margin-top: 25px;">
                        <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0;">
                          ⏰ This verification link expires in <strong>24 hours</strong>.<br>
                          If you didn't create an account, you can safely ignore this email.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: #f8f5fa; padding: 25px 30px; text-align: center; border-top: 1px solid #ede7f2;">
                      <p style="color: #9b59b6; font-size: 14px; margin: 0 0 5px; font-weight: 600;">Candiez Dispensary</p>
                      <p style="color: #999; font-size: 12px; margin: 0;">California Licensed Dispensary Management System</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Welcome to Candiez, ${firstName}!

Thank you for creating an account. Please verify your email address by visiting:

${verificationUrl}

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

- Candiez Dispensary Team
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Verification email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email (after verification)
export const sendWelcomeEmail = async (userEmail, firstName) => {
  const loginUrl = `${CLIENT_URL}/login`;

  // If email not configured, log to console and return success for testing
  if (!EMAIL_ENABLED) {
    console.log('\n🎉 ===== WELCOME EMAIL (DEV MODE) =====');
    console.log(`To: ${userEmail}`);
    console.log(`Subject: 🎉 Welcome to Candiez - Your Account is Verified!`);
    console.log(`Login URL: ${loginUrl}`);
    console.log('=======================================\n');
    return { success: true, messageId: 'dev-mode', devMode: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: '🎉 Welcome to Candiez - Your Account is Verified!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Candiez</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f0f7;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f0f7; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(123, 74, 158, 0.15); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #9b59b6 0%, #7b4a9e 100%); padding: 40px 30px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">🍬</div>
                      <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">Candiez</h1>
                      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0; letter-spacing: 1px;">DISPENSARY CRM & INVENTORY</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; border-radius: 50px; font-size: 18px; font-weight: 600;">
                          ✅ Email Verified Successfully!
                        </div>
                      </div>

                      <h2 style="color: #333; font-size: 24px; margin: 0 0 20px; font-weight: 600;">Welcome aboard, ${firstName}! 🎉</h2>
                      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                        Your email has been verified and your Candiez account is now active. You're all set to start using our dispensary management system!
                      </p>

                      <div style="background: #f8f5fa; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                        <h3 style="color: #7b4a9e; font-size: 18px; margin: 0 0 15px;">🚀 Getting Started</h3>
                        <ul style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                          <li>Explore the <strong>Dashboard</strong> for an overview</li>
                          <li>Use the <strong>POS</strong> for quick transactions</li>
                          <li>Manage <strong>Customers</strong> and loyalty programs</li>
                          <li>Track your <strong>Inventory</strong> in real-time</li>
                        </ul>
                      </div>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 20px;">
                            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #9b59b6 0%, #7b4a9e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(155, 89, 182, 0.4);">
                              🔐 Sign In to Your Account
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: #f8f5fa; padding: 25px 30px; text-align: center; border-top: 1px solid #ede7f2;">
                      <p style="color: #9b59b6; font-size: 14px; margin: 0 0 5px; font-weight: 600;">Candiez Dispensary</p>
                      <p style="color: #999; font-size: 12px; margin: 0;">California Licensed Dispensary Management System</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Welcome to Candiez, ${firstName}! 🎉

Your email has been verified and your account is now active!

Sign in at: ${loginUrl}

Getting Started:
- Explore the Dashboard for an overview
- Use the POS for quick transactions
- Manage Customers and loyalty programs
- Track your Inventory in real-time

- Candiez Dispensary Team
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Welcome email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

export default resend;
