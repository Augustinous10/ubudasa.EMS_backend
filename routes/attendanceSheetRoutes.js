const express = require('express');
const router = express.Router();
const controller = require('../controllers/attendanceSheetController');

router.post('/', controller.createAttendanceSheet);
router.get('/', controller.getAllAttendanceSheets);
router.get('/:id', controller.getAttendanceSheetById);
router.put('/:id', controller.updateAttendanceSheet);
router.delete('/:id', controller.deleteAttendanceSheet);

module.exports = router;
