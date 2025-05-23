// const mongoose = require('mongoose');

// const payrollSchema = new mongoose.Schema({
//   employee: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Employee',
//     required: true
//   },
//   month: {
//     type: String, // e.g. '2025-05'
//     required: true
//   },
//   totalDays: Number,
//   totalSalary: Number
// });

// module.exports = mongoose.model('Payroll', payrollSchema);

const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  siteManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  periodStart: Date,
  periodEnd: Date,
  daysWorked: Number,
  amountPaid: Number,
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
