const mongoose = require('mongoose');

const tempAttendanceSchema = new mongoose.Schema({
  siteManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone: String,
  name: String,
  salary: Number,
  date: { type: Date, default: () => new Date().setHours(0, 0, 0, 0) }
});

module.exports = mongoose.model('TempAttendance', tempAttendanceSchema);
