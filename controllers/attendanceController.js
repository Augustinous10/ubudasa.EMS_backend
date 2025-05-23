const Attendance = require('../models/Attendance');
const Report = require('../models/Report');

// ✅ Get all attendance records
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .sort({ date: -1, createdAt: -1 })
      .populate('siteManager', 'name email')
      .populate('attendedEmployees.employee', 'name');
    res.json(records);
  } catch (error) {
    console.error('Failed to fetch attendance records:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
};

// ✅ Create new attendance sheet (siteManager + employees for that day)
exports.createAttendanceSheet = async (req, res) => {
  try {
    const { siteManager, date, attendedEmployees, groupImage } = req.body;

    if (!siteManager || !date || !groupImage || !Array.isArray(attendedEmployees) || attendedEmployees.length === 0) {
      return res.status(400).json({ error: 'siteManager, date, groupImage, and attendedEmployees are required' });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // ✅ Check with normalized date
    const existing = await Attendance.findOne({ siteManager, date: normalizedDate });
    if (existing) {
      return res.status(409).json({ error: 'Attendance for this siteManager and date already exists' });
    }

    const attendance = new Attendance({
      siteManager,
      date: normalizedDate,
      groupImage,
      attendedEmployees
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Failed to create attendance sheet:', error);
    res.status(400).json({ error: 'Failed to create attendance sheet' });
  }
};

// ✅ Get attendance by specific date (all managers)
exports.getAttendanceByDate = async (req, res) => {
  try {
    const dayStart = new Date(req.params.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: dayStart, $lt: dayEnd }
    })
      .sort({ createdAt: -1 })
      .populate('siteManager', 'name email')
      .populate('attendedEmployees.employee', 'name');

    res.json(records);
  } catch (error) {
    console.error('Failed to get attendance by date:', error);
    res.status(500).json({ error: 'Failed to get attendance by date' });
  }
};

// ✅ Get all attendance for a given employee
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const records = await Attendance.find({ 'attendedEmployees.employee': employeeId })
      .sort({ date: -1 })
      .populate('siteManager', 'name email')
      .populate('attendedEmployees.employee', 'name');
    res.json(records);
  } catch (error) {
    console.error('Failed to get attendance by employee:', error);
    res.status(500).json({ error: 'Failed to get attendance by employee' });
  }
};

// ✅ Filter by optional query params (date, siteManagerId)
exports.getAttendanceByFilter = async (req, res) => {
  try {
    const { date, siteManagerId } = req.query;
    const query = {};

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      query.date = { $gte: dayStart, $lt: dayEnd };
    }

    if (siteManagerId) query.siteManager = siteManagerId;

    const records = await Attendance.find(query)
      .sort({ date: -1, createdAt: -1 })
      .populate('siteManager', 'name email')
      .populate('attendedEmployees.employee', 'name');

    res.json(records);
  } catch (error) {
    console.error('Failed to get attendance by filter:', error);
    res.status(500).json({ error: 'Failed to get attendance by filter' });
  }
};

// ✅ Combined: Attendance and Report for given siteManager and date
exports.getCombinedAttendanceAndReport = async (req, res) => {
  try {
    const { siteManagerId, date } = req.query;

    if (!siteManagerId || !date) {
      return res.status(400).json({ error: 'siteManagerId and date are required' });
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);
    const dayStart = parsedDate;
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const attendance = await Attendance.findOne({
      siteManager: siteManagerId,
      date: { $gte: dayStart, $lt: dayEnd }
    }).populate('attendedEmployees.employee');

    const report = await Report.findOne({
      siteManagerId,
      date: { $gte: dayStart, $lt: dayEnd }
    });

    res.json({ attendance, report });
  } catch (error) {
    console.error('Error fetching combined attendance and report:', error);
    res.status(500).json({ error: 'Failed to fetch combined data' });
  }
};
