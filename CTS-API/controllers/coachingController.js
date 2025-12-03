const asyncHandler = require("express-async-handler");
const Coaching = require("../models/coachingModel");
const mongoose = require("mongoose");

// Authorization middleware
const canUpdateCoaching = (user) => {
  return user.isAdmin || user.role === "TL" || user.role === "TM";
};

const canUpdateFeedbackAndDecision = (user, nte) => {
  return (
    canUpdateCoaching(user) || nte.nte.employeeId.toString() === user._id.toString()
  );
};

// Get all NTEs
const getCoachings = asyncHandler(async (req, res) => {
  const coaching = await Coaching.find()
    .populate("nte.employeeId", "name email")
    .sort({ createdAt: -1 });

  if (!coaching) {
    res.status(404);
    throw new Error("Coaching's not found");
  }
  res.status(200).json(coaching);
});

// Get single NTE
const getCoaching = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid NTE ID");
  }

  const coaching = await Coaching.findById(id);
  if (!coaching) {
    res.status(404);
    throw new Error("NTE not found");
  }

  res.status(200).json(coaching);
});

// Create NTE - Only admin/TL/TM
const createCoaching = asyncHandler(async (req, res) => {
  const createdBy = req.user.name;
  const { coaching, status } = req.body;

  // Check authorization
  if (!canUpdateCoaching(req.user)) {
    res.status(403);
    throw new Error("Not authorized to create NTE");
  }

  // Validate required fields
  if (
    !coaching ||
    !coaching.employeeId ||
    !coaching.name ||
    !coaching.position ||
    !coaching.dateIssued ||
    !coaching.issuedBy ||
    !coaching.offenseType ||
    !coaching.offenseDescription ||
    !status
  ) {
    res.status(400);
    throw new Error("Please provide all required NTE fields");
  }

  // Validate status
  const validStatuses = ["DRAFT", "PER", "PNOD", "PNODA", "FTHR"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  // Check for existing NTE
  const existingCoaching = await Coaching.findOne({
    "coaching.employeeId": coaching.employeeId,
    "coaching.dateIssued": coaching.dateIssued,
    "coaching.offenseType": coaching.offenseType,
    "coaching.offenseDescription": coaching.offenseDescription,
  });

  if (existingCoaching) {
    res.status(409);
    throw new Error("An NTE with the same details already exists");
  }

  // Create new NTE with status
  const newCoaching = await Coaching.create({
    coaching: {
      ...coaching,
      file: coaching.file || null, // Make file field optional
    },
    status,
    createdBy,
  });

  res.status(201).json(newCoaching);
});

// Update NTE sections
const updateCoaching = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { coaching, employeeFeedback, noticeOfDecision, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid Coaching ID");
  }

  const existingCoaching = await Coaching.findById(id);

  if (!existingCoaching) {
    res.status(404);
    throw new Error("NTE not found");
  }

  let updateData = {};

  // Handle NTE section update
  if (coaching) {
    updateData.coaching = { ...existingCoaching.coaching, ...coaching };
  }

  // Handle Employee Feedback and Notice of Decision updates
  if (employeeFeedback) updateData.employeeFeedback = employeeFeedback;
  if (noticeOfDecision) updateData.noticeOfDecision = noticeOfDecision;

  // Allow status update
  if (status) {
    updateData.status = status;
  }

  // Update `updatedAt` automatically via timestamps option
  existingCoaching.set(updateData);
  const updatedCoaching = await existingCoaching.save(); // Ensures __v is incremented

  res.status(200).json(updatedCoaching);
});

// Delete NTE - Only admin/TL/TM
const deleteCoaching = asyncHandler(async (req, res) => {
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
});

//get nte by status query param
const getCoachingByStatus = asyncHandler(async (req, res) => {
  const status = req.params.status;
  const coachings = await Coaching.find({ status }).sort({ createdAt: -1 }); // newest first
  res.status(200).json(coachings);
});

const getCoachingByUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id?.toString();

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Update the query to match employeeId inside the nte object
  const coachings = await Coaching.find({
    "coaching.employeeId": userId,
    status: { $ne: "DRAFT" },
  })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(coachings);
});

module.exports = {
  getCoachings,
  getCoaching,
  createCoaching,
  updateCoaching,
  deleteCoaching,
  getCoachingByStatus,
  getCoachingByUser,
};
