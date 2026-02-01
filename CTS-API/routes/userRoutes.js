const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  adminResetPassword,
  getAllUsersEmails,
  searchUsers,
  setUserToInactive,
  setUserToActive,
  changePassword,
  updateLoginLimit,
  addUser
} = require("../controllers/userController");

const { protect, verifyAdmin } = require("../middleware/authMiddleware");

router.post("/", registerUser);

router.post("/login", loginUser);

router.post("/add-user", protect, addUser);

router.post("/admin-reset-password", protect, verifyAdmin, adminResetPassword);

// Protected route (2nd argument) - protect
router.get("/me", protect, getMe);

router.get("/emails", protect, verifyAdmin, getAllUsersEmails);

router.get("/search", protect, searchUsers);

router.put("/inactive/:userId", protect, verifyAdmin, setUserToInactive);

router.put("/active/:userId", protect, verifyAdmin, setUserToActive);

router.put("/change-password", protect, changePassword);

router.put("/update-login-limit/:userId", protect, verifyAdmin, updateLoginLimit);

module.exports = router;
