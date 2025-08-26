const User = require("../models/userModel");
const mongoose = require("mongoose");

const asyncHandler = require("express-async-handler");
const Memo = require("../models/memoModel");

const getMemos = asyncHandler(async (_req, res) => {
  try {
    const user = await User.findById(_req.user._id);

    let memos;
    if (user.isAdmin) {
      memos = await Memo.find().sort({ createdAt: -1 }); // Admins see all memos
    } else {
      memos = await Memo.find({
        $or: [
          { isPinned: true }, // Always include pinned memos
          {
            $or: [
              { isPinned: false }, // Explicitly unpinned
              { isPinned: { $exists: false } }, // Or field doesn't exist
            ],
            createdAt: { $gte: user.createdAt }, // Only newer memos
          },
        ],
      }).sort({ createdAt: -1 });
    }

    res.status(200).json(memos);
  } catch (error) {
    console.log(error);
    res.status(404);
    throw new Error("Memos not found");
  }
});

const createMemo = asyncHandler(async (req, res) => {
  const { subject, description } = req.body;
  if (!subject || !description) {
    res.status(400);
    throw new Error("Please add all required fields");
  }

  const memo = await Memo.create(req.body);
  res.status(200).json(memo);
});

const updateMemo = asyncHandler(async (req, res) => {
  const memo = await Memo.findById(req.params.id);

  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }

  const { subject, description } = req.body;
  if (!subject || !description) {
    res.status(400);
    throw new Error("Please add all required fields");
  }

  const updatedMemo = await Memo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedMemo);
});

const deleteMemo = asyncHandler(async (req, res) => {
  const memo = await Memo.findById(req.params.id);

  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }

  await memo.remove();

  res.status(200).json({ id: req.params.id });
});

const getMemoById = asyncHandler(async (req, res) => {
  const memo = await Memo.findById(req.params.id);
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }
  res.status(200).json(memo);
});

const updateAcknowledged = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const name = req.user.name;
  const { id } = req.params;

  const memo = await Memo.findById(id);
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }

  const alreadyAcknowledged = memo.acknowledgedby.some(
    (acknowledged) => acknowledged.userId === userId
  );

  if (alreadyAcknowledged) {
    res.status(400);
    throw new Error("You already acknowledged this memo");
  }

  const newAcknowledgment = {
    name,
    userId,
    acknowledgedAt: new Date(),
  };

  const updatedMemo = await Memo.findByIdAndUpdate(
    id,
    {
      $push: { acknowledgedby: newAcknowledgment },
    },
    { new: true }
  );

  res.status(200).json(updatedMemo);
});

const getUserUnacknowledged = asyncHandler(async (req, res) => {
  try {
    const { memoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(memoId)) {
      return res.status(400).json({ message: "Invalid memo ID" });
    }

    const memo = await Memo.findById(memoId);
    if (!memo) {
      return res.status(404).json({ message: "Memo not found" });
    }

    const acknowledgedUserIds = memo.acknowledgedby.map((ack) => ack.userId);
    const unacknowledgedUsers = await User.find(
      {
        _id: { $nin: acknowledgedUserIds },
        status: { $ne: "inactive" },
        createdAt: { $lte: memo.createdAt },
      },
      "name _id"
    );

    return res.status(200).json({
      memoId,
      unacknowledgedUsers: unacknowledgedUsers.map((user) => ({
        userId: user._id,
        name: user.name,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = {
  getMemos,
  createMemo,
  updateMemo,
  deleteMemo,
  getMemoById,
  updateAcknowledged,
  getUserUnacknowledged,
};
