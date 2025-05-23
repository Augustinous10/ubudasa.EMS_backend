const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  siteManager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' }
}, { timestamps: true });

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
