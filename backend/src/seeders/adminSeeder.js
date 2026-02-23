/**
 * Admin Seeder
 *
 * Creates the first admin account directly in the database.
 * Run this ONCE after the schema is set up:
 *
 *   node src/seeders/adminSeeder.js
 *
 * You can change the credentials below before running.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const { pool, testConnection } = require('../config/db');

const ADMIN = {
  name:     'Super Admin',
  email:    'admin@conceps.com',
  password: 'Admin@1234',   // ← change this before running
  role:     'admin',
};

const seed = async () => {
  await testConnection();

  try {
    // Check if admin already exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [ADMIN.email]
    );

    if (existing.length > 0) {
      console.log(`⚠️  Admin already exists with email: ${ADMIN.email}`);
      process.exit(0);
    }

    const password_hash = await bcrypt.hash(ADMIN.password, 12);

    const [result] = await pool.execute(
      `INSERT INTO users
         (name, email, password_hash, role, is_verified, is_password_changed, is_temp_password)
       VALUES (?, ?, ?, 'admin', 1, 1, 0)`,
      [ADMIN.name, ADMIN.email, password_hash]
    );

    console.log('✅ Admin account created successfully!');
    console.log('─────────────────────────────────────');
    console.log(`   ID    : ${result.insertId}`);
    console.log(`   Name  : ${ADMIN.name}`);
    console.log(`   Email : ${ADMIN.email}`);
    console.log(`   Role  : admin`);
    console.log('─────────────────────────────────────');
    console.log('🔐 Use these credentials to log in via POST /api/auth/login');
  } catch (error) {
    console.error('❌ Seeder failed:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

seed();
