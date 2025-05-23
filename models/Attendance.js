// const mongoose = require('mongoose');

// const attendedEmployeeSchema = new mongoose.Schema({
//   employee: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Employee',
//     required: true
//   },
//   salary: {
//     type: Number,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['Present', 'Absent'],
//     default: 'Present'
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['PAID', 'UNPAID'],
//     default: 'UNPAID'
//   },
//   paidAt: {
//     type: Date,
//     default: null
//   }
// });

// const attendanceSchema = new mongoose.Schema({
//   siteManager: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   attendedEmployees: [attendedEmployeeSchema],
//   groupImage: {
//     type: String,
//     required: true
//   },
//   date: {
//     type: Date,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // 🕒 Normalize date to midnight before save
// attendanceSchema.pre('save', function (next) {
//   if (this.date instanceof Date) {
//     this.date.setHours(0, 0, 0, 0);
//   }
//   next();
// });

// // 🔐 Unique per siteManager per day
// attendanceSchema.index({ siteManager: 1, date: 1 }, { unique: true });

// module.exports = mongoose.model('Attendance', attendanceSchema);

const mongoose = require('mongoose');

const attendedEmployeeSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Present',
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'UNPAID'],
    default: 'UNPAID',
  },
  paidAt: {
    type: Date,
    default: null,
  },
});

const attendanceSchema = new mongoose.Schema({
  siteManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendedEmployees: [attendedEmployeeSchema],
  groupImage: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Normalize date to UTC midnight on save
attendanceSchema.pre('save', function (next) {
  if (this.date instanceof Date) {
    const d = this.date;
    this.date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }
  next();
});

// Unique index: one attendance per siteManager per day
attendanceSchema.index({ siteManager: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
