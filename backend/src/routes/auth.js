// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, adminOnly } = require('../middleware/auth');

// ─────────────────────────────────────────────
// Public
// ─────────────────────────────────────────────
router.post('/login', authController.login);

// ─────────────────────────────────────────────
// Authenticated (self)
// ─────────────────────────────────────────────
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, authController.changePassword);

// ─────────────────────────────────────────────
// Admin only — User management
// ─────────────────────────────────────────────
router.post('/register', authenticate, adminOnly, authController.register);
router.get('/users', authenticate, adminOnly, authController.getAllUsers);
router.patch('/users/:id', authenticate, adminOnly, authController.updateUser);
router.delete('/users/:id', authenticate, adminOnly, authController.deleteUser);
router.post(
  '/users/:id/reset-password',
  authenticate,
  adminOnly,
  authController.resetPassword
);
router.patch(
  '/users/:id/toggle-active',
  authenticate,
  adminOnly,
  authController.toggleUserActive
);

module.exports = router;