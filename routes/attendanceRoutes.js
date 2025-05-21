// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const Attendance = require('../models/Attendance');
// const Employee = require('../models/Employee');
// const attendanceController = require('../controllers/attendanceController');

// // Setup Multer
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });
// const upload = multer({ storage });

// router.post('/attendance/finalize', upload.single('group_image'), async (req, res) => {
//   try {
//     const { employees, date } = JSON.parse(req.body.employees);
//     const siteManagerId = req.user._id;
//     const imagePath = req.file.path;

//     if (!date) {
//       return res.status(400).json({ success: false, error: 'Date is required' });
//     }

//     const normalizedDate = new Date(date);
//     normalizedDate.setHours(0, 0, 0, 0);

//     const resolvedEmployees = [];

//     for (const e of employees) {
//       let employeeDoc;

//       // First, try finding the employee
//       if (e.employeeId) {
//         employeeDoc = await Employee.findById(e.employeeId);
//       } else if (e.phone) {
//         employeeDoc = await Employee.findOne({ phone: e.phone });

//         // If not found, create a new one
//         if (!employeeDoc) {
//           employeeDoc = await Employee.create({
//             name: e.name,
//             phone: e.phone,
//             currentSalary: e.salaryToday,
//             createdBy: siteManagerId
//           });
//         }
//       }

//       if (employeeDoc) {
//         resolvedEmployees.push({
//           employee: employeeDoc._id,
//           salary: e.salaryToday,
//           status: e.status || 'Present',
//           paymentStatus: 'UNPAID',
//           paidAt: null
//         });
//       }
//     }

//     if (resolvedEmployees.length === 0) {
//       return res.status(400).json({ success: false, error: 'No valid employees found or created' });
//     }

//     const attendance = new Attendance({
//       siteManager: siteManagerId,
//       groupImage: imagePath,
//       date: normalizedDate,
//       isFinalized: true,
//       attendedEmployees: resolvedEmployees
//     });

//     await attendance.save();

//     res.json({ success: true, attendance });
//   } catch (err) {
//     console.error('Attendance finalize error:', err);
//     res.status(500).json({ success: false, error: 'Failed to finalize attendance' });
//   }
// });

// // Combined Attendance + Report
// router.get('/combined', attendanceController.getCombinedAttendanceAndReport);

// module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const attendanceController = require('../controllers/attendanceController');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/attendance/finalize', upload.single('group_image'), async (req, res) => {
  try {
    const { employees, date } = JSON.parse(req.body.employees);
    const siteManagerId = req.user._id;
    const imagePath = req.file.path;

    if (!date) return res.status(400).json({ success: false, error: 'Date is required' });

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const resolvedEmployees = [];

    for (const e of employees) {
      let employeeDoc = null;

      // 1. Use existing ID
      if (e.employeeId) {
        employeeDoc = await Employee.findById(e.employeeId);
      }

      // 2. Try to find by phone if no ID
      if (!employeeDoc && e.phone) {
        employeeDoc = await Employee.findOne({ phone: e.phone });

        // Create if not found
        if (!employeeDoc) {
          employeeDoc = await Employee.create({
            name: e.name,
            phone: e.phone,
            currentSalary: e.salaryToday,
            createdBy: siteManagerId
          });
        }
      }

      // 3. Push only if employee is resolved
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

  } catch (err) {
    console.error('Attendance finalize error:', err);
    res.status(500).json({ success: false, error: 'Failed to finalize attendance' });
  }
});

router.get('/combined', attendanceController.getCombinedAttendanceAndReport);

module.exports = router;
