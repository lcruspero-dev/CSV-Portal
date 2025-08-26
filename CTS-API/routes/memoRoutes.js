const express = require("express");
const router = express.Router();
const {
  getMemos,
  createMemo,
  updateMemo,
  deleteMemo,
  getMemoById,
  updateAcknowledged,
  getUserUnacknowledged,
} = require("../controllers/memoController");

const { protect, verifyAdmin } = require("../middleware/authMiddleware");

router.get("/", protect, getMemos);

router.get("/:id", protect, getMemoById);

router.post("/create", protect, verifyAdmin, createMemo);

router.put("/:id", protect, verifyAdmin, updateMemo);

router.delete("/:id", protect, verifyAdmin, deleteMemo);

router.put("/:id/acknowledged", protect, updateAcknowledged);

router.get(
  "/unacknowledged/:memoId",
  protect,
  verifyAdmin,
  getUserUnacknowledged
);

module.exports = router;
