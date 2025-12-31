import Coaching from "../models/coachingModel";
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
    res.status(404).json({
      success: false,
      message: "Coaching not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "Fetch NTEs",
    data: coaching,
  });
    
  } catch (error) {

    console.error("Fetch NTEs", error)
    return res.status(500).json({
      success: true,
      message: "Internal Server Error"
    });
    
  }

};

// Get single NTE
export const getCoaching = async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid Coaching ID");
  }

  const coaching = await Coaching.findById(id);
  if (!coaching) {
    res.status(404);
    throw new Error("Coaching not found");
  }

  res.status(200).json(coaching);

};

// Create NTE - Only admin/TL/TM
export const createCoaching = async (req, res) => {
  const createdBy = req.user.name;
  const { coaching, status } = req.body;

  if (!canUpdateCoaching(req.user)) {
    res.status(403);
    throw new Error("Not authorized to create NTE");
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
    res.status(400);
    throw new Error("Please provide all required Coaching fields");
  }

  const validStatuses = ["DRAFT", "PER", "PNOD", "PNODA", "FTHR"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const existingCoaching = await Coaching.findOne({
    "coaching.employeeId": coaching.employeeId,
    "coaching.dateIssued": coaching.dateIssued,
    "coaching.coachingObjectives": coaching.coachingObjectives,
    "coaching.employeeResponse": coaching.employeeResponse,
  });

  if (existingCoaching) {
    res.status(409);
    throw new Error("An Coaching with the same details already exists");
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

  res.status(201).json(newCoaching);
};

export const updateCoaching = async (req, res) => {
  const { id } = req.params;
  const { coachingObjectives, employeeResponse, ...updateFields } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid Coaching ID format");
  }

  const existingCoaching = await Coaching.findById(id);
  
  if (!existingCoaching) {
    res.status(404);
    throw new Error("Coaching record not found");
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
      ...updateFields.coaching
    };
  }

  const allowedFields = ['employeeFeedback', 'noticeOfDecision', 'status'];
  allowedFields.forEach(field => {
    if (updateFields[field] !== undefined) {
      updateData[field] = updateFields[field];
    }
  });

  if (updateData.status) {
    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(updateData.status)) {
      res.status(400);
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
  }

  Object.keys(updateData).forEach(key => {
    existingCoaching[key] = updateData[key];
  });

  const updatedCoaching = await existingCoaching.save();
  res.status(200).json({
    success: true,
    message: "Coaching record updated successfully",
    data: updatedCoaching
  });
};

// Delete NTE - Only admin/TL/TM
export const deleteCoaching = async (req, res) => {
  const { id } = req.params;

  if (!canUpdateCoaching(req.user)) {
    res.status(403);
    throw new Error("Not authorized to delete Coaching");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid Coaching ID");
  }

  const coaching = await Coaching.findById(id);
  if (!coaching) {
    res.status(404);
    throw new Error("Coaching not found");
  }

  await coaching.deleteOne();
  res.status(200).json({ message: "Coaching deleted successfully" });
};

//get nte by status query param
export const getCoachingByStatus = async (req, res) => {
  const status = req.params.status;
  const coachings = await Coaching.find({ status }).sort({ createdAt: -1 }); // newest first
  res.status(200).json(coachings);
};

export const getCoachingByUser = async (req, res) => {
  const userId = req.user?._id?.toString();

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const coachings = await Coaching.find({
    "coaching.employeeId": userId,
    status: { $ne: "DRAFT" },
  })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(coachings);
};


