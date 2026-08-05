const mongoose = require("mongoose");

const itMemoSchema = new mongoose.Schema(
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
      default: "Team Leader",
    },

    witness: {
      type: String,
      required: true,
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
module.exports =
  mongoose.models.ItMemo || mongoose.model("ItMemo", itMemoSchema);
