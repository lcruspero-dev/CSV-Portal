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

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      overtimeType,
      overtimeDate,
      overtimeStart,
      overtimeEnd,
      overtimeDuration,
      reason,
      remarks,
      status // For admin to update status
    } = req.body;

    // Find the overtime record
    const overtime = await Overtime.findById(id);
    
    if (!overtime) {
      return res.status(404).json({
        success: false,
        message: "Overtime record not found",
      });
    }

    // Check permissions - user can only update their own pending requests
    const isOwner = overtime.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin'; // Assuming you have role in user object
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this overtime record",
      });
    }

    // If non-admin tries to update status, reject
    if (!isAdmin && status && status !== overtime.status) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can change overtime status",
      });
    }

    // If updating time fields, validate them
    if (overtimeStart || overtimeEnd) {
      const start = overtimeStart || overtime.overtimeStart;
      const end = overtimeEnd || overtime.overtimeEnd;
      
      if (new Date(`2000-01-01T${end}`) <= new Date(`2000-01-01T${start}`)) {
        return res.status(400).json({
          success: false,
          message: "Overtime end must be after overtime start",
        });
      }
    }

    // If updating date/time, check for overlaps (excluding current record)
    if (overtimeDate || overtimeStart || overtimeEnd) {
      const date = overtimeDate || overtime.overtimeDate;
      const start = overtimeStart || overtime.overtimeStart;
      const end = overtimeEnd || overtime.overtimeEnd;
      
      const existingOvertime = await Overtime.findOne({
        _id: { $ne: id },
        user: overtime.user,
        overtimeDate: date,
        $or: [
          {
            overtimeStart: { $lt: end },
            overtimeEnd: { $gt: start }
          }
        ],
        status: { $nin: ['rejected', 'cancelled'] }
      });

      if (existingOvertime) {
        return res.status(400).json({
          success: false,
          message: "You already have another overtime request for this time period",
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (overtimeType) updateData.overtimeType = overtimeType;
    if (overtimeDate) updateData.overtimeDate = overtimeDate;
    if (overtimeStart) updateData.overtimeStart = overtimeStart;
    if (overtimeEnd) updateData.overtimeEnd = overtimeEnd;
    if (overtimeDuration !== undefined) updateData.overtimeDuration = overtimeDuration;
    if (reason !== undefined) updateData.reason = reason;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (status && isAdmin) updateData.status = status;

    // Update the record
    const updatedOvertime = await Overtime.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Overtime updated successfully",
      data: updatedOvertime,
    });
  } catch (error) {
    console.error("Update Overtime Error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid overtime ID format",
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const overtime = await Overtime.findById(id);
    
    if (!overtime) {
      return res.status(404).json({
        success: false,
        message: "Overtime record not found",
      });
    }

    // Check permissions
    const isOwner = overtime.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this overtime record",
      });
    }

    // Only allow deletion of pending requests (or admin can delete any)
    if (!isAdmin && overtime.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Only pending overtime requests can be deleted",
      });
    }

    await Overtime.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Overtime deleted successfully",
    });
  } catch (error) {
    console.error("Delete Overtime Error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid overtime ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};  

module.exports = {
  index,
  show,
  store,
  update,
  destroy
};
