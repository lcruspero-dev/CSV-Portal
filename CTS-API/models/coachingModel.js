const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const coachingSchema = new Schema({
  
  coaching: {
    employeeId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    dateIssued: {
      type: String,
      required: true,
    },
    issuedBy: {
      type: String,
      required: true,
    },
    coachingObjectives: {
      type: String,
      required: true,
    },
    employeeResponse: {
      type: String,
      required: true,
    },
    file: {
      type: String,
    },
    employeeSignatureDate: {
      type: String,
      default: null,
    },
    authorizedSignatureDate: {
      type: String,
      default: null,
    },
  },
   status: {
    type: String,
    enum: ["DRAFT", "PER", "PNOD", "PNODA", "FTHR"],
  },
  createdBy: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

});

coachingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("COACHING", coachingSchema);