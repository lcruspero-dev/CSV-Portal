const express = require("express");
const router = express.Router();
const { getActiveAd } = require("../controllers/adController");

router.get("/active", getActiveAd);

module.exports = router;
