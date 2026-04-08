import express from "express";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getUserProfileById,
  getAllUserAvatar,
  adminUpdateUserProfile,
  getAllUsers,
} from "../controllers/userProfileController.js";

import { protect, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/", protect, createUserProfile); // Create user profile
router.get("/", protect, getUserProfile); // Get current user's profile
router.get("/all", protect, verifyAdmin, getAllUsers); // Get all user profiles (admin)
router.put("/", protect, updateUserProfile); // Update user profile
router.delete("/", protect, verifyAdmin, deleteUserProfile); // Delete user profile
// Place specific routes before param routes to avoid conflicts
router.get("/avatar/all", protect, getAllUserAvatar);
router.get("/:id", protect, verifyAdmin, getUserProfileById); // Get user profile by id
router.put(
  "/admin-update-user-profile/:id",
  protect,
  verifyAdmin,
  adminUpdateUserProfile
);

export default router;
