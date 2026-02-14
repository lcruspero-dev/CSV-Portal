import express from "express";
import {
  getMemos,
  createMemo,
  updateMemo,
  deleteMemo,
  getMemoById,
  updateAcknowledged,
  getUserUnacknowledged,
} from "../controllers/memoController.js";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

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

export default router;
