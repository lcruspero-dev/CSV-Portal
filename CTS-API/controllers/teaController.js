const Tea = require("../models/teaModel");
const mongoose = require("mongoose");

// GET ALL TEA RECORDS
const index = async (req, res) => {
  try {
    const teas = await Tea.find().sort({ date: -1 });

    res.status(200).json({
      status: "Success",
      count: teas.length,
      data: teas,
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

    const tea = await Tea.findById(id);

    if (!tea) {
      return res.status(404).json({
        status: "Error",
        message: "Record not found",
      });
    }

    res.status(200).json({
      status: "Success",
      data: tea,
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
    const { employeeId, name, position, manager, signature, date } = req.body;

    const tea = await Tea.create({
      employeeId,
      name,
      position,
      manager,
      signature,
      date,
    });

    res.status(201).json({
      status: "Success",
      message: "Record created successfully",
      data: tea,
    });
  } catch (error) {
    console.error("Failed to create", error);

    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
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

    const tea = await Tea.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tea) {
      return res.status(404).json({
        status: "Error",
        message: "Record not found",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Updated successfully",
      data: tea,
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

    const tea = await Tea.findByIdAndDelete(id);

    if (!tea) {
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

module.exports = {
  index,
  get,
  create,
  update,
  remove,
};
