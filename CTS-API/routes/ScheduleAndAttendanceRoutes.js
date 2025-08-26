const express = require("express");
const router = express.Router();
const scheduleAndAttendanceController = require("../controllers/ScheduleAndAttendanceController");
const { protect } = require("../middleware/authMiddleware");

// Schedule Entry Routes
router.get(
  "/schedule-entries",
  protect,
  scheduleAndAttendanceController.getScheduleEntries
);
router.post(
  "/schedule-entries",
  protect,
  scheduleAndAttendanceController.createScheduleEntry
);
router.put(
  "/schedule-entries/:id",
  protect,
  scheduleAndAttendanceController.updateScheduleEntry
);

// Attendance Entry Routes
router.get(
  "/attendance-entries",
  protect,
  scheduleAndAttendanceController.getAttendanceEntries
);
router.post(
  "/attendance-entries",
  protect,
  scheduleAndAttendanceController.createAttendanceEntry
);
router.put(
  "/attendance-entries/:id",
  protect,
  scheduleAndAttendanceController.updateAttendanceEntry
);

router.get(
  "/team-leader-entries",
  protect,
  scheduleAndAttendanceController.getAllTeamLeaderEntries
);

router.post(
  "/team-leader-entries",
  protect,
  scheduleAndAttendanceController.createTeamLeaderEntry
);

router.post(
  "/check-existing-entry",
  protect,
  scheduleAndAttendanceController.checkExistingEntry
);

router.get(
  "/schedule-per-employee-by-date",
  protect,
  scheduleAndAttendanceController.getSchedulePerEmployeeByDate
);

router.get(
  "/schedule/employee",
  protect,
  scheduleAndAttendanceController.getSchedulePerEmployee
);
module.exports = router;
