const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/userModel");

// @desc    Register a new user
// @route   /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check for existing user
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    isAdmin: isAdmin || false, // Set isAdmin, default to false if not provided
    role: "user",
  });

  // User is created
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      token: generateToken(user._id, user.isAdmin, user.name),
      loginLimit: user.loginLimit,
    });
  } else {
    res.status(400);
    throw new Error("User could not be created");
  }
});

// @desc    Login a user
// @route   /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Check User and Password match
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      status: user.status,
      loginLimit: user.loginLimit,
      token: generateToken(user._id, user.isAdmin, user.name),
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

// @desc    Get current user
// @route   /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = {
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    isAdmin: req.user.isAdmin,
  };
  res.status(200).json(user);
});

// Generate token
const generateToken = (id, isAdmin, name) => {
  return jwt.sign({ id, isAdmin, name }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Reset password using secret key
const adminResetPassword = asyncHandler(async (req, res) => {
  const { email, password, confirmPassword, secretKey } = req.body;

  // Validate input fields
  if (!email || !password || !confirmPassword || !secretKey) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  // Password validation: Password must be at least 12 characters, and can include letters, numbers, and special characters.
  const passwordRegex = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{12,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400);
    throw new Error(
      "Password must be at least 12 characters, and can include letters, numbers, and special characters."
    );
  }

  // Check if email exists
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  // Verify secret key from environment variable
  if (secretKey !== process.env.RESET_SECRET_KEY) {
    res.status(400);
    throw new Error("Invalid secret key");
  }

  // Check if new password is different from current password
  const isPasswordSame = await bcrypt.compare(password, user.password);
  if (isPasswordSame) {
    res.status(400);
    throw new Error("New password cannot be the same as the current password");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update password
  user.password = hashedPassword;

  await user.save();

  res.status(200).json({
    message: "Password reset successfully",
    userId: user._id,
    email: user.email,
    name: user.name,
  });
});

//get all users emails
const getAllUsersEmails = asyncHandler(async (req, res) => {
  const users = await User.find({}, { email: 1 });
  res.status(200).json(users);
});

const searchUsers = asyncHandler(async (req, res) => {
  // Get user information from the authenticated request
  const requestingUser = req.user; // Assuming you have user data in req.user from auth middleware

  // Check if user exists and has required permissions
  if (!requestingUser) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Check if user is either admin or has required role
  if (!requestingUser.isAdmin && !["TL", "TM"].includes(requestingUser.role)) {
    return res.status(403).json({
      message: "Access denied. Requires admin privileges or TL/TM role",
    });
  }

  const { query } = req.query;

  let users;
  if (query === "csv-all") {
    users = await User.find({}, { password: 0 }).sort({ name: 1 });
  } else {
    users = await User.find(
      { name: { $regex: `.*${query}.*`, $options: "i" } },
      { password: 0 } // Excludes password field
    );
  }

  res.status(200).json(users);
});

const setUserToInactive = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await User.findByIdAndUpdate(userId, { status: "inactive" });
  res.status(200).json({ message: "User set to inactive" });
});
const setUserToActive = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await User.findByIdAndUpdate(userId, { status: "active" });
  res.status(200).json({ message: "User set to active" });
});

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const isPasswordSame = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordSame) {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });
  res.status(200).json({ message: "Password changed successfully" });
});

//update login limit
const updateLoginLimit = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Destructure userId from params
  const { loginLimit } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await User.findByIdAndUpdate(userId, { loginLimit });

  res.status(200).json({ message: "Login limit updated successfully" });
});

const fetchAllUsers = asyncHandler(async (req, res) => {

})

module.exports = {
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
};
