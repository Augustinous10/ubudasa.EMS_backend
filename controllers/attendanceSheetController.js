const AttendanceSheet = require('../models/AttendanceSheet');
const Employee = require('../models/Employee');
const multer = require('multer');
const path = require('path');

// Assuming Multer is configured globally
exports.createAttendanceSheet = async (req, res) => {
  try {
    const { attendanceRecords, notes } = req.body;
    const createdBy = req.user._id; // or req.siteManager._id
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD only

    // Group photo should be available on req.file if using Multer
    const groupPhoto = req.file ? req.file.path : '';

    const attendanceSheet = new AttendanceSheet({
      date,
      createdBy,
      attendanceRecords,
      groupPhoto,
      notes
    });

    await attendanceSheet.save();
    res.status(201).json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating attendance sheet' });
  }
};
