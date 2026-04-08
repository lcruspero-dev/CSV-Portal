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
  getIncompleteLogins
} from "../controllers/employeeTimeController.js";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getEmployeeTimes)
  .post(protect, createEmployeeTimeIn)
  .put(protect, updateEmployeeTimeOut);

router.route("/break").put(protect, updateEmployeeTimeBreak);

router.route("/times").get(protect, getEmployeeTimes);

router.route("/null").get(protect, getEmployeeTimeWithNullTimeOut);

router.route("/time").get(protect, getEmployeeTimeByEmployeeId);

router.route("/search").get(protect, verifyAdmin, searchByNameAndDate);

router
  .route("/:id")
  .put(protect, createEmployeeTimeOut)
  .patch(protect, verifyAdmin, updateEmployeeTime)
  .delete(protect, verifyAdmin, deleteEmployeeTime);

router.route("/lunch/update").put(protect, updateEmployeeTimelunch);

router.route("/bio/update").put(protect, updateEmployeeBioBreak);

router.route("/search/:id").get(protect, getEmployeeTimeByEmployeeIdandDate);

router.route("/incomplete").get(protect, getIncompleteBreaks);

router.route("/incompleteLogins").get(protect, getIncompleteLogins);

export default router;
