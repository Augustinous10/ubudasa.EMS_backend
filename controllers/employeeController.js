const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// ✅ Check if employee exists by phone (within current site)
exports.checkEmployeeByPhone = async (req, res) => {
  const { phone } = req.body;
  const siteId = req.user.siteId;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    const existing = await Employee.findOne({ phone, site: siteId });
    if (existing) {
      return res.json({
        exists: true,
        name: existing.name,
        salary: existing.currentSalary,
      });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error("Error checking employee:", err);
    res.status(500).json({ message: "Server error while checking employee." });
  }
};

// ✅ Finalize or update attendance with group image
exports.finalizeAttendance = async (req, res) => {
  try {
    if (!req.body.employees || !req.file) {
      return res.status(400).json({ message: "Employees data and group image are required" });
    }

    let employees;
    try {
      employees = JSON.parse(req.body.employees);
    } catch (parseErr) {
      return res.status(400).json({ message: "Invalid employees JSON format" });
    }

    const siteManagerId = req.user._id;
    const siteId = req.user.siteId;
    const imagePath = req.file.path;

    // Normalize date to start of day UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ siteManager: siteManagerId, date: today });

    const newAttendedEmployees = [];

    for (const e of employees) {
      if (!e.phone || !e.name || e.salary_today == null) {
        return res.status(400).json({ message: "Each employee must have phone, name, and salary_today" });
      }

      let employee = await Employee.findOne({ phone: e.phone, site: siteId });

      if (!employee) {
        try {
          employee = await Employee.create({
            name: e.name,
            phone: e.phone,
            currentSalary: e.salary_today,
            site: siteId,
            createdBy: siteManagerId,
          });
        } catch (creationErr) {
          console.error("Error creating employee:", creationErr);
          return res.status(500).json({ message: "Failed to create a new employee" });
        }
      }

      if (!employee || !employee._id) {
        console.warn("Skipping invalid employee:", e);
        continue;
      }

      const alreadyPresent = attendance?.attendedEmployees.some(att =>
        att.employee.toString() === employee._id.toString()
      );
      if (alreadyPresent) continue;

      newAttendedEmployees.push({
        employee: employee._id,
        salary: e.salary_today,
        status: "Present",
        paymentStatus: "UNPAID",
        paidAt: null,
      });
    }

    if (newAttendedEmployees.length === 0) {
      return res.status(409).json({ message: "No new employees to add for today" });
    }

    if (attendance) {
      attendance.attendedEmployees.push(...newAttendedEmployees);
      await attendance.save();
    } else {
      attendance = new Attendance({
        siteManager: siteManagerId,
        groupImage: imagePath,
        date: today,
        attendedEmployees: newAttendedEmployees,
      });
      await attendance.save();
    }

    res.status(201).json({
      success: true,
      message: "Attendance finalized/updated successfully.",
      attendance,
    });
  } catch (err) {
    console.error("Attendance Finalization Error:", err);
    res.status(500).json({ success: false, error: "Failed to finalize attendance" });
  }
};

// ✅ Create a new employee
exports.createEmployee = async (req, res) => {
  const { phone, name, defaultSalary } = req.body;
  const siteId = req.user.siteId;

  if (!phone || !name || defaultSalary == null) {
    return res.status(400).json({
      success: false,
      error: "Please provide name, phone, and defaultSalary for the employee.",
    });
  }

  try {
    const existing = await Employee.findOne({ phone, site: siteId });
    if (existing) {
      return res.status(200).json({ message: "Employee already exists", employee: existing });
    }

    const employee = new Employee({
      phone,
      name,
      defaultSalary,
      currentSalary: defaultSalary,
      site: siteId,
      createdBy: req.user._id,
    });

    await employee.save();
    res.status(201).json({ success: true, employee });
  } catch (error) {
    console.error("Create Employee Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all employees at current site
exports.getAllEmployees = async (req, res) => {
  const siteId = req.user.siteId;

  try {
    const employees = await Employee.find({ site: siteId }).sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get a single employee
exports.getEmployeeById = async (req, res) => {
  const siteId = req.user.siteId;

  try {
    const employee = await Employee.findOne({ _id: req.params.id, site: siteId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update employee
exports.updateEmployee = async (req, res) => {
  const siteId = req.user.siteId;

  try {
    const updatedData = req.body;
    Object.keys(updatedData).forEach(key => {
      if (updatedData[key] == null) delete updatedData[key];
    });

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, site: siteId },
      updatedData,
      { new: true }
    );

    if (!employee) return res.status(404).json({ message: "Employee not found or not allowed" });

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete employee
exports.deleteEmployee = async (req, res) => {
  const siteId = req.user.siteId;

  try {
    const employee = await Employee.findOneAndDelete({ _id: req.params.id, site: siteId });
    if (!employee) return res.status(404).json({ message: "Employee not found or not allowed" });

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
