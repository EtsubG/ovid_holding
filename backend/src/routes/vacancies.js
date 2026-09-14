// backend/src/routes/vacancies.js
const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancyController');
const { authenticate, hrOnly, adminOnly, authorize } = require('../middleware/auth');

// ─────────────────────────────────────────────
// PUBLIC routes
// ─────────────────────────────────────────────
router.get('/', vacancyController.getAllVacancies);
router.get('/approvals/pending', authenticate, hrOnly, vacancyController.getPendingApprovals);
router.get('/:id', vacancyController.getVacancyById);

// ─────────────────────────────────────────────
// PROTECTED routes (HR only)
// ─────────────────────────────────────────────
router.post('/', authenticate, hrOnly, vacancyController.createVacancy);
router.put('/:id', authenticate, hrOnly, vacancyController.updateVacancy);
router.delete('/:id', authenticate, hrOnly, vacancyController.deleteVacancy);
router.patch('/:id/toggle-active', authenticate, hrOnly, vacancyController.toggleVacancyActive);
router.patch('/:id/toggle-featured', authenticate, hrOnly, vacancyController.toggleVacancyFeatured);

// 🆕 Approval workflow
router.post('/:id/submit-approval', authenticate, hrOnly, vacancyController.submitForApproval);


// 🆕 Approve/reject — manager or admin only
router.post(
  '/:id/approve',
  authenticate,
  authorize('admin', 'holding_hr'),   // Managers or admins
  vacancyController.approveVacancy
);
router.post(
  '/:id/reject',
  authenticate,
  authorize('admin', 'holding_hr'),
  vacancyController.rejectVacancy
);

module.exports = router;