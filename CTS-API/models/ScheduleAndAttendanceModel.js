const mongoose = require("mongoose");

const scheduleEntrySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    // ref: "user", // Reference to the User model
  },
  employeeName: {
    type: String,
  },
  schedule: [
    {
      date: {
        type: String, // You can also use Date type if needed
      },
      shiftType: {
        type: String,
      },
      startTime: {
        type: String,
      },
      endTime: {
        type: String,
      },
      break1: {
        type: String,
      },
      break2: {
        type: String,
      },
      lunch: {
        type: String,
      },
    },
  ],
  teamLeader: {
    type: String,
  },
  position: {
    type: String,
  },
});

const attendanceEntrySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    // ref: "user", // Reference to the User model
  },
  date: {
    type: String,
  },
  status: {
    type: String,
    required: true,
  },
  logIn: {
    type: String,
  },
  logOut: {
    type: String,
  },
  totalHours: {
    type: String,
  },
  shift: {
    type: String,
  },
  ot: {
    type: String,
  },
  rdot: {
    type: String,
  },
});

const teamLeaderEntrySchema = new mongoose.Schema({
  teamLeader: {
    type: String,
  },
});

const ScheduleEntry = mongoose.model("ScheduleEntry", scheduleEntrySchema);
const AttendanceEntry = mongoose.model(
  "AttendanceEntry",
  attendanceEntrySchema
);
const TeamLeaderEntry = mongoose.model(
  "TeamLeaderEntry",
  teamLeaderEntrySchema
);

module.exports = { ScheduleEntry, AttendanceEntry, TeamLeaderEntry };
