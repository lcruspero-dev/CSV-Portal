const Tea = require("../models/teaModel");
const mongoose = require("mongoose");

const index = async (req, res) => {
  try {
    console.log("Perfect");
  } catch (error) {
    console.error("Failed to fetch data", error);
    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

const get = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("perfect");
  } catch (error) {
    console.error("Failed", error);
    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

const create = async (req, res) => {};

module.exports = {
  index,
  get,
};
