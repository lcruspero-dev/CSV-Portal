import express from "express";
import coachingController from "../controllers/coachingController.js";
import { protect } from "../middleware/authMiddleware.js";

const verifyTeamRole = (req, res, next) => {
    if (req.user.isAdmin || req.user.role === "TL" || req.user.role === "TM") {
        next();
    } else {
        res.status(403);
        throw new Error("Not authorized");
    }
}

const router = express.Router();

router.get("/my/coaching", protect, coachingController.getCoachingByUser);
router.post("/", protect, verifyTeamRole, coachingController.createCoaching);
router.get("/", protect, verifyTeamRole, coachingController.getCoaching);
router.get("/:id", protect, coachingController.getCoaching);
router.put("/:id", protect, coachingController.updateCoaching);
router.delete("/:id", protect, verifyTeamRole, coachingController.deleteCoaching);
router.get("/status/:status", protect, verifyTeamRole, coachingController.getCoachingByStatus);

export default router;