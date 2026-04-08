import express from "express";
import nteController from "../controllers/nteController.js";
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

router.get("/my/nte", protect, nteController.getNtesByUser);
// Basic CRUD routes - restricted to TL/TM/Admin
router.post("/", protect, verifyTeamRole, nteController.createNte);
router.get("/", protect, verifyTeamRole, nteController.getNtes);
router.get("/:id", protect, nteController.getNte);
router.put("/:id", protect, nteController.updateNte);
router.delete("/:id", protect, verifyTeamRole, nteController.deleteNte);

// Get NTEs by status query param - restricted to TL/TM/Admin
router.get(
  "/status/:status",
  protect,
  verifyTeamRole,
  nteController.getNtesByStatus
);

export default router;
