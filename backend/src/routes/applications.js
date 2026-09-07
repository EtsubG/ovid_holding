const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

router.post('/', applicationController.submitApplication);
router.get('/', applicationController.getAllCandidates);
router.get('/stats', applicationController.getDashboardStats);
router.get('/:id', applicationController.getCandidateById);
router.put('/:id/status', applicationController.updateCandidateStatus);
router.post('/:id/notes', applicationController.addCandidateNote);

module.exports = router;