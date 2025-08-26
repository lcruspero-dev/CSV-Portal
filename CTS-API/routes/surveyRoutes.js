const router = require("express").Router();
const surveyController = require("../controllers/surveyController");
const { protect, verifyAdmin } = require("../middleware/authMiddleware");

router.post("/", protect, verifyAdmin, surveyController.createSurvey);
router.get("/", protect, verifyAdmin, surveyController.getAllSurveys);
router.get("/search/:id", protect, verifyAdmin, surveyController.getSurveyById);
router.put("/:id", protect, verifyAdmin, surveyController.updateSurvey);
router.delete("/:id", protect, verifyAdmin, surveyController.deleteSurvey);
router.post("/:id/respond", protect, surveyController.submitResponse);
router.get("/active", protect, surveyController.getAllActiveSurveys);
router.get(
  "/titles",
  protect,
  verifyAdmin,
  surveyController.getAllSurveyTitles
);

module.exports = router;
