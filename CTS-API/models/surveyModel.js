const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const surveySchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  question: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "active", "closed"],
    default: "active",
  },
  allowAnonymous: {
    type: Boolean,
    default: true,
  },
  responses: [
    {
      respondent: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      username: {
        type: String,
      },
      isAnonymous: {
        type: Boolean,
        default: false,
      },
      feedback: {
        type: String,
      },
      ratingAnswer: {
        type: Number,
      },
      dateAnswer: {
        type: Date,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the 'updatedAt' field on save
surveySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Survey", surveySchema);
