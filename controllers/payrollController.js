const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');

// Get unpaid employees within a date range for a site manager
exports.getUnpaidEmployees = async (req, res) => {
  try {
    const { siteManagerId, startDate, endDate } = req.query;

    if (!siteManagerId || !startDate || !endDate) {
      return res.status(400).json({ error: 'siteManagerId, startDate, and endDate are required' });
    }

    const from = new Date(startDate);
    const to = new Date(endDate);
    from.setUTCHours(0, 0, 0, 0);
    to.setUTCHours(23, 59, 59, 999);

    // Find attendance records in date range for this site manager
    const attendanceRecords = await Attendance.find({
      siteManager: siteManagerId,
      date: { $gte: from, $lte: to },
    }).populate('attendedEmployees.employee');

    const unpaidEntries = [];

    for (const record of attendanceRecords) {
      for (const attended of record.attendedEmployees) {
        if (attended.paymentStatus === 'UNPAID') {
          unpaidEntries.push({
            employee: attended.employee,
            date: record.date,
            siteManager: siteManagerId,
          });
        }
      }
    }

    res.json({ unpaidEmployees: unpaidEntries });

  } catch (error) {
    console.error('Error fetching unpaid employees:', error);
    res.status(500).json({ error: 'Failed to fetch unpaid employees' });
  }
};

// Mark employees as paid (accepts payments array in request body)
exports.markEmployeesAsPaid = async (req, res) => {
  try {
    const { payments } = req.body;

    if (!Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({ error: 'payments must be a non-empty array' });
    }

    const paymentRecords = [];

    for (const p of payments) {
      const { employeeId, siteManager, date } = p;

      if (!mongoose.Types.ObjectId.isValid(employeeId) || !mongoose.Types.ObjectId.isValid(siteManager)) {
        console.warn(`Invalid ObjectId: employeeId=${employeeId}, siteManager=${siteManager}`);
        continue;
      }

      const siteManagerId = new mongoose.Types.ObjectId(siteManager);
      const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

      const targetDate = new Date(date);
      const from = new Date(targetDate);
      const to = new Date(targetDate);
      from.setUTCHours(0, 0, 0, 0);
      to.setUTCHours(23, 59, 59, 999);

      // Find attendance for that site manager on that date
      const attendance = await Attendance.findOne({
        siteManager: siteManagerId,
        date: { $gte: from, $lte: to },
      });

      if (!attendance) {
        console.warn(`No attendance found for siteManager=${siteManagerId} on ${targetDate.toDateString()}`);
        continue;
      }

      const attended = attendance.attendedEmployees.find(ae =>
        ae.employee.toString() === employeeObjectId.toString()
      );

      if (!attended) {
        console.warn(`Employee ${employeeId} not found in attendance`);
        continue;
      }

      if (attended.paymentStatus === 'PAID') {
        console.log(`Employee ${employeeId} already marked as paid`);
        continue;
      }

      // Update payment status and paid timestamp
      attended.paymentStatus = 'PAID';
      attended.paidAt = new Date();

      try {
        await attendance.save();
      } catch (err) {
        console.error(`Failed to update attendance for employee ${employeeId}:`, err);
        continue;
      }

      // Check if payment record already exists to avoid duplicates
      const existingPayment = await Payment.findOne({
        employee: employeeObjectId,
        siteManager: siteManagerId,
        date: { $gte: from, $lte: to },
      });

      if (existingPayment) {
        console.log(`Payment already exists for employee ${employeeId}`);
        continue;
      }

      // Create new payment record
      const newPayment = new Payment({
        employee: employeeObjectId,
        siteManager: siteManagerId,
        date: targetDate,
        status: 'paid',
      });

      try {
        await newPayment.save();
        paymentRecords.push(newPayment);
        console.log(`Payment recorded for employee ${employeeId}`);
      } catch (err) {
        console.error(`Failed to record payment for employee ${employeeId}:`, err);
      }
    }

    res.status(201).json({ message: 'Marked as paid', records: paymentRecords });

  } catch (error) {
    console.error('Error marking employees as paid:', error);
    res.status(500).json({ error: 'Failed to mark employees as paid' });
  }
};

// Get payment history from attendance for employees marked as paid within a date range
exports.getPaymentHistory = async (req, res) => {
  try {
    const { siteManagerId, startDate, endDate } = req.query;

    if (!siteManagerId || !startDate || !endDate) {
      return res.status(400).json({ error: 'siteManagerId, startDate, and endDate are required' });
    }

    const from = new Date(startDate);
    const to = new Date(endDate);
    from.setUTCHours(0, 0, 0, 0);
    to.setUTCHours(23, 59, 59, 999);

    // Query attendance for site manager and date range where at least one employee is paid
    const attendanceRecords = await Attendance.find({
      siteManager: siteManagerId,
      date: { $gte: from, $lte: to },
      'attendedEmployees.paymentStatus': 'PAID',
    }).populate('attendedEmployees.employee');

    const paymentHistory = [];

    for (const record of attendanceRecords) {
      for (const attended of record.attendedEmployees) {
        if (attended.paymentStatus === 'PAID') {
          paymentHistory.push({
            employee: attended.employee,
            siteManager: siteManagerId,
            date: record.date,
            salary: attended.salary,
            paidAt: attended.paidAt || record.updatedAt,
          });
        }
      }
    }

    res.json({ paymentHistory });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};
