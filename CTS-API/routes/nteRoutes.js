import express from "express";
import {
  getNtesByUser,
  createNte,
  getNtes,
  getNte,
  updateNte,
  deleteNte ,
  getNtesByStatus
} from "../controllers/nteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Role verification middleware for TL/TM/Admin
const verifyTeamRole = (req, res, next) => {
  if (req.user.isAdmin || req.user.role === "TL" || req.user.role === "TM") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized");
  }
};

router.get("/my/nte", protect, getNtesByUser);
// Basic CRUD routes - restricted to TL/TM/Admin
router.post("/", protect, verifyTeamRole, createNte);
router.get("/", protect, verifyTeamRole, getNtes);
router.get("/:id", protect, getNte);
router.put("/:id", protect, updateNte);
router.delete("/:id", protect, verifyTeamRole, deleteNte);

// Get NTEs by status query param - restricted to TL/TM/Admin
router.get(
  "/status/:status",
  protect,
  verifyTeamRole,
  getNtesByStatus
);

export default router;
