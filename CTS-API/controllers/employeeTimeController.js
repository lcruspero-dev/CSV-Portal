const EmployeeTime = require("../models/employeeTimeModel");
const mongoose = require("mongoose");
const { autoUpdatePayrollFromTimeTracker } = require("./payrollController");

// Helper function to trigger payroll update
const triggerPayrollUpdate = async (employeeId, date) => {
  try {
    // Calculate date range for the current month
    const currentDate = new Date(date);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Format dates as strings (MM/DD/YYYY)
    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const startDate = formatDate(startOfMonth);
    const endDate = formatDate(endOfMonth);

    // Auto-update payroll
    await autoUpdatePayrollFromTimeTracker(employeeId, startDate, endDate);
  } catch (error) {
    console.error('Error triggering payroll update:', error);
  }
};

// Helper function to calculate which break to deduct time from
const calculateBreakDeduction = (employeeTime, bioBreakDuration) => {
  const deductionAmount = bioBreakDuration || 15; // Default to 15 minutes if not provided
  
  // Check break usage and available time in order of priority
  const breakUsage = {
    break1: {
      used: employeeTime.breakStart && employeeTime.breakEnd,
      availableTime: employeeTime.totalBreakTime || 15, // Default break time
      currentTime: employeeTime.totalBreakTime || 0,
      type: 'break1'
    },
    break2: {
      used: employeeTime.secondBreakStart && employeeTime.secondBreakEnd,
      availableTime: employeeTime.totalSecondBreakTime || 15, // Default break time
      currentTime: employeeTime.totalSecondBreakTime || 0,
      type: 'break2'
    },
    lunch: {
      used: employeeTime.lunchStart && employeeTime.lunchEnd,
      availableTime: employeeTime.totalLunchTime || 30, // Default lunch time
      currentTime: employeeTime.totalLunchTime || 0,
      type: 'lunch'
    }
  };

  // Priority order: break1 -> break2 -> lunch
  const priorityOrder = ['break1', 'break2', 'lunch'];
  
  for (const breakType of priorityOrder) {
    const breakInfo = breakUsage[breakType];
    
    // If this break is NOT used, deduct from it
    if (!breakInfo.used) {
      const newBreakTime = Math.max(0, breakInfo.availableTime - deductionAmount);
      
      return {
        deductedFrom: breakType,
        deductionAmount: deductionAmount,
        newBreakTime: newBreakTime,
        originalBreakTime: breakInfo.availableTime
      };
    }
  }

  // If all breaks are used, deduct from lunch by default (as it typically has the most time)
  const lunchInfo = breakUsage.lunch;
  const newLunchTime = Math.max(0, lunchInfo.availableTime - deductionAmount);
  
  return {
    deductedFrom: 'lunch',
    deductionAmount: deductionAmount,
    newBreakTime: newLunchTime,
    originalBreakTime: lunchInfo.availableTime,
    note: "All breaks were used, deducted from lunch"
  };
};

const getEmployeeTimes = async (_req, res) => {
  try {
    const employeeTimes = await EmployeeTime.find();
    res.status(200).json(employeeTimes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const createEmployeeTimeIn = async (req, res) => {
  try {
    // Count existing records for this employee, date, and shift
    const existingRecordsCount = await EmployeeTime.countDocuments({
      employeeId: req.user._id,
      date: req.body.date,
      shift: req.body.shift,
    });

    // If loginLimit is 1, allow only one record
    if (req.body.loginLimit === 1 && existingRecordsCount >= 1) {
      return res.status(409).json({
        message: "Duplicate entry: Time-in already recorded for this date.",
      });
    }
    // If loginLimit is 2, allow up to two records
    else if (req.body.loginLimit === 2 && existingRecordsCount >= 2) {
      return res.status(409).json({
        message: "Maximum 2 time-ins allowed for this date and shift.",
      });
    }

    // Create new record if within limits
    const newEmployeeTime = await EmployeeTime.create({
      employeeId: req.user._id,
      employeeName: req.user.name,
      date: req.body.date,
      timeIn: req.body.timeIn,
      shift: req.body.shift,
    });

    return res.status(201).json(newEmployeeTime);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createEmployeeTimeOut = async (req, res) => {
  try {
    const employeeTime = await EmployeeTime.findById(req.params.id);
    if (!employeeTime) {
      return res.status(404).json({ message: "Employee time not found" });
    }
    employeeTime.timeOut = req.body.timeOut;
    await employeeTime.save();
    res.status(200).json(employeeTime);
  } catch (error) {
    console.error("Error saving employee time:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateEmployeeTime = async (req, res) => {
  try {
    const {
      secretKey,
      date,
      timeIn,
      timeOut,
      totalHours,
      notes,
      shift,
      breakStart,
      breakEnd,
      totalBreakTime,
      dateBreakStart,
      dateBreakEnd,
      lunchStart,
      lunchEnd,
      totalLunchTime,
      dateLunchStart,
      dateLunchEnd,
      secondBreakStart,
      secondBreakEnd,
      totalSecondBreakTime,
      overBreak1,
      overBreak2,
      overLunch,
      bioBreakStart,
      bioBreakEnd,
      bioBreakDuration,
      bioBreakDeductedFrom,
      bioBreakDeductionAmount,
    } = req.body;

    // Validate secret key from environment variable
    if (secretKey !== process.env.UPDATE_SECRET_KEY) {
      return res.status(400).json({ message: "Invalid secret key" });
    }

    const employeeTime = await EmployeeTime.findById(req.params.id);
    if (!employeeTime) {
      return res.status(404).json({ message: "Employee time not found" });
    }

    // Update employee time fields
    employeeTime.date = date;
    employeeTime.timeIn = timeIn;
    employeeTime.timeOut = timeOut;
    employeeTime.totalHours = totalHours;
    employeeTime.notes = notes;
    employeeTime.shift = shift;
    employeeTime.breakStart = breakStart;
    employeeTime.breakEnd = breakEnd;
    employeeTime.totalBreakTime = totalBreakTime;
    employeeTime.dateBreakStart = dateBreakStart;
    employeeTime.dateBreakEnd = dateBreakEnd;
    employeeTime.lunchStart = lunchStart;
    employeeTime.lunchEnd = lunchEnd;
    employeeTime.totalLunchTime = totalLunchTime;
    employeeTime.dateLunchStart = dateLunchStart;
    employeeTime.dateLunchEnd = dateLunchEnd;
    employeeTime.secondBreakStart = secondBreakStart;
    employeeTime.secondBreakEnd = secondBreakEnd;
    employeeTime.totalSecondBreakTime = totalSecondBreakTime;
    employeeTime.overBreak1 = overBreak1;
    employeeTime.overBreak2 = overBreak2;
    employeeTime.overLunch = overLunch;
    employeeTime.bioBreak = bioBreakStart;
    employeeTime.bioBreakEnd = bioBreakEnd;
    employeeTime.bioBreakDuration = bioBreakDuration;
    employeeTime.bioBreakDeductedFrom = bioBreakDeductedFrom;
    employeeTime.bioBreakDeductionAmount = bioBreakDeductionAmount;

    const updatedEmployeeTime = await employeeTime.save();
    res.status(200).json(updatedEmployeeTime);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteEmployeeTime = async (req, res) => {
  try {
    const employeeTime = await EmployeeTime.findById(req.params.id);
    if (!employeeTime) {
      return res.status(404).json({ message: "Employee time not found" });
    }
    await employeeTime.deleteOne();
    res.status(200).json({ message: "Employee time deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeTimeByEmployeeId = async (req, res) => {
  try {
    const employeeTime = await EmployeeTime.find({
      employeeId: req.user._id,
    }).sort({ createdAt: -1 }); // Sort by createdAt in descending order

    if (!employeeTime || employeeTime.length === 0) {
      return res.status(404).json({ message: "Employee time not found" });
    }
    res.status(200).json(employeeTime);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const updateEmployeeTimeOut = async (req, res) => {
  try {
    // Destructure values from the request body
    const { timeOut, totalHours, notes } = req.body;

    // Build the update object dynamically based on what is provided in the request body
    const updateFields = {};
    if (timeOut) updateFields.timeOut = timeOut;
    if (totalHours) updateFields.totalHours = totalHours;
    if (notes) updateFields.notes = notes;

    // Find and update the employee time record
    const employeeTime = await EmployeeTime.findOneAndUpdate(
      {
        employeeId: req.user._id,
        timeOut: null, // Ensure we only update records where timeOut is null
      },
      updateFields,
      { new: true } // Return the updated document
    );

    if (!employeeTime) {
      return res.status(404).json({ message: "Employee time not found" });
    }

    // Trigger payroll update when time out is recorded
    if (timeOut) {
      await triggerPayrollUpdate(req.user._id, employeeTime.date);
    }

    res.status(200).json(employeeTime);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeTimeWithNullTimeOut = async (req, res) => {
  try {
    const employeeTime = await EmployeeTime.find({
      employeeId: req.user._id,
      timeOut: null,
    });
    if (!employeeTime) {
      return res.status(404).json({ message: "Employee time not found" });
    }
    res.status(200).json(employeeTime);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const searchByNameAndDate = async (req, res) => {
  try {
    const { name, date } = req.query;

    // Basic validation
    if (!name || !date) {
      return res.status(400).json({ message: "Name and date are required" });
    }

    // Convert the date format from 'YYYY-MM-DD' to 'MM/DD/YYYY'
    const parsedDate = new Date(date);
    const formattedDate = `${parsedDate.getMonth() + 1
      }/${parsedDate.getDate()}/${parsedDate.getFullYear()}`;

    let query = { date: formattedDate };

    // Handle special CSV filter cases
    const nameLower = name.toLowerCase();
    switch (nameLower) {
      case "csv-all":
        // No additional filters needed
        break;
      case "csv-shift1":
        query.shift = "shift1";
        break;
      case "csv-shift2":
        query.shift = "shift2";
        break;
      case "csv-shift3":
        query.shift = "shift3";
        break;
      case "csv-staff":
        query.shift = "staff";
        break;
      default:
        // Create a case-insensitive regex for partial name matching
        { const nameRegex = new RegExp(name, "i");
        query.employeeName = { $regex: nameRegex }; }
    }

    const employeeTimes = await EmployeeTime.find(query);

    // Handle no records found
    if (employeeTimes.length === 0) {
      return res.status(404).json({ message: "No time records found" });
    }

    res.status(200).json(employeeTimes);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while fetching time records" });
  }
};

const updateEmployeeTimeBreak = async (req, res) => {
  try {
    // Find and update the employee time record
    const employeeTime = await EmployeeTime.findOneAndUpdate(
      {
        employeeId: req.user._id,
        timeOut: null, // Ensure we only update records where timeOut is null
      },
      {
        breakStart: req.body.breakStart,
        breakEnd: req.body.breakEnd,
        totalBreakTime: req.body.totalBreakTime,
        dateBreakStart: req.body.dateBreakStart,
        dateBreakEnd: req.body.dateBreakEnd,
        secondBreakStart: req.body.secondBreakStart,
        secondBreakEnd: req.body.secondBreakEnd,
        totalSecondBreakTime: req.body.totalSecondBreakTime,
        dateSecondBreakStart: req.body.dateSecondBreakStart,
        dateSecondBreakEnd: req.body.dateSecondBreakEnd,
      },
      { new: true } // Return the updated document
    );

    if (!employeeTime) {
      return res.status(404).json({
        message: "No active time record found for the employee",
      });
    }

    res.status(200).json(employeeTime);
  } catch (error) {
    console.error("Error updating employee time:", error);
    res.status(500).json({
      message: "Failed to update employee time record",
      error: error.message,
    });
  }
};

const updateEmployeeTimelunch = async (req, res) => {
  try {
    // Find and update the employee time record
    const employeeTime = await EmployeeTime.findOneAndUpdate(
      {
        employeeId: req.user._id,
        timeOut: null, // Ensure we only update records where timeOut is null
      },
      {
        lunchStart: req.body.lunchStart,
        lunchEnd: req.body.lunchEnd,
        totalLunchTime: req.body.totalLunchTime,
        dateLunchStart: req.body.dateLunchStart,
        dateLunchEnd: req.body.dateLunchEnd,
      },
      { new: true } // Return the updated document
    );

    if (!employeeTime) {
      return res.status(404).json({
        message: "No active time record found for the employee",
      });
    }

    res.status(200).json(employeeTime);
  } catch (error) {
    console.error("Error updating employee time:", error);
    res.status(500).json({
      message: "Failed to update employee time record",
      error: error.message,
    });
  }
};

const getEmployeeTimeByEmployeeIdandDate = async (req, res) => {
  try {
    const { date } = req.query;
    const employeeTime = await EmployeeTime.findOne({
      employeeId: new mongoose.Types.ObjectId(req.params.id),
      date,
    });

    if (!employeeTime) {
      return res.status(404).json({ message: "Employee time not found" });
    }

    res.status(200).json(employeeTime);
  } catch (error) {
    console.error("Error fetching employee time:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const getIncompleteBreaks = async (req, res) => {
  try {
    // Find all records where at least one break is started but not ended
    const incompleteBreaks = await EmployeeTime.find({
      $or: [
        { breakStart: { $ne: null }, breakEnd: null },
        { secondBreakStart: { $ne: null }, secondBreakEnd: null },
        { lunchStart: { $ne: null }, lunchEnd: null },
        { bioBreak: { $ne: null }, bioBreakEnd: null }, // Add bio break to incomplete checks
      ],
    }).select(
      "employeeId employeeName date breakStart breakEnd secondBreakStart secondBreakEnd lunchStart lunchEnd bioBreak bioBreakEnd bioBreakDeductedFrom"
    );

    if (!incompleteBreaks || incompleteBreaks.length === 0) {
      return res.status(200).json({ breaks: [] });
    }

    // Create a flat array with each incomplete break as a separate entry
    const formattedResponse = [];

    incompleteBreaks.forEach((record) => {
      // Check and add first break if incomplete
      if (record.breakStart && !record.breakEnd) {
        formattedResponse.push({
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          date: record.date,
          type: "First break",
          start: record.breakStart,
          end: record.breakEnd,
        });
      }

      // Check and add second break if incomplete
      if (record.secondBreakStart && !record.secondBreakEnd) {
        formattedResponse.push({
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          date: record.date,
          type: "Second break",
          start: record.secondBreakStart,
          end: record.secondBreakEnd,
        });
      }

      // Check and add lunch if incomplete
      if (record.lunchStart && !record.lunchEnd) {
        formattedResponse.push({
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          date: record.date,
          type: "Lunch",
          start: record.lunchStart,
          end: record.lunchEnd,
        });
      }

      // Check and add bio break if incomplete
      if (record.bioBreak && !record.bioBreakEnd) {
        formattedResponse.push({
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          date: record.date,
          type: "Bio Break",
          start: record.bioBreak,
          end: record.bioBreakEnd,
          deductedFrom: record.bioBreakDeductedFrom,
        });
      }
    });

    res.status(200).json({
      message: "Incomplete breaks retrieved successfully",
      count: formattedResponse.length,
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error fetching incomplete breaks:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const getIncompleteLogins = async (req, res) => {
  try {
    // Find all records where employee has logged in but not logged out
    const incompleteLogins = await EmployeeTime.find({
      $and: [
        { timeIn: { $ne: null } },  // timeIn exists and is not null
        { timeOut: null }            // timeOut is null (not logged out)
      ]
    }).select(
      "employeeId employeeName date timeIn timeOut totalHours"
    );

    if (!incompleteLogins || incompleteLogins.length === 0) {
      return res.status(200).json({ 
        message: "No incomplete logins found",
        count: 0,
        data: [] 
      });
    }

    // Format the response similar to the breaks controller
    const formattedResponse = incompleteLogins.map((record) => ({
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      date: record.date,
      type: "Login",
      timeIn: record.timeIn,
      timeOut: record.timeOut,
      totalHours: record.totalHours
    }));

    res.status(200).json({
      message: "Incomplete logins retrieved successfully",
      count: formattedResponse.length,
      data: formattedResponse
    });

  } catch (error) {
    console.error("Error fetching incomplete logins:", error.message);
    res.status(500).json({ 
      status: false,
      message: error.message || "Internal Server Error" 
    });
  }
};

const updateEmployeeBioBreak = async (req, res) => {
  try {
    const { bioBreak, bioBreakEnd, bioBreakDuration } = req.body;

    // Find the active employee time record
    const employeeTime = await EmployeeTime.findOne({
      employeeId: req.user._id,
      timeOut: null,
    });

    if (!employeeTime) {
      return res.status(404).json({
        message: "No active time record found for the employee",
      });
    }

    // Calculate which break to deduct time from based on usage
    const breakDeductionInfo = calculateBreakDeduction(employeeTime, bioBreakDuration);

    // Update the employee time record
    const updatedEmployeeTime = await EmployeeTime.findOneAndUpdate(
      {
        employeeId: req.user._id,
        timeOut: null,
      },
      {
        bioBreak,
        bioBreakEnd,
        bioBreakDuration,
        // Store which break was deducted for tracking
        bioBreakDeductedFrom: breakDeductionInfo.deductedFrom,
        bioBreakDeductionAmount: breakDeductionInfo.deductionAmount,
        // Update the deducted break's total time if applicable
        ...(breakDeductionInfo.deductedFrom === 'break1' && {
          totalBreakTime: breakDeductionInfo.newBreakTime
        }),
        ...(breakDeductionInfo.deductedFrom === 'break2' && {
          totalSecondBreakTime: breakDeductionInfo.newBreakTime
        }),
        ...(breakDeductionInfo.deductedFrom === 'lunch' && {
          totalLunchTime: breakDeductionInfo.newBreakTime
        }),
      },
      { new: true }
    );

    res.status(200).json({
      message: "Bio break updated successfully",
      bioBreakDeductedFrom: breakDeductionInfo.deductedFrom,
      bioBreakDeductionAmount: breakDeductionInfo.deductionAmount,
      data: updatedEmployeeTime,
    });
  } catch (error) {
    console.error("Error updating bio break:", error);
    res.status(500).json({
      message: "Failed to update bio break",
      error: error.message,
    });
  }
};

const getBioBreakSummary = async (req, res) => {
  try {
    const employeeTime = await EmployeeTime.findOne({
      employeeId: req.user._id,
      timeOut: null,
    });

    if (!employeeTime) {
      return res.status(404).json({
        message: "No active time record found",
      });
    }

    const breakUsage = {
      break1: {
        used: !!(employeeTime.breakStart && employeeTime.breakEnd),
        availableTime: employeeTime.totalBreakTime || 15,
        timeUsed: employeeTime.totalBreakTime || 0
      },
      break2: {
        used: !!(employeeTime.secondBreakStart && employeeTime.secondBreakEnd),
        availableTime: employeeTime.totalSecondBreakTime || 15,
        timeUsed: employeeTime.totalSecondBreakTime || 0
      },
      lunch: {
        used: !!(employeeTime.lunchStart && employeeTime.lunchEnd),
        availableTime: employeeTime.totalLunchTime || 30,
        timeUsed: employeeTime.totalLunchTime || 0
      }
    };

    const breakSummary = {
      break1: {
        used: breakUsage.break1.used,
        availableTime: breakUsage.break1.availableTime,
        timeUsed: breakUsage.break1.timeUsed
      },
      break2: {
        used: breakUsage.break2.used,
        availableTime: breakUsage.break2.availableTime,
        timeUsed: breakUsage.break2.timeUsed
      },
      lunch: {
        used: breakUsage.lunch.used,
        availableTime: breakUsage.lunch.availableTime,
        timeUsed: breakUsage.lunch.timeUsed
      },
      bioBreak: {
        hasBioBreak: !!(employeeTime.bioBreak),
        bioBreakDuration: employeeTime.bioBreakDuration || 0,
        deductedFrom: employeeTime.bioBreakDeductedFrom || 'none'
      }
    };

    // Calculate which break would be deducted for a new bio break
    const potentialDeduction = calculateBreakDeduction(employeeTime, 15); // 15 minutes as example

    // Get available breaks for deduction
    const availableForDeduction = ['break1', 'break2', 'lunch'].filter(breakType => !breakUsage[breakType].used);

    res.status(200).json({
      message: "Bio break summary retrieved successfully",
      currentStatus: breakSummary,
      nextBioBreakWouldDeductFrom: potentialDeduction.deductedFrom,
      availableForDeduction: availableForDeduction
    });
  } catch (error) {
    console.error("Error getting bio break summary:", error);
    res.status(500).json({
      message: "Failed to get bio break summary",
      error: error.message,
    });
  }
};

module.exports = {
  getEmployeeTimes,
  createEmployeeTimeIn,
  updateEmployeeTime,
  deleteEmployeeTime,
  createEmployeeTimeOut,
  getEmployeeTimeByEmployeeId,
  updateEmployeeTimeOut,
  getEmployeeTimeWithNullTimeOut,
  searchByNameAndDate,
  updateEmployeeTimeBreak,
  updateEmployeeTimelunch,
  getEmployeeTimeByEmployeeIdandDate,
  getIncompleteBreaks,
  updateEmployeeBioBreak,
  getBioBreakSummary,
  getIncompleteLogins
};