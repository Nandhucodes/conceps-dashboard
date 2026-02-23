const { pool } = require('../config/db');

/**
 * User Model – wraps all SQL queries for the `users` table.
 * Every method uses parameterised queries to prevent SQL injection.
 */

/* Columns returned for public/admin consumption (excludes password_hash) */
const PUBLIC_COLS = `
  id, name, email, phone, department, status, role,
  is_verified, is_password_changed, is_temp_password,
  temp_password_expires_at, created_by_admin, created_at
`.trim();

const User = {

  /* ── Lookups ─────────────────────────────────────────────────── */

  /** Find user by email – returns ALL columns (needed for auth). */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  /** Find user by PK – returns safe public columns only. */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ${PUBLIC_COLS} FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /** Find by phone – returns all columns (needed for duplicate-check). */
  async findByPhone(phone) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE phone = ? AND deleted_at IS NULL LIMIT 1',
      [phone]
    );
    return rows[0] || null;
  },

  /* ── Creates ─────────────────────────────────────────────────── */

  /**
   * Self-registration: creates a user that must verify via OTP.
   * is_password_changed = 1 (user picked their own password)
   * is_temp_password    = 0
   */
  async create({ name, email, phone = null, password_hash }) {
    const [result] = await pool.execute(
      `INSERT INTO users
         (name, email, phone, password_hash, is_password_changed, is_temp_password)
       VALUES (?, ?, ?, ?, 1, 0)`,
      [name, email, phone, password_hash]
    );
    return result.insertId;
  },

  /**
   * Admin creates a user with a known role – pre-verified, own password.
   * Used by the old createAdmin flow (non-temp-password path).
   */
  async createWithRole({ name, email, password_hash, role }) {
    const [result] = await pool.execute(
      `INSERT INTO users
         (name, email, password_hash, role, is_verified, is_password_changed, is_temp_password)
       VALUES (?, ?, ?, ?, 1, 1, 0)`,
      [name, email, password_hash, role]
    );
    return result.insertId;
  },

  /**
   * Admin creates a user with a TEMPORARY password.
   *  - is_verified        = 1  (admin bypasses OTP)
   *  - is_password_changed = 0  (user MUST change on first login)
   *  - is_temp_password    = 1  (flag the password as temporary)
   *  - temp_password_expires_at = 24 hours from now by default
   *
   * @param {{ name, email, phone, department, role, status,
   *           password_hash, created_by_admin, expiresAt }} data
   * @returns {number} insertId
   */
  async createByAdmin({
    name,
    email,
    phone             = null,
    department        = null,
    role              = 'user',
    status            = 'active',
    password_hash,
    created_by_admin,
    expiresAt         = null, // DateTime string for temp_password_expires_at
    isTempPassword    = 1,    // 1 = temp (forced change), 0 = permanent (no forced change)
    isPasswordChanged = 0,    // 0 = must change, 1 = can login freely
  }) {
    const [result] = await pool.execute(
      `INSERT INTO users
         (name, email, phone, department, status, password_hash, role,
          is_verified, is_password_changed, is_temp_password,
          temp_password_expires_at, created_by_admin)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
      [
        name, email, phone, department, status, password_hash, role,
        isPasswordChanged, isTempPassword, expiresAt, created_by_admin,
      ]
    );
    return result.insertId;
  },

  /* ── Updates ─────────────────────────────────────────────────── */

  /** Mark OTP-verified. */
  async markVerified(userId) {
    await pool.execute(
      'UPDATE users SET is_verified = 1 WHERE id = ?',
      [userId]
    );
  },

  /**
   * Change a user's password and mark it as no longer temporary.
   * Called from the change-password endpoint.
   * @param {number} userId
   * @param {string} newPasswordHash
   */
  async updatePassword(userId, newPasswordHash) {
    await pool.execute(
      `UPDATE users
       SET password_hash            = ?,
           is_password_changed      = 1,
           is_temp_password         = 0,
           temp_password_expires_at = NULL
       WHERE id = ?`,
      [newPasswordHash, userId]
    );
  },

  /**
   * Update profile fields (admin panel).
   * Does NOT touch password or security flags.
   */
  async update(id, { name, email, phone, department, status, role }) {
    await pool.execute(
      `UPDATE users
       SET name=?, email=?, phone=?, department=?, status=?, role=?
       WHERE id=?`,
      [name, email, phone ?? null, department ?? null,
       status ?? 'active', role ?? 'user', id]
    );
  },

  /* ── Aggregates / lists ──────────────────────────────────────── */

  async count() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM users');
    return rows[0].total;
  },

  /**
   * Paginated + filtered list for the admin panel.
   * @param {number} page
   * @param {number} limit
   * @param {string} search
   * @param {string} role
   * @param {string} status
   */
  async findAll(page = 1, limit = 10, search = '', role = '', status = '') {
    const offset = (page - 1) * limit;

    let where = 'WHERE deleted_at IS NULL';
    const params = [];
    if (search) {
      where += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role)   { where += ' AND role = ?';   params.push(role.toLowerCase()); }
    if (status) { where += ' AND status = ?'; params.push(status.toLowerCase()); }

    const [rows] = await pool.execute(
      `SELECT ${PUBLIC_COLS}
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM users ${where}`,
      params
    );
    return { rows, total: countRows[0].total };
  },

  /* ── Deletes (soft) ──────────────────────────────────────────── */

  /** Soft-delete: set deleted_at instead of removing the row. */
  async delete(id) {
    await pool.execute(
      'UPDATE users SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
  },

  /** Bulk soft-delete. */
  async deleteMany(ids) {
    if (!ids.length) return;
    const placeholders = ids.map(() => '?').join(',');
    await pool.execute(
      `UPDATE users SET deleted_at = NOW() WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
      ids
    );
  },
};

module.exports = User;
