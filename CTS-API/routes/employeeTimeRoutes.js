import express from "express";
import {
  getEmployeeTimes,
  createEmployeeTimeIn,
  createEmployeeTimeOut,
  updateEmployeeTime,
  deleteEmployeeTime,
  updateEmployeeTimeOut,
  getEmployeeTimeWithNullTimeOut,
  getEmployeeTimeByEmployeeId,
  searchByNameAndDate,
  updateEmployeeTimeBreak,
  updateEmployeeTimelunch,
  getEmployeeTimeByEmployeeIdandDate,
  getIncompleteBreaks,
  updateEmployeeBioBreak,
} from "../controllers/employeeTimeController.js";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router("/")
  .get(protect, getEmployeeTimes)
  .post(protect, createEmployeeTimeIn)
  .put(protect, updateEmployeeTimeOut);

router("/break").put(protect, updateEmployeeTimeBreak);

router("/times").get(protect, getEmployeeTimes);

router("/null").get(protect, getEmployeeTimeWithNullTimeOut);

router("/time").get(protect, getEmployeeTimeByEmployeeId);

router("/search").get(protect, verifyAdmin, searchByNameAndDate);

router("/:id")
  .put(protect, createEmployeeTimeOut)
  .patch(protect, verifyAdmin, updateEmployeeTime)
  .delete(protect, verifyAdmin, deleteEmployeeTime);

router("/lunch/update").put(protect, updateEmployeeTimelunch);

router("/bio/update").put(protect, updateEmployeeBioBreak);

router("/search/:id").get(protect, getEmployeeTimeByEmployeeIdandDate);

router("/incomplete").get(protect, getIncompleteBreaks);

export default router;
