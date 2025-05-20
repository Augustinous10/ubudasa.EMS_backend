const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');

// Example dashboard routes
router.get('/admin', authenticate, authorize(['ADMIN']), (req, res) => {
  res.json({ message: 'Admin dashboard data' });
});

router.get('/manager', authenticate, authorize(['SITE_MANAGER']), (req, res) => {
  res.json({ message: 'Site manager dashboard data' });
});

module.exports = router;
