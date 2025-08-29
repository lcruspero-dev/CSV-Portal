const Payroll = require("../models/payroll");

// CREATE Payroll Record
exports.createPayroll = async (req, res) => {
    try {
        const payroll = new Payroll({
            payrollRate: {
                userId: req.body.userId,
                monthlyRate: req.body.monthlyRate,
                dailyRate: req.body.dailyRate,
                hourlyRate: req.body.hourlyRate,
            },
            pay: { basicPay: 0 },
            workDays: { regularDays: 0, absentDays: 0, minsLate: 0 },
            holidays: { regHoliday: 0, regHolidayPay: 0, speHoliday: 0, speHolidayPay: 0 },
            latesAndAbsent: {},
            salaryAdjustments: {},
            totalOvertime: { totalOvertime: 0 },
            totalSupplementary: { nightDiffHours: 0, nightDiffPay: 0, totalSupplementaryIncome: 0 },
            grossSalary: { grossSalary: 0, performanceBonus: 0, nonTaxableAllowance: 0 },
            totalDeductions: {
                sssEmployeeShare: 1000,
                phicEmployeeShare: 500,
                hdmfEmployeeShare: 200,
                withHoldingTax: 0,
                sssSalaryLoan: 0,
                hdmfLoan: 0,
                wisp: 0,
                totalDeductions: 0,
            },
            grandtotal: { grandtotal: 0 },
        });

        await payroll.save();
        return res.status(201).json({
            status: "Success",
            message: "Payroll record created",
            payroll,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "Error", message: err.message });
    }
};

// PROCESS Payroll
exports.processPayroll = async (req, res) => {
    try {
        const { userId, regularDays, absentDays, minsLate, otData, holidayData, ndHours, cutOff } = req.body;

        let payroll = await Payroll.findOne({ "payrollRate.userId": userId });
        if (!payroll) {
            return res.status(404).json({
                status: "Error",
                message: `No payroll record found for user ${userId}`,
            });
        }

        const hourlyRate = payroll.payrollRate.hourlyRate;
        const dailyRate = payroll.payrollRate.dailyRate;

        // 1. Basic Pay
        payroll.pay.basicPay = dailyRate * (regularDays || 0);

        // 2. Absence Deduction
        const absenceDeduction = (absentDays || 0) * dailyRate;

        // 3. Late Deduction
        const lateDeduction = ((minsLate || 0) / 60) * hourlyRate;

        // 4. Holidays
        payroll.holidays.regHolidayPay = 0;
        payroll.holidays.speHolidayPay = 0;
        let holidayPay = 0;
        for (let h of holidayData || []) {
            let multiplier = 1;
            if (h.type === "regular") multiplier = 2.0;
            if (h.type === "special") multiplier = 1.3;
            if (h.type === "double") multiplier = 3.0;

            const pay = dailyRate * h.days * multiplier;
            holidayPay += pay;

            if (h.type === "regular") payroll.holidays.regHolidayPay += pay;
            if (h.type === "special") payroll.holidays.speHolidayPay += pay;
        }

        // 5. Overtime
        let totalOT = 0;
        for (let ot of otData || []) {
            let multiplier = 1;
            if (ot.type === "ordinary") multiplier = 1.25;
            if (ot.type === "restDay") multiplier = 1.30;
            if (ot.type === "specialHoliday") multiplier = 1.30;
            if (ot.type === "regularHoliday") multiplier = 2.0;
            if (ot.type === "doubleHoliday") multiplier = 3.0;

            if (ot.isRestDay && ot.type === "regularHoliday") multiplier = 2.6;
            if (ot.isRestDay && ot.type === "doubleHoliday") multiplier = 3.9;

            totalOT += ot.hours * hourlyRate * multiplier;
        }
        payroll.totalOvertime.totalOvertime = totalOT;

        // 6. Night Differential
        const ndPay = (ndHours || 0) * hourlyRate * 0.1;
        payroll.totalSupplementary.nightDiffHours = ndHours || 0;
        payroll.totalSupplementary.nightDiffPay = ndPay;
        payroll.totalSupplementary.totalSupplementaryIncome = ndPay;

        // 7. Gross Salary
        payroll.grossSalary.grossSalary =
            payroll.pay.basicPay -
            absenceDeduction -
            lateDeduction +
            payroll.holidays.regHolidayPay +
            payroll.holidays.speHolidayPay +
            payroll.totalOvertime.totalOvertime +
            payroll.totalSupplementary.totalSupplementaryIncome +
            payroll.grossSalary.performanceBonus +
            payroll.grossSalary.nonTaxableAllowance;

        // 8. Deductions (split by cutoff)
        let sss = payroll.totalDeductions.sssEmployeeShare;
        let phic = payroll.totalDeductions.phicEmployeeShare;
        let hdmf = payroll.totalDeductions.hdmfEmployeeShare;

        if (cutOff === "first" || cutOff === "second") {
            sss = sss / 2;
            phic = phic / 2;
            hdmf = hdmf / 2;
        }

        payroll.totalDeductions.totalDeductions =
            sss +
            phic +
            hdmf +
            payroll.totalDeductions.withHoldingTax +
            payroll.totalDeductions.sssSalaryLoan +
            payroll.totalDeductions.hdmfLoan +
            payroll.totalDeductions.wisp;

        // 9. Net Pay (Grand Total)
        payroll.grandtotal.grandtotal =
            payroll.grossSalary.grossSalary - payroll.totalDeductions.totalDeductions;

        await payroll.save();

        return res.status(200).json({
            status: "Success",
            message: `Payroll processed for ${cutOff || "full month"}`,
            payroll,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "Error", message: err.message });
    }
};

// GET Payroll by User
exports.getPayrollByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const payroll = await Payroll.findOne({ "payrollRate.userId": userId });

        if (!payroll) {
            return res.status(404).json({
                status: "Error",
                message: `No payroll record found for user ${userId}`,
            });
        }

        return res.status(200).json({
            status: "Success",
            payroll,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "Error", message: err.message });
    }
};

// UPDATE Payroll (e.g., bonuses, allowances, deductions)
exports.updatePayroll = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const payroll = await Payroll.findOneAndUpdate(
            { "payrollRate.userId": userId },
            { $set: updates },
            { new: true }
        );

        if (!payroll) {
            return res.status(404).json({
                status: "Error",
                message: `No payroll record found for user ${userId}`,
            });
        }

        return res.status(200).json({
            status: "Success",
            message: "Payroll updated successfully",
            payroll,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "Error", message: err.message });
    }
};

// DELETE Payroll
exports.deletePayroll = async (req, res) => {
    try {
        const { userId } = req.params;
        const payroll = await Payroll.findOneAndDelete({ "payrollRate.userId": userId });

        if (!payroll) {
            return res.status(404).json({
                status: "Error",
                message: `No payroll record found for user ${userId}`,
            });
        }

        return res.status(200).json({
            status: "Success",
            message: "Payroll deleted successfully",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "Error", message: err.message });
    }
};

// GET ALL Payrolls
exports.getAllPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.find();

        return res.status(200).json({
            status: "Success",
            count: payrolls.length,
            payrolls,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "Error", message: err.message });
    }
};
