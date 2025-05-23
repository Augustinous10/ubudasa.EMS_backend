const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  name: String,
  phone: { type: String, required: true },
  currentSalary: Number,
  site: { type: Schema.Types.ObjectId, ref: 'Site', required: true }, // ✅ Required site reference
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ✅ Prevent OverwriteModelError on hot-reload
module.exports = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
