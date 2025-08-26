const mongoose = require("mongoose");

const memoSchema = mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Please add a subject"],
    },
    file: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    acknowledgedby: [
      {
        name: {
          type: String,
        },
        userId: {
          type: String,
        },
        acknowledgedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Memo", memoSchema);
