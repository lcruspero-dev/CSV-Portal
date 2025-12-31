import UserProfile from "../models/userProfileModel.js";

// Whitelist fields allowed to be updated by users
const userAllowedFields = ["avatar", "bio", "address", "phone", "location"];
// Whitelist fields allowed for admin updates
const adminAllowedFields = ["avatar", "bio", "address", "phone", "location", "role", "isAdmin"];

// Helper to filter request body
const filterFields = (body, allowedFields) => {
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedFields.includes(key))
  );
};

// Create User Profile or update existing
export const upsertUserProfile = async (req, res) => {
  try {
    const updates = filterFields(req.body, userAllowedFields);

    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: { ...updates, userId: req.user.id },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "User profile saved successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Failed to save user profile", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserProfile.find();
    return res.status(200).json({
      success: true,
      message: "Fetch all users",
      data: users,
    });
  } catch (error) {
    console.error("Failed fetch all users", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get authenticated user's profile
export const getUserProfile = async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: req.user.id });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetch user profile",
      data: userProfile,
    });
  } catch (error) {
    console.error("Failed to fetch user profile", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update authenticated user's profile
export const updateUserProfile = async (req, res) => {
  try {
    const updates = filterFields(req.body, userAllowedFields);

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Update user profile failed", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete authenticated user's profile
export const deleteUserProfile = async (req, res) => {
  try {
    const deletedProfile = await UserProfile.findOneAndDelete({
      userId: req.user.id,
    });

    if (!deletedProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    // 204 No Content - do not return a body
    return res.status(204).send();
  } catch (error) {
    console.error("Failed to delete user profile", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get any user's profile by ID (admin or public)
export const getUserProfileById = async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: req.params.id });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetch user profile by ID",
      data: userProfile,
    });
  } catch (error) {
    console.error("Failed to get user profile by ID", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get all user avatars (id + avatar only)
export const getAllUserAvatar = async (req, res) => {
  try {
    const userProfiles = await UserProfile.find({}, { userId: 1, avatar: 1, _id: 0 });

    if (!userProfiles.length) {
      return res.status(404).json({
        success: false,
        message: "No user avatars found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetch all user avatars",
      data: userProfiles,
    });
  } catch (error) {
    console.error("Failed to fetch user avatars", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Admin: Update any user's profile
export const adminUpdateUserProfile = async (req, res) => {
  try {
    const updates = filterFields(req.body, adminAllowedFields);

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: req.params.id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
        upsert: true, // creates profile if not exists
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "User profile updated by admin",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Failed to update user profile by admin", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
