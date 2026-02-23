const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Creates a MySQL connection pool.
 * Using a pool allows multiple concurrent requests to reuse connections
 * instead of opening/closing a new connection per query.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00', // Store all dates in UTC
});

/**
 * Verifies the database connection on startup.
 * Throws an error and exits if the DB is unreachable.
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully.');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
