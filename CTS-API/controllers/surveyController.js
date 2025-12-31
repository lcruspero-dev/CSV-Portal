import asyncHandler from "express-async-handler";
import Survey from "../models/surveyModel";
import mongoose from "mongoose";

// Helper function to check if ObjectId is valid
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createSurvey = asyncHandler(async (req, res) => {
  const { title, question } = req.body;

  // Validate required fields
  if (!title || !question) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  // Check if a survey with the same title, description, and question already exists
  const existingSurvey = await Survey.findOne({ title, question });
  if (existingSurvey) {
    return res.status(400).json({
      success: false,
      message: "A survey with the same title, and question already exists",
    });
  }

  // Create a new survey
  const survey = new Survey({
    title,
    question,
    createdBy: req.user._id,
  });

  await survey.save();

  res.status(201).json({
    success: true,
    data: survey,
    message: "Survey created successfully",
  });
});

export const getAllSurveys = asyncHandler(async (req, res) => {
  const { status, startDate, endDate } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (startDate) filter.startDate = { $gte: new Date(startDate) };
  if (endDate) filter.endDate = { $lte: new Date(endDate) };

  const surveys = await Survey.find(filter)
    .populate("createdBy", "username email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: surveys.length,
    data: surveys,
  });
});

export const getSurveyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid survey ID",
    });
  }

  const survey = await Survey.findById(id)
    .populate("createdBy", "username email")
    .populate("responses.respondent", "username email");

  if (!survey) {
    return res.status(404).json({
      success: false,
      message: "Survey not found",
    });
  }

  res.status(200).json({
    success: true,
    data: survey,
  });
});

export const updateSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid survey ID",
    });
  }

  const survey = await Survey.findById(id);

  if (!survey) {
    return res.status(404).json({
      success: false,
      message: "Survey not found",
    });
  }

  // const isAdmin = req.user.role === "admin";
  // const isCreator = survey.createdBy.toString() === req.user._id.toString();

  // If not admin and not creator, deny access
  // if (!isAdmin) {
  //   return res.status(403).json({
  //     success: false,
  //     message: "Not authorized to update this survey",
  //   });
  // }

  // If regular user (not admin) trying to update a closed survey
  // if (!isAdmin && survey.status === "closed") {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Cannot update closed survey",
  //   });
  // }

  const updatedSurvey = await Survey.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedSurvey,
    message: "Survey updated successfully",
  });
});

export const deleteSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid survey ID",
    });
  }

  const survey = await Survey.findById(id);

  if (!survey) {
    return res.status(404).json({
      success: false,
      message: "Survey not found",
    });
  }

  if (survey.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this survey",
    });
  }

  await Survey.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Survey deleted successfully",
  });
});

export const submitResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { feedback, ratingAnswer, isAnonymous } = req.body;

  // Validate feedback and ratingAnswer
  if (!ratingAnswer) {
    return res.status(400).json({
      success: false,
      message: "ratingAnswer are required",
    });
  }

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid survey ID",
    });
  }

  const survey = await Survey.findById(id);

  if (!survey) {
    return res.status(404).json({
      success: false,
      message: "Survey not found",
    });
  }

  if (survey.status !== "active") {
    return res.status(400).json({
      success: false,
      message: "Survey is not active",
    });
  }

  // Check if the user has already responded
  if (
    survey.responses.some(
      (response) => response.respondent?.toString() === req.user._id.toString()
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "You have already responded to this survey",
    });
  }

  const response = {
    feedback,
    ratingAnswer,
    isAnonymous,
    dateAnswer: new Date(),
    respondent: req.user._id, // Always save the respondent ID
    username: req.user.name, // Always save the username
  };

  survey.responses.push(response);
  await survey.save();

  res.status(201).json({
    success: true,
    message: "Response submitted successfully",
  });
});

//get all survey with active status
export const getAllActiveSurveys = asyncHandler(async (req, res) => {
  // Fetch all active surveys
  const surveys = await Survey.find({ status: "active" });

  if (surveys.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No available survey",
    });
  }

  // Filter surveys to exclude those the user has already responded to
  const filteredSurveys = surveys.filter(
    (survey) =>
      !survey.responses.some(
        (response) =>
          response.respondent?.toString() === req.user._id.toString()
      )
  );

  if (filteredSurveys.length === 0) {
    return res.status(200).json({
      success: false,
      message: "No active survey that you don't respond to",
    });
  }

  // Map surveys to hide the "responses" field
  const sanitizedSurveys = filteredSurveys.map((survey) => {
    const { ...rest } = survey.toObject();
    return rest;
  });

  res.status(200).json({
    success: true,
    data: sanitizedSurveys,
  });
});

export const getAllSurveyTitles = asyncHandler(async (req, res) => {
  // Fetch all survey titles without status filter
  const surveyTitles = await Survey.find(
    {}, // Empty filter to get all surveys
    { title: 1, _id: 1, status: 1 } // Fetch title, ID and status fields
  );

  if (surveyTitles.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No surveys found",
    });
  }

  // Format the response data
  const titles = surveyTitles.map((survey) => ({
    id: survey._id,
    title: survey.title,
    status: survey.status,
  }));

  res.status(200).json({
    success: true,
    count: titles.length,
    data: titles,
  });
});


