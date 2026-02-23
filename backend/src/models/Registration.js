const { pool } = require('../config/db');

/**
 * Registration Model – all queries against the `registrations` table.
 * All deletes are SOFT: deleted_at is set instead of removing the row.
 */
const Registration = {
  async count() {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM registrations WHERE deleted_at IS NULL'
    );
    return rows[0].total;
  },

  async countByStatus() {
    const [rows] = await pool.execute(
      'SELECT status, COUNT(*) AS total FROM registrations WHERE deleted_at IS NULL GROUP BY status'
    );
    return rows;
  },

  async recent(limit = 5) {
    const [rows] = await pool.execute(
      `SELECT id, full_name, email, status, created_at
       FROM registrations
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  /**
   * Create a new registration record.
   */
  async create({ userId, fullName, firstName, lastName, email, phone,
                  dob, gender, department, rolePosition,
                  address, city, state, country, pincode,
                  notes, bio, newsletter, notifications }) {
    const [result] = await pool.execute(
      `INSERT INTO registrations
        (user_id, full_name, first_name, last_name, email, phone,
         dob, gender, department, role_position,
         address, city, state, country, pincode,
         notes, bio, newsletter, notifications)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId   || null,
        fullName, firstName || null, lastName || null,
        email, phone || null,
        dob    || null, gender || null,
        department || null, rolePosition || null,
        address || null, city || null, state || null,
        country || 'India', pincode || null,
        notes  || null, bio || null,
        newsletter    ? 1 : 0,
        notifications ? 1 : 0,
      ]
    );
    return result.insertId;
  },

  async findAll({ page = 1, limit = 10, search = '', status = '' } = {}) {
    const offset = (page - 1) * limit;
    const conditions = ['deleted_at IS NULL'];
    const params = [];

    if (search) {
      conditions.push('(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM registrations ${where}`,
      params
    );

    const [rows] = await pool.execute(
      `SELECT id, user_id, full_name, first_name, last_name, email, phone,
              dob, gender, department, role_position,
              address, city, state, country, pincode,
              notes, bio, newsletter, notifications, status, created_at, updated_at
       FROM registrations ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { total, rows };
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM registrations WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return rows[0] || null;
  },

  async updateStatus(id, status) {
    const [result] = await pool.execute(
      'UPDATE registrations SET status = ? WHERE id = ? AND deleted_at IS NULL',
      [status, id]
    );
    return result.affectedRows;
  },

  /**
   * Soft-delete a registration by setting deleted_at to now.
   * @param {number} id
   * @returns {number} affectedRows
   */
  async delete(id) {
    const [result] = await pool.execute(
      'UPDATE registrations SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return result.affectedRows;
  },
};

module.exports = Registration;
