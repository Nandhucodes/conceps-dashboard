const { pool } = require('../config/db');

/**
 * Product Model – all queries against the `products` table.
 * All deletes are SOFT: deleted_at is set instead of removing the row.
 */
const Product = {
  /**
   * Paginated list of non-deleted active products.
   * @param {number} page  – 1-based page number
   * @param {number} limit – rows per page
   * @returns {{ rows: object[], total: number }}
   */
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `SELECT id, name, description, price, stock, category, image_url, status, created_at
       FROM products
       WHERE status = 'active' AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countRows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM products WHERE status = 'active' AND deleted_at IS NULL"
    );

    return { rows, total: countRows[0].total };
  },

  /**
   * Single non-deleted product by ID.
   * @param {number} id
   * @returns {object|null}
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ? AND deleted_at IS NULL LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Insert a new product.
   * @param {{ name, description, price, stock, category, image_url, created_by }} data
   * @returns {number} insertId
   */
  async create({ name, description, price, stock, category, image_url, created_by }) {
    const [result] = await pool.execute(
      `INSERT INTO products (name, description, price, stock, category, image_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description ?? null, price, stock ?? 0, category ?? null, image_url ?? null, created_by ?? null]
    );
    return result.insertId;
  },

  /**
   * Soft-delete a product by setting deleted_at to now.
   * @param {number} id
   * @returns {number} affectedRows
   */
  async delete(id) {
    const [result] = await pool.execute(
      'UPDATE products SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return result.affectedRows;
  },

  /**
   * Total count of non-deleted active products (used by dashboard).
   * @returns {number}
   */
  async count() {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM products WHERE status = 'active' AND deleted_at IS NULL"
    );
    return rows[0].total;
  },

  /**
   * Revenue sum from all non-deleted active products (price × stock).
   * @returns {number}
   */
  async totalRevenue() {
    const [rows] = await pool.execute(
      "SELECT COALESCE(SUM(price * stock), 0) AS revenue FROM products WHERE status = 'active' AND deleted_at IS NULL"
    );
    return rows[0].revenue;
  },
};

module.exports = Product;
