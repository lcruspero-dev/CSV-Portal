const Payroll = require("../models/payroll");
const UserProfile = require("../models/userProfileModel")

// Helper to recursively update nested objects
function deepUpdate(doc, updates) {
    for (const key in updates) {
        if (
            updates[key] !== null &&
            typeof updates[key] === "object" &&
            !Array.isArray(updates[key])
        ) {
            doc[key] = doc[key] || {};
            deepUpdate(doc[key], updates[key]);
        } else {
            doc[key] = updates[key];
        }
    }
}

function computePayroll(payroll) {
    const monthlyRate = payroll.payrollRate?.monthlyRate || 0;
    const dailyRate = monthlyRate / 26;
    const hourlyRate = dailyRate / 8;

    const regularDays = payroll.workDays?.regularDays || 0;
    const absentDays = payroll.workDays?.absentDays || 0;
    const minsLate = payroll.workDays?.minsLate || 0;
    const regHoliday = payroll.holidays?.regHoliday || 0;
    const speHoliday = payroll.holidays?.speHoliday || 0;
    const regularOT = payroll.totalOvertime?.regularOT || 0;
    const restDayOT = payroll.totalOvertime?.restDayOtHours || 0;
    const ndHours = payroll.totalSupplementary?.nightDiffHours || 0;
    const unpaidDays = payroll.salaryAdjustments?.unpaid || 0;
    const salaryIncrease = payroll.salaryAdjustments?.increase || 0;

    const sss = payroll.totalDeductions?.sssEmployeeShare || 0;
    const phic = payroll.totalDeductions?.phicEmployeeShare || 0;
    const hdmf = payroll.totalDeductions?.hdmfEmployeeShare || 0;

    // Basic Pay
    const basicPay = regularDays * dailyRate;

    // Late & Absences
    const amountAbsent = absentDays * dailyRate;
    const amountMinLateUT = (minsLate / 60) * hourlyRate;

    // Holidays
    const regHolidayPay = regHoliday * dailyRate;
    const speHolidayPay = speHoliday * dailyRate * 0.3;

    // Overtime
    const regularOTpay = regularOT * hourlyRate * 1.25;
    const restDayOtPay = restDayOT * hourlyRate * 1.3;

    // Night Differential
    const nightDiffPay = ndHours * hourlyRate * 0.1;

    // Salary Adjustments
    const unpaidAmount = unpaidDays * dailyRate;

    // Gross & Deductions
    const grossSalary =
        basicPay + regHolidayPay + speHolidayPay + regularOTpay + restDayOtPay + nightDiffPay + salaryIncrease;

    const totalDeductions = amountAbsent + amountMinLateUT + unpaidAmount + sss + phic + hdmf;

    const netPay = grossSalary - totalDeductions;

    // Assign computed values
    payroll.pay = { basicPay };
    payroll.holidays = { ...payroll.holidays, regHolidayPay, speHolidayPay };
    payroll.latesAndAbsent = { ...payroll.latesAndAbsent, amountAbsent, amountMinLateUT };
    payroll.salaryAdjustments = { ...payroll.salaryAdjustments, unpaidAmount };
    payroll.totalOvertime = { ...payroll.totalOvertime, regularOTpay, restDayOtPay };
    payroll.totalSupplementary = { ...payroll.totalSupplementary, nightDiffPay };
    payroll.grossSalary = { grossSalary, nonTaxableAllowance: 0, performanceBonus: 0 };
    payroll.totalDeductions = { ...payroll.totalDeductions, totalDeductions };
    payroll.grandtotal = { grandtotal: netPay };

    return payroll;
}

// CREATE or UPDATE Payroll
exports.processPayroll = async (req, res) => {
    try {
        const { payrollRate } = req.body;

        if (!payrollRate || !payrollRate.userId) {
            return res.status(400).json({ status: "Error", message: "payrollRate.userId is required" });
        }

        let payroll = await Payroll.findOne({ "payrollRate.userId": payrollRate.userId });

        if (!payroll) {
            payroll = new Payroll(req.body);
        } else {
            deepUpdate(payroll, req.body);
        }

        // Compute all payroll fields
        computePayroll(payroll);

        await payroll.save();

        return res.status(payroll.isNew ? 201 : 200).json({
            status: "Success",
            message: payroll.isNew ? "Payroll created successfully" : "Payroll updated successfully",
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
        const payroll = await Payroll.findOne({ "payrollRate.userId": userId }).lean();

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

// DELETE Payroll by User
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
        const payrolls = await Payroll.find().lean();

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
