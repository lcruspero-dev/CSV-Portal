// models/EmployeeLeave.js
const mongoose = require("mongoose");

const EmployeeLeaveSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    employeeName: { type: String, required: true },
    annualLeaveCredit: { type: Number, default: 18 },
    currentBalance: { type: Number, default: 0 },
    startDate: { type: Date, required: true }, // Stored as UTC but represents PHT
    accrualRate: { type: Number, default: 1.5 },
    lastAccrualDate: { type: Date, required: true }, // Stored as UTC but represents PHT
    nextAccrualDate: { type: Date, required: true }, // Stored as UTC but represents PHT
    isActive: { type: Boolean, default: true },
    employmentStatus: { type: String, default: "Probationary" },
    startingLeaveCredit: { type: Number, default: 0 },
    timezone: { type: String, default: "Asia/Manila" },
    history: [
      {
        date: Date,
        description: String,
        days: Number,
        ticket: String,
        status: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmployeeLeave", EmployeeLeaveSchema);
