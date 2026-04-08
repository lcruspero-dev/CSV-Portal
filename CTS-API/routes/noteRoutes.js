import express from "express";
import { getNotes, addNote } from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getNotes).post(protect, addNote);

export default router;

