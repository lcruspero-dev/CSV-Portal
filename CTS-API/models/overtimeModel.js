const mongoose = require("mongoose");

const OvertimeApplicationSchema = mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      index: true,
    },

    user: {
      type: String,
      required: true,
      index: true,
    },

    overtimeType: {
      type: String,
      required: true,
      trim: true,
    },

    overtimeDate: {
      type: Date,
      required: true,
    },

    overtimeStart: {
      type: Date,
      required: true,
    },

    overtimeEnd: {
      type: Date,
      required: true,
    },

    overtimeDuration: {
      type: Number, // stored in hours (e.g., 1.5)
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },

    approvedBy: {
      type: String,
    },

    approvedAt: {
      type: Date,
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "OvertimeApplication",
  OvertimeApplicationSchema
);
