const { validationResult } = require('express-validator');
const Registration = require('../models/Registration');

/**
 * POST /api/registrations
 * Public – any authenticated user can submit.
 */
const createRegistration = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const {
      firstName, lastName, email, phone,
      dob, gender, department, rolePosition,
      address, city, state, country, pincode,
      notes, bio, newsletter, notifications,
    } = req.body;

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const userId   = req.user ? req.user.id : null;

    const id = await Registration.create({
      userId, fullName, firstName, lastName, email, phone,
      dob, gender, department, rolePosition,
      address, city, state, country, pincode,
      notes, bio,
      newsletter:    newsletter    === true || newsletter    === 'true',
      notifications: notifications === true || notifications === 'true',
    });

    return res.status(201).json({
      success: true,
      message: 'Registration submitted successfully.',
      data: { id },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/registrations
 * Admin only.
 */
const getRegistrations = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit, 10) || 10);
    const search = req.query.search || '';
    const status = req.query.status || '';

    const { total, rows } = await Registration.findAll({ page, limit, search, status });

    return res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/registrations/:id
 * Admin only.
 */
const getRegistrationById = async (req, res, next) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }
    return res.json({ success: true, data: reg });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/registrations/:id/status
 * Admin only – approve or reject.
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    const affected = await Registration.updateStatus(req.params.id, status);
    if (!affected) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }
    return res.json({ success: true, message: `Registration ${status}.` });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/registrations/:id
 * Admin only.
 */
const deleteRegistration = async (req, res, next) => {
  try {
    const affected = await Registration.delete(req.params.id);
    if (!affected) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }
    return res.json({ success: true, message: 'Registration deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateStatus,
  deleteRegistration,
};
