const { body } = require('express-validator');

const signupValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Provide a valid email address.')
    .normalizeEmail(),

  body('phone')
    .notEmpty().withMessage('Phone number is required.')
    .matches(/^(\+91|91)?[6-9]\d{9}$/).withMessage('Provide a valid 10-digit Indian mobile number.'),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

const verifyOtpValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Provide a valid email address.')
    .normalizeEmail(),

  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required.')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits.')
    .isNumeric().withMessage('OTP must contain digits only.'),
];

const resendOtpValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Provide a valid email address.')
    .normalizeEmail(),
];

const createAdminValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),

  body('role')
    .optional()
    .isIn(['admin', 'user']).withMessage("Role must be 'admin' or 'user'."),
];

const resetPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Provide a valid email address.')
    .normalizeEmail(),

  body('new_password')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),

  body('confirm_password')
    .notEmpty().withMessage('Please confirm your password.'),
];

module.exports = {
  signupValidator, loginValidator, verifyOtpValidator,
  resendOtpValidator, createAdminValidator, resetPasswordValidator,
};
