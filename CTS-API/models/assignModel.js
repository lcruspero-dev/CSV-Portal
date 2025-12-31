import mongoose from "mongoose";

const assignSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    ref: "User",
  },
  role: {
    type: String,
    required: true,
    enum: ["HR", "IT"],
  },
});

export default mongoose.model("assign", assignSchema);
