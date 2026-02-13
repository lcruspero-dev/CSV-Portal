import Coaching from "../models/coachingModel.js";
import mongoose from "mongoose";

// Authorization middleware
const canUpdateCoaching = (user) => {
  return user.isAdmin || user.role === "TL" || user.role === "TM";
};

// Get all NTEs
export const getCoachings = async (req, res) => {
  try {
    const coaching = await Coaching.find()
      .populate("coaching.employeeId", "name email")
      .sort({ createdAt: -1 });

    if (!coaching) {
      return res .status(404).json({
        success: false,
        message: "Coaching not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fetch NTEs",
      data: coaching,
    });

  } catch (error) {
    console.error("Fetch NTEs", error);
     res.status(500).json({
      success: true,
      message: "Internal Server Error",
    });
  }
};

// Get single NTE
export const getCoaching = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Coaching ID",
      });
    }

    const coaching = await Coaching.findById(id);
    if (!coaching) {
      return res.status(404).json({
        success: false,
        message: "Coaching not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fetch Single NTE",
      coaching,
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
export const createCoaching = async (req, res) => {
  try {
    const createdBy = req.user.name;
    const { coaching, status } = req.body;

    if (!canUpdateCoaching(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create NTE",
      });
    }

    if (
      !coaching ||
      !coaching.employeeId ||
      !coaching.name ||
      !coaching.position ||
      !coaching.dateIssued ||
      !coaching.coachingObjectives ||
      !coaching.employeeResponse ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        meesage: "Please provide all required Coaching fields",
      });
    }

    const validStatuses = ["DRAFT", "PER", "PNOD", "PNODA", "FTHR"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Status value",
      });
    }

    const existingCoaching = await Coaching.findOne({
      "coaching.employeeId": coaching.employeeId,
      "coaching.dateIssued": coaching.dateIssued,
      "coaching.coachingObjectives": coaching.coachingObjectives,
      "coaching.employeeResponse": coaching.employeeResponse,
    });

    if (existingCoaching) {
      return res.status(409).json({
        success: false,
        message: "An Coaching with the same details already exists",
      });
    }

    // Create new NTE with status
    const newCoaching = await Coaching.create({
      coaching: {
        ...coaching,
        file: coaching.file || null,
      },
      status,
      createdBy,
    });

    res.status(201).json({
      success: true,
      message: "Successfully Created NTE",
      newCoaching,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateCoaching = async (req, res) => {
  try {
    const { id } = req.params;
    const { coachingObjectives, employeeResponse, ...updateFields } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid Coaching ID format",
      });
    }

    const existingCoaching = await Coaching.findById(id);

    if (!existingCoaching) {
      return res.status(404).json({
        status: false,
        message: "Coaching record not found",
      });
    }

    const updateData = {};

    if (coachingObjectives !== undefined) {
      updateData.coachingObjectives = coachingObjectives;
    }

    if (employeeResponse !== undefined) {
      updateData.employeeResponse = employeeResponse;
    }

    if (updateFields.coaching) {
      updateData.coaching = {
        ...existingCoaching.coaching,
        ...updateFields.coaching,
      };
    }

    const allowedFields = ["employeeFeedback", "noticeOfDecision", "status"];
    allowedFields.forEach((field) => {
      if (updateFields[field] !== undefined) {
        updateData[field] = updateFields[field];
      }
    });

    if (updateData.status) {
      const validStatuses = [
        "pending",
        "in-progress",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }
    }

    Object.keys(updateData).forEach((key) => {
      existingCoaching[key] = updateData[key];
    });

    const updatedCoaching = await existingCoaching.save();
    res.status(200).json({
      success: true,
      message: "Coaching record updated successfully",
      data: updatedCoaching,
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
export const deleteCoaching = async (req, res) => {
  try {
    const { id } = req.params;

    if (!canUpdateCoaching(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete Coaching",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Coaching ID",
      });
    }

    const coaching = await Coaching.findById(id);
    if (!coaching) {
      return res.status(404).json({
        success: false,
        message: "Coaching not found",
      });
    }

    await coaching.deleteOne();
    res.status(200).json({
      success: true,
      message: "Coaching deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.staus(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//get nte by status query param
export const getCoachingByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const coachings = await Coaching.find({ status }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Fetch nte by status",
      coachings,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getCoachingByUser = async (req, res) => {
  try {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        succses: false,
        message: "User not authenticated",
      });
    }

    const coachings = await Coaching.find({
      "coaching.employeeId": userId,
      status: { $ne: "DRAFT" },
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Fetch coaching by user",
      coachings,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
