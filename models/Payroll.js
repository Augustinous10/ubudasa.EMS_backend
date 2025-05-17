const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: String, // e.g. '2025-05'
    required: true
  },
  totalDays: Number,
  totalSalary: Number
});

module.exports = mongoose.model('Payroll', payrollSchema);
