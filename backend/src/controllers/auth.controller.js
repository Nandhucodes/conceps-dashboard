const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const OTP     = require('../models/OTP');
const { generateToken }                  = require('../utils/jwt.utils');
const { generateOTP, otpExpiresAt }      = require('../utils/otp.utils');
const { sendOtpSMS }                     = require('../utils/sms.utils');
const { sendSuccess, sendError }         = require('../utils/response.utils');
const { sendOtpEmail, sendPasswordChangedEmail } = require('../services/email.service');

/* ── Helper: generate + store + send OTP ─────────────────────────────────── */
const issueAndSendOtp = async (userId, phone, purpose = 'signup') => {
  await OTP.invalidatePrevious(userId, purpose);
  const otpCode   = generateOTP();
  const expiresAt = otpExpiresAt(Number(process.env.OTP_EXPIRES_MINUTES) || 10);

  await OTP.create({ userId, otpCode, purpose, expiresAt });

  try {
    await sendOtpSMS(phone, otpCode);
  } catch (smsError) {
    console.error(`⚠️  SMS failed for ${phone}: ${smsError.message}`);
    console.log(`📱 [DEV FALLBACK] OTP for ${phone}: ${otpCode}`);
  }

  return otpCode;
};

/* ── POST /api/auth/signup ───────────────────────────────────────────────── */
const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const cleanPhone = phone.replace(/^\+?91/, '').replace(/\s+/g, '').trim();

    if (await User.findByEmail(email)) {
      return sendError(res, 'An account with this email already exists.', 409);
    }
    if (await User.findByPhone(cleanPhone)) {
      return sendError(res, 'An account with this phone number already exists.', 409);
    }

    const password_hash = await bcrypt.hash(password, 12);
    const userId        = await User.create({ name, email, phone: cleanPhone, password_hash });
    const otpCode       = await issueAndSendOtp(userId, cleanPhone, 'signup');

    return sendSuccess(
      res,
      {
        userId,
        phone: `+91${cleanPhone}`,
        ...(process.env.NODE_ENV !== 'production' && { otp: otpCode }),
      },
      `OTP sent to +91${cleanPhone}. Please verify to activate your account.`,
      201
    );
  } catch (error) {
    next(error);
  }
};

/* ── POST /api/auth/resend-otp ───────────────────────────────────────────── */
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return sendError(res, 'No account found with that email.', 404);
    if (user.is_verified) return sendError(res, 'This account is already verified.', 400);
    if (!user.phone)      return sendError(res, 'No phone number registered for this account.', 400);

    await issueAndSendOtp(user.id, user.phone, 'signup');
    return sendSuccess(res, { phone: `+91${user.phone}` }, `A new OTP has been sent to +91${user.phone}.`);
  } catch (error) {
    next(error);
  }
};

/* ── POST /api/auth/send-otp ─────────────────────────────────────────────── */
/**
 * Send a 6-digit OTP to the provided email address.
 *
 * Used by the VerifyOTP page (email-based verification flow).
 * The user must already have an account with this email.
 *
 * Body: { email }
 */
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email address is required.', 400);

    const user = await User.findByEmail(email.trim().toLowerCase());
    if (!user) return sendError(res, 'No account found with that email address.', 404);

    const expiresMinutes = Number(process.env.OTP_EXPIRES_MINUTES) || 10;

    await OTP.invalidatePrevious(user.id, 'signup');
    const otpCode   = generateOTP();
    const expiresAt = otpExpiresAt(expiresMinutes);
    await OTP.create({ userId: user.id, otpCode, purpose: 'signup', expiresAt });

    /* Send via email (non-blocking in production; awaited so dev logs appear) */
    try {
      await sendOtpEmail({ name: user.name, email: user.email, otpCode, expiresMinutes });
    } catch (emailErr) {
      console.error(`⚠️  OTP email failed for ${user.email}: ${emailErr.message}`);
      /* In dev expose OTP in response so testing is possible without SMTP */
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📧 [DEV FALLBACK] OTP for ${user.email}: ${otpCode}`);
      }
    }

    return sendSuccess(
      res,
      {
        email: user.email,
        ...(process.env.NODE_ENV !== 'production' && { otp: otpCode }),
      },
      `A 6-digit verification code has been sent to ${user.email}.`
    );
  } catch (error) {
    next(error);
  }
};

/* ── POST /api/auth/login ────────────────────────────────────────────────── */
/**
 * Authenticate user.
 *
 * If is_password_changed = 0 the response includes:
 *   must_change_password: true
 * The frontend should redirect to /change-password when this flag is true.
 *
 * If the temporary password has expired, login is blocked and the user
 * must contact an admin.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return sendError(res, 'Invalid email or password.', 401);

    /* Verify password */
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return sendError(res, 'Invalid email or password.', 401);

    /* Account must be OTP-verified */
    if (!user.is_verified) {
      return sendError(res, 'Please verify your mobile number before logging in.', 403);
    }

    /* Block inactive accounts */
    if (user.status === 'inactive') {
      return sendError(res, 'Your account has been deactivated. Please contact an administrator.', 403);
    }

    /* Check if temp password has expired */
    if (user.is_temp_password && user.temp_password_expires_at) {
      const expired = new Date(user.temp_password_expires_at) < new Date();
      if (expired) {
        return sendError(
          res,
          'Your temporary password has expired. Please contact an administrator to reset it.',
          401
        );
      }
    }

    const token = generateToken(user);

    /*
     * must_change_password is ONLY true when:
     *   - is_password_changed = 0  (explicitly set by admin create-user flow)
     *   - AND is_temp_password = 1 (has a system-generated temp password)
     *
     * NULL or 1 in is_password_changed means the user's password is fine.
     * This prevents legacy admin rows (seeded before the column existed)
     * from being incorrectly forced to change their password.
     */
    const mustChangePassword =
      user.is_password_changed === 0 && user.is_temp_password === 1;

    return sendSuccess(res, {
      token,
      must_change_password: mustChangePassword,
      user: {
        id:                   user.id,
        name:                 user.name,
        email:                user.email,
        phone:                user.phone,
        role:                 user.role,
        is_password_changed:  user.is_password_changed ?? 1,
        is_temp_password:     user.is_temp_password    ?? 0,
      },
    }, mustChangePassword
      ? 'Login successful. You must change your temporary password before continuing.'
      : 'Login successful.'
    );
  } catch (error) {
    next(error);
  }
};

/* ── POST /api/auth/verify-otp ───────────────────────────────────────────── */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return sendError(res, 'No account found with that email.', 404);

    const otpRecord = await OTP.findValid(user.id, otp, 'signup');
    if (!otpRecord) return sendError(res, 'OTP is invalid or has expired. Please request a new one.', 400);

    await OTP.markUsed(otpRecord.id);
    await User.markVerified(user.id);

    const token = generateToken(user);
    return sendSuccess(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    }, 'Mobile number verified. Your account is now active.');
  } catch (error) {
    next(error);
  }
};

/* ── POST /api/auth/change-password ─────────────────────────────────────── */
/**
 * Allow an authenticated user to change their password.
 *
 * Accepts:
 *   { current_password, new_password, confirm_password }
 *
 * On success:
 *   - Updates password_hash
 *   - Sets is_password_changed = 1, is_temp_password = 0
 *   - Sends confirmation email
 *   - Returns a fresh JWT so the frontend can continue the session
 */
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    /* Re-fetch with password_hash (findById excludes it for security) */
    const user = await User.findByEmail(req.user.email);
    if (!user) return sendError(res, 'User not found.', 404);

    /* Verify current / temporary password */
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 401);
    }

    /* Prevent re-using the same password */
    const isSame = await bcrypt.compare(new_password, user.password_hash);
    if (isSame) {
      return sendError(res, 'New password must be different from your current password.', 400);
    }

    /* Hash and save */
    const newHash = await bcrypt.hash(new_password, 12);
    await User.updatePassword(user.id, newHash);

    /* Send confirmation email (non-blocking) */
    sendPasswordChangedEmail({ name: user.name, email: user.email })
      .catch(err => console.error('⚠️  Password-changed email failed:', err.message));

    /* Issue fresh token with updated state */
    const updatedUser = await User.findById(user.id);
    const token       = generateToken({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });

    return sendSuccess(res, {
      token,
      user: {
        id:                  updatedUser.id,
        name:                updatedUser.name,
        email:               updatedUser.email,
        role:                updatedUser.role,
        is_password_changed: updatedUser.is_password_changed,
      },
    }, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

/* ── POST /api/auth/create-admin ─────────────────────────────────────────── */
/**
 * Create an admin/user account without OTP (admin-only, legacy endpoint).
 * For the full admin create-user flow use POST /api/admin/create-user.
 */
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return sendError(res, "Role must be 'admin' or 'user'.", 400);
    }

    if (await User.findByEmail(email)) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    const password_hash = await bcrypt.hash(password, 12);
    const userId  = await User.createWithRole({ name, email, password_hash, role });
    const newUser = await User.findById(userId);

    return sendSuccess(
      res,
      { user: newUser },
      `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      201
    );
  } catch (error) {
    next(error);
  }
};

/* ── POST /api/auth/reset-password ──────────────────────────────────────── */
/**
 * Allows a user to reset their password by providing their email,
 * new password, and confirm password (no OTP / token required — direct reset).
 *
 * Body: { email, new_password, confirm_password }
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
      return sendError(res, 'Passwords do not match.', 400);
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return sendError(res, 'No account found with that email address.', 404);
    }

    /* Prevent re-using the same password */
    const isSame = await bcrypt.compare(new_password, user.password_hash);
    if (isSame) {
      return sendError(res, 'New password must be different from your current password.', 400);
    }

    const newHash = await bcrypt.hash(new_password, 12);
    await User.updatePassword(user.id, newHash);

    /* Send confirmation email (non-blocking) */
    sendPasswordChangedEmail({ name: user.name, email: user.email })
      .catch(err => console.error('⚠️  Password-changed email failed:', err.message));

    return sendSuccess(res, {}, 'Password has been reset successfully. You can now sign in.');
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, sendOtp, resendOtp, login, verifyOtp, changePassword, createAdmin, resetPassword };
