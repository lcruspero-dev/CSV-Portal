const Overtime = require("../models/overtimeModel");

const index = async (req, res) => {
  try {
    const overtimes = await Overtime.find();

    res.status(200).json({
      success: true,
      message: "Fetch Overtimes",
      data: overtimes,
    });
  } catch (error) {
    console.error("Failed to fetch overtimes", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const show = async (req, res) => {
  try {
    const overtime = await Overtime.findById(req.params.id);

    if (!overtime) {
      return res.status(404).json({
        success: false,
        message: "Overtime not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fetch overtime",
      data: overtime,
    });
  } catch (error) {
    console.error("Failed to fetch overtime", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const store = async (req, res) => {
  try {
    const {
      overtimeType,
      overtimeDate,
      overtimeStart,
      overtimeEnd,
      overtimeDuration,
      reason,
      remarks,
    } = req.body;

    // Basic validation
    if (
      !overtimeType ||
      !overtimeDate ||
      !overtimeStart ||
      !overtimeEnd ||
      overtimeDuration == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Ensure end time is after start time
    if (new Date(overtimeEnd) <= new Date(overtimeStart)) {
      return res.status(400).json({
        success: false,
        message: "Overtime end must be after overtime start",
      });
    }

    // Create overtime application
    const overtimeApplication = await Overtime.create({
      employeeId: req.user.employeeId,
      user: req.user.id,
      overtimeType,
      overtimeDate,
      overtimeStart,
      overtimeEnd,
      overtimeDuration,
      reason,
      remarks,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Overtime application submitted successfully",
      data: overtimeApplication,
    });
  } catch (error) {
    console.error("Create Overtime Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  index,
  show,
  store
};
