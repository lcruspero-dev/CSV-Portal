import Nte from "../models/nteModel.js";
import mongoose from "mongoose";

// Authorization middleware
const canUpdateNte = (user) => {
  return user.isAdmin || user.role === "TL" || user.role === "TM";
};

// Get all NTEs
export const getNtes = async (req, res) => {
  try {
    const ntes = await Nte.find()
      .populate("nte.employeeId", "name email")
      .sort({ createdAt: -1 });

    if (!ntes) {
      return res.status(404).json({
        success: false,
        message: "NTEs not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Fetch NTEs",
      ntes,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get single NTE
export const getNte = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NTE ID",
      });
    }

    const nte = await Nte.findById(id);
    if (!nte) {
      return res.status(404).json({
        success: false,
        messag: "NTE not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fetch NTE",
      nte,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Create NTE - Only admin/TL/TM
export const createNte = async (req, res) => {
  try {
    const createdBy = req.user.name;
    const { nte, status } = req.body;

    // Check authorization
    if (!canUpdateNte(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create NTE",
      });
    }

    // Validate required fields
    if (
      !nte ||
      !nte.employeeId ||
      !nte.name ||
      !nte.position ||
      !nte.dateIssued ||
      !nte.issuedBy ||
      !nte.offenseType ||
      !nte.offenseDescription ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required NTE fields",
      });
    }

    // Validate status
    const validStatuses = ["DRAFT", "PER", "PNOD", "PNODA", "FTHR"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Check for existing NTE
    const existingNte = await Nte.findOne({
      "nte.employeeId": nte.employeeId,
      "nte.dateIssued": nte.dateIssued,
      "nte.offenseType": nte.offenseType,
      "nte.offenseDescription": nte.offenseDescription,
    });

    if (existingNte) {
      return res.status(409).json({
        success: false,
        message: "An NTE with the same details already exists",
      });
    }

    // Create new NTE with status
    const newNte = await Nte.create({
      nte: {
        ...nte,
        file: nte.file || null, // Make file field optional
      },
      status,
      createdBy,
    });

    res.status(201).json({
      success: true,
      message: "Successfully created NTE",
      newNte,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update NTE sections
export const updateNte = async (req, res) => {
  
  try {

    const { id } = req.params;
    const { nte, employeeFeedback, noticeOfDecision, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NTE ID",
      });
    }

    const existingNte = await Nte.findById(id);

    if (!existingNte) {
      return res.status(404).json({
        success: false,
        message: "NTE not found",
      });
    }

    let updateData = {};

    // Handle NTE section update
    if (nte) {
      updateData.nte = { ...existingNte.nte, ...nte };
    }

    // Handle Employee Feedback and Notice of Decision updates
    if (employeeFeedback) updateData.employeeFeedback = employeeFeedback;
    if (noticeOfDecision) updateData.noticeOfDecision = noticeOfDecision;

    // Allow status update
    if (status) {
      updateData.status = status;
    }

    // Update `updatedAt` automatically via timestamps option
    existingNte.set(updateData);
    const updatedNte = await existingNte.save(); // Ensures __v is incremented

    res.status(200).json({
      success: true,
      messag: "Update NTE sections",
      updatedNte,
    });

  } catch (error) {

    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};

// Delete NTE - Only admin/TL/TM
export const deleteNte = async (req, res) => {
  try {
    const { id } = req.params;

    if (!canUpdateNte(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete NTE",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NTE ID",
      });
    }

    const nte = await Nte.findById(id);
    if (!nte) {
      return res.status(404).json({
        success: false,
        message: "NTE not found",
      });
    }

    await nte.deleteOne();
    res.status(200).json({
      success: true,
      message: "NTE deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//get nte by status query param
export const getNtesByStatus = async (req, res) => {
  try {
    const status = req.params.status;

    const ntes = await Nte.find({ status }).sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      success: false,
      message: "Fetch NTE by status",
      ntes,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getNtesByUser = async (req, res) => {
  try {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Update the query to match employeeId inside the nte object
    const ntes = await Nte.find({
      "nte.employeeId": userId,
      status: { $ne: "DRAFT" },
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Fetch NTEs by user",
      ntes,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
