const mongoose = require("mongoose");

const teaSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },

    employeeName: {
      type: String,
      required: true,
    },

    position: {
      type: String,
      default: "Customer Service",
    },

    signature: {
      type: String,
      required: true,
    },

    manager: {
      type: String,
      default: "Ronalyn Booc",
    },

    dateSigned: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("TeamExpectationsAcknowledgement", teaSchema);
