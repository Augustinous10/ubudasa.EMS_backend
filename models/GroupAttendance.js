const mongoose = require('mongoose');

const groupAttendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: () => new Date().setHours(0, 0, 0, 0),
    unique: true
  },
  groupPhoto: { type: String, required: true }
});

module.exports = mongoose.model('GroupAttendance', groupAttendanceSchema);
