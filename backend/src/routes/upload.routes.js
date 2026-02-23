const express  = require('express');
const path     = require('path');
const router   = express.Router();
const upload   = require('../middlewares/upload.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { sendSuccess, sendError } = require('../utils/response.utils');

/**
 * POST /api/upload
 * Accepts a single image file under the field name "image".
 * Returns the public URL of the stored file.
 */
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return sendError(res, 'No image file provided.', 400);
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  return sendSuccess(res, { url: fileUrl, filename: req.file.filename }, 'Image uploaded successfully.', 201);
});

module.exports = router;
