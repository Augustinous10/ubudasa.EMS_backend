// // routes/reportRoutes.js
// const express = require('express');
// const router = express.Router();
// const reportController = require('../controllers/reportController');

// router.post('/create', reportController.createReport);
// router.get('/all', reportController.getAllReports);

// module.exports = router;

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Route to get all reports
router.get('/', reportController.getAllReports);

// Route to create a report
router.post('/', reportController.createReport);

module.exports = router;

