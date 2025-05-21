const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { siteManagerAuth } = require('../middlewares/auth');


// Route to get all reports
router.get('/', reportController.getAllReports);

// ✅ Protect the POST route so req.user is set
router.post('/', siteManagerAuth, reportController.createReport);

// Optional: route to get reports by filter
router.get('/filter', reportController.getReportsByDateAndManager);

module.exports = router;
