const mongoose = require("mongoose");

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

module.exports = mongoose.model("Ad", adSchema);
