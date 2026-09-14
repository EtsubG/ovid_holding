// backend/src/routes/applications.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const upload = require('../config/multer');
const {
  authenticate,
  hrOnly,
  viewerOrHR,
  applyCompanyScope,
} = require('../middleware/auth');

// ─────────────────────────────────────────────
// PUBLIC — submit application
// ─────────────────────────────────────────────
router.post('/', applicationController.submitApplication);

// ─────────────────────────────────────────────
// PROTECTED — HR list + stats (viewers or higher, company scoped)
// ─────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  viewerOrHR,
  applyCompanyScope,
  applicationController.getAllCandidates
);

router.get(
  '/stats',
  authenticate,
  viewerOrHR,
  applyCompanyScope,
  applicationController.getDashboardStats
);

router.get(
  '/:id',
  authenticate,
  viewerOrHR,
  applyCompanyScope,
  applicationController.getCandidateById
);

// ─────────────────────────────────────────────
// HR write — no management
// ─────────────────────────────────────────────
router.put(
  '/:id/status',
  authenticate,
  hrOnly,
  applyCompanyScope,
  applicationController.updateCandidateStatus
);

router.post(
  '/:id/notes',
  authenticate,
  hrOnly,
  applyCompanyScope,
  applicationController.addCandidateNote
);

// ─────────────────────────────────────────────
// Document routes
// ─────────────────────────────────────────────
router.post(
  '/:id/upload',
  authenticate,
  hrOnly,
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'documents', maxCount: 10 },
  ]),
  applicationController.uploadDocuments
);

router.get(
  '/:id/documents/:filename',
  authenticate,
  viewerOrHR,
  applicationController.getDocument
);

router.get(
  '/:id/documents/:filename/download',
  authenticate,
  viewerOrHR,
  applicationController.downloadDocument
);

module.exports = router;