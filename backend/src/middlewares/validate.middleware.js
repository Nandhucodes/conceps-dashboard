const { validationResult } = require('express-validator');

/**
 * Runs after an express-validator chain.
 * If there are validation errors, respond with 422 and the list of messages.
 * Otherwise, call next() to continue to the controller.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
