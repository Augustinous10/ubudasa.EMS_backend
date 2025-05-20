const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/multer'); // For group image uploads
const Attendance = require('../models/Attendance');

// ========== AUTH + USER MANAGEMENT ========== //

// Admin registers a Site Manager
router.post(
  '/admin/register-site-manager',
  authenticate,
  authorize(['ADMIN']),
  userController.registerSiteManager
);

// Admin fetches all Site Managers
router.get(
  '/admin/site-managers',
  authenticate,
  authorize(['ADMIN']),
  userController.getAllSiteManagers
);

// Delete a Site Manager
router.delete(
  '/admin/users/:id',
  authenticate,
  authorize(['ADMIN']),
  userController.deleteUser
);

// Update a Site Manager
router.put(
  '/admin/users/:id',
  authenticate,
  authorize(['ADMIN']),
  userController.updateUser
);

// Site Manager registers an Employee
router.post(
  '/site-manager/register-employee',
  authenticate,
  authorize(['SITE_MANAGER']),
  userController.registerEmployee
);

// Shared login route
router.post('/login', userController.login);

// ========== ATTENDANCE SUBMISSION ========== //

// Site Manager submits attendance with group image
router.post(
  '/site-manager/attendance/submit',
  authenticate,
  authorize(['SITE_MANAGER']),
  upload.single('groupImage'), // The form field name must be 'groupImage'
  async (req, res) => {
    try {
      const { employeeIds } = req.body;

      if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
        return res.status(400).json({ success: false, error: 'Please provide a list of present employees.' });
      }

      const attendance = new Attendance({
        siteManager: req.user.id,
        presentEmployees: employeeIds,
        groupImage: req.file.path,
        date: new Date()
      });

      await attendance.save();

      res.status(201).json({ success: true, message: 'Attendance submitted successfully.' });
    } catch (error) {
      console.error('Attendance Submission Error:', error);
      res.status(500).json({ success: false, error: 'Failed to submit attendance.' });
    }
  }
);

module.exports = router;
