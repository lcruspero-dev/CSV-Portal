const express = require("express");
const router = express.Router();
const {
  getAllPolicies,
  getPoliciesById,
  createPolicies,
  updatePolicies,
  getUserUnacknowledged,
  updateAcknowledged,
  deletePolicies,
} = require("../controllers/policiesController");
const { protect, verifyAdmin } = require("../middleware/authMiddleware");

router.get("/", protect, getAllPolicies);

router.get("/:id", protect, getPoliciesById);

router.post("/create", protect, verifyAdmin, createPolicies);

router.put("/:id", protect, verifyAdmin, updatePolicies);

router.delete("/:id", protect, verifyAdmin, deletePolicies);

router.put("/:id/acknowledged", protect, updateAcknowledged);

router.get("/unacknowledged/:memoId", protect, verifyAdmin, getUserUnacknowledged);

module.exports = router;
