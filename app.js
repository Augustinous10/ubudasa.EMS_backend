const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// API Routes
app.use('/api/users', userRoutes);               // Auth/Login/Register
app.use('/api/employees', employeeRoutes);       // Employee management
app.use('/api/attendance', attendanceRoutes);    // Attendance features
app.use('/api/payroll', payrollRoutes);          // Payroll management
app.use('/api/reports', reportRoutes);           // Reports (active)
app.use('/api/dashboard', dashboardRoutes);      // Dashboard

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the UBUDASA EMS Backend API');
});

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
