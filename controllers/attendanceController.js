const Attendance = require('../models/Attendance');
const Report = require('../models/Report');
const Employee = require('../models/Employee');

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

// ✅ Create new attendance sheet
exports.createAttendanceSheet = async (req, res) => {
  try {
    const { siteManager, date, attendedEmployees, groupImage } = req.body;

    if (!siteManager || !date || !groupImage || !Array.isArray(attendedEmployees) || attendedEmployees.length === 0) {
      return res.status(400).json({ error: 'siteManager, date, groupImage, and attendedEmployees are required' });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

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

// ✅ Get attendance by date
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

// ✅ Get attendance by employee
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

// ✅ Filter attendance
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

// ✅ Get combined attendance and report
exports.getCombinedAttendanceAndReport = async (req, res) => {
  try {
    const { siteManagerId, date } = req.query;

    if (!siteManagerId || !date) {
      return res.status(400).json({ error: 'siteManagerId and date are required' });
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);
    const dayEnd = new Date(parsedDate);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const attendance = await Attendance.findOne({
      siteManager: siteManagerId,
      date: { $gte: parsedDate, $lt: dayEnd }
    }).populate('attendedEmployees.employee');

    const report = await Report.findOne({
      siteManagerId,
      date: { $gte: parsedDate, $lt: dayEnd }
    });

    res.json({ attendance, report });
  } catch (error) {
    console.error('Error fetching combined attendance and report:', error);
    res.status(500).json({ error: 'Failed to fetch combined data' });
  }
};

// ✅ Get attendance for a specific site manager
exports.getAttendanceBySiteManager = async (req, res) => {
  try {
    const siteManagerId = req.params.siteManagerId;
    const records = await Attendance.find({ siteManager: siteManagerId })
      .sort({ date: -1 })
      .populate('attendedEmployees.employee', 'name');

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance by site manager' });
  }
};

// ✅ Mark attendance as paid
exports.markAttendancePaid = async (req, res) => {
  const { attendanceId, employeeId } = req.params;

  try {
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) return res.status(404).json({ error: 'Attendance not found' });

    const record = attendance.attendedEmployees.find(ae => ae.employee.toString() === employeeId);
    if (!record) return res.status(404).json({ error: 'Employee not found in attendance' });

    record.paymentStatus = 'PAID';
    record.paidAt = new Date();

    await attendance.save();
    res.json({ success: true, message: 'Payment marked as paid' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark payment as paid' });
  }
};

// ✅ Get today's attendance for the logged-in manager
exports.getTodayAttendanceForManager = async (req, res) => {
  const siteManagerId = req.user._id;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  try {
    const record = await Attendance.findOne({
      siteManager: siteManagerId,
      date: { $gte: today, $lt: tomorrow }
    }).populate('attendedEmployees.employee');

    if (!record) {
      return res.status(404).json({ message: 'No attendance found for today' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving today\'s attendance' });
  }
};

// ✅ Finalize attendance with image upload and dynamic employee creation
exports.finalizeAttendance = async (req, res) => {
  try {
    const { employees, date } = JSON.parse(req.body.employees);
    const siteManagerId = req.user._id;
    const imagePath = req.file.path;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Date is required' });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const resolvedEmployees = [];

    for (const e of employees) {
      let employeeDoc = null;

      if (e.employeeId) {
        employeeDoc = await Employee.findById(e.employeeId);
      }

      if (!employeeDoc && e.phone) {
        employeeDoc = await Employee.findOne({ phone: e.phone });

        if (!employeeDoc) {
          employeeDoc = await Employee.create({
            name: e.name,
            phone: e.phone,
            currentSalary: e.salaryToday,
            createdBy: siteManagerId
          });
        }
      }

      if (employeeDoc && employeeDoc._id) {
        resolvedEmployees.push({
          employee: employeeDoc._id,
          salary: e.salaryToday,
          status: e.status || 'Present',
          paymentStatus: 'UNPAID',
          paidAt: null
        });
      }
    }

    if (resolvedEmployees.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid employees to record attendance' });
    }

    const attendance = new Attendance({
      siteManager: siteManagerId,
      groupImage: imagePath,
      date: normalizedDate,
      isFinalized: true,
      attendedEmployees: resolvedEmployees
    });

    await attendance.save();
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Attendance finalize error:', error);
    res.status(500).json({ success: false, error: 'Failed to finalize attendance' });
  }
};

// ✅ Get unpaid attendance records for a site manager within a date range
exports.getUnpaidEmployees = async (req, res) => {
  try {
    const { siteManagerId, startDate, endDate } = req.query;

    if (!siteManagerId || !startDate || !endDate) {
      return res.status(400).json({ error: 'siteManagerId, startDate, and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      siteManager: siteManagerId,
      date: { $gte: start, $lte: end },
      'attendedEmployees.paymentStatus': 'UNPAID'
    }).populate('attendedEmployees.employee', 'name phone');

    const unpaid = records.flatMap(record =>
      record.attendedEmployees
        .filter(emp => emp.paymentStatus === 'UNPAID')
        .map(emp => ({
          attendanceId: record._id,
          employee: emp.employee,
          date: record.date,
          salary: emp.salary
        }))
    );

    res.json({ totalRecords: records.length, unpaid });
  } catch (error) {
    console.error('Error fetching unpaid employees:', error);
    res.status(500).json({ error: 'Failed to get unpaid attendance records' });
  }
};
