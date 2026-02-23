const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const User    = require('../models/User');
const { sendSuccess, sendError }       = require('../utils/response.utils');
const { sendTempPasswordEmail }        = require('../services/email.service');

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/**
 * Generate a cryptographically secure temporary password.
 * Format: 3 uppercase + 4 digits + 3 symbols → e.g. "ABc1234!@#"
 * Shuffled so it isn't predictably ordered.
 */
const generateTempPassword = () => {
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower   = 'abcdefghjkmnpqrstuvwxyz';
  const digits  = '23456789';
  const symbols = '!@#$%&*';

  const pick = (charset, n) =>
    Array.from({ length: n }, () =>
      charset[crypto.randomInt(0, charset.length)]
    ).join('');

  const parts = pick(upper, 2) + pick(lower, 2) + pick(digits, 3) + pick(symbols, 2);

  /* Fisher-Yates shuffle */
  const arr = parts.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};

/**
 * Return a DateTime string N hours from now.
 * @param {number} hours
 * @returns {string} 'YYYY-MM-DD HH:MM:SS'
 */
const futureDateTime = (hours = 24) => {
  const d = new Date(Date.now() + hours * 60 * 60 * 1000);
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

/* ── POST /api/admin/create-user ─────────────────────────────────────────── */
/**
 * Admin creates a new user account.
 *
 * Flow (Option 2 – auto-generated temp password):
 *  1. Validate inputs.
 *  2. Check for duplicate email.
 *  3. Generate (or accept admin-supplied) temporary password.
 *  4. Hash password with bcrypt (cost 12).
 *  5. Insert user with is_password_changed=0, is_temp_password=1.
 *  6. Send welcome email with the plaintext temp password.
 *  7. Return the new user (without password_hash).
 *
 * The plaintext temp password is also included in the response
 * in non-production environments so the admin can share it manually.
 */
const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      role          = 'user',
      department,
      status        = 'active',
      temp_password,          // optional: admin provides their own temp pw
    } = req.body;

    /* 1. Duplicate check */
    const existing = await User.findByEmail(email);
    if (existing) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    /* 2. Resolve temp password */
    const plainTextPassword = temp_password?.trim() || generateTempPassword();

    /* 3. Hash (bcrypt cost 12 is safe for production) */
    const password_hash = await bcrypt.hash(plainTextPassword, 12);

    /* 4. Expiry: 24 hours from now */
    const expiresAt = futureDateTime(24);

    /* 5. Persist */
    const userId = await User.createByAdmin({
      name,
      email,
      phone:           phone || null,
      department:      department || null,
      role:            role.toLowerCase(),
      status,
      password_hash,
      created_by_admin: req.user.id,
      expiresAt,
    });

    /* 6. Send welcome email (fire-and-forget; don't block the response) */
    sendTempPasswordEmail({
      name,
      email,
      tempPassword:   plainTextPassword,
      expiresInHours: 24,
    }).catch(err => console.error('⚠️  Welcome email failed:', err.message));

    /* 7. Return new user */
    const newUser = await User.findById(userId);

    return sendSuccess(
      res,
      {
        user: newUser,
        /* Expose temp password in dev so admin can relay it manually */
        ...(process.env.NODE_ENV !== 'production' && {
          temp_password: plainTextPassword,
        }),
      },
      'User created successfully. A temporary password has been sent to their email.',
      201
    );
  } catch (error) {
    next(error);
  }
};

/* ── GET /api/admin/users ─────────────────────────────────────────────────── */
/**
 * Paginated list of all users with filters.
 * Query params: page, limit, search, role, status
 */
const listUsers = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 10);
    const search = req.query.search || '';
    const role   = req.query.role   || '';
    const status = req.query.status || '';

    const { rows, total } = await User.findAll(page, limit, search, role, status);

    return sendSuccess(res, {
      users: rows,
      pagination: {
        currentPage:  page,
        totalPages:   Math.ceil(total / limit),
        totalItems:   total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, listUsers };
