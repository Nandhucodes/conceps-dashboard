const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a given user.
 * @param {{ id, email, role }} user
 * @returns {string} token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = { generateToken };
