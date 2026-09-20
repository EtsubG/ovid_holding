
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

// Middleware (only what we need here)
const { authenticate, hrOnly, viewerOrHR, applyCompanyScope } = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const vacancyRoutes = require('./routes/vacancies');
const applicationRoutes = require('./routes/applications');
const referenceRoutes = require('./routes/references');
const exportRoutes = require('./routes/exports');
const interviewRoutes = require('./routes/interviews');

const app = express();
const PORT = process.env.PORT || 5000;

// ═════════════════════════════════════════════
// GLOBAL MIDDLEWARE
// ═════════════════════════════════════════════
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS — supports a comma-separated list of origins in FRONTEND_URL
// e.g. FRONTEND_URL=http://localhost:5173,https://app.example.com
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ═════════════════════════════════════════════
// ROUTES
// ═════════════════════════════════════════════

// Public: Auth (login is public, /me + /users are protected INSIDE the file)
app.use('/api/auth', authRoutes);

// Public: Companies (GET is public, POST/PUT/DELETE protected INSIDE the file)
app.use('/api/companies', companyRoutes);

// Public: Vacancies (GET is public, POST/PUT/DELETE protected INSIDE the file)
app.use('/api/vacancies', vacancyRoutes);

// Public + Protected: Applications
// ⚠️ DO NOT wrap with authenticate/hrOnly here!
// Inside the file:
//   - POST /           → public (submit application)
//   - POST /:id/upload → public (file upload)
//   - GET /            → protected (list, HR only)
//   - PUT /:id/status  → protected (update, HR only)
app.use('/api/applications', applicationRoutes);

// Public: References (all GET, no auth)
app.use('/api/references', referenceRoutes);

// Protected: Exports (HR only — enforced INSIDE the file)
app.use('/api/exports', exportRoutes);

// Protected: Interviews (HR only — enforced INSIDE the file)
app.use('/api/interviews', interviewRoutes);

// ═════════════════════════════════════════════
// HEALTH CHECK
// ═════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ═════════════════════════════════════════════
// ERROR HANDLER
// ═════════════════════════════════════════════
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ═════════════════════════════════════════════
// START SERVER
// ═════════════════════════════════════════════
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // Only alter schema in development — never in production
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synced (alter) in development mode.');
    } else {
      await sequelize.sync();
      console.log('✅ Database synced successfully.');
    }

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