// backend/src/routes/companies.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate, adminOnly } = require('../middleware/auth');

// ─────────────────────────────────────────────
// PUBLIC routes
// ─────────────────────────────────────────────
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);

// ─────────────────────────────────────────────
// PROTECTED — system_admin only
// ─────────────────────────────────────────────
router.post('/', authenticate, adminOnly, companyController.createCompany);
router.put('/:id', authenticate, adminOnly, companyController.updateCompany);
router.delete('/:id', authenticate, adminOnly, companyController.deleteCompany);
router.get(
  '/:id/check-deletion',
  authenticate,
  adminOnly,
  companyController.checkCompanyDeletion
);

module.exports = router;