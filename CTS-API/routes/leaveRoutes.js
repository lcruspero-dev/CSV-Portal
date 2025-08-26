// routes/leaveRoutes.js
const express = require("express");
const { zonedTimeToUtc, utcToZonedTime, format } = require("date-fns-tz");
const { addMonths, lastDayOfMonth } = require("date-fns");
const EmployeeLeave = require("../models/EmployeeLeave");
const { protect, verifyAdmin } = require("../middleware/authMiddleware");

const PH_TIMEZONE = "Asia/Manila";
const router = express.Router();

// Helper to format dates for display (now in MM/DD/YYYY format)
const formatForDisplay = (date) => {
  return format(utcToZonedTime(date, PH_TIMEZONE), "MM/dd/yyyy", {
    timeZone: PH_TIMEZONE,
  });
};

// Helper to get the same day next month (adjusts for short months)
const getSameDayNextMonth = (date) => {
  const originalDay = date.getDate();
  let nextMonth = addMonths(date, 1);

  // If the next month doesn't have this day (e.g., Jan 31 → Feb 28/29)
  if (nextMonth.getDate() !== originalDay) {
    nextMonth = lastDayOfMonth(nextMonth); // Adjust to last day
  }

  return nextMonth;
};

// Get all employee leave records with PHT dates (now in MM/DD/YYYY format)
router.get("/", protect, verifyAdmin, async (req, res) => {
  try {
    const employees = await EmployeeLeave.find({
      isActive: { $ne: false },
    }).sort({ currentBalance: -1 });

    const formattedEmployees = employees.map((emp) => ({
      ...emp.toObject(),
      startDate: formatForDisplay(emp.startDate),
      lastAccrualDate: formatForDisplay(emp.lastAccrualDate),
      nextAccrualDate: formatForDisplay(emp.nextAccrualDate),
    }));

    res.json(formattedEmployees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my/leave-credits", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const employeeLeave = await EmployeeLeave.findOne({
      employeeId: userId,
    });

    if (!employeeLeave) {
      return res
        .status(404)
        .json({ message: "Leave record not found for this user" });
    }

    res.json(employeeLeave);
  } catch (error) {
    console.error("Error fetching leave credits:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new employee leave record with PHT dates (now in MM/DD/YYYY format)
router.post("/", async (req, res) => {
  try {
    const { employeeId, employeeName } = req.body;

    // Set defaults
    const annualLeaveCredit = 18; // Default annual leave credit
    const startDate = new Date(); // Current date as default start date

    // Convert start date (in PHT) to UTC
    const startDateUTC = zonedTimeToUtc(startDate, PH_TIMEZONE);
    const accrualRate = annualLeaveCredit / 12;

    // Calculate next accrual date (same day next month)
    const nextAccrualPHT = getSameDayNextMonth(startDate);
    const nextAccrualUTC = zonedTimeToUtc(nextAccrualPHT, PH_TIMEZONE);

    const employeeLeave = new EmployeeLeave({
      employeeId,
      employeeName,
      annualLeaveCredit,
      currentBalance: 0,
      startDate: startDateUTC,
      accrualRate,
      lastAccrualDate: startDateUTC,
      nextAccrualDate: nextAccrualUTC,
      isActive: true,
      timezone: PH_TIMEZONE,
      //
    });

    await employeeLeave.save();
    res.status(201).json({
      ...employeeLeave.toObject(),
      startDate: formatForDisplay(employeeLeave.startDate), // Now in MM/DD/YYYY
      lastAccrualDate: formatForDisplay(employeeLeave.lastAccrualDate), // Now in MM/DD/YYYY
      nextAccrualDate: formatForDisplay(employeeLeave.nextAccrualDate), // Now in MM/DD/YYYY
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//update employee leave
router.put("/:id", async (req, res) => {
  try {
    const leaveId = req.params.id;
    const updateData = req.body;

    // Validate the incoming data
    if (!leaveId || !updateData) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // If currentBalance is being updated, ensure it's a valid number
    if (updateData.currentBalance !== undefined) {
      const balance = parseFloat(updateData.currentBalance);
      if (isNaN(balance)) {
        return res.status(400).json({ message: "Invalid balance value" });
      }
      // Ensure balance doesn't go negative
      updateData.currentBalance = Math.max(0, balance);
    }

    const updatedLeave = await EmployeeLeave.findByIdAndUpdate(
      leaveId,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure updates follow schema validation
      }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave credit record not found" });
    }

    // Log the update for audit purposes
    console.log(
      `Leave credit updated for ${updatedLeave.employeeId}: New balance ${updatedLeave.currentBalance}`
    );

    res.json({
      success: true,
      data: updatedLeave,
      message: "Leave credit updated successfully",
    });
  } catch (error) {
    console.error("Error updating leave credit:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating leave credit",
      error: error.message,
    });
  }
});

module.exports = router;
