// jobs/leaveAccrualJob.js
const cron = require("node-cron");
const { zonedTimeToUtc } = require("date-fns-tz");
const mongoose = require("mongoose");
const EmployeeLeave = require("../models/EmployeeLeave");
const {
  calculateAccrual,
  getTodayPHT,
  PH_TIMEZONE,
} = require("../utils/leaveAccrual");

// Lock model for preventing duplicate runs
const Lock = mongoose.model(
  "Lock",
  new mongoose.Schema({
    jobName: { type: String, unique: true },
    isLocked: { type: Boolean, default: false },
    lockedAt: Date,
    releasedAt: Date,
  })
);

const runLeaveAccrual = async () => {
  let lock = null;

  try {
    // Try to acquire a lock
    lock = await Lock.findOneAndUpdate(
      { jobName: "leaveAccrual", isLocked: false },
      { isLocked: true, lockedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!lock || lock.isLocked === false) {
      const existingLock = await Lock.findOne({ jobName: "leaveAccrual" });
      console.warn(
        `Leave accrual job skipped — already locked since ${existingLock?.lockedAt}`
      );
      return { success: false, message: "Job already running" };
    }

    console.log(
      "Starting leave accrual job at",
      new Date().toISOString(),
      "UTC"
    );

    const todayPHT = getTodayPHT();
    const endOfDayPHT = new Date(todayPHT.setHours(23, 59, 59, 999));

    // Find active employees due for accrual
    const employees = await EmployeeLeave.find({
      nextAccrualDate: {
        $lte: zonedTimeToUtc(endOfDayPHT, PH_TIMEZONE),
      },
      isActive: true,
    });

    let updatedCount = 0;
    const updates = [];

    for (const employee of employees) {
      const accrualResult = calculateAccrual(employee);

      if (accrualResult) {
        const update = {
          currentBalance: accrualResult.currentBalance,
          startingLeaveCredit: accrualResult.startingLeaveCredit,
          lastAccrualDate: accrualResult.lastAccrualDate,
          nextAccrualDate: accrualResult.nextAccrualDate,
        };

        updates.push({
          employeeId: employee._id,
          employeeName: employee.employeeName,
          update,
          accruedDays: accrualResult.accruedDays,
        });

        await EmployeeLeave.findByIdAndUpdate(employee._id, update);

        updatedCount++;
        console.log(
          `[ACCRUED] ${accrualResult.accruedDays} days for ${employee.employeeName}`
        );
      }
    }

    const result = {
      success: true,
      totalEmployees: employees.length,
      updatedCount,
      updates,
      timestamp: new Date(),
    };

    console.log(
      `Leave accrual job completed. Found ${employees.length} active employees, updated ${updatedCount}.`
    );

    return result;
  } catch (error) {
    console.error("Error in leave accrual job:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date(),
    };
  } finally {
    // Always release the lock
    await Lock.findOneAndUpdate(
      { jobName: "leaveAccrual" },
      { isLocked: false, releasedAt: new Date() }
    );
  }
};

// Schedule: run daily at 3:00 AM Asia/Manila
cron.schedule("0 3 * * *", () => runLeaveAccrual(), {
  timezone: "Asia/Manila",
});

console.log("Leave accrual job scheduled to run daily at 3 AM Asia/Manila");

// Manual execution
const manualRun = async () => {
  console.log("Starting manual execution...");
  const result = await runLeaveAccrual();
  console.log("Job completed with result:", result);
  return result;
};

module.exports = {
  runLeaveAccrual,
  manualRun,
};
