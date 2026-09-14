// backend/src/routes/interviews.js
const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticate, hrOnly } = require('../middleware/auth');

// All interview routes require HR auth
router.use(authenticate);
router.use(hrOnly);

router.get('/', interviewController.getAllInterviews);
router.get('/stats', interviewController.getInterviewStats);
router.get('/candidate/:candidateId', interviewController.getCandidateInterviews);
router.get('/:id', interviewController.getInterviewById);

router.post('/', interviewController.createInterview);
router.put('/:id', interviewController.updateInterview);
router.delete('/:id', interviewController.deleteInterview);

module.exports = router;