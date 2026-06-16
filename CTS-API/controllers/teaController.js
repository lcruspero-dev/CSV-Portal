const Tea = require("../models/teaModel");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

const canUpdateTea = (user) => {
  return user.isAdmin || user.role === "TL" || user.role === "TM";
};

const get = asyncHandler(async (req, res) => {
  const tea = await Tea.find();
});
