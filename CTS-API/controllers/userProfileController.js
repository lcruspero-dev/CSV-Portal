import UserProfile from "../models/userProfileModel.js";

// Create User Profile or update existing
export const createUserProfile = async (req, res) => {
  try {
    let userProfile = await UserProfile.findOne({ userId: req.user.id });
    if (userProfile) {
      // Update existing user profile
      userProfile = await UserProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      res.status(200).json(userProfile);
    } else {
      // Create new user profile
      userProfile = new UserProfile({
        userId: req.user.id,
        ...req.body,
      });
      const savedProfile = await userProfile.save();
      res.status(201).json(savedProfile);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating or updating user profile", error });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserProfile.find();
    res.status(200).json(users); 
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: req.user.id });
    if (!userProfile) {
      return res.status(200).json({ message: "User profile not found" });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};

export const updateUserProfile = async (req, res) => {
    try {
      const updatedProfile = await UserProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!updatedProfile) {
        return res.status(404).json({ message: "User profile not found" });
      }
      res.status(200).json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Error updating user profile", error });
    }
  };

export const deleteUserProfile = async (req, res) => {
  try {
    const deletedProfile = await UserProfile.findOneAndDelete({
      userId: req.user.id,
    });
    if (!deletedProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }
    res.status(200).json({ message: "User profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user profile", error });
  }
};

export const getUserProfileById = async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: req.params.id }); 
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};

export const getAllUserAvatar = async (req, res) => {
  try {
    const userProfiles = await UserProfile.find(
      {},
      { userId: 1, avatar: 1, _id: 0 }
    ); // Explicitly include only userId & avatar, exclude _id
    res.status(200).json(userProfiles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user avatars", error });
  }
};

export const adminUpdateUserProfile = async (req, res) => {
  try {
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: req.params.id },
      { $set: req.body },
      {
        new: true,
        runValidators: true,
        upsert: true, // This creates the document if it doesn't exist
        setDefaultsOnInsert: true, // This applies schema defaults if creating new
      }
    );

    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: "Error updating user profile", error });
  }
};

