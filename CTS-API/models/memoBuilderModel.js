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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

memoBuilderSchema.index({ title: "text", subject: "text", content: "text" });

module.exports = mongoose.model("MemoBuilder", memoBuilderSchema);
