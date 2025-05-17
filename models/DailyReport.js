const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
  siteManager: String,
  date: {
    type: Date,
    required: true
  },
  startTime: String,
  endTime: String,
  activitiesCompleted: String,
  nextDayPlan: String,
  comments: String
});

module.exports = mongoose.model('DailyReport', dailyReportSchema);
