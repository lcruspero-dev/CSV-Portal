import express from "express";
import { getActiveAd } from "../controllers/adController.js";

const router = express.Router();

router.get("/active", getActiveAd);

export default router;
