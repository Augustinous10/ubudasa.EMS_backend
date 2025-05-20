const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Excused'],
    default: 'Present'
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const attendanceSheetSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  attendanceRecords: [attendanceRecordSchema],
  groupPhoto: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // or SiteManager
    required: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AttendanceSheet', attendanceSheetSchema);
