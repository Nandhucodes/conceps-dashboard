const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/* ── protect ────────────────────────────────────────────────────────────── */
/**
 * Verifies the JWT in the Authorization header and attaches the fresh
 * user record to req.user.
 *
 * Expected header: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided. Access denied.' });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* Always fetch a fresh row so deactivated / deleted users cannot reuse old tokens */
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    /* Block inactive accounts on every request (not just login) */
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

/* ── authorize ───────────────────────────────────────────────────────────── */
/**
 * Role-based access control middleware factory.
 *
 * Usage:
 *   router.get('/admin-only', protect, authorize('admin'), handler)
 *   router.get('/staff',      protect, authorize('admin', 'manager'), handler)
 *
 * @param {...string} roles – one or more allowed role names
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}.`,
    });
  }
  next();
};

/* ── requirePasswordChange ───────────────────────────────────────────────── */
/**
 * Guards routes that should be inaccessible until the user has set their
 * own password (replaces the admin-assigned temporary one).
 *
 * Place this AFTER `protect` on any route that should be blocked for
 * first-time users:
 *
 *   router.get('/dashboard', protect, requirePasswordChange, handler)
 *
 * The /api/auth/change-password route must NOT use this guard so the
 * user can actually complete the change.
 */
const requirePasswordChange = (req, res, next) => {
  if (!req.user.is_password_changed) {
    return res.status(403).json({
      success: false,
      must_change_password: true,
      message: 'You must change your temporary password before accessing this resource.',
    });
  }
  next();
};

module.exports = { protect, authorize, requirePasswordChange };
