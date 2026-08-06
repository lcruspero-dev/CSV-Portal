const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const memoBuilderSchema = require("../models/memoBuilderModel");

/**
 * @desc    Create a memo draft
 * @route   POST /api/memos
 * @access  Private - HR, IT, SUPERADMIN
 */
const createMemo = asyncHandler(async (req, res) => {
  const {
    memoCode,
    recipientLabel,
    senderLabel,
    subject,
    content,
    memoDate,
    issuedByLabel,
    confidentialityNotice,
    acknowledgementDeadline,
  } = req.body;

  if (
    !memoCode ||
    !recipientLabel ||
    !senderLabel ||
    !subject ||
    !content ||
    !memoDate
  ) {
    res.status(400);
    throw new Error("Please complete all required memo fields.");
  }

  const normalizedMemoCode = memoCode.trim().toUpperCase();

  const existingMemo = await memoBuilderSchema.findOne({
    memoCode: normalizedMemoCode,
  });

  if (existingMemo) {
    res.status(409);
    throw new Error("Memo code already exists.");
  }

  const parsedMemoDate = new Date(memoDate);

  if (Number.isNaN(parsedMemoDate.getTime())) {
    res.status(400);
    throw new Error("Invalid memo date.");
  }

  let parsedDeadline = null;

  if (acknowledgementDeadline) {
    parsedDeadline = new Date(acknowledgementDeadline);

    if (Number.isNaN(parsedDeadline.getTime())) {
      res.status(400);
      throw new Error("Invalid acknowledgement deadline.");
    }

    if (parsedDeadline < parsedMemoDate) {
      res.status(400);
      throw new Error(
        "Acknowledgement deadline cannot be earlier than the memo date.",
      );
    }
  }

  const memo = await memoBuilderSchema.create({
    memoCode: normalizedMemoCode,
    recipientLabel: recipientLabel.trim(),
    senderLabel: senderLabel.trim(),
    subject: subject.trim(),
    content: content.trim(),
    memoDate: parsedMemoDate,
    issuedByLabel: issuedByLabel?.trim() || "TOP MANAGEMENT",
    confidentialityNotice: confidentialityNotice?.trim() || null,
    acknowledgementDeadline: parsedDeadline,
    status: "draft",

    // Never accept createdBy from req.body
    createdBy: req.user._id,
  });

  const populatedMemo = await memoBuilderSchema
    .findById(memo._id)
    .populate("createdBy", "name email role");

  res.status(201).json({
    success: true,
    message: "Memo draft created successfully.",
    data: populatedMemo,
  });
});

/**
 * @desc    Get all memos
 * @route   GET /api/memos
 * @access  Private - HR, IT, SUPERADMIN
 */
const getMemos = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const filter = {};

  if (
    req.query.status &&
    ["draft", "published", "archived"].includes(req.query.status)
  ) {
    filter.status = req.query.status;
  }

  if (req.query.createdByMe === "true") {
    filter.createdBy = req.user._id;
  }

  if (typeof req.query.search === "string" && req.query.search.trim()) {
    filter.$text = {
      $search: req.query.search.trim(),
    };
  }

  const [memos, total] = await Promise.all([
    memoBuilderSchema
      .find(filter)
      .populate("createdBy", "name email role")
      .populate("publishedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    memoBuilderSchema.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: memos.length,
    data: memos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get one memo
 * @route   GET /api/memos/:memoId
 * @access  Private
 */
const getMemoById = asyncHandler(async (req, res) => {
  const { memoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(memoId)) {
    res.status(400);
    throw new Error("Invalid memo ID.");
  }

  const memo = await memoBuilderSchema
    .findById(memoId)
    .populate("createdBy", "name email role")
    .populate("publishedBy", "name email role");

  if (!memo) {
    res.status(404);
    throw new Error("Memo not found.");
  }

  res.status(200).json({
    success: true,
    data: memo,
  });
});

/**
 * @desc    Update a memo draft
 * @route   PATCH /api/memos/:memoId
 * @access  Private - HR, IT, SUPERADMIN
 */
const updateMemo = asyncHandler(async (req, res) => {
  const { memoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(memoId)) {
    res.status(400);
    throw new Error("Invalid memo ID.");
  }

  const memo = await memoBuilderSchema.findById(memoId);

  if (!memo) {
    res.status(404);
    throw new Error("Memo not found.");
  }

  if (memo.status !== "draft") {
    res.status(409);
    throw new Error("Only draft memos can be edited.");
  }

  const {
    memoCode,
    recipientLabel,
    senderLabel,
    subject,
    content,
    memoDate,
    issuedByLabel,
    confidentialityNotice,
    acknowledgementDeadline,
  } = req.body;

  if (memoCode !== undefined) {
    const normalizedMemoCode = memoCode.trim().toUpperCase();

    if (!normalizedMemoCode) {
      res.status(400);
      throw new Error("Memo code cannot be empty.");
    }

    const existingMemo = await memoBuilderSchema.findOne({
      _id: { $ne: memo._id },
      memoCode: normalizedMemoCode,
    });

    if (existingMemo) {
      res.status(409);
      throw new Error("Memo code already exists.");
    }

    memo.memoCode = normalizedMemoCode;
  }

  if (recipientLabel !== undefined) {
    if (!recipientLabel.trim()) {
      res.status(400);
      throw new Error("Recipient label cannot be empty.");
    }

    memo.recipientLabel = recipientLabel.trim();
  }

  if (senderLabel !== undefined) {
    if (!senderLabel.trim()) {
      res.status(400);
      throw new Error("Sender label cannot be empty.");
    }

    memo.senderLabel = senderLabel.trim();
  }

  if (subject !== undefined) {
    if (!subject.trim()) {
      res.status(400);
      throw new Error("Subject cannot be empty.");
    }

    memo.subject = subject.trim();
  }

  if (content !== undefined) {
    if (!content.trim()) {
      res.status(400);
      throw new Error("Memo content cannot be empty.");
    }

    memo.content = content.trim();
  }

  if (memoDate !== undefined) {
    const parsedMemoDate = new Date(memoDate);

    if (Number.isNaN(parsedMemoDate.getTime())) {
      res.status(400);
      throw new Error("Invalid memo date.");
    }

    memo.memoDate = parsedMemoDate;
  }

  if (issuedByLabel !== undefined) {
    memo.issuedByLabel = issuedByLabel.trim() || "TOP MANAGEMENT";
  }

  if (confidentialityNotice !== undefined) {
    memo.confidentialityNotice = confidentialityNotice?.trim() || null;
  }

  if (acknowledgementDeadline !== undefined) {
    if (!acknowledgementDeadline) {
      memo.acknowledgementDeadline = null;
    } else {
      const parsedDeadline = new Date(acknowledgementDeadline);

      if (Number.isNaN(parsedDeadline.getTime())) {
        res.status(400);
        throw new Error("Invalid acknowledgement deadline.");
      }

      memo.acknowledgementDeadline = parsedDeadline;
    }
  }

  if (
    memo.acknowledgementDeadline &&
    memo.acknowledgementDeadline < memo.memoDate
  ) {
    res.status(400);
    throw new Error(
      "Acknowledgement deadline cannot be earlier than the memo date.",
    );
  }

  await memo.save();

  const updatedMemo = await memoBuilderSchema
    .findById(memo._id)
    .populate("createdBy", "name email role");

  res.status(200).json({
    success: true,
    message: "Memo draft updated successfully.",
    data: updatedMemo,
  });
});

/**
 * @desc    Delete a memo draft
 * @route   DELETE /api/memos/:memoId
 * @access  Private - HR, IT, SUPERADMIN
 */
const deleteMemo = asyncHandler(async (req, res) => {
  const { memoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(memoId)) {
    res.status(400);
    throw new Error("Invalid memo ID.");
  }

  const memo = await memoBuilderSchema.findById(memoId);

  if (!memo) {
    res.status(404);
    throw new Error("Memo not found.");
  }

  if (memo.status !== "draft") {
    res.status(409);
    throw new Error("Published or archived memos cannot be deleted.");
  }

  await memo.deleteOne();

  res.status(200).json({
    success: true,
    message: "Memo draft deleted successfully.",
    data: {
      id: memo._id,
    },
  });
});

/**
 * @desc    Publish a memo
 * @route   PATCH /api/memos/:memoId/publish
 * @access  Private - HR, IT, SUPERADMIN
 */
const publishMemo = asyncHandler(async (req, res) => {
  const { memoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(memoId)) {
    res.status(400);
    throw new Error("Invalid memo ID.");
  }

  const memo = await memoBuilderSchema.findById(memoId);

  if (!memo) {
    res.status(404);
    throw new Error("Memo not found.");
  }

  if (memo.status !== "draft") {
    res.status(409);
    throw new Error("Only draft memos can be published.");
  }

  memo.status = "published";
  memo.publishedBy = req.user._id;
  memo.publishedAt = new Date();

  await memo.save();

  const publishedMemo = await memoBuilderSchema
    .findById(memo._id)
    .populate("createdBy", "name email role")
    .populate("publishedBy", "name email role");

  res.status(200).json({
    success: true,
    message: "Memo published successfully.",
    data: publishedMemo,
  });
});

/**
 * @desc    Archive a published memo
 * @route   PATCH /api/memos/:memoId/archive
 * @access  Private - HR, IT, SUPERADMIN
 */
const archiveMemo = asyncHandler(async (req, res) => {
  const { memoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(memoId)) {
    res.status(400);
    throw new Error("Invalid memo ID.");
  }

  const memo = await memoBuilderSchema.findById(memoId);

  if (!memo) {
    res.status(404);
    throw new Error("Memo not found.");
  }

  if (memo.status !== "published") {
    res.status(409);
    throw new Error("Only published memos can be archived.");
  }

  memo.status = "archived";
  memo.archivedAt = new Date();

  await memo.save();

  res.status(200).json({
    success: true,
    message: "Memo archived successfully.",
    data: memo,
  });
});

module.exports = {
  createMemo,
  getMemos,
  getMemoById,
  updateMemo,
  deleteMemo,
  publishMemo,
  archiveMemo,
};
