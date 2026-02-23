const { body } = require('express-validator');

const createRegistrationValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^\+?[\d\s\-(). ]{7,}$/)
    .withMessage('Enter a valid phone number'),
  body('dob').optional({ checkFalsy: true }).isDate().withMessage('Valid date of birth required'),
  body('gender').optional({ checkFalsy: true }).isString(),
  body('department').optional({ checkFalsy: true }).isString(),
  body('rolePosition').optional({ checkFalsy: true }).isString(),
  body('address').optional({ checkFalsy: true }).isString(),
  body('city').optional({ checkFalsy: true }).isString(),
  body('state').optional({ checkFalsy: true }).isString(),
  body('country').optional({ checkFalsy: true }).isString(),
  body('pincode').optional({ checkFalsy: true }).isString(),
  body('notes').optional({ checkFalsy: true }).isString(),
  body('bio')
    .optional({ checkFalsy: true })
    .isLength({ min: 20 })
    .withMessage('Bio must be at least 20 characters'),
  body('newsletter').optional().isBoolean(),
  body('notifications').optional().isBoolean(),
];

module.exports = { createRegistrationValidator };
