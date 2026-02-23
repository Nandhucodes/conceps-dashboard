// Load environment variables FIRST before any other import
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { testConnection } = require('./src/config/db');
const { errorHandler, notFound } = require('./src/middlewares/error.middleware');

// ─── Route imports ────────────────────────────────────────────────────────────
const authRoutes         = require('./src/routes/auth.routes');
const productRoutes      = require('./src/routes/product.routes');
const dashboardRoutes    = require('./src/routes/dashboard.routes');
const userRoutes         = require('./src/routes/user.routes');
const registrationRoutes = require('./src/routes/registration.routes');
const uploadRoutes       = require('./src/routes/upload.routes');
const adminRoutes        = require('./src/routes/admin.routes');

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow requests only from the frontend origin defined in .env.
// In production, set FRONTEND_ORIGIN to your deployed domain.
const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,            // Required if you send cookies / auth headers
  optionsSuccessStatus: 200,    // Some legacy browsers choke on 204
};
app.use(cors(corsOptions));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static: serve uploaded images ────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running.', status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/admin',         adminRoutes);

// ─── 404 & Global Error Handler ──────────────────────────────────────────────
// notFound must come after all routes; errorHandler must be very last
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await testConnection(); // Fail fast if DB is not reachable
  app.listen(PORT, () => {
    console.log(`🚀 Backend API running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();
