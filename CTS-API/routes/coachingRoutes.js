import express from 'express';
import {
getCoachingByUser,
createCoaching,
getCoaching,
updateCoaching,
deleteCoaching,
getCoachingByStatus
} from "../controllers/coachingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const verifyTeamRole = (req, res, next) => {
    if (req.user.isAdmin || req.user.role === "TL" || req.user.role === "TM") {
        next();
    } else {
        res.status(403);
        throw new Error("Not authorized");
    }
}

router.get("/my/coaching", protect, getCoachingByUser);
router.post("/", protect, verifyTeamRole, createCoaching);
router.get("/", protect, verifyTeamRole, getCoaching);
router.get("/:id", protect, getCoaching);
router.put("/:id", protect, updateCoaching);
router.delete("/:id", protect, verifyTeamRole, deleteCoaching);
router.get("/status/:status", protect, verifyTeamRole, getCoachingByStatus);

export default router;