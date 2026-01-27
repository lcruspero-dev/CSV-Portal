import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

{
  /** Register User */
}
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Check for existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin ?? false,
      role: "user",
    });

    return res.status(201).json({
      success: true,
      message: "Registration complete",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        loginLimit: user.loginLimit,
        token: generateToken(user._id, user.isAdmin, user.name),
      },
    });
  } catch (error) {
    console.error("Register User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

{
  /** Login User */
}
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    // Check credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Successful login
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        status: user.status,
        loginLimit: user.loginLimit,
        token: generateToken(user._id, user.isAdmin, user.name),
      },
    });
  } catch (error) {
    console.error("Login User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      isAdmin: req.user.isAdmin,
    };

    res.status(200).json({
      success: true,
      message: "Fetch user",
      user,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Generate token
export const generateToken = (id, isAdmin, name) => {
  return jwt.sign({ id, isAdmin, name }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Reset password using secret key
export const adminResetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword, secretKey } = req.body;

    // Validate input fields
    if (!email || !password || !confirmPassword || !secretKey) {
      return res.status(400).json({ 
        message: "Please provide all required fields" 
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: "Passwords do not match" 
      });
    }

    // Password validation: Password must be at least 12 characters, and can include letters, numbers, and special characters.
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{12,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 12 characters, and can include letters, numbers, and special characters." 
      });
    }

    // Check if email exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ 
        message: "User not found" 
      });
    }

    // Verify secret key from environment variable
    if (secretKey !== process.env.RESET_SECRET_KEY) {
      return res.status(400).json({ 
        message: "Invalid secret key" 
      });
    }

    // Check if new password is different from current password
    const isPasswordSame = await bcrypt.compare(password, user.password);
    if (isPasswordSame) {
      return res.status(400).json({ 
        message: "New password cannot be the same as the current password" 
      });
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
  } catch (error) {
    console.error("Error in adminResetPassword:", error);
    
    // Handle specific error types if needed
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: error.message 
      });
    }
    
    // Generic server error
    res.status(500).json({ 
      message: "An error occurred while resetting the password",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

//get all users emails
export const getAllUsersEmails = async (req, res) => {
  try {
    const users = await User.find({}, { email: 1 });

    res.status(200).json({
      success: true,
      message: "Fetch users emails",
      users,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: true,
      message: "Internal Server Error",
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const requestingUser = req.user; // Assuming you have user data in req.user from auth middleware
    // Check if user exists and has required permissions
    if (!requestingUser) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Check if user is either admin or has required role
    if (
      !requestingUser.isAdmin &&
      !["TL", "TM"].includes(requestingUser.role)
    ) {
      return res.status(403).json({
        success: false,
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
        { password: 0 }, // Excludes password field
      );
    }
    res.status(200).json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const setUserToInactive = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: true,
        messag: "User not found",
      });
    }

    await User.findById(userId, {
      status: "inactive",
    });

    res.status(200).json({
      success: true,
      message: "User set to inactive",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const setUserToActive = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndUpdate(userId, { status: "active" });

    res.status(200).json({
      success: true,
      message: "User set to active",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Validate input fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Please provide both current and new password"
      });
    }

    // Password validation: Password must be at least 12 characters
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "New password must be at least 12 characters, and can include letters, numbers, and special characters."
      });
    }

    // Check if new password is different from current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the current password"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isPasswordSame = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordSame) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(
      userId, 
      { password: hashedPassword },
      { new: true } // Optional: returns the updated document
    );

    res.status(200).json({ 
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Invalid user ID format"
      });
    }
    
    // Generic server error
    res.status(500).json({
      message: "An error occurred while changing the password",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

//update login limit
export const updateLoginLimit = async (req, res) => {
  try {
    const { userId } = req.params;
    const { loginLimit } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndUpdate(userId, { loginLimit });

    res.status(200).json({
      success: true,
      message: "Login limit updated successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      role: role || "user",
      status: "active",
      loginLimit: 0,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        status: user.status,
        loginLimit: user.loginLimit,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: true,
      message: "Internal Server Error",
    });
  }
};
