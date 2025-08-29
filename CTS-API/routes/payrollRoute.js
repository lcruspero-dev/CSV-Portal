const express = require('express');
const router = express.Router();
const payroll = require('../controllers/payrollController');

router.post("/create", payroll.createPayroll);
router.post("/process", payroll.processPayroll);
router.get("/:id", payroll.getPayrollByUser)
router.put("/:id", payroll.updatePayroll)
router.delete("/:id", payroll.deletePayroll)



module.exports = router;