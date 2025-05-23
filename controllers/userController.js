const User = require('../models/User');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper: Check admin access
const isAdmin = (user) => user && user.role === 'ADMIN';

// Admin-only: Register a new Site Manager
exports.registerSiteManager = async (req, res) => {
  try {
    const { name, phone, password, site } = req.body;

    if (!isAdmin(req.user)) {
      return res.status(403).json({ success: false, error: 'Access denied: Only admin can register site managers.' });
    }

    if (!name || !phone || !password || !site) {
      return res.status(400).json({ success: false, error: 'All fields (name, phone, password, site) are required.' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this phone number already exists.' });
    }

    const siteExists = await User.findOne({ site, role: 'SITE_MANAGER' });
    if (siteExists) {
      return res.status(400).json({ success: false, error: 'This site already has a manager assigned.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      phone,
      password: hashedPassword,
      role: 'SITE_MANAGER',
      site
    });

    await newUser.save();

    res.status(201).json({ success: true, message: 'Site Manager registered successfully.' });

  } catch (error) {
    console.error('Site Manager Registration Error:', error);
    res.status(500).json({ success: false, error: 'Registration failed', message: error.message });
  }
};

// Login: For both Admin and Site Manager
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, error: 'Please provide phone number and password.' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not defined');
      return res.status(500).json({ success: false, error: 'Server configuration error.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ success: true, token });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: 'Login failed', message: error.message });
  }
};

// Get all Site Managers (Admin only)
exports.getAllSiteManagers = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ success: false, error: 'Access denied: Only admin can view site managers.' });
    }

    const { page = 1, limit = 10, name, phone } = req.query;

    const query = { role: 'SITE_MANAGER' };
    if (name) query.name = new RegExp(name, 'i');
    if (phone) query.phone = new RegExp(phone, 'i');

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

    const siteManagers = await User.find(query)
      .select('-password')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: siteManagers.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      siteManagers,
    });

  } catch (error) {
    console.error('Fetch Site Managers Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch site managers', message: error.message });
  }
};

// Admin-only: Delete a Site Manager
exports.deleteUser = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (userToDelete.role !== 'SITE_MANAGER') {
      return res.status(403).json({ success: false, error: 'Only site managers can be deleted.' });
    }

    await userToDelete.deleteOne();

    res.status(200).json({ success: true, message: 'Site Manager deleted successfully.' });

  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ success: false, error: 'Deletion failed', message: error.message });
  }
};

// Admin-only: Update a Site Manager
exports.updateUser = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const { name, phone } = req.body;

    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (userToUpdate.role !== 'SITE_MANAGER') {
      return res.status(403).json({ success: false, error: 'Only site managers can be updated.' });
    }

    userToUpdate.name = name || userToUpdate.name;
    userToUpdate.phone = phone || userToUpdate.phone;

    await userToUpdate.save();

    const updatedUser = userToUpdate.toObject();
    delete updatedUser.password;

    res.status(200).json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ success: false, error: 'Update failed', message: error.message });
  }
};

// Site Manager: Register an Employee
exports.registerEmployee = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'SITE_MANAGER') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Only site managers can add employees.'
      });
    }

    const { name, phone, currentSalary } = req.body;

    if (!name || !phone || currentSalary === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, phone, and currentSalary for the employee.'
      });
    }

    const existingEmployee = await Employee.findOne({ phone });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        error: 'Employee with this phone number already exists.'
      });
    }

    const newEmployee = new Employee({ name, phone, currentSalary });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully.'
    });

  } catch (error) {
    console.error('Employee Registration Error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
};
