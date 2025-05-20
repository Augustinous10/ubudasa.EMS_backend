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
}, { _id: false }); // prevents creating an _id for each subdocument

module.exports = attendanceRecordSchema;
