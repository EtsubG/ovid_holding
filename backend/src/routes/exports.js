// backend/src/routes/exports.js
const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticate, viewerOrHR } = require('../middleware/auth');

router.use(authenticate);
router.use(viewerOrHR);

router.get('/candidates/excel', exportController.exportCandidatesExcel);
router.get('/candidates/pdf', exportController.exportCandidatesPDF);

module.exports = router;