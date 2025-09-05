const express = require('express');
const router = express.Router();
const {
    processPayroll,
    getAllPayrolls,
    getPayrollByUser,
    deletePayroll
} = require('../controllers/payrollController');

router.post("/process", processPayroll);

router.get("/", getAllPayrolls);

router.get("/:id", getPayrollByUser);

router.delete("/:id", deletePayroll);

module.exports = router;
