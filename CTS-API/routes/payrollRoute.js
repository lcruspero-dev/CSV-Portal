const express = require("express");
const router = express.Router();
const {
  processPayroll,
  getAllPayrolls,
  getPayrollByUser,
  deletePayroll,
  updatePayroll,
  autoUpdatePayrollFromTimeTracker,
  sendPayroll,
  getEmployeePayslips,
  generatePayslipForRange,
  getAllArchivedPayslips,
} = require("../controllers/payrollController");
const { protect } = require("../middleware/authMiddleware");

router.post("/process", protect, processPayroll);

router.post("/auto-calculate/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.body;
    
    const result = await autoUpdatePayrollFromTimeTracker(userId, startDate, endDate);
    
    res.status(200).json({
      status: "Success",
      message: "Payroll auto-calculated successfully",
      payroll: result
    });
  } catch (error) {
    console.error('Error auto-calculating payroll:', error);
    res.status(500).json({
      status: "Error",
      message: "Failed to auto-calculate payroll",
      error: error.message
    });
  }
});

router.put("/update/:id", protect, updatePayroll);

router.post("/send/:userId", protect, sendPayroll);

// Get all archived payslips - MUST come before /payslips/:userId to avoid route conflict
router.get("/payslips/archive", protect, getAllArchivedPayslips);

router.get("/payslips/:userId", protect, getEmployeePayslips);

// Generate a payslip for a custom date range without persisting it
router.post("/payslips/generate/:userId", protect, generatePayslipForRange);

router.get("/", protect, getAllPayrolls);

router.get("/:userId", protect, getPayrollByUser);

router.delete("/:userId", protect, deletePayroll);

module.exports = router;
