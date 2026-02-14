import User from "../models/userModel.js";
import mongoose from "mongoose";
import Memo from "../models/memoModel.js";

export const getMemos = async (_req, res) => {
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

      if (!memos) {
        return res.status(404).json({
          success: false,
          message: "Memos not found",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Fetch memos",
      data: memos,
    });
  } catch (error) {
    console.log("", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const createMemo = async (req, res) => {
  try {
    const { subject, description } = req.body;
    if (!subject || !description) {
      res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const memo = await Memo.create(req.body);

    res.status(201).json({
      success: true,
      message: "Create memo successfully",
      data: memo,
    });
  } catch (error) {
    console.error("", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateMemo = async (req, res) => {
  try {
    const memo = await Memo.findById(req.params.id);

    if (!memo) {
      return res.status(404).json({
        success: false,
        message: "Memo not found",
      });
    }

    const { subject, description } = req.body;

    if (!subject || !description) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const updatedMemo = await Memo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Updated memo",
      data: updatedMemo,
    });
  } catch (error) {
    console.error("", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteMemo = async (req, res) => {
  try {
    const memo = await Memo.findById(req.params.id);

    if (!memo) {
      return res.status(404).json({
        success: false,
        message: "Memo not found",
      });
    }

    await memo.remove();

    res.status(200).json({
      success: true,
      message: "Memo deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Failed to delete memo:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMemoById = async (req, res) => {
  try {
    const memo = await Memo.findById(req.params.id);

    if (!memo) {
      return res.status(404).json({
        success: false,
        message: "Memo not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get Memo ID",
      data: memo,
    });
  } catch (error) {
    console.error("Failed to get memo ID", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateAcknowledged = async (req, res) => {
  const userId = req.user.id;
  const name = req.user.name;
  const { id } = req.params;

  try {
    const memo = await Memo.findById(id);

    if (!memo) {
      return res.status(404).json({
        status: false,
        message: "Memo not found",
      });
    }

    const alreadyAcknowledged = memo.acknowledgedby.some(
      (acknowledged) => acknowledged.userId === userId
    );

    if (alreadyAcknowledged) {
      return res.status(400).json({
        success: false,
        message: "You already acknowledged this memo",
      });
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

    res.status(200).json({
      success: true,
      message: "Acknowleged this memo successfully",
      data: updatedMemo,
    });
  } catch (error) {
    console.error("Failed to acknowledge", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getUserUnacknowledged = async (req, res) => {

  try {

    const { memoId } = req.params;

    // Validate memoId
    if (!mongoose.Types.ObjectId.isValid(memoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid memo ID",
      });
    }

    // Fetch memo
    const memo = await Memo.findById(memoId);
    if (!memo) {
      return res.status(404).json({
        success: false,
        message: "Memo not found",
      });
    }

    // Extract acknowledged user IDs
    const acknowledgedUserIds = memo.acknowledgedby.map((ack) => ack.userId);

    // Fetch unacknowledged users
    const unacknowledgedUsers = await User.find(
      {
        _id: { $nin: acknowledgedUserIds },
        status: { $ne: "inactive" },
        createdAt: { $lte: memo.createdAt },
      },
      "name _id"
    );

    // Return response
    return res.status(200).json({
      success: true,
      message: "Get user Unacknowledged",
      memoId,
      unacknowledgedUsers: unacknowledgedUsers.map((user) => ({
        userId: user._id,
        name: user.name,
      })),
    });

  } catch (error) {
    console.error("Error fetching unacknowledged users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    
  }
};
