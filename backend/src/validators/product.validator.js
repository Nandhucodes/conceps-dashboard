const { body } = require('express-validator');

const createProductValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required.')
    .isLength({ max: 200 }).withMessage('Name must not exceed 200 characters.'),

  body('price')
    .notEmpty().withMessage('Price is required.')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category must not exceed 100 characters.'),

  body('image_url')
    .optional()
    .isString()
    .isLength({ max: 500 }).withMessage('image_url must not exceed 500 characters.'),
];

module.exports = { createProductValidator };
