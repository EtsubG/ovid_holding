// backend/src/routes/exports.js
const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticate, hrOnly } = require('../middleware/auth');

// All export routes require HR auth
router.use(authenticate);
router.use(hrOnly);

router.get('/candidates/excel', exportController.exportCandidatesExcel);
router.get('/candidates/pdf', exportController.exportCandidatesPDF);

module.exports = router;