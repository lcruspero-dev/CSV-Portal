const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const MemoBuilder = require("../models/memoBuilderModel");
const User = require("../models/userModel");

const VALID_STATUSES = ["draft", "published", "archived"];

const validateId = (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid memo ID");
  }
};

const getMemos = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
  const search = String(req.query.search || "").trim();
  const status = String(req.query.status || "all").toLowerCase();

  if (status !== "all" && !VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Invalid memo status");
  }

  const filter = {};
  if (status !== "all") filter.status = status;
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = ["title", "subject", "content"].map((field) => ({
      [field]: { $regex: escaped, $options: "i" },
    }));
  }

  const [memos, total] = await Promise.all([
    MemoBuilder.find(filter)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    MemoBuilder.countDocuments(filter),
  ]);

  const canManage =
    req.user.isAdmin || ["TL", "TM"].includes(req.user.role);
  const requesterId = req.user._id.toString();
  const visibleMemos = memos.map((memo) => ({
    ...memo,
    acknowledgedBy: canManage
      ? memo.acknowledgedBy || []
      : (memo.acknowledgedBy || []).filter(
          (entry) => entry.userId === requesterId,
        ),
  }));

  res.json({
    data: visibleMemos,
    pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
  });
});

const getMemo = asyncHandler(async (req, res) => {
  validateId(req.params.id, res);
  const memo = await MemoBuilder.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }
  res.json(memo);
});

const createMemo = asyncHandler(async (req, res) => {
  const title = String(req.body.title || "").trim();
  const subject = String(req.body.subject || "").trim();
  const content = String(req.body.content || "").trim();
  const status = String(req.body.status || "draft").toLowerCase();
  if (!title || !subject || !content) {
    res.status(400);
    throw new Error("Title, subject, and content are required");
  }
  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Invalid memo status");
  }

  const now = new Date();
  const memo = await MemoBuilder.create({
    title,
    subject,
    content,
    status,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    publishedAt: status === "published" ? now : null,
    archivedAt: status === "archived" ? now : null,
  });
  res.status(201).json(await memo.populate("createdBy updatedBy", "name email"));
});

const updateMemo = asyncHandler(async (req, res) => {
  validateId(req.params.id, res);
  const memo = await MemoBuilder.findById(req.params.id);
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }
  ["title", "subject", "content"].forEach((field) => {
    if (req.body[field] !== undefined) memo[field] = String(req.body[field]).trim();
  });
  if (!memo.title || !memo.subject || !memo.content) {
    res.status(400);
    throw new Error("Title, subject, and content are required");
  }
  memo.updatedBy = req.user._id;
  await memo.save();
  res.json(await memo.populate("createdBy updatedBy", "name email"));
});

const updateMemoStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id, res);
  const status = String(req.body.status || "").toLowerCase();
  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Invalid memo status");
  }
  const memo = await MemoBuilder.findById(req.params.id);
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }
  memo.status = status;
  memo.updatedBy = req.user._id;
  if (status === "published" && !memo.publishedAt) memo.publishedAt = new Date();
  if (status === "archived") memo.archivedAt = new Date();
  if (status !== "archived") memo.archivedAt = null;
  await memo.save();
  res.json(await memo.populate("createdBy updatedBy", "name email"));
});

const deleteMemo = asyncHandler(async (req, res) => {
  validateId(req.params.id, res);
  const memo = await MemoBuilder.findById(req.params.id);
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }
  await memo.deleteOne();
  res.json({ id: req.params.id, message: "Memo deleted successfully" });
});

const acknowledgeMemo = asyncHandler(async (req, res) => {
  validateId(req.params.id, res);
  const signature = String(req.body.signature || "");
  if (
    !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(signature) ||
    signature.length > 500000
  ) {
    res.status(400);
    throw new Error("A valid PNG employee signature is required");
  }
  const memo = await MemoBuilder.findById(req.params.id);
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }
  if (memo.status !== "published") {
    res.status(409);
    throw new Error("Only published memos can be acknowledged");
  }

  const userId = req.user._id.toString();
  const existingAcknowledgement = memo.acknowledgedBy.some(
    (entry) => entry.userId === userId,
  );
  if (!existingAcknowledgement) {
    memo.acknowledgedBy.push({
      userId,
      name: req.user.name,
      email: req.user.email || "",
      signature,
      acknowledgedAt: new Date(),
    });
    await memo.save();
  }

  res.json({
    message: existingAcknowledgement
      ? "Memo already acknowledged"
      : "Memo acknowledged successfully",
    acknowledged: true,
    acknowledgedBy: memo.acknowledgedBy,
  });
});

const getMemoAcknowledgements = asyncHandler(async (req, res) => {
  validateId(req.params.id, res);
  const memo = await MemoBuilder.findById(req.params.id).lean();
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }

  const acknowledgements = memo.acknowledgedBy || [];
  const signedUserIds = acknowledgements.map((entry) => entry.userId);
  const eligibleBefore = memo.publishedAt || memo.createdAt;
  const unsignedUsers = await User.find(
    {
      _id: { $nin: signedUserIds },
      isAdmin: false,
      status: { $ne: "inactive" },
      createdAt: { $lte: eligibleBefore },
    },
    "name email role",
  )
    .sort({ name: 1 })
    .lean();

  const signed = [...acknowledgements].sort(
    (first, second) =>
      new Date(second.acknowledgedAt).getTime() -
      new Date(first.acknowledgedAt).getTime(),
  );

  res.json({
    memoId: memo._id,
    signed,
    unsigned: unsignedUsers.map((user) => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    })),
    summary: {
      signed: signed.length,
      unsigned: unsignedUsers.length,
      total: signed.length + unsignedUsers.length,
    },
  });
});

module.exports = {
  getMemos,
  getMemo,
  createMemo,
  updateMemo,
  updateMemoStatus,
  deleteMemo,
  acknowledgeMemo,
  getMemoAcknowledgements,
};
