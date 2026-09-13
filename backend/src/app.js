// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

// Middleware
const { authenticate, hrOnly, applyCompanyScope } = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const vacancyRoutes = require('./routes/vacancies');
const applicationRoutes = require('./routes/applications');
const referenceRoutes = require('./routes/references');

const app = express();
const PORT = process.env.PORT || 5001;

// ─────────────────────────────────────────────
// Global middleware
// ─────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─────────────────────────────────────────────
// Public routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/vacancies', vacancyRoutes);
app.use('/api/references', referenceRoutes);

// Public application submission (no auth required)
app.post(
  '/api/applications',
  (req, res, next) => {
    // Allow public to submit — auth handled in controller
    next();
  },
  require('./controllers/applicationController').submitApplication
);

// ─────────────────────────────────────────────
// Protected routes (HR only)
// ─────────────────────────────────────────────
app.use(
  '/api/applications',
  authenticate,
  hrOnly,
  applyCompanyScope,
  applicationRoutes
);

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────
// Error handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Max 25MB per file.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  if (err.message === 'Invalid file type') {
    return res.status(400).json({
      error: 'Invalid file type. PDF, DOC, DOCX, JPG, PNG, ZIP only.',
    });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;