// backend/src/routes/interviews.js
const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const {
  authenticate,
  hrOnly,
  viewerOrHR,
  applyCompanyScope,
} = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);
router.use(viewerOrHR);
router.use(applyCompanyScope);

router.get('/', interviewController.getAllInterviews);
router.get('/stats', interviewController.getInterviewStats);
router.get('/candidate/:candidateId', interviewController.getCandidateInterviews);
router.get('/:id', interviewController.getInterviewById);

// Writes — HR only
router.post('/', hrOnly, interviewController.createInterview);
router.put('/:id', hrOnly, interviewController.updateInterview);
router.delete('/:id', hrOnly, interviewController.deleteInterview);

module.exports = router;