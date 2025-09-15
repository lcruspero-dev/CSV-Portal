const express = require("express");
const router = express.Router();
const {
  processPayroll,
  getAllPayrolls,
  getPayrollByUser,
  deletePayroll,
  updatePayroll,
  calculatePayrollFromTimeTracker,
} = require("../controllers/payrollController");
const { protect } = require("../middleware/authMiddleware");

router.post("/process", protect, processPayroll);

// router.post("/calculate-from-time-tracker", protect, calculatePayrollFromTimeTracker);

router.put("/update/:id", protect, updatePayroll);

router.get("/", protect, getAllPayrolls);

router.get("/:userId", protect, getPayrollByUser);

router.delete("/:userId", protect, deletePayroll);

module.exports = router;
