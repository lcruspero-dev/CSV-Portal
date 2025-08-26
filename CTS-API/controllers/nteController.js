const asyncHandler = require("express-async-handler");
const Nte = require("../models/nteModel");
const mongoose = require("mongoose");

// Authorization middleware
const canUpdateNte = (user) => {
  return user.isAdmin || user.role === "TL" || user.role === "TM";
};

const canUpdateFeedbackAndDecision = (user, nte) => {
  return (
    canUpdateNte(user) || nte.nte.employeeId.toString() === user._id.toString()
  );
};

// Get all NTEs
const getNtes = asyncHandler(async (req, res) => {
  const ntes = await Nte.find()
    .populate("nte.employeeId", "name email")
    .sort({ createdAt: -1 });

  if (!ntes) {
    res.status(404);
    throw new Error("NTEs not found");
  }
  res.status(200).json(ntes);
});

// Get single NTE
const getNte = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid NTE ID");
  }

  const nte = await Nte.findById(id);
  if (!nte) {
    res.status(404);
    throw new Error("NTE not found");
  }

  res.status(200).json(nte);
});

// Create NTE - Only admin/TL/TM
const createNte = asyncHandler(async (req, res) => {
  const createdBy = req.user.name;
  const { nte, status } = req.body;

  // Check authorization
  if (!canUpdateNte(req.user)) {
    res.status(403);
    throw new Error("Not authorized to create NTE");
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
  const existingNte = await Nte.findOne({
    "nte.employeeId": nte.employeeId,
    "nte.dateIssued": nte.dateIssued,
    "nte.offenseType": nte.offenseType,
    "nte.offenseDescription": nte.offenseDescription,
  });

  if (existingNte) {
    res.status(409);
    throw new Error("An NTE with the same details already exists");
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

  res.status(201).json(newNte);
});

// Update NTE sections
const updateNte = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nte, employeeFeedback, noticeOfDecision, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid NTE ID");
  }

  const existingNte = await Nte.findById(id);
  if (!existingNte) {
    res.status(404);
    throw new Error("NTE not found");
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

  res.status(200).json(updatedNte);
});

// Delete NTE - Only admin/TL/TM
const deleteNte = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!canUpdateNte(req.user)) {
    res.status(403);
    throw new Error("Not authorized to delete NTE");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid NTE ID");
  }

  const nte = await Nte.findById(id);
  if (!nte) {
    res.status(404);
    throw new Error("NTE not found");
  }

  await nte.deleteOne();
  res.status(200).json({ message: "NTE deleted successfully" });
});

//get nte by status query param
const getNtesByStatus = asyncHandler(async (req, res) => {
  const status = req.params.status;
  const ntes = await Nte.find({ status }).sort({ createdAt: -1 }); // newest first
  res.status(200).json(ntes);
});

const getNtesByUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id?.toString();

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Update the query to match employeeId inside the nte object
  const ntes = await Nte.find({
    "nte.employeeId": userId,
    status: { $ne: "DRAFT" },
  })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(ntes);
});

module.exports = {
  getNtes,
  getNte,
  createNte,
  updateNte,
  deleteNte,
  getNtesByStatus,
  getNtesByUser,
};
