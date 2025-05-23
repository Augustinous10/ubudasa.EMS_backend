const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

// Get unpaid employees between dates
router.get('/unpaid', payrollController.getUnpaidEmployees);

// Mark employees as paid
router.post('/mark-paid', payrollController.markEmployeesAsPaid);

// View payment history
router.get('/history', payrollController.getPaymentHistory);

module.exports = router;
