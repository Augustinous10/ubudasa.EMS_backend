const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    console.log('📥 Incoming request to createReport');
    console.log('➡️ Request body:', req.body);
    console.log('➡️ Authenticated user:', req.user);

    const siteManagerId = req.user?._id;
    const { date, activitiesDone, nextDayPlan, comments } = req.body;

    if (!siteManagerId) {
      return res.status(401).json({ message: 'Unauthorized: site manager ID missing' });
    }

    if (!date || !activitiesDone || !nextDayPlan) {
      return res.status(400).json({
        message: 'Date, activitiesDone, and nextDayPlan are required',
      });
    }

    // Normalize date to remove time
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    console.log('📅 Normalized Date:', normalizedDate);

    // Check if report already exists
    const existingReport = await Report.findOne({
      siteManagerId,
      date: normalizedDate,
    });

    if (existingReport) {
      console.warn('⚠️ Report already exists for this date.');
      return res.status(400).json({
        message: 'A report already exists for this date.',
      });
    }

    // Create and save the report
    const report = await Report.create({
      siteManagerId,
      date: normalizedDate,
      activitiesDone,
      nextDayPlan,
      comments,
    });

    console.log('✅ Report created:', report._id);
    res.status(201).json(report);
  } catch (error) {
    console.error('❌ Error in createReport:', error);
    res.status(500).json({
      message: 'Failed to create report',
      error: error.message,
    });
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

exports.getReportsByDateAndManager = async (req, res) => {
  try {
    const { date, siteManagerId } = req.query;

    const query = {};
    if (date) query.date = new Date(date);
    if (siteManagerId) query.siteManagerId = siteManagerId;

    const reports = await Report.find(query)
      .populate('siteManagerId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
