const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a CineGo email with both a clickable verification link AND a 6-digit OTP code.
 * @param {string} to - Recipient email address
 * @param {string} token - The raw verification token for the URL link
 * @param {string} otp - The 6-digit OTP code
 */
const sendVerificationEmail = async (to, token, otp) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${clientUrl}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `CineGo <${process.env.EMAIL_USER}>`,
    to,
    subject: '🎬 CineGo – Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CineGo Email Verification</title>
      </head>
      <body style="margin:0;padding:0;background-color:#0a0c16;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" border="0"
                style="background:rgba(22,27,46,0.95);border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;box-shadow: 0 10px 30px rgba(0,0,0,0.5);">

                <!-- Header -->
                <tr>
                  <td align="center" style="padding:32px 40px 24px;background:linear-gradient(135deg,#6366f1,#ec4899);">
                    <h1 style="margin:0;color:#fff;font-size:30px;letter-spacing:-0.5px;font-weight:800;">🎬 CineGo</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:14px;font-weight:500;">Online Movie Ticket Booking</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 36px;">
                    <h2 style="margin:0 0 12px;color:#f8fafc;font-size:22px;font-weight:700;">Verify Your Email Address</h2>
                    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                      Thank you for joining CineGo! Please confirm your email address to activate your account and start booking movie tickets.
                    </p>

                    <!-- Clickable Link Button -->
                    <div style="text-align:center;margin:32px 0;">
                      <a href="${verificationLink}" target="_blank"
                         style="display:inline-block;background:linear-gradient(135deg,#6366f1,#ec4899);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 38px;border-radius:10px;box-shadow:0 4px 15px rgba(99,102,241,0.4);">
                        ✅ Verify Email Now
                      </a>
                    </div>

                    <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;text-align:center;">
                      Or copy and paste this verification link into your browser:
                    </p>
                    <p style="margin:0 0 28px;text-align:center;word-break:break-all;">
                      <a href="${verificationLink}" style="color:#6366f1;font-size:12px;text-decoration:underline;">${verificationLink}</a>
                    </p>

                    <div style="border-top: 1px solid rgba(255,255,255,0.08); margin: 28px 0; padding-top: 24px;">
                      <p style="margin:0 0 12px;color:#94a3b8;font-size:14px;text-align:center;">
                        Prefer to verify using an OTP code?
                      </p>
                      <div style="text-align:center;">
                        <span style="display:inline-block;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.4);color:#818cf8;font-size:26px;font-weight:800;letter-spacing:6px;padding:8px 20px;border-radius:8px;">
                          ${otp}
                        </span>
                      </div>
                    </div>

                    <p style="margin:20px 0 6px;color:#cbd5e1;font-size:13px;">
                      ⏳ This verification link and OTP will expire in <strong>24 hours</strong>.
                    </p>
                    <p style="margin:0;color:#64748b;font-size:13px;">
                      If you did not sign up for CineGo, please ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);background:rgba(10,12,22,0.6);">
                    <p style="margin:0;color:#64748b;font-size:12px;">
                      © ${new Date().getFullYear()} CineGo Inc. All rights reserved.
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
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Legacy wrapper for OTP-only sends if needed
 */
const sendOTPEmail = async (to, otp) => {
  return sendVerificationEmail(to, otp, otp);
};

/**
 * Sends a password reset email with a secure clickable link.
 * @param {string} to - Recipient email
 * @param {string} resetToken - Raw reset token (hashed version stored in DB)
 */
const sendPasswordResetEmail = async (to, resetToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `CineGo <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔐 CineGo – Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CineGo Password Reset</title>
      </head>
      <body style="margin:0;padding:0;background-color:#0a0c16;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" border="0"
                style="background:rgba(22,27,46,0.95);border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">

                <!-- Header -->
                <tr>
                  <td align="center" style="padding:32px 40px 24px;background:linear-gradient(135deg,#6366f1,#ec4899);">
                    <h1 style="margin:0;color:#fff;font-size:30px;letter-spacing:-0.5px;font-weight:800;">🎬 CineGo</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:14px;font-weight:500;">Online Movie Ticket Booking</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 36px;">
                    <h2 style="margin:0 0 12px;color:#f8fafc;font-size:22px;font-weight:700;">🔐 Reset Your Password</h2>
                    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                      We received a request to reset your CineGo account password. Click the button below to create a new password.
                    </p>

                    <!-- Reset Button -->
                    <div style="text-align:center;margin:32px 0;">
                      <a href="${resetLink}" target="_blank"
                         style="display:inline-block;background:linear-gradient(135deg,#6366f1,#ec4899);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 38px;border-radius:10px;box-shadow:0 4px 15px rgba(99,102,241,0.4);">
                        🔐 Reset My Password
                      </a>
                    </div>

                    <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;text-align:center;">
                      Or paste this link into your browser:
                    </p>
                    <p style="margin:0 0 28px;text-align:center;word-break:break-all;">
                      <a href="${resetLink}" style="color:#6366f1;font-size:12px;text-decoration:underline;">${resetLink}</a>
                    </p>

                    <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:16px 20px;margin-top:8px;">
                      <p style="margin:0 0 6px;color:#fca5a5;font-size:13px;font-weight:600;">⚠️ Important Security Notice</p>
                      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
                        This link expires in <strong style="color:#f8fafc;">1 hour</strong>. If you did not request a password reset, please ignore this email — your account remains secure.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);background:rgba(10,12,22,0.6);">
                    <p style="margin:0;color:#64748b;font-size:12px;">
                      © ${new Date().getFullYear()} CineGo Inc. All rights reserved.
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
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendOTPEmail, sendPasswordResetEmail };

