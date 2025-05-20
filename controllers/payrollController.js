// // controllers/payrollController.js
// const Attendance = require('../models/Attendance');
// const Employee = require('../models/Employee');

// // Calculate payroll for all employees
// exports.generatePayroll = async (req, res) => {
//   try {
//     const employees = await Employee.find();

//     const payrollData = await Promise.all(employees.map(async (employee) => {
//       const attendanceCount = await Attendance.countDocuments({ employeeId: employee._id });
//       const totalPay = attendanceCount * employee.salary;

//       return {
//         employee: employee.name,
//         daysPresent: attendanceCount,
//         totalPay,
//       };
//     }));

//     res.json(payrollData);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to generate payroll' });
//   }
// };

// const AttendanceSheet = require('../models/AttendanceSheet');
// const Employee = require('../models/Employee');

// exports.getPayroll = async (req, res) => {
//   try {
//     const employees = await Employee.find();
//     const attendanceSheets = await AttendanceSheet.find().populate('attendanceRecords.employee');

//     const payrollData = employees.map((employee) => {
//       let daysWorked = 0;

//       attendanceSheets.forEach(sheet => {
//         sheet.attendanceRecords.forEach(record => {
//           if (record.employee._id.equals(employee._id) && record.status === 'present') {
//             daysWorked++;
//           }
//         });
//       });

//       return {
//         employeeId: employee._id,
//         name: employee.name,
//         phone: employee.phone,
//         daysWorked,
//         dailySalary: employee.dailySalary,
//         totalSalary: employee.dailySalary * daysWorked
//       };
//     });

//     res.status(200).json(payrollData);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const AttendanceSheet = require('../models/AttendanceSheet');
const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');

// Live payroll preview (not saved in DB)
exports.getPayroll = async (req, res) => {
  try {
    const employees = await Employee.find();
    const attendanceSheets = await AttendanceSheet.find().populate('attendanceRecords.employee');

    const payrollData = employees.map((employee) => {
      let daysWorked = 0;

      attendanceSheets.forEach(sheet => {
        sheet.attendanceRecords.forEach(record => {
          if (record.employee._id.equals(employee._id) && record.status === 'present') {
            daysWorked++;
          }
        });
      });

      return {
        employeeId: employee._id,
        name: employee.name,
        phone: employee.phone,
        daysWorked,
        dailySalary: employee.dailySalary,
        totalSalary: employee.dailySalary * daysWorked
      };
    });

    res.status(200).json(payrollData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark payroll as paid and save in DB
exports.markPayrollAsPaid = async (req, res) => {
  try {
    const { month } = req.body; // format: 'YYYY-MM'

    const employees = await Employee.find();
    const attendanceSheets = await AttendanceSheet.find().populate('attendanceRecords.employee');

    const payrolls = await Promise.all(employees.map(async (employee) => {
      let daysWorked = 0;

      attendanceSheets.forEach(sheet => {
        const sheetMonth = sheet.date.toISOString().substring(0, 7); // 'YYYY-MM'
        if (sheetMonth === month) {
          sheet.attendanceRecords.forEach(record => {
            if (record.employee._id.equals(employee._id) && record.status === 'present') {
              daysWorked++;
            }
          });
        }
      });

      const totalSalary = daysWorked * employee.dailySalary;

      const savedPayroll = new Payroll({
        employee: employee._id,
        month,
        totalDays: daysWorked,
        totalSalary,
        isPaid: true
      });

      await savedPayroll.save();

      return savedPayroll;
    }));

    res.status(201).json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View payroll payment history
exports.getPayrollHistory = async (req, res) => {
  try {
    const history = await Payroll.find().populate('employee').sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
