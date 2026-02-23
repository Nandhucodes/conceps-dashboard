const { pool } = require('../config/db');

/**
 * OTP Model – handles creation, lookup, and expiry of one-time passwords.
 */
const OTP = {
  /**
   * Persist a new OTP record.
   * @param {{ userId, otpCode, purpose, expiresAt }} data
   */
  async create({ userId, otpCode, purpose = 'signup', expiresAt }) {
    await pool.execute(
      `INSERT INTO otp_verifications (user_id, otp_code, purpose, expires_at)
       VALUES (?, ?, ?, ?)`,
      [userId, otpCode, purpose, expiresAt]
    );
  },

  /**
   * Find a valid (unused + not-expired) OTP for a user.
   * @param {number} userId
   * @param {string} otpCode
   * @param {string} purpose
   * @returns {object|null}
   */
  async findValid(userId, otpCode, purpose = 'signup') {
    const [rows] = await pool.execute(
      `SELECT * FROM otp_verifications
       WHERE user_id = ? AND otp_code = ? AND purpose = ?
         AND used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, otpCode, purpose]
    );
    return rows[0] || null;
  },

  /**
   * Mark an OTP record as consumed so it cannot be reused.
   * @param {number} otpId
   */
  async markUsed(otpId) {
    await pool.execute(
      'UPDATE otp_verifications SET used = 1 WHERE id = ?',
      [otpId]
    );
  },

  /**
   * Invalidate all previous OTPs for a user (clean-up before issuing a new one).
   * @param {number} userId
   * @param {string} purpose
   */
  async invalidatePrevious(userId, purpose = 'signup') {
    await pool.execute(
      `UPDATE otp_verifications SET used = 1
       WHERE user_id = ? AND purpose = ? AND used = 0`,
      [userId, purpose]
    );
  },
};

module.exports = OTP;
