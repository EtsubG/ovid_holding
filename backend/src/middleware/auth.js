// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User, Company } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'ovid-holding-super-secret-key-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ─────────────────────────────────────────────
// Token generation
// ─────────────────────────────────────────────
exports.generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// ─────────────────────────────────────────────
// Require authentication
// ─────────────────────────────────────────────
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Company, as: 'company' }],
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// ─────────────────────────────────────────────
// Restrict by role
// ─────────────────────────────────────────────
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
};

// ─────────────────────────────────────────────
// HR access (holding_hr, company_hr, admin)
// ─────────────────────────────────────────────
exports.hrOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const allowed = ['admin', 'holding_hr', 'company_hr'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ error: 'HR access required' });
  }

  next();
};

// ─────────────────────────────────────────────
// Admin only
// ─────────────────────────────────────────────
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// ─────────────────────────────────────────────
// Company-level filter
// If company_hr, they only see their own company's data
// ─────────────────────────────────────────────
exports.applyCompanyScope = (req, res, next) => {
  if (!req.user) return next();

  // Holding HR and admin see everything
  if (req.user.role === 'admin' || req.user.role === 'holding_hr') {
    return next();
  }

  // Company HR — restrict to own company
  if (req.user.role === 'company_hr' && req.user.companyId) {
    req.companyScope = req.user.companyId;
  }

  next();
};