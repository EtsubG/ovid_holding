// backend/src/routes/vacancies.js
const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancyController');
const {
  authenticate,
  hrOnly,
  adminOnly,
  canManageAllCompanies,
  canWrite,
  applyCompanyScope,
} = require('../middleware/auth');

// ─────────────────────────────────────────────
// PUBLIC routes (anyone can read active vacancies)
// ─────────────────────────────────────────────
router.get('/', vacancyController.getAllVacancies);

// 🆕 Must be BEFORE /:id — get pending approvals
router.get(
  '/approvals/pending',
  authenticate,
  canManageAllCompanies,
  vacancyController.getPendingApprovals
);

// Public single vacancy
router.get('/:id', vacancyController.getVacancyById);

// ─────────────────────────────────────────────
// PROTECTED routes (HR only)
// ─────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  hrOnly,
  canWrite,
  applyCompanyScope,
  vacancyController.createVacancy
);

router.put(
  '/:id',
  authenticate,
  hrOnly,
  canWrite,
  applyCompanyScope,
  vacancyController.updateVacancy
);

router.delete(
  '/:id',
  authenticate,
  hrOnly,
  canWrite,
  applyCompanyScope,
  vacancyController.deleteVacancy
);

router.patch(
  '/:id/toggle-active',
  authenticate,
  hrOnly,
  canWrite,
  applyCompanyScope,
  vacancyController.toggleVacancyActive
);

router.patch(
  '/:id/toggle-featured',
  authenticate,
  hrOnly,
  canWrite,
  applyCompanyScope,
  vacancyController.toggleVacancyFeatured
);

// 🆕 Approval workflow — HR submits
router.post(
  '/:id/submit-approval',
  authenticate,
  hrOnly,
  canWrite,
  vacancyController.submitForApproval
);

// 🆕 Approval workflow — Manager/Admin approves or rejects
router.post(
  '/:id/approve',
  authenticate,
  canManageAllCompanies,
  vacancyController.approveVacancy
);

router.post(
  '/:id/reject',
  authenticate,
  canManageAllCompanies,
  vacancyController.rejectVacancy
);

module.exports = router;