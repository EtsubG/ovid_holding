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

// ═════════════════════════════════════════════
// PUBLIC ROUTES — NO AUTH
// ═════════════════════════════════════════════

// Submit application (public)
router.post('/', applicationController.submitApplication);

// 🆕 PUBLIC: Upload documents for a new application
// NO authenticate, NO hrOnly — candidates are not logged in
router.post(
  '/:id/upload',
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'documents', maxCount: 10 },
  ]),
  applicationController.uploadDocuments
);

// ═════════════════════════════════════════════
// PROTECTED ROUTES — HR ONLY
// ═════════════════════════════════════════════

// List all candidates
router.get(
  '/',
  authenticate,
  viewerOrHR,
  applyCompanyScope,
  applicationController.getAllCandidates
);

// Stats
router.get(
  '/stats',
  authenticate,
  viewerOrHR,
  applyCompanyScope,
  applicationController.getDashboardStats
);

// Single candidate
router.get(
  '/:id',
  authenticate,
  viewerOrHR,
  applyCompanyScope,
  applicationController.getCandidateById
);

// Update status
router.put(
  '/:id/status',
  authenticate,
  hrOnly,
  applyCompanyScope,
  applicationController.updateCandidateStatus
);

// Add note
router.post(
  '/:id/notes',
  authenticate,
  hrOnly,
  applyCompanyScope,
  applicationController.addCandidateNote
);

// View document (HR only)
router.get(
  '/:id/documents/:filename',
  authenticate,
  viewerOrHR,
  applicationController.getDocument
);

// Download document (HR only)
router.get(
  '/:id/documents/:filename/download',
  authenticate,
  viewerOrHR,
  applicationController.downloadDocument
);

module.exports = router;