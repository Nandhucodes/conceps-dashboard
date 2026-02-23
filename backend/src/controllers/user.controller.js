const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response.utils');

// ─── GET /api/users ───────────────────────────────────────────────────────────
/**
 * Paginated, filtered list of all users.
 * Query params: ?page=1&limit=8&search=&role=&status=
 */
const getUsers = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 8);
    const search = req.query.search || '';
    const role   = req.query.role   || '';
    const status = req.query.status || '';

    const { rows, total } = await User.findAll(page, limit, search, role, status);

    return sendSuccess(res, {
      users: rows,
      pagination: {
        currentPage : page,
        totalPages  : Math.ceil(total / limit),
        totalItems  : total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/users/:id ──────────────────────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/users ─────────────────────────────────────────────────────────
/**
 * Admin creates a new user via the users panel.
 *
 * Two paths:
 *  A) Admin supplies a password → user can log in immediately with that
 *     password, no forced change required (is_temp_password = 0).
 *  B) No password supplied → system generates a random temp password,
 *     user must change it on first login (is_temp_password = 1).
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, role, department, status, password } = req.body;

    if (!name || !email) {
      return sendError(res, 'Name and email are required.', 400);
    }

    const existing = await User.findByEmail(email);
    if (existing) return sendError(res, 'An account with this email already exists.', 409);

    const adminSuppliedPassword = password?.trim();
    const crypto = require('crypto');

    let plainPassword, isTempPassword, isPasswordChanged, expiresAt;

    if (adminSuppliedPassword) {
      /* Path A: admin set a real password — user logs in directly, no forced change */
      plainPassword      = adminSuppliedPassword;
      isTempPassword     = 0;
      isPasswordChanged  = 1;
      expiresAt          = null;
    } else {
      /* Path B: auto-generate a temporary password — user must change on first login */
      plainPassword      = `Tmp${crypto.randomBytes(4).toString('hex').toUpperCase()}!9`;
      isTempPassword     = 1;
      isPasswordChanged  = 0;
      expiresAt          = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString().slice(0, 19).replace('T', ' ');
    }

    const password_hash = await bcrypt.hash(plainPassword, 12);

    const userId = await User.createByAdmin({
      name,
      email,
      phone:             phone      || null,
      department:        department || null,
      role:              (role      || 'user').toLowerCase(),
      status:            status     || 'active',
      password_hash,
      created_by_admin:  req.user.id,
      expiresAt,
      isTempPassword,
      isPasswordChanged,
    });

    const newUser = await User.findById(userId);

    return sendSuccess(
      res,
      {
        user: newUser,
        /* In dev, return the password so the admin can share it if needed */
        ...(process.env.NODE_ENV !== 'production' && !adminSuppliedPassword && {
          temp_password: plainPassword,
        }),
      },
      adminSuppliedPassword
        ? 'User created successfully. They can sign in with the provided password.'
        : 'User created successfully. A temporary password has been generated.',
      201
    );
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/:id ──────────────────────────────────────────────────────
/**
 * Admin updates a user's profile (name, email, phone, department, role, status).
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await User.findById(id);
    if (!existing) return sendError(res, 'User not found.', 404);

    const { name, email, phone, department, status, role, password } = req.body;

    // If email changed, ensure no duplicate
    if (email && email !== existing.email) {
      const dup = await User.findByEmail(email);
      if (dup) return sendError(res, 'Email is already used by another account.', 409);
    }

    await User.update(id, {
      name       : name       || existing.name,
      email      : email      || existing.email,
      phone      : phone      ?? existing.phone,
      department : department ?? existing.department,
      status     : status     || existing.status,
      role       : (role      || existing.role).toLowerCase(),
    });

    // Optional password change
    if (password && password.trim().length >= 8) {
      const password_hash = await bcrypt.hash(password, 12);
      await require('../config/db').pool.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [password_hash, id]
      );
    }

    const updated = await User.findById(id);
    return sendSuccess(res, { user: updated }, 'User updated successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/users/:id ───────────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admins from deleting themselves
    if (parseInt(id) === req.user.id) {
      return sendError(res, 'You cannot delete your own account.', 400);
    }

    const existing = await User.findById(id);
    if (!existing) return sendError(res, 'User not found.', 404);

    await User.delete(id);
    return sendSuccess(res, {}, 'User deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/users (bulk) ─────────────────────────────────────────────────
/**
 * Body: { ids: [1, 2, 3] }
 */
const deleteUsers = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 'Provide an array of user IDs to delete.', 400);
    }

    // Prevent self-deletion
    const safeIds = ids.filter(id => parseInt(id) !== req.user.id);
    await User.deleteMany(safeIds);
    return sendSuccess(res, { deleted: safeIds.length }, `${safeIds.length} user(s) deleted.`);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, deleteUsers };
