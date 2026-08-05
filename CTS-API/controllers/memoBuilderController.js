const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const MemoBuilder = require("../models/memoBuilderModel");

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

  res.json({
    data: memos,
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

module.exports = { getMemos, getMemo, createMemo, updateMemo, updateMemoStatus, deleteMemo };
