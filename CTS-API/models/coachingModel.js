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
    offenseType: {
      type: String,
      required: true,
    },
    offenseDescription: {
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

   employeeFeedback: {
    name: {
      type: String,
    },
    position: {
      type: String,
    },
    responseDate: {
      type: String,
    },
    responseDetail: {
      type: String,
    },
    employeeSignatureDate: {
      type: String,
    },
  },

  noticeOfDecision: {
    name: {
      type: String,
    },
    position: {
      type: String,
    },
    nteIssuanceDate: {
      type: String,
    },
    writtenExplanationReceiptDate: {
      type: String,
    },
    offenseType: {
      type: String,
    },
    offenseDescription: {
      type: String,
    },
    findings: {
      type: String,
    },
    decision: {
      type: String,
    },
    employeeSignatureDate: {
      type: String,
    },
    authorizedSignatureDate: {
      type: String,
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

coachingSchema("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("COACHING", coachingSchema);