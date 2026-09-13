const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancyController');

router.get('/', vacancyController.getAllVacancies);
router.get('/:id', vacancyController.getVacancyById);

module.exports = router;