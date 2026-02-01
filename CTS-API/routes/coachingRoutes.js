const router = require("express").Router();
const coachingController = require("../controllers/coachingController");
const { protect } = require("../middleware/authMiddleware");

const verifyTeamRole = (req, res, next) => {
    if (req.user.isAdmin || req.user.role === "TL" || req.user.role === "TM") {
        next();
    } else {
        res.status(403);
        throw new Error("Not authorized");
    }
}
router.get("/my/coaching", protect, coachingController.getCoachingByUser);
router.post("/", protect, verifyTeamRole, coachingController.createCoaching);
router.get("/", protect, verifyTeamRole, coachingController.getCoaching);
router.get("/:id", protect, coachingController.getCoaching);
router.put("/:id", protect, coachingController.updateCoaching);
router.delete("/:id", protect, verifyTeamRole, coachingController.deleteCoaching);
router.get("/status/:status", protect, verifyTeamRole, coachingController.getCoachingByStatus);

module.exports = router;