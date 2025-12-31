import {
  ScheduleEntry,
  AttendanceEntry,
  TeamLeaderEntry,
} from "../models/ScheduleAndAttendanceModel";

// Get all schedule entries
export const getScheduleEntries = async (req, res) => {
  try {
    const scheduleEntries = await ScheduleEntry.find({
      teamLeader: { $ne: "Inactive" }, // Exclude entries where teamLeader is "inactive"
    }).populate("employeeId");

    // Sort by employeeName alphabetically (case-insensitive)
    scheduleEntries.sort((a, b) => {
      const nameA = a.employeeName.toLowerCase();
      const nameB = b.employeeName.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    res.status(200).json(scheduleEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new schedule entry
export const createScheduleEntry = async (req, res) => {
  try {
    const existingScheduleEntry = await ScheduleEntry.findOne({
      employeeId: req.body.employeeId,
    });
    if (existingScheduleEntry) {
      const updatedScheduleEntry = await ScheduleEntry.findByIdAndUpdate(
        existingScheduleEntry._id,
        { ...req.body },
        { new: true }
      );
      res.status(200).json(updatedScheduleEntry);
    } else {
      const newScheduleEntry = new ScheduleEntry({ ...req.body });
      await newScheduleEntry.save();
      res.status(201).json(newScheduleEntry);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a schedule entry
export const updateScheduleEntry = async (req, res) => {
  const { id } = req.params;
  const { date, shiftType, startTime, endTime, break1, break2, lunch } =
    req.body;

  try {
    const scheduleEntry = await ScheduleEntry.findOne({ employeeId: id });
    if (!scheduleEntry) {
      return res.status(404).json({ message: "Schedule entry not found" });
    }

    // Check if the date already exists in the schedule array
    const existingSchedule = scheduleEntry.schedule.find(
      (entry) => entry.date === date
    );

    // Determine if we should clear startTime and endTime
    const shouldClearTimes = [
      "restday",
      "paidTimeOff",
      "plannedLeave",
    ].includes(shiftType);

    if (existingSchedule) {
      // Update the existing entry
      existingSchedule.shiftType = shiftType;
      if (shouldClearTimes) {
        existingSchedule.startTime = "";
        existingSchedule.endTime = "";
        existingSchedule.break1 = "";
        existingSchedule.break2 = "";
        existingSchedule.lunch = "";
      } else {
        // Only update times if they're provided and not for special shift types
        if (startTime !== undefined) existingSchedule.startTime = startTime;
        if (endTime !== undefined) existingSchedule.endTime = endTime;
        if (break1 !== undefined) existingSchedule.break1 = break1;
        if (break2 !== undefined) existingSchedule.break2 = break2;
        if (lunch !== undefined) existingSchedule.lunch = lunch;
      }
    } else {
      // Create new entry
      const newEntry = {
        date,
        shiftType,
        startTime: shouldClearTimes ? "" : startTime,
        endTime: shouldClearTimes ? "" : endTime,
        break1: shouldClearTimes ? "" : break1,
        break2: shouldClearTimes ? "" : break2,
        lunch: shouldClearTimes ? "" : lunch,
      };
      scheduleEntry.schedule.push(newEntry);
    }

    // Save the updated document
    await scheduleEntry.save();

    res.status(200).json(scheduleEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// this will remove the employee from the list
export const updateTeamLeaderToInactive = async (req, res) => {
  try {
    const scheduleEntry = await ScheduleEntry.findById(req.params.id);
    if (!scheduleEntry) {
      return res.status(404).json({ message: "Schedule entry not found" });
    }

    scheduleEntry.teamLeader = "Inactive";
    await scheduleEntry.save();

    res.status(200).json({ message: "User set to Inactive", scheduleEntry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all attendance entries
export const getAttendanceEntries = async (req, res) => {
  try {
    const attendanceEntries = await AttendanceEntry.find().populate(
      "employeeId"
    );
    res.status(200).json(attendanceEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new attendance entry
export const createAttendanceEntry = async (req, res) => {
  try {
    const { date, employeeId } = req.body; // Assuming your request body contains these fields

    // Check if an entry already exists for this date and employee
    const existingEntry = await AttendanceEntry.findOne({
      date: date,
      employeeId: employeeId, // or whatever field identifies the employee
    });

    if (existingEntry) {
      // If entry exists, update it with the new data
      const updatedEntry = await AttendanceEntry.findByIdAndUpdate(
        existingEntry._id,
        { ...req.body },
        { new: true } // Return the updated document
      );
      return res.status(200).json(updatedEntry);
    } else {
      // If no entry exists, create a new one
      const newAttendanceEntry = new AttendanceEntry({ ...req.body });
      await newAttendanceEntry.save();
      return res.status(201).json(newAttendanceEntry);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an attendance entry
export const updateAttendanceEntry = async (req, res) => {
  const { id } = req.params;
  const { status, checkinTime, checkoutTime } = req.body;
  try {
    const updatedAttendanceEntry = await AttendanceEntry.findByIdAndUpdate(
      id,
      { status, checkinTime, checkoutTime },
      { new: true }
    );
    res.status(200).json(updatedAttendanceEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create Team Leader Entry
export const createTeamLeaderEntry = async (req, res) => {
  try {
    const newTeamLeaderEntry = new TeamLeaderEntry({ ...req.body });
    await newTeamLeaderEntry.save();
    res.status(201).json(newTeamLeaderEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All team leader entries
export const getAllTeamLeaderEntries = async (req, res) => {
  try {
    const teamLeaderEntries = await TeamLeaderEntry.find();
    res.status(200).json(teamLeaderEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkExistingEntry = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const existingEntry = await ScheduleEntry.findOne({
      employeeId,
    });

    if (existingEntry) {
      res.status(200).json({
        exists: true,
        employeeName: existingEntry.employeeName,
        teamLeader: existingEntry.teamLeader,
      });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSchedulePerEmployeeByDate = async (req, res) => {
  const { date } = req.query; // Read date from query parameters
  const employeeId = req.user.id; // Get employeeId from authenticated user

  try {
    const scheduleEntry = await ScheduleEntry.findOne({ employeeId });

    if (!scheduleEntry) {
      return res.status(404).json({ message: "Schedule entry not found" });
    }

    const schedule = scheduleEntry.schedule.find(
      (entry) => entry.date === date
    );

    if (!schedule) {
      return res
        .status(404)
        .json({ message: "Schedule for the specified date not found" });
    }

    res.status(200).json({ shiftType: schedule.shiftType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSchedulePerEmployee = async (req, res) => {
  const employeeId = req.user.id; // Get employeeId from authenticated user

  try {
    const scheduleEntry = await ScheduleEntry.findOne({ employeeId });

    if (!scheduleEntry) {
      return res.status(404).json({ message: "Schedule entry not found" });
    }

    // Return the schedule data along with employeeName, teamLeader, and position
    const response = {
      employeeName: scheduleEntry.employeeName,
      teamLeader: scheduleEntry.teamLeader,
      position: scheduleEntry.position,
      schedule: scheduleEntry.schedule,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
