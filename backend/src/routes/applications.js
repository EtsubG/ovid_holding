// backend/src/routes/applications.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const upload = require('../config/multer');

// Application routes
router.post('/', applicationController.submitApplication);
router.get('/', applicationController.getAllCandidates);
router.get('/stats', applicationController.getDashboardStats);
router.get('/:id', applicationController.getCandidateById);
router.put('/:id/status', applicationController.updateCandidateStatus);
router.post('/:id/notes', applicationController.addCandidateNote);

// File upload routes
router.post(
  '/:id/upload',
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'documents', maxCount: 10 },
  ]),
  applicationController.uploadDocuments
);
router.get('/:id/documents/:filename', applicationController.getDocument);
router.get('/:id/documents/:filename/download', applicationController.downloadDocument);

module.exports = router;