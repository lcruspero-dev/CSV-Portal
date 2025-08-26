const mongoose = require("mongoose");

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

module.exports = mongoose.model("assign", assignSchema);
