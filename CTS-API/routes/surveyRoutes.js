import express from "express";
import {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  submitResponse,
  getAllActiveSurveys,
  getAllSurveyTitles
} from "../controllers/surveyController.js";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, verifyAdmin, createSurvey);
router.get("/", protect, verifyAdmin, getAllSurveys);
router.get("/search/:id", protect, verifyAdmin, getSurveyById);
router.put("/:id", protect, verifyAdmin, updateSurvey);
router.delete("/:id", protect, verifyAdmin, deleteSurvey);
router.post("/:id/respond", protect, submitResponse);
router.get("/active", protect, getAllActiveSurveys);
router.get(
  "/titles",
  protect,
  verifyAdmin,
  getAllSurveyTitles
);

export default router;
