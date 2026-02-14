import express from "express";
import {
  getAllPolicies,
  getPoliciesById,
  createPolicies,
  updatePolicies,
  getUserUnacknowledged,
  updateAcknowledged,
  deletePolicies,
} from "../controllers/policiesController.js";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllPolicies);

router.get("/:id", protect, getPoliciesById);

router.post("/create", protect, verifyAdmin, createPolicies);

router.put("/:id", protect, verifyAdmin, updatePolicies);

router.delete("/:id", protect, verifyAdmin, deletePolicies);

router.put("/:id/acknowledged", protect, updateAcknowledged);

router.get("/unacknowledged/:policyId", protect, verifyAdmin, getUserUnacknowledged);

export default router;
