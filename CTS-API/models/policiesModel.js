import mongoose from "mongoose";

const policiesSchema = mongoose.Schema({
  subject: {
    type: String,
    required: [true, "Please add a subject"],
  },
  file: {
    type: String,
  },
  description: {
    type: String,
    required: [true, "Please add a subject"],
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

export default mongoose.model("Policies", policiesSchema);
