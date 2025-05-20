const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeController');
const upload = require('../middlewares/multer');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/check', controller.checkEmployeeByPhone);
router.post('/attendance/finalize', authenticate, authorize(['SITE_MANAGER']), upload.single('groupImage'), controller.finalizeAttendance);

// Optional extra employee routes
router.post('/', authenticate, authorize(['SITE_MANAGER']), controller.createEmployee);
router.get('/', authenticate, authorize(['SITE_MANAGER']), controller.getAllEmployees);
router.get('/:id', authenticate, authorize(['SITE_MANAGER']), controller.getEmployeeById);
router.put('/:id', authenticate, authorize(['SITE_MANAGER']), controller.updateEmployee);
router.delete('/:id', authenticate, authorize(['SITE_MANAGER']), controller.deleteEmployee);

module.exports = router;
