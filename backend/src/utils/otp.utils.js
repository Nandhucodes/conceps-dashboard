const crypto = require('crypto');

/**
 * Generate a cryptographically random 6-digit OTP string.
 * @returns {string} e.g. "483920"
 */
const generateOTP = () => {
  // Random integer in [100000, 999999]
  const otp = crypto.randomInt(100000, 1000000);
  return String(otp);
};

/**
 * Compute the expiry date for an OTP.
 * @param {number} minutes – how many minutes until expiry
 * @returns {Date}
 */
const otpExpiresAt = (minutes) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date;
};

module.exports = { generateOTP, otpExpiresAt };
