const express = require('express');
const router = express.Router();
const multer = require('multer');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Set up Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Your route
router.post("/attendance/finalize", upload.single("group_image"), async (req, res) => {
  try {
    const { employees } = JSON.parse(req.body.employees); // If coming as stringified JSON
    const site_manager_id = req.user._id; // You must have auth middleware before this
    const imagePath = req.file.path;

    const attendance = new Attendance({
      site_manager: site_manager_id,
      group_image: imagePath,
      is_finalized: true,
      employees: employees.map(e => ({
        ...e,
        is_paid: false
      }))
    });

    await attendance.save();

    // Save new employees
    for (const e of employees) {
      const existing = await Employee.findOne({ phone: e.phone });
      if (!existing) {
        await Employee.create({
          name: e.name,
          phone: e.phone,
          default_salary: e.salary_today,
          created_by: site_manager_id
        });
      }
    }

    res.json({ message: "Attendance finalized", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

module.exports = router;
