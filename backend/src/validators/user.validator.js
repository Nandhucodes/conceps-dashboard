const { body } = require('express-validator');

const VALID_ROLES = ['admin', 'user', 'manager', 'developer', 'designer', 'analyst'];

const createUserValidator = [
  body('name')
    .trim().notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),

  body('email')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),

  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^(\+91|91)?[6-9]\d{9}$/).withMessage('Provide a valid 10-digit Indian mobile number.'),

  body('role')
    .optional()
    .isIn(VALID_ROLES).withMessage(`Role must be one of: ${VALID_ROLES.join(', ')}.`),

  body('department')
    .optional().trim()
    .isLength({ max: 100 }).withMessage('Department name must not exceed 100 characters.'),

  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'."),
];

const updateUserValidator = [
  body('name')
    .optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),

  body('email')
    .optional().trim()
    .isEmail().withMessage('Provide a valid email address.')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^(\+91|91)?[6-9]\d{9}$/).withMessage('Provide a valid 10-digit Indian mobile number.'),

  body('role')
    .optional()
    .isIn(VALID_ROLES).withMessage(`Role must be one of: ${VALID_ROLES.join(', ')}.`),

  body('department')
    .optional().trim()
    .isLength({ max: 100 }).withMessage('Department name must not exceed 100 characters.'),

  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'."),
];

module.exports = { createUserValidator, updateUserValidator };
