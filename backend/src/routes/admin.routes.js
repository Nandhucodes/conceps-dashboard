const express  = require('express');
const router   = express.Router();

const { createUser, listUsers }           = require('../controllers/admin.controller');
const { createUserByAdminValidator }      = require('../validators/admin.validator');
const validate                            = require('../middlewares/validate.middleware');
const { protect, authorize }              = require('../middlewares/auth.middleware');

/* All routes under /api/admin require a valid JWT + admin role */
router.use(protect, authorize('admin'));

/**
 * GET  /api/admin/users
 * List all users (paginated, filterable by role / status / search).
 */
router.get('/users', listUsers);

/**
 * POST /api/admin/create-user
 * Create a new user with a temporary password.
 * Body: { name, email, phone?, role?, department?, status?, temp_password? }
 */
router.post('/create-user', createUserByAdminValidator, validate, createUser);

module.exports = router;
