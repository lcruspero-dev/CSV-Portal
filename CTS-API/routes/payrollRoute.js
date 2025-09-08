const express = require('express');
const router = express.Router();
const {
    processPayroll,
    getAllPayrolls,
    getPayrollByUser,
    deletePayroll,
    updatePayroll
} = require('../controllers/payrollController');

router.post("/process", processPayroll);

router.put("/update/:id", updatePayroll);

router.get("/", getAllPayrolls);

router.get("/:id", getPayrollByUser);

router.delete("/:id", deletePayroll);

module.exports = router;
    