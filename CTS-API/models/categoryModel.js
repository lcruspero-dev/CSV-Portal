import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
  category: {
    type: String,
    required: [true, "Please select a Category"],
  },
  role: {
    type: String,
    required: true,
    enum: ["HR", "IT"],
  },
});

export default mongoose.model('category', categorySchema)
