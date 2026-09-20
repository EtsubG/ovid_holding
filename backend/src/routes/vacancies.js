// backend/src/routes/vacancies.js
const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancyController');
const {
  authenticate,
  hrOnly,
  canManageAllCompanies,
  canWrite,
  applyCompanyScope,
  optionalAuth,
} = require('../middleware/auth');

// ─────────────────────────────────────────────
// PUBLIC routes — but with optional auth
// ─────────────────────────────────────────────
router.get(
  '/',
  optionalAuth,   // 🔒 sets req.companyScope if logged in
  vacancyController.getAllVacancies
);

router.get(
  '/approvals/pending',
  authenticate,
  canManageAllCompanies,
  vacancyController.getPendingApprovals
);

router.get(
  '/:id',
  optionalAuth,
  vacancyController.getVacancyById
);

// ─────────────────────────────────────────────
// PROTECTED routes (HR only)
// ─────────────────────────────────────────────
router.post('/', authenticate, hrOnly, canWrite, applyCompanyScope, vacancyController.createVacancy);
router.put('/:id', authenticate, hrOnly, canWrite, applyCompanyScope, vacancyController.updateVacancy);
router.delete('/:id', authenticate, hrOnly, canWrite, applyCompanyScope, vacancyController.deleteVacancy);
router.patch('/:id/toggle-active', authenticate, hrOnly, canWrite, applyCompanyScope, vacancyController.toggleVacancyActive);
router.patch('/:id/toggle-featured', authenticate, hrOnly, canWrite, applyCompanyScope, vacancyController.toggleVacancyFeatured);
router.post('/:id/submit-approval', authenticate, hrOnly, canWrite, vacancyController.submitForApproval);

router.post('/:id/approve', authenticate, canManageAllCompanies, vacancyController.approveVacancy);
router.post('/:id/reject', authenticate, canManageAllCompanies, vacancyController.rejectVacancy);

module.exports = router;