import mongoose from "mongoose";

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
    overBreak1: {
      type: String,
      default: null,
    },
    overBreak2: {
      type: String,
      default: null,
    },
    overLunch: {
      type: String,
      default: null,
    },
    bioBreakStart: {
      type: String,
      default: null,
    },
    bioBreakend: {
      type: String,
      default: true,
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
    timestamps: true, 
  }
);

export default mongoose.model("EmployeeTime", employeeTimeSchema);

