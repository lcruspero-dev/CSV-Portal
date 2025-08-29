const express = require('express');
const router = express.Router();
const payroll = require('../controllers/payrollController');

// CREATE
router.post("/create", payroll.createPayroll);

// PROCESS (compute payroll)
router.post("/process", payroll.processPayroll);

// GET ALL
router.get("/", payroll.getAllPayrolls);

// GET by userId
router.get("/:userId", payroll.getPayrollByUser);

// UPDATE by userId
router.put("/:userId", payroll.updatePayroll);

// DELETE by userId
router.delete("/:userId", payroll.deletePayroll);

module.exports = router;
