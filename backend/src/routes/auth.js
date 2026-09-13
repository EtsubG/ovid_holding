// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, adminOnly } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);

// Authenticated routes
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, authController.changePassword);

// Admin only routes
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

module.exports = router;