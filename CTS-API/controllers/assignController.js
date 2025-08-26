// controllers/assignController.js
const Assign = require("../models/assignModel");

// Create new assignment
const createAssign = async (req, res) => {
  try {
    const { name, role } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide both name and role",
      });
    }

    // Check if the name already exists
    const existingAssign = await Assign.findOne({ name });
    if (existingAssign) {
      return res.status(400).json({
        success: false,
        message: "Name already exists",
      });
    }

    // If name doesn't exist, create a new assign
    const assign = await Assign.create({
      name,
      role,
    });

    res.status(201).json({
      success: true,
      assign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all assignments
const getAllAssigns = async (req, res) => {
  try {
    const assigns = await Assign.find();

    res.status(200).json({
      success: true,
      count: assigns.length,
      assigns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single assignment
const getAssign = async (req, res) => {
  try {
    const assign = await Assign.findById(req.params.id);

    if (!assign) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      assign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update assignment
const updateAssign = async (req, res) => {
  try {
    const { name, role } = req.body;

    const assign = await Assign.findById(req.params.id);

    if (!assign) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (name) assign.name = name;
    if (role) assign.role = role;

    await assign.save();

    res.status(200).json({
      success: true,
      assign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete assignment
const deleteAssign = async (req, res) => {
  try {
    const assign = await Assign.findById(req.params.id);

    if (!assign) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    await assign.deleteOne();

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAssign,
  getAllAssigns,
  getAssign,
  updateAssign,
  deleteAssign,
};
