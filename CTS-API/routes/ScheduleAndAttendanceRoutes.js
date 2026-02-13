import express from "express";
import {
  getScheduleEntries,
  createAttendanceEntry,
  updateAttendanceEntry,
  createScheduleEntry,
  updateScheduleEntry,
  getAttendanceEntries,
  getAllTeamLeaderEntries,
  createTeamLeaderEntry,
  checkExistingEntry,
  getSchedulePerEmployee,
  getSchedulePerEmployeeByDate
 } from '../controllers/ScheduleAndAttendanceController.js'
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Schedule Entry Routes
router.get(
  "/schedule-entries",
  protect,
  getScheduleEntries
);
router.post(
  "/schedule-entries",
  protect,
 createScheduleEntry
);
router.put(
  "/schedule-entries/:id",
  protect,
 updateScheduleEntry
);

// Attendance Entry Routes
router.get(
  "/attendance-entries",
  protect,
 getAttendanceEntries
);
router.post(
  "/attendance-entries",
  protect,
 createAttendanceEntry
);
router.put(
  "/attendance-entries/:id",
  protect,
 updateAttendanceEntry
);

router.get(
  "/team-leader-entries",
  protect,
 getAllTeamLeaderEntries
);

router.post(
  "/team-leader-entries",
  protect,
 createTeamLeaderEntry
);

router.post(
  "/check-existing-entry",
  protect,
 checkExistingEntry
);

router.get(
  "/schedule-per-employee-by-date",
  protect,
 getSchedulePerEmployeeByDate
);

router.get(
  "/schedule/employee",
  protect,
 getSchedulePerEmployee
);

export default router;
