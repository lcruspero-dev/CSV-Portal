const Lea = require("../models/leaModel");
const mongoose = require("mongoose");

// GET ALL TEA RECORDS
const index = async (req, res) => {
  try {
    const leas = await Lea.find().sort({ date: -1 });

    res.status(200).json({
      status: "Success",
      count: leas.length,
      data: leas,
    });
  } catch (error) {
    console.error("Failed to fetch data", error);

    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

// GET SINGLE TEA RECORD
const get = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid ID",
      });
    }

    const lea = await Lea.findById(id);

    if (!lea) {
      return res.status(404).json({
        status: "Error",
        message: "Record not found",
      });
    }

    res.status(200).json({
      status: "Success",
      data: lea,
    });
  } catch (error) {
    console.error("Failed", error);

    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

// CREATE TEA RECORD
const create = async (req, res) => {
  try {
    const { employeeId, employeeName, signature } = req.body;

    if (!employeeId || !employeeName || !signature) {
      return res.status(400).json({
        status: "Error",
        message: "Missing required fields",
      });
    }

    const existing = await Lea.findOne({ employeeId });

    if (existing) {
      return res.status(409).json({
        status: "Error",
        message: "You have already signed this acknowledgement.",
      });
    }

    const lea = await Lea.create({
      employeeId,
      employeeName,
      position: "Team Leader",
      signature,
      manager: "Ronalyn Booc",
      dateSigned: new Date(),
    });

    res.status(201).json({
      status: "Success",
      message: "Acknowledgement submitted successfully",
      data: lea,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// UPDATE TEA RECORD
const update = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid ID",
      });
    }

    const lea = await Lea.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lea) {
      return res.status(404).json({
        status: "Error",
        message: "Record not found",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Updated successfully",
      data: lea,
    });
  } catch (error) {
    console.error("Failed to update", error);

    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

// DELETE TEA RECORD
const remove = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid ID",
      });
    }

    const lea = await Lea.findByIdAndDelete(id);

    if (!lea) {
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

    const record = await Lea.findOne({ employeeId });

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
