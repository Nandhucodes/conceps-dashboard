/**
 * Email Service
 *
 * Production: replace the `sendEmail` function body with your preferred
 * provider (Nodemailer + SMTP, SendGrid, AWS SES, Resend, etc.).
 *
 * Development: all emails are logged to the console so you can
 * test without a real mail server.
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/* ── Core send function ─────────────────────────────────────────────────────── */

/**
 * Send an email.
 * In development this prints a formatted log; in production wire up your
 * provider here (e.g. nodemailer, SendGrid SDK, etc.).
 *
 * @param {{ to: string, subject: string, html: string, text?: string }} options
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (IS_PRODUCTION) {
    /* ── PRODUCTION: plug your mail provider in here ── */
    // Example with Nodemailer (install: npm i nodemailer):
    //
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({
    //   host:   process.env.SMTP_HOST,
    //   port:   Number(process.env.SMTP_PORT) || 587,
    //   secure: false,
    //   auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // });
    // await transporter.sendMail({
    //   from:    `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    //   to, subject, html, text,
    // });
    console.log(`📧 [EMAIL] Production send to ${to} | subject: "${subject}"`);
  } else {
    /* ── DEVELOPMENT: print to terminal ── */
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧  [DEV EMAIL]`);
    console.log(`    To      : ${to}`);
    console.log(`    Subject : ${subject}`);
    console.log(`    Body    :\n${text || html}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
};

/* ── Templated email helpers ─────────────────────────────────────────────────── */

/**
 * Send the admin-created welcome email with a temporary password.
 *
 * @param {{ name: string, email: string, tempPassword: string,
 *           loginUrl?: string, expiresInHours?: number }} opts
 */
const sendTempPasswordEmail = async ({
  name,
  email,
  tempPassword,
  loginUrl      = process.env.FRONTEND_ORIGIN || 'http://localhost:3000/signin',
  expiresInHours = 24,
}) => {
  const subject = `Your ${process.env.APP_NAME || 'Conceps'} account is ready`;

  const text = [
    `Hi ${name},`,
    '',
    `An admin has created an account for you on ${process.env.APP_NAME || 'Conceps Dashboard'}.`,
    '',
    `  Email    : ${email}`,
    `  Password : ${tempPassword}`,
    '',
    `This password is temporary and will expire in ${expiresInHours} hours.`,
    `You will be prompted to set a new password on your first login.`,
    '',
    `Login here: ${loginUrl}`,
    '',
    'If you did not expect this email, please ignore it.',
    '',
    `– The ${process.env.APP_NAME || 'Conceps'} Team`,
  ].join('\n');

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e2646">
      <div style="background:linear-gradient(135deg,#1b84ff,#7239ea);padding:28px 32px;border-radius:12px 12px 0 0">
        <h2 style="margin:0;color:#fff;font-size:1.4rem">🎉 Your account is ready</h2>
      </div>
      <div style="background:#f8faff;padding:28px 32px;border:1px solid #e0e7ff;border-top:none;border-radius:0 0 12px 12px">
        <p style="font-size:1rem">Hi <strong>${name}</strong>,</p>
        <p>An admin has created an account for you on
           <strong>${process.env.APP_NAME || 'Conceps Dashboard'}</strong>.</p>

        <div style="background:#fff;border:1.5px solid #c7d2fe;border-radius:10px;padding:16px 20px;margin:20px 0">
          <p style="margin:0 0 8px;font-size:0.85rem;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Login credentials</p>
          <p style="margin:4px 0"><strong>Email:</strong> ${email}</p>
          <p style="margin:4px 0"><strong>Temporary password:</strong>
            <code style="background:#f1f5f9;padding:2px 8px;border-radius:5px;font-size:1rem">${tempPassword}</code>
          </p>
        </div>

        <p style="color:#ef4444;font-size:0.875rem">
          ⚠️ This password expires in <strong>${expiresInHours} hours</strong>.
          You will be asked to set a new password on first login.
        </p>

        <a href="${loginUrl}"
           style="display:inline-block;margin-top:8px;padding:12px 28px;
                  background:linear-gradient(135deg,#1b84ff,#7239ea);
                  color:#fff;text-decoration:none;border-radius:8px;font-weight:700">
          Sign In Now →
        </a>

        <p style="margin-top:24px;font-size:0.8rem;color:#94a3b8">
          If you did not expect this email, you can safely ignore it.
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject, html, text });
};

/**
 * Send a 6-digit OTP to the user's email address for verification.
 * @param {{ name: string, email: string, otpCode: string, expiresMinutes?: number }} opts
 */
const sendOtpEmail = async ({ name, email, otpCode, expiresMinutes = 10 }) => {
  const subject = `Your verification code is ${otpCode}`;

  const text = [
    `Hi ${name},`,
    '',
    `Your ${process.env.APP_NAME || 'Conceps'} verification code is: ${otpCode}`,
    '',
    `This code expires in ${expiresMinutes} minutes.`,
    'Do not share this code with anyone.',
    '',
    'If you did not request this code, you can safely ignore this email.',
    '',
    `– The ${process.env.APP_NAME || 'Conceps'} Team`,
  ].join('\n');

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1e2646">
      <div style="background:linear-gradient(135deg,#1b84ff,#7239ea);padding:24px 32px;border-radius:12px 12px 0 0">
        <h2 style="margin:0;color:#fff;font-size:1.3rem">Your verification code</h2>
      </div>
      <div style="background:#f8faff;padding:28px 32px;border:1px solid #e0e7ff;border-top:none;border-radius:0 0 12px 12px">
        <p style="font-size:1rem">Hi <strong>${name}</strong>,</p>
        <p>Use the code below to verify your email address.</p>

        <div style="text-align:center;margin:24px 0">
          <div style="display:inline-block;background:#fff;border:2px solid #c7d2fe;
                      border-radius:12px;padding:16px 32px">
            <span style="font-size:2rem;font-weight:800;letter-spacing:0.35em;
                         color:#1b84ff;font-family:monospace">${otpCode}</span>
          </div>
        </div>

        <p style="font-size:0.875rem;color:#6b7280;text-align:center">
          ⏱ Expires in <strong>${expiresMinutes} minutes</strong>
        </p>
        <p style="font-size:0.8rem;color:#94a3b8;margin-top:16px">
          If you did not request this code, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject, html, text });
};

/**
 * Send a "password changed successfully" confirmation email.
 * @param {{ name: string, email: string }} opts
 */
const sendPasswordChangedEmail = async ({ name, email }) => {
  const subject = 'Your password has been changed';

  const text = [
    `Hi ${name},`,
    '',
    'Your password was successfully updated.',
    'If you did not make this change, please contact support immediately.',
    '',
    `– The ${process.env.APP_NAME || 'Conceps'} Team`,
  ].join('\n');

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e2646">
      <div style="background:#22c55e;padding:24px 32px;border-radius:12px 12px 0 0">
        <h2 style="margin:0;color:#fff">✅ Password updated</h2>
      </div>
      <div style="background:#f8faff;padding:28px 32px;border:1px solid #bbf7d0;border-top:none;border-radius:0 0 12px 12px">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your password was <strong>successfully updated</strong>.</p>
        <p style="color:#ef4444;font-size:0.875rem">
          If you did not make this change, please contact support immediately.
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject, html, text });
};

module.exports = { sendEmail, sendOtpEmail, sendTempPasswordEmail, sendPasswordChangedEmail };
