const express = require('express');
const router = express.Router();
const payroll = require('../controllers/payrollController');

router.post("/process", payroll.processPayroll);
router.post("/create", payroll.createPayroll);

module.exports = router;