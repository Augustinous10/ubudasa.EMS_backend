// // routes/payrollRoutes.js
// const express = require('express');
// const router = express.Router();
// const payrollController = require('../controllers/payrollController');

// router.get('/generate', payrollController.generatePayroll);

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const payrollController = require('../controllers/payrollController');

// // Get payroll report
// router.get('/', payrollController.getPayroll);

// module.exports = router;

const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

// Live preview of payroll (based on attendance)
router.get('/', payrollController.getPayroll);

// Mark current month payroll as paid and save in DB
router.post('/pay', payrollController.markPayrollAsPaid);

// Get payroll history
router.get('/history', payrollController.getPayrollHistory);

module.exports = router;
