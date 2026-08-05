const itMemo = require("../models/itMemo");
const mongoose = require("mongoose");

// GET ALL IT MEMO RECORDS
const index = async (req, res) => {
  try {
    const itMemos = await itMemo.find().sort({ date: -1 });

    res.status(200).json({
      status: "Success",
      count: itMemos.length,
      data: itMemos,
    });
  } catch (error) {
    console.error("Failed to fetch data", error);

    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

// GET SINGLE IT MEMO RECORD
const get = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid ID",
      });
    }

    const itMemo = await itMemo.findById(id);

    if (!itMemo) {
      return res.status(404).json({
        status: "Error",
        message: "Record not found",
      });
    }

    res.status(200).json({
      status: "Success",
      data: itMemo,
    });
  } catch (error) {
    console.error("Failed", error);

    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

// CREATE IT MEMO RECORD
const create = async (req, res) => {
  try {
    const { employeeId, employeeName, witness, signature } = req.body;

    if (!employeeId || !employeeName || !witness || !signature) {
      return res.status(400).json({
        status: "Error",
        message: "Missing required fields",
      });
    }

    const existing = await itMemo.findOne({ employeeId });

    if (existing) {
      return res.status(409).json({
        status: "Error",
        message: "You have already signed this acknowledgement.",
      });
    }

    const itMemoRecord = await itMemo.create({
      employeeId,
      employeeName,
      witness,
      signature,
      dateSigned: new Date(),
    });

    res.status(201).json({
      status: "Success",
      message: "Acknowledgement submitted successfully",
      data: itMemoRecord,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// UPDATE IT MEMO RECORD
const update = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid ID",
      });
    }

    const itMemoRecord = await itMemo.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!itMemoRecord) {
      return res.status(404).json({
        status: "Error",
        message: "Record not found",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Updated successfully",
      data: itMemoRecord,
    });
  } catch (error) {
    console.error("Failed to update", error);

    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

// DELETE IT MEMO RECORD
const remove = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid ID",
      });
    }

    const itMemoRecord = await itMemo.findByIdAndDelete(id);

    if (!itMemoRecord) {
      return res.status(404).json({
        status: "Error",
        message: "Record not found",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete", error);

    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

const checkAcknowledgement = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const record = await itMemo.findOne({ employeeId });

    res.status(200).json({
      signed: !!record,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

module.exports = {
  index,
  get,
  create,
  update,
  remove,
  checkAcknowledgement,
};
