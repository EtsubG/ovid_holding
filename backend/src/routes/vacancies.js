// backend/src/routes/vacancies.js
const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancyController');
const { authenticate, hrOnly, applyCompanyScope } = require('../middleware/auth');

// ─────────────────────────────────────────────
// PUBLIC routes (anyone can read active vacancies)
// ─────────────────────────────────────────────
router.get('/', vacancyController.getAllVacancies);
router.get('/:id', vacancyController.getVacancyById);

// ─────────────────────────────────────────────
// PROTECTED routes (HR only)
// ─────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  hrOnly,
  applyCompanyScope,
  vacancyController.createVacancy
);

router.put(
  '/:id',
  authenticate,
  hrOnly,
  applyCompanyScope,
  vacancyController.updateVacancy
);

router.delete(
  '/:id',
  authenticate,
  hrOnly,
  applyCompanyScope,
  vacancyController.deleteVacancy
);

router.patch(
  '/:id/toggle-active',
  authenticate,
  hrOnly,
  applyCompanyScope,
  vacancyController.toggleVacancyActive
);

router.patch(
  '/:id/toggle-featured',
  authenticate,
  hrOnly,
  applyCompanyScope,
  vacancyController.toggleVacancyFeatured
);

module.exports = router;