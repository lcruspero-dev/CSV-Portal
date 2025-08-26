const mongoose = require("mongoose");
const Counter = require("./counterModel");

const ticketSchema = mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      ref: "User",
    },
    category: {
      type: String,
      required: [true, "Please select a Category"],
    },
    description: {
      type: String,
      required: [true, "Please enter a decription of the issue"],
    },
    leaveDays: {
      type: Number,
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "closed", "In Progress", "Approved", "Rejected"],
      default: "open",
    },
    priority: {
      type: String,
      required: true,
      enum: ["4-Low", "3-Moderate", "2-High", "1-Critical"],
      default: "4-Low",
    },
    assignedTo: {
      type: String,
      required: true,
      default: "Not Assigned",
    },
    closingNote: {
      type: String,
      default: null,
    },

    file: {
      type: String,
    },
    department: {
      type: String,
      required: true,
      enum: ["HR", "IT"],
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.pre("save", async function (next) {
  if (!this.ticketNumber) {
    try {
      // Define category to prefix mapping
      const incCategories = [
        "MFA related concern",
        "Account recovery",
        "Spam / Phishing email",
        "Network & Connectivity",
      ];

      let prefix = "RITM"; // Default prefix

      if (incCategories.includes(this.category)) {
        prefix = "INC";
      } else if (this.category === "Change Management") {
        prefix = "CHG";
      }

      // Get or create counter for this prefix
      const counter = await Counter.findByIdAndUpdate(
        { _id: prefix },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this.ticketNumber = `${prefix}-${String(counter.seq).padStart(4, "0")}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("ticket", ticketSchema);
