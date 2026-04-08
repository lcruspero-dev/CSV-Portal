import mongoose from "mongoose";

const manualSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please add title"],
    },
   description: {
    type: String,
    required: [true, "Please add email"],
   },
   file: {
    type:String,
    required: [true, "Please add a file"]
   },
}, {
    timestamps: true,
});

export default mongoose.model("Manual", manualSchema);
    