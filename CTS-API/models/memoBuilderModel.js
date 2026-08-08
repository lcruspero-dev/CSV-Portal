const mongoose = require("mongoose");

const memoBuilderSchema = mongoose.Schema(
  {
    title: { type: String, required: [true, "Please add a title"], trim: true, maxlength: 160 },
    subject: { type: String, required: [true, "Please add a subject"], trim: true, maxlength: 240 },
    content: { type: String, required: [true, "Please add memo content"], trim: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    targetType: {
      type: String,
      enum: ["all", "group", "employee"],
      default: "all",
      index: true,
    },
    targetGroup: { type: String, default: null, trim: true },
    targetGroups: [{ type: String, trim: true }],
    targetEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    targetEmployees: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    audienceUserIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    audienceResolvedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
    acknowledgedBy: [
      {
        userId: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, default: "" },
        signature: { type: String, required: true },
        acknowledgedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

memoBuilderSchema.index({ title: "text", subject: "text", content: "text" });

module.exports = mongoose.model("MemoBuilder", memoBuilderSchema);
