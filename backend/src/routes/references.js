const express = require('express');
const router = express.Router();
const referenceController = require('../controllers/referenceController');

router.get('/departments', referenceController.getDepartments);
router.get('/job-categories', referenceController.getJobCategories);
router.get('/locations', referenceController.getLocations);
router.get('/pipeline-stages', referenceController.getPipelineStages);

module.exports = router;