import { Resend } from 'resend';
import crypto from 'crypto';

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'Candiez Dispensary <noreply@candiez.shop>';
// Use production URL as fallback - Railway should have CLIENT_URL set, but default to production
const CLIENT_URL = process.env.CLIENT_URL || 'https://candiez.shop';

// Logo URLs from Supabase storage
const LOGO_PRIMARY = 'https://hhdmovjjvlfkspqrzsjz.supabase.co/storage/v1/object/public/public-media/candiez/images/logos/official-logo.png';
const LOGO_SECONDARY = 'https://hhdmovjjvlfkspqrzsjz.supabase.co/storage/v1/object/public/public-media/candiez/images/logos/Candiez2-logo.png';

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
          <title>Verify Your Candiez Account</title>
          <!--[if mso]>
          <style type="text/css">
            table { border-collapse: collapse; }
            .button { padding: 16px 40px !important; }
          </style>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1225; -webkit-font-smoothing: antialiased;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #1a1225; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #2d2438; border-radius: 20px; box-shadow: 0 8px 40px rgba(181, 126, 220, 0.25); overflow: hidden; border: 1px solid rgba(181, 126, 220, 0.2);">

                  <!-- Header with Logo -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3d2952 0%, #2d1f3d 50%, #1a1225 100%); padding: 50px 30px; text-align: center;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="center">
                            <!-- Logo Container with Glow Effect -->
                            <div style="display: inline-block; padding: 15px; background: linear-gradient(135deg, rgba(181, 126, 220, 0.15) 0%, rgba(147, 112, 219, 0.1) 100%); border-radius: 20px; box-shadow: 0 0 30px rgba(181, 126, 220, 0.3), 0 0 60px rgba(181, 126, 220, 0.15);">
                              <img src="${LOGO_PRIMARY}" alt="Candiez Logo" width="100" height="100" style="display: block; border-radius: 12px;" />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-top: 20px;">
                            <p style="color: rgba(212, 165, 235, 0.9); font-size: 13px; margin: 0; letter-spacing: 3px; text-transform: uppercase; font-weight: 500;">Dispensary CRM & Inventory</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 45px 40px;">
                      <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 8px; font-weight: 600; letter-spacing: -0.5px;">Welcome, ${firstName}!</h2>
                      <p style="color: #b57edc; font-size: 15px; margin: 0 0 25px; font-weight: 500;">Your sweet journey begins here</p>

                      <p style="color: #a89bb0; font-size: 16px; line-height: 1.7; margin: 0 0 30px;">
                        Thank you for creating an account with Candiez. To complete your registration and unlock all features, please verify your email address.
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="center" style="padding: 15px 0 35px;">
                            <a href="${verificationUrl}" class="button" style="display: inline-block; background: linear-gradient(135deg, #b57edc 0%, #9370db 50%, #8a5fd3 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 6px 25px rgba(181, 126, 220, 0.45), 0 0 40px rgba(181, 126, 220, 0.2); letter-spacing: 0.5px;">
                              Verify My Email
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Alternative Link -->
                      <div style="background: rgba(181, 126, 220, 0.08); border-radius: 12px; padding: 20px; border: 1px solid rgba(181, 126, 220, 0.15);">
                        <p style="color: #8a7a96; font-size: 13px; line-height: 1.5; margin: 0 0 12px;">
                          If the button doesn't work, copy and paste this link:
                        </p>
                        <p style="color: #b57edc; font-size: 13px; word-break: break-all; margin: 0; font-family: monospace;">
                          ${verificationUrl}
                        </p>
                      </div>

                      <!-- Expiry Notice -->
                      <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid rgba(181, 126, 220, 0.15);">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td width="24" valign="top" style="padding-right: 12px;">
                              <div style="width: 24px; height: 24px; background: rgba(181, 126, 220, 0.15); border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px;">⏰</div>
                            </td>
                            <td>
                              <p style="color: #8a7a96; font-size: 13px; line-height: 1.5; margin: 0;">
                                This verification link expires in <strong style="color: #b57edc;">24 hours</strong>.<br>
                                If you didn't create an account, you can safely ignore this email.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: linear-gradient(135deg, rgba(45, 36, 56, 0.8) 0%, rgba(26, 18, 37, 0.9) 100%); padding: 30px; text-align: center; border-top: 1px solid rgba(181, 126, 220, 0.1);">
                      <img src="${LOGO_SECONDARY}" alt="Candiez" width="40" height="40" style="display: inline-block; border-radius: 8px; margin-bottom: 12px;" />
                      <p style="color: #b57edc; font-size: 14px; margin: 0 0 5px; font-weight: 600;">Candiez Dispensary</p>
                      <p style="color: #6b5f78; font-size: 12px; margin: 0;">California Licensed Dispensary Management System</p>
                      <p style="color: #4a4255; font-size: 11px; margin: 15px 0 0;">
                        <a href="${CLIENT_URL}" style="color: #8a7a96; text-decoration: none;">candiez.shop</a>
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Legal Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px;">
                  <tr>
                    <td style="padding: 25px 30px; text-align: center;">
                      <p style="color: #4a4255; font-size: 11px; line-height: 1.5; margin: 0;">
                        This email was sent to ${userEmail}. If you have questions, contact us at support@candiez.shop
                      </p>
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
          <!--[if mso]>
          <style type="text/css">
            table { border-collapse: collapse; }
            .button { padding: 16px 40px !important; }
          </style>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1225; -webkit-font-smoothing: antialiased;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #1a1225; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #2d2438; border-radius: 20px; box-shadow: 0 8px 40px rgba(181, 126, 220, 0.25); overflow: hidden; border: 1px solid rgba(181, 126, 220, 0.2);">

                  <!-- Header with Logo -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3d2952 0%, #2d1f3d 50%, #1a1225 100%); padding: 50px 30px; text-align: center;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="center">
                            <!-- Logo Container with Glow Effect -->
                            <div style="display: inline-block; padding: 15px; background: linear-gradient(135deg, rgba(181, 126, 220, 0.15) 0%, rgba(147, 112, 219, 0.1) 100%); border-radius: 20px; box-shadow: 0 0 30px rgba(181, 126, 220, 0.3), 0 0 60px rgba(181, 126, 220, 0.15);">
                              <img src="${LOGO_PRIMARY}" alt="Candiez Logo" width="100" height="100" style="display: block; border-radius: 12px;" />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-top: 20px;">
                            <p style="color: rgba(212, 165, 235, 0.9); font-size: 13px; margin: 0; letter-spacing: 3px; text-transform: uppercase; font-weight: 500;">Dispensary CRM & Inventory</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Success Badge -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: -25px;">
                        <tr>
                          <td align="center">
                            <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 35px; border-radius: 50px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);">
                              ✓ Email Verified Successfully
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 35px 40px 45px;">
                      <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 8px; font-weight: 600; letter-spacing: -0.5px; text-align: center;">Welcome aboard, ${firstName}!</h2>
                      <p style="color: #b57edc; font-size: 15px; margin: 0 0 25px; font-weight: 500; text-align: center;">Your account is now active</p>

                      <p style="color: #a89bb0; font-size: 16px; line-height: 1.7; margin: 0 0 30px; text-align: center;">
                        You're all set to start using our dispensary management system. Here's what you can do:
                      </p>

                      <!-- Features Grid -->
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 0 5px 10px;">
                            <div style="background: rgba(181, 126, 220, 0.08); border-radius: 12px; padding: 20px; border: 1px solid rgba(181, 126, 220, 0.15);">
                              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td width="50%" style="padding-right: 8px; vertical-align: top;">
                                    <div style="background: rgba(181, 126, 220, 0.1); border-radius: 10px; padding: 16px; text-align: center; height: 80px;">
                                      <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                                      <p style="color: #d4a5eb; font-size: 13px; margin: 0; font-weight: 600;">Dashboard</p>
                                      <p style="color: #8a7a96; font-size: 11px; margin: 4px 0 0;">Business overview</p>
                                    </div>
                                  </td>
                                  <td width="50%" style="padding-left: 8px; vertical-align: top;">
                                    <div style="background: rgba(181, 126, 220, 0.1); border-radius: 10px; padding: 16px; text-align: center; height: 80px;">
                                      <div style="font-size: 24px; margin-bottom: 8px;">💳</div>
                                      <p style="color: #d4a5eb; font-size: 13px; margin: 0; font-weight: 600;">Point of Sale</p>
                                      <p style="color: #8a7a96; font-size: 11px; margin: 4px 0 0;">Quick transactions</p>
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td width="50%" style="padding: 10px 8px 0 0; vertical-align: top;">
                                    <div style="background: rgba(181, 126, 220, 0.1); border-radius: 10px; padding: 16px; text-align: center; height: 80px;">
                                      <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
                                      <p style="color: #d4a5eb; font-size: 13px; margin: 0; font-weight: 600;">Customers</p>
                                      <p style="color: #8a7a96; font-size: 11px; margin: 4px 0 0;">Loyalty programs</p>
                                    </div>
                                  </td>
                                  <td width="50%" style="padding: 10px 0 0 8px; vertical-align: top;">
                                    <div style="background: rgba(181, 126, 220, 0.1); border-radius: 10px; padding: 16px; text-align: center; height: 80px;">
                                      <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                                      <p style="color: #d4a5eb; font-size: 13px; margin: 0; font-weight: 600;">Inventory</p>
                                      <p style="color: #8a7a96; font-size: 11px; margin: 4px 0 0;">Real-time tracking</p>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="center" style="padding: 5px 0 20px;">
                            <a href="${loginUrl}" class="button" style="display: inline-block; background: linear-gradient(135deg, #b57edc 0%, #9370db 50%, #8a5fd3 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 6px 25px rgba(181, 126, 220, 0.45), 0 0 40px rgba(181, 126, 220, 0.2); letter-spacing: 0.5px;">
                              Sign In to Your Account
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Referral Notice (if applicable) -->
                      <div style="margin-top: 20px; padding: 18px; background: rgba(16, 185, 129, 0.1); border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2); text-align: center;">
                        <p style="color: #10b981; font-size: 14px; margin: 0; font-weight: 500;">
                          🎁 Earn rewards by referring friends!
                        </p>
                        <p style="color: #8a7a96; font-size: 12px; margin: 8px 0 0;">
                          Share your referral code and both of you earn bonus points.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: linear-gradient(135deg, rgba(45, 36, 56, 0.8) 0%, rgba(26, 18, 37, 0.9) 100%); padding: 30px; text-align: center; border-top: 1px solid rgba(181, 126, 220, 0.1);">
                      <img src="${LOGO_SECONDARY}" alt="Candiez" width="40" height="40" style="display: inline-block; border-radius: 8px; margin-bottom: 12px;" />
                      <p style="color: #b57edc; font-size: 14px; margin: 0 0 5px; font-weight: 600;">Candiez Dispensary</p>
                      <p style="color: #6b5f78; font-size: 12px; margin: 0;">California Licensed Dispensary Management System</p>
                      <p style="color: #4a4255; font-size: 11px; margin: 15px 0 0;">
                        <a href="${CLIENT_URL}" style="color: #8a7a96; text-decoration: none;">candiez.shop</a>
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Legal Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px;">
                  <tr>
                    <td style="padding: 25px 30px; text-align: center;">
                      <p style="color: #4a4255; font-size: 11px; line-height: 1.5; margin: 0;">
                        This email was sent to ${userEmail}. If you have questions, contact us at support@candiez.shop
                      </p>
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

// Generate password reset token
export const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send password reset email
export const sendPasswordResetEmail = async (userEmail, firstName, resetToken) => {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;

  // If email not configured, log to console and return success for testing
  if (!EMAIL_ENABLED) {
    console.log('\n🔐 ===== PASSWORD RESET EMAIL (DEV MODE) =====');
    console.log(`To: ${userEmail}`);
    console.log(`Subject: 🔐 Reset Your Candiez Password`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('==============================================\n');
    return { success: true, messageId: 'dev-mode', devMode: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: '🔐 Reset Your Candiez Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Candiez Password</title>
          <!--[if mso]>
          <style type="text/css">
            table { border-collapse: collapse; }
            .button { padding: 16px 40px !important; }
          </style>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1225; -webkit-font-smoothing: antialiased;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #1a1225; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #2d2438; border-radius: 20px; box-shadow: 0 8px 40px rgba(181, 126, 220, 0.25); overflow: hidden; border: 1px solid rgba(181, 126, 220, 0.2);">

                  <!-- Header with Logo -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3d2952 0%, #2d1f3d 50%, #1a1225 100%); padding: 50px 30px; text-align: center;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="center">
                            <!-- Logo Container with Glow Effect -->
                            <div style="display: inline-block; padding: 15px; background: linear-gradient(135deg, rgba(181, 126, 220, 0.15) 0%, rgba(147, 112, 219, 0.1) 100%); border-radius: 20px; box-shadow: 0 0 30px rgba(181, 126, 220, 0.3), 0 0 60px rgba(181, 126, 220, 0.15);">
                              <img src="${LOGO_PRIMARY}" alt="Candiez Logo" width="100" height="100" style="display: block; border-radius: 12px;" />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-top: 20px;">
                            <p style="color: rgba(212, 165, 235, 0.9); font-size: 13px; margin: 0; letter-spacing: 3px; text-transform: uppercase; font-weight: 500;">Dispensary CRM & Inventory</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 45px 40px;">
                      <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 8px; font-weight: 600; letter-spacing: -0.5px;">Password Reset Request</h2>
                      <p style="color: #b57edc; font-size: 15px; margin: 0 0 25px; font-weight: 500;">Hi ${firstName}, we received your request</p>

                      <p style="color: #a89bb0; font-size: 16px; line-height: 1.7; margin: 0 0 30px;">
                        We received a request to reset the password for your Candiez account. Click the button below to create a new password.
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="center" style="padding: 15px 0 35px;">
                            <a href="${resetUrl}" class="button" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 6px 25px rgba(245, 158, 11, 0.45), 0 0 40px rgba(245, 158, 11, 0.2); letter-spacing: 0.5px;">
                              Reset My Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Alternative Link -->
                      <div style="background: rgba(181, 126, 220, 0.08); border-radius: 12px; padding: 20px; border: 1px solid rgba(181, 126, 220, 0.15);">
                        <p style="color: #8a7a96; font-size: 13px; line-height: 1.5; margin: 0 0 12px;">
                          If the button doesn't work, copy and paste this link:
                        </p>
                        <p style="color: #b57edc; font-size: 13px; word-break: break-all; margin: 0; font-family: monospace;">
                          ${resetUrl}
                        </p>
                      </div>

                      <!-- Expiry Notice -->
                      <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid rgba(181, 126, 220, 0.15);">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td width="24" valign="top" style="padding-right: 12px;">
                              <div style="width: 24px; height: 24px; background: rgba(245, 158, 11, 0.15); border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px;">⏰</div>
                            </td>
                            <td>
                              <p style="color: #8a7a96; font-size: 13px; line-height: 1.5; margin: 0;">
                                This password reset link expires in <strong style="color: #f59e0b;">1 hour</strong>.<br>
                                If you didn't request a password reset, you can safely ignore this email.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Security Notice -->
                      <div style="margin-top: 25px; padding: 18px; background: rgba(239, 68, 68, 0.08); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.15);">
                        <p style="color: #ef4444; font-size: 13px; margin: 0; font-weight: 500;">
                          🔒 Security Tip
                        </p>
                        <p style="color: #8a7a96; font-size: 12px; margin: 8px 0 0;">
                          Never share this link with anyone. Candiez staff will never ask for your password.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: linear-gradient(135deg, rgba(45, 36, 56, 0.8) 0%, rgba(26, 18, 37, 0.9) 100%); padding: 30px; text-align: center; border-top: 1px solid rgba(181, 126, 220, 0.1);">
                      <img src="${LOGO_SECONDARY}" alt="Candiez" width="40" height="40" style="display: inline-block; border-radius: 8px; margin-bottom: 12px;" />
                      <p style="color: #b57edc; font-size: 14px; margin: 0 0 5px; font-weight: 600;">Candiez Dispensary</p>
                      <p style="color: #6b5f78; font-size: 12px; margin: 0;">California Licensed Dispensary Management System</p>
                      <p style="color: #4a4255; font-size: 11px; margin: 15px 0 0;">
                        <a href="${CLIENT_URL}" style="color: #8a7a96; text-decoration: none;">candiez.shop</a>
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Legal Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px;">
                  <tr>
                    <td style="padding: 25px 30px; text-align: center;">
                      <p style="color: #4a4255; font-size: 11px; line-height: 1.5; margin: 0;">
                        This email was sent to ${userEmail}. If you have questions, contact us at support@candiez.shop
                      </p>
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
Password Reset Request

Hi ${firstName},

We received a request to reset your Candiez account password.

Reset your password: ${resetUrl}

This link expires in 1 hour. If you didn't request this, you can safely ignore this email.

Security Tip: Never share this link with anyone.

- Candiez Dispensary Team
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Password reset email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

export default resend;
