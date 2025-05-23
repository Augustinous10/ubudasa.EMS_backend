const express = require('express');
const router = express.Router();
const multer = require('multer');
const attendanceController = require('../controllers/attendanceController');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Attendance Routes
router.get('/', attendanceController.getAllAttendance);
router.get('/filter', attendanceController.getAttendanceByFilter);
router.get('/date/:date', attendanceController.getAttendanceByDate);
router.get('/employee/:employeeId', attendanceController.getAttendanceByEmployee);
router.get('/manager/:siteManagerId', attendanceController.getAttendanceBySiteManager);
router.get('/combined', attendanceController.getCombinedAttendanceAndReport);
router.get('/today', attendanceController.getTodayAttendanceForManager);
router.get('/unpaid', attendanceController.getUnpaidEmployees);
router.post('/', attendanceController.createAttendanceSheet);
router.post('/attendance/finalize', upload.single('group_image'), attendanceController.finalizeAttendance);

router.patch('/:attendanceId/mark-paid/:employeeId', attendanceController.markAttendancePaid);

module.exports = router;
