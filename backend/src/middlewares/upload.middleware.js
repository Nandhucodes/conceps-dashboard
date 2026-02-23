const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

/* ── Ensure uploads folder exists ── */
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* ── Disk storage: keep original extension, unique filename ── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .slice(0, 40);
    const unique = `${basename}_${Date.now()}${ext}`;
    cb(null, unique);
  },
});

/* ── Allow only image types ── */
const fileFilter = (_req, file, cb) => {
  const allowed = /^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, gif, webp, svg).'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

module.exports = upload;
