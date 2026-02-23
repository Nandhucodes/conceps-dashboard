const { body } = require('express-validator');

const VALID_ROLES = ['admin', 'user', 'manager', 'developer', 'designer', 'analyst'];

/**
 * Validation rules for POST /api/admin/create-user
 * Admin may provide an optional temporary password;
 * if omitted the system auto-generates one.
 */
const createUserByAdminValidator = [
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
    .optional({ checkFalsy: true })
    .matches(/^(\+91|91)?[6-9]\d{9}$/).withMessage('Provide a valid 10-digit Indian mobile number.'),

  body('role')
    .optional()
    .isIn(VALID_ROLES).withMessage(`Role must be one of: ${VALID_ROLES.join(', ')}.`),

  body('department')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Department must not exceed 100 characters.'),

  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'."),

  /* Optional: admin supplies their own temp password */
  body('temp_password')
    .optional({ checkFalsy: true })
    .isLength({ min: 8 }).withMessage('Temporary password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Temporary password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Temporary password must contain at least one number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Temporary password must contain at least one special character.'),
];

/**
 * Validation rules for POST /api/auth/change-password
 * Used on first login when is_password_changed = 0, and for normal changes.
 */
const changePasswordValidator = [
  body('current_password')
    .notEmpty().withMessage('Current password is required.'),

  body('new_password')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('New password must contain at least one number.')
    .matches(/[^A-Za-z0-9]/).withMessage('New password must contain at least one special character.'),

  body('confirm_password')
    .notEmpty().withMessage('Please confirm your new password.')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

module.exports = { createUserByAdminValidator, changePasswordValidator };
