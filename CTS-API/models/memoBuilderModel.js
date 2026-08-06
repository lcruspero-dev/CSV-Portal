const mongoose = require("mongoose");

const memoBuilderSchema = new mongoose.Schema(
  {
    memoCode: {
      type: String,
      required: [true, "Please add a memo code"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    recipientLabel: {
      type: String,
      required: [true, "Please add the recipient label"],
      trim: true,
    },

    senderLabel: {
      type: String,
      required: [true, "Please add the sender"],
      trim: true,
    },

    subject: {
      type: String,
      required: [true, "Please add the memo subject"],
      trim: true,
      maxlength: 300,
    },

    content: {
      type: String,
      required: [true, "Please add the memo content"],
      trim: true,
      maxlength: 50000,
    },

    memoDate: {
      type: Date,
      required: [true, "Please add the memo date"],
    },

    issuedByLabel: {
      type: String,
      default: "TOP MANAGEMENT",
      trim: true,
    },

    confidentialityNotice: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    acknowledgementDeadline: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

memoBuilderSchema.index({
  memoCode: "text",
  subject: "text",
  content: "text",
});

module.exports = mongoose.model("Memo", memoBuilderSchema);
