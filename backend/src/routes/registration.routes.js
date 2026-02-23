const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateStatus,
  deleteRegistration,
} = require('../controllers/registration.controller');
const { createRegistrationValidator } = require('../validators/registration.validator');

// Public (but user must be logged-in to attach user_id)
router.post('/', protect, createRegistrationValidator, createRegistration);

// Admin-only management routes
router.get('/',     protect, authorize('admin'), getRegistrations);
router.get('/:id',  protect, authorize('admin'), getRegistrationById);
router.patch('/:id/status', protect, authorize('admin'), updateStatus);
router.delete('/:id', protect, authorize('admin'), deleteRegistration);

module.exports = router;
