// controllers/attendanceController.js
const Attendance = require('../models/Attendance');

// Get all attendance records
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
};

// Create attendance sheet (POST /attendance)
exports.createAttendanceSheet = async (req, res) => {
  try {
    const { employeeId, date } = req.body;
    // TODO: add validation for employeeId and date here

    const attendance = new Attendance({ employeeId, date });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ error: 'Failed to mark attendance' });
  }
};

// Get attendance by date (GET /attendance/date/:date)
exports.getAttendanceByDate = async (req, res) => {
  try {
    const dateParam = req.params.date;
    // Convert string date param to Date object if needed
    const date = new Date(dateParam);
    const records = await Attendance.find({ date });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get attendance by date' });
  }
};

// Get attendance by employee ID (GET /attendance/employee/:employeeId)
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const records = await Attendance.find({ employeeId });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get attendance by employee' });
  }
};
