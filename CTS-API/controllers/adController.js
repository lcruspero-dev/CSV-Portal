const Ad = require("../models/adModel");

// Get the current ad
const getActiveAd = async (req, res) => {
  try {
    const ad = await Ad.findOne();
    if (!ad) return res.status(404).json({ message: "No ad found" });
    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getActiveAd };
