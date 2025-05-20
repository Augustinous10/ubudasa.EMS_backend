// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  siteManagerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  activitiesDone: {
    type: String,
    required: true
  },
  nextDayPlan: {
    type: String,
    required: true
  },
  comments: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
