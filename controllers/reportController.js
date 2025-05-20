// // controllers/reportController.js
// const Report = require('../models/Report');

// // Create a daily report
// exports.createReport = async (req, res) => {
//   try {
//     const { siteManagerId, date, activitiesDone, nextDayPlan, comments } = req.body;
//     const report = new Report({ siteManagerId, date, activitiesDone, nextDayPlan, comments });
//     await report.save();
//     res.status(201).json(report);
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to submit daily report' });
//   }
// };

// // Get all daily reports
// exports.getAllReports = async (req, res) => {
//   try {
//     const reports = await Report.find().populate('siteManagerId', 'name');
//     res.json(reports);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch reports' });
//   }
// };

// const DailyReport = require('../models/DailyReport');

// exports.createDailyReport = async (req, res) => {
//   try {
//     const report = await DailyReport.create(req.body);
//     res.status(201).json(report);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getAllReports = async (req, res) => {
//   try {
//     const reports = await DailyReport.find().sort({ createdAt: -1 });
//     res.status(200).json(reports);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const report = await Report.create(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

