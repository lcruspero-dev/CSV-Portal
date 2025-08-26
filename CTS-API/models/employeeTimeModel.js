const mongoose = require("mongoose");

const employeeTimeSchema = mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user", // Reference to the User model
    },
    employeeName: {
      type: String,
    },
    date: {
      type: String,
    },
    timeIn: {
      type: String,
    },
    timeOut: {
      type: String,
      default: null,
    },
    totalHours: {
      type: String,
      default: null,
    },
    dateBreakStart: {
      type: String,
      default: null,
    },
    dateBreakEnd: {
      type: String,
      default: null,
    },
    dateSecondBreakStart: {
      type: String,
      default: null,
    },
    dateSecondBreakEnd: {
      type: String,
      default: null,
    },
    breakStart: {
      type: String,
      default: null,
    },
    breakEnd: {
      type: String,
      default: null,
    },
    secondBreakStart: {
      type: String,
      default: null,
    },
    secondBreakEnd: {
      type: String,
      default: null,
    },
    totalBreakTime: {
      type: String,
      default: null,
    },
    totalSecondBreakTime: {
      type: String,
      default: null,
    },
    lunchStart: {
      type: String,
      default: null,
    },
    lunchEnd: {
      type: String,
      default: null,
    },
    totalLunchTime: {
      type: String,
      default: null,
    },
    dateLunchStart: {
      type: String,
      default: null,
    },
    dateLunchEnd: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    shift: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields automatically
  }
);

module.exports = mongoose.model("EmployeeTime", employeeTimeSchema);
