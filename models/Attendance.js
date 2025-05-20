const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  siteManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendedEmployees: [
    {
      employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
      },
      salary: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: ['Present', 'Absent'],
        default: 'Present'
      },
      paymentStatus: {
        type: String,
        enum: ['PAID', 'UNPAID'],
        default: 'UNPAID'
      },
      paidAt: {
        type: Date,
        default: null
      }
    }
  ],
  groupImage: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 🔐 Ensure only one attendance per siteManager per day
attendanceSchema.index({ siteManager: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
