const express = require("express");
const { protect, verifyAdmin } = require("../middleware/authMiddleware");
const {
  getMemos,
  getMemo,
  createMemo,
  updateMemo,
  updateMemoStatus,
  deleteMemo,
  acknowledgeMemo,
  getMemoAcknowledgements,
  getTargetOptions,
} = require("../controllers/memoBuilderController");

const router = express.Router();

router.route("/").get(protect, getMemos).post(protect, verifyAdmin, createMemo);
router.get("/targets", protect, verifyAdmin, getTargetOptions);
router.patch("/:id/status", protect, verifyAdmin, updateMemoStatus);
router.put("/:id/acknowledge", protect, acknowledgeMemo);
router.get(
  "/:id/acknowledgements",
  protect,
  verifyAdmin,
  getMemoAcknowledgements,
);
router
  .route("/:id")
  .get(protect, getMemo)
  .put(protect, verifyAdmin, updateMemo)
  .delete(protect, verifyAdmin, deleteMemo);

module.exports = router;
