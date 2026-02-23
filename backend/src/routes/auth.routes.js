const express = require('express');
const router  = express.Router();

const {
  signup, sendOtp, resendOtp, login, verifyOtp, changePassword, createAdmin, resetPassword,
} = require('../controllers/auth.controller');

const {
  signupValidator, loginValidator, verifyOtpValidator,
  resendOtpValidator, createAdminValidator, resetPasswordValidator,
} = require('../validators/auth.validator');

const { changePasswordValidator } = require('../validators/admin.validator');
const validate                    = require('../middlewares/validate.middleware');
const { protect, authorize }      = require('../middlewares/auth.middleware');

/* ── Public routes ──────────────────────────────────────────────────────── */

// POST /api/auth/signup       — register + send OTP via SMS
router.post('/signup',     signupValidator,    validate, signup);

// POST /api/auth/send-otp    — send a 6-digit OTP to the user's email
router.post('/send-otp',   sendOtp);

// POST /api/auth/login        — login with email + password
router.post('/login',      loginValidator,     validate, login);

// POST /api/auth/verify-otp   — verify the SMS OTP
router.post('/verify-otp', verifyOtpValidator, validate, verifyOtp);

// POST /api/auth/resend-otp   — resend a fresh OTP
router.post('/resend-otp', resendOtpValidator, validate, resendOtp);

// POST /api/auth/reset-password — public: reset password using email directly
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

/* ── Protected routes (valid JWT required) ──────────────────────────────── */

// POST /api/auth/change-password — change own password (required on first login)
router.post(
  '/change-password',
  protect,
  changePasswordValidator,
  validate,
  changePassword
);

// POST /api/auth/create-admin — admin-only: create another admin account
router.post(
  '/create-admin',
  protect,
  authorize('admin'),
  createAdminValidator,
  validate,
  createAdmin
);

module.exports = router;
