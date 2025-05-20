const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
 currentSalary: {
    type: Number,
    required: true
  },
 
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Enforce unique phone per site
employeeSchema.index({ phone: 1, site: 1 }, { unique: true });

module.exports = mongoose.model('Employee', employeeSchema);
