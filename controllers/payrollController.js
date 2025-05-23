const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');

// ✅ Get unpaid employees
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

    console.log('Query dates:', from.toISOString(), to.toISOString());

    const attendanceRecords = await Attendance.find({
      siteManager: siteManagerId,
      date: { $gte: from, $lte: to },
    }).populate('attendedEmployees.employee');

    console.log('Total attendance records found:', attendanceRecords.length);

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

    console.log('Unpaid entries found:', unpaidEntries.length);
    res.json({ unpaidEmployees: unpaidEntries });

  } catch (error) {
    console.error('❌ Error fetching unpaid employees:', error);
    res.status(500).json({ error: 'Failed to fetch unpaid employees' });
  }
};

// ✅ Mark employees as paid
exports.markEmployeesAsPaid = async (req, res) => {
  try {
    const { payments } = req.body;
    console.log('📥 Incoming request body:', payments);

    if (!Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({ error: 'payments must be a non-empty array' });
    }

    const paymentRecords = [];

    for (const p of payments) {
      const { employeeId, siteManager, date } = p;

      if (!mongoose.Types.ObjectId.isValid(employeeId) || !mongoose.Types.ObjectId.isValid(siteManager)) {
        console.warn(`⚠️ Invalid ObjectId: employeeId=${employeeId}, siteManager=${siteManager}`);
        continue;
      }

      const siteManagerId = new mongoose.Types.ObjectId(siteManager);
      const employeeObjectId = new mongoose.Types.ObjectId(employeeId);
      const targetDate = new Date(date);

      const from = new Date(targetDate);
      const to = new Date(targetDate);
      from.setUTCHours(0, 0, 0, 0);
      to.setUTCHours(23, 59, 59, 999);

      console.log(`➡️ Processing payment for employee ${employeeId} on ${targetDate.toISOString()}`);

      const attendance = await Attendance.findOne({
        siteManager: siteManagerId,
        date: { $gte: from, $lte: to },
      });

      if (!attendance) {
        console.warn(`⚠️ No attendance found for siteManager=${siteManagerId} on ${targetDate.toDateString()}`);
        continue;
      }

      const attended = attendance.attendedEmployees.find(
        (ae) => ae.employee.toString() === employeeObjectId.toString()
      );

      if (!attended) {
        console.warn(`⚠️ Employee ${employeeId} not found in attendance`);
        continue;
      }

      if (attended.paymentStatus === 'PAID') {
        console.log(`✅ Employee ${employeeId} already marked as paid`);
        continue;
      }

      attended.paymentStatus = 'PAID';
      attended.paidAt = new Date();

      await attendance.save();
      console.log(`✔️ Updated attendance for employee ${employeeId}`);

      const existingPayment = await Payment.findOne({
        employee: employeeObjectId,
        siteManager: siteManagerId,
        date: { $gte: from, $lte: to },
      });

      if (existingPayment) {
        console.log(`🛑 Payment already recorded for employee ${employeeId}`);
        continue;
      }

      const newPayment = new Payment({
        employee: employeeObjectId,
        date: targetDate,
        siteManager: siteManagerId,
        status: 'paid',
      });

      await newPayment.save();
      paymentRecords.push(newPayment);
      console.log(`💰 Payment recorded for employee ${employeeId}`);
    }

    res.status(201).json({ message: 'Marked as paid', records: paymentRecords });

  } catch (error) {
    console.error('❌ Error marking employees as paid:', error);
    res.status(500).json({ error: 'Failed to mark employees as paid' });
  }
};

// ✅ Get payment history
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

    const history = await Payment.find({
      siteManager: siteManagerId,
      date: { $gte: from, $lte: to },
    }).populate('employee');

    res.json({ paymentHistory: history });

  } catch (error) {
    console.error('❌ Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};
