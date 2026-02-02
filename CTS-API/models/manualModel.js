const mongoose = require("mongoose");

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

module.exports = mongoose.model("Manual", manualSchema);
    