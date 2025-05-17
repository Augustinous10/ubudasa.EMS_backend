const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: String,
  phone: String,
  dailySalary: Number,
  photo: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
