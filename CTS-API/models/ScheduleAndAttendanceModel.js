import mongoose from "mongoose";

const scheduleEntrySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  employeeName: {
    type: String,
  },
  schedule: [
    {
      date: {
        type: String,
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

export const ScheduleEntry = mongoose.model("ScheduleEntry", scheduleEntrySchema);

export const AttendanceEntry = mongoose.model(
  "AttendanceEntry",
  attendanceEntrySchema,
);
export const TeamLeaderEntry = mongoose.model(
  "TeamLeaderEntry",
  teamLeaderEntrySchema,
);





