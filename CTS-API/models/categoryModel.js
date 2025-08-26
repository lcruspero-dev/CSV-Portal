const mongoose = require("mongoose");

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

module.exports = mongoose.model("category", categorySchema);
