// controllers/assignController.js
import Assign from "../models/assignModel.js";

// Create new assignment
export const createAssign = async (req, res) => {

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
      message: "Create assign successfully",
      data: assign,
    });

  } catch (error) {
    console.error("Failed to create a new assign", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }

};

// Get all assignments
export const getAllAssigns = async (req, res) => {

  try {

    const assigns = await Assign.find();

    res.status(200).json({
      success: true,
      message: "Fetch assignments",
      count: assigns.length,
      data: assigns,
    });

  } catch (error) {
    console.error("Failed fetch assignments", error);
    res.status(500).json({
      success: false,
      message: "Inernal Server Error",
    });
  }
};

// Get single assignment
export const getAssign = async (req, res) => {
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
      message: "Fetch assignment",
      data: assign,
    });

  } catch (error) {
      console.error("Failed fetch assignment", error);
      return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update assignment
export const updateAssign = async (req, res) => {

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
      message: "Upadete assignment successfully",
      data: assign,
    });

  } catch (error) {
    console.error("Failed to update assignment", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }

};

// Delete assignment
export const deleteAssign = async (req, res) => {
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
    console.error("Failed to delete assignment", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

