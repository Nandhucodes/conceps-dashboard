const express = require('express');
const router  = express.Router();

const { getUsers, getUserById, createUser, updateUser, deleteUser, deleteUsers } = require('../controllers/user.controller');
const { createUserValidator, updateUserValidator } = require('../validators/user.validator');
const validate  = require('../middlewares/validate.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');

// All user management routes require a valid JWT + admin role
router.use(protect, authorize('admin'));

// GET    /api/users              – paginated list with filters
router.get('/',         getUsers);

// GET    /api/users/:id          – single user
router.get('/:id',      getUserById);

// POST   /api/users              – create user (admin)
router.post('/',        createUserValidator, validate, createUser);

// PUT    /api/users/:id          – update user
router.put('/:id',      updateUserValidator, validate, updateUser);

// DELETE /api/users/bulk         – bulk delete (must be before /:id)
router.delete('/bulk',  deleteUsers);

// DELETE /api/users/:id          – single delete
router.delete('/:id',  deleteUser);

module.exports = router;
