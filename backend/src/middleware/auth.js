// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User, Company } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'ovid-holding-secret-key-change-me';
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
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Company, as: 'company' }],
    });

    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.isActive) return res.status(401).json({ error: 'Account is disabled' });

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
// Require specific roles
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
// Preset role guards
// ─────────────────────────────────────────────

// Full admin (system_admin only)
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'system_admin') {
    return res.status(403).json({ error: 'System admin access required' });
  }
  next();
};

// Any HR-level user (can manage candidates, vacancies)
exports.hrOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  const allowed = ['system_admin', 'holding_hr', 'company_hr'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ error: 'HR access required' });
  }
  next();
};

// Management or HR (can view dashboards)
exports.viewerOrHR = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  const allowed = ['system_admin', 'holding_hr', 'company_hr', 'management'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

// Users who can write (not management)
exports.canWrite = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.role === 'management') {
    return res.status(403).json({ error: 'Management role is read-only' });
  }
  next();
};

// Can manage vacancies across all companies
exports.canManageAllCompanies = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  const allowed = ['system_admin', 'holding_hr'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ error: 'Holding-level access required' });
  }
  next();
};

// ─────────────────────────────────────────────
// Company scoping middleware
// Attaches `req.companyScope`:
//   - null  = no restriction (system_admin, holding_hr, management)
//   - string = company ID (company_hr is restricted to this)
// ─────────────────────────────────────────────
exports.applyCompanyScope = (req, res, next) => {
  if (!req.user) return next();

  // Global roles — no restriction
  if (['system_admin', 'holding_hr', 'management'].includes(req.user.role)) {
    req.companyScope = null;
    return next();
  }

  // Company HR — restricted to their assigned company
  if (req.user.role === 'company_hr') {
    if (!req.user.companyId) {
      return res.status(403).json({
        error: 'Company HR user has no company assigned. Contact system admin.',
      });
    }
    req.companyScope = req.user.companyId;
    return next();
  }

  next();
};

// ─────────────────────────────────────────────
// Helper: build a company-scoped WHERE clause
// Usage in controllers:
//   const where = applyCompanyWhere(req, baseWhere);
// ─────────────────────────────────────────────
exports.buildCompanyWhere = (req, baseWhere = {}) => {
  const where = { ...baseWhere };
  if (req.companyScope) {
    where.preferredCompany = req.companyScope;
  }
  return where;
};

// ─────────────────────────────────────────────
// Check if user can write to a specific company
// Usage: assertCompanyAccess(req, vacancy.companyId)
// ─────────────────────────────────────────────
exports.canAccessCompany = (req, companyId) => {
  if (!req.user) return false;
  // Global roles can access any company
  if (['system_admin', 'holding_hr', 'management'].includes(req.user.role)) {
    return true;
  }
  // Company HR only their own
  if (req.user.role === 'company_hr') {
    return req.user.companyId === companyId;
  }
  return false;
};

// Middleware: assert access to a specific companyId (from req.body or req.params)
exports.assertCompanyAccess = (getCompanyId) => {
  return (req, res, next) => {
    const companyId = getCompanyId(req);
    if (!companyId) return next();

    if (!exports.canAccessCompany(req, companyId)) {
      return res.status(403).json({
        error: 'You do not have access to this company',
      });
    }
    next();
  };
};
// backend/src/middleware/auth.js

// ─────────────────────────────────────────────
// Optional authentication — sets req.user if token valid, but doesn't block
// Use for endpoints that are PUBLIC but behave differently for HR users
// ─────────────────────────────────────────────
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) return next();

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'ovid-holding-secret-key-change-me';

    const decoded = jwt.verify(token, JWT_SECRET);
    const { User, Company } = require('../models');
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Company, as: 'company' }],
    });

    if (user && user.isActive) {
      req.user = user;
      // Set company scope for company_hr
      if (user.role === 'company_hr' && user.companyId) {
        req.companyScope = user.companyId;
      } else {
        req.companyScope = null;
      }
    }
    next();
  } catch (error) {
    // Silently ignore — public can still access
    next();
  }
};