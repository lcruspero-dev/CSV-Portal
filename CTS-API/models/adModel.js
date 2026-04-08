import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("Ad", adSchema);
