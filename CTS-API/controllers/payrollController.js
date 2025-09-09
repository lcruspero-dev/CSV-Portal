const Payroll = require("../models/payroll");
const UserProfile = require("../models/userProfileModel");

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
    const restDayOTExcess = payroll.totalOvertime?.restDayOtHoursExcess || 0;
    const regularHolidayWorked = payroll.totalOvertime?.regularHolidayWorked || 0;
    const regularHolidayWorkedExcess = payroll.totalOvertime?.regularHolidayWorkedExcess || 0;
    const specialHolidayWorked = payroll.totalOvertime?.specialHolidayWorked || 0;
    const specialHolidayWorkedOT = payroll.totalOvertime?.specialHolidayWorkedOT || 0;
    const specialHolidayRDworkedHours = payroll.totalOvertime?.specialHolidayRDworkedHours || 0;
    const specialHolidayRDworkedOT = payroll.totalOvertime?.specialHolidayRDworkedOT || 0;
    const ndHours = payroll.totalSupplementary?.nightDiffHours || 0;
    const regOTnightDiffHours = payroll.totalSupplementary?.regOTnightDiffHours || 0;
    const restDayNDhours = payroll.totalSupplementary?.restDayNDhours || 0;
    const regHolNDHours = payroll.totalSupplementary?.regHolNDHours || 0;
    const specialHolidayNDhours = payroll.totalSupplementary?.specialHolidayNDhours || 0;
    const unpaidDays = payroll.salaryAdjustments?.unpaid || 0;
    const salaryIncrease = payroll.salaryAdjustments?.increase || 0;

    const sss = payroll.totalDeductions?.sssEmployeeShare || 0;
    const phic = payroll.totalDeductions?.phicEmployeeShare || 0;
    const hdmf = payroll.totalDeductions?.hdmfEmployeeShare || 0;
    const wisp = payroll.totalDeductions?.wisp || 0;
    const totalSSScontribution = payroll.totalDeductions?.totalSSScontribution || 0;
    const nonTaxableIncome = payroll.totalDeductions?.nonTaxableIncome || 0;
    const taxableIncome = payroll.totalDeductions?.taxableIncome || 0;
    const withHoldingTax = payroll.totalDeductions?.withHoldingTax || 0;
    const sssSalaryLoan = payroll.totalDeductions?.sssSalaryLoan || 0;
    const hdmfLoan = payroll.totalDeductions?.hdmfLoan || 0;

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
    const restDayOtExcessPay = restDayOTExcess * hourlyRate * 1.5;
    const regularHolidayWorkedPay = regularHolidayWorked * dailyRate * 2;
    const regularHolidayWorkedExcessPay = regularHolidayWorkedExcess * hourlyRate * 2.6;
    const specialHolidayWorkedPay = specialHolidayWorked * dailyRate * 1.3;
    const specialHolidayWorkedOTpay = specialHolidayWorkedOT * hourlyRate * 1.69;
    const specialHolidayRDworkedPay = specialHolidayRDworkedHours * hourlyRate * 1.69;
    const specialHolidayRDworkedOTpay = specialHolidayRDworkedOT * hourlyRate * 2;

    // Night Differential
    const nightDiffPay = ndHours * hourlyRate * 0.1;
    const regOTnightDiffPay = regOTnightDiffHours * hourlyRate * 0.1;
    const restDayNDPay = restDayNDhours * hourlyRate * 0.1;
    const regHolNDpay = regHolNDHours * hourlyRate * 0.1;
    const specialHolidayNDpay = specialHolidayNDhours * hourlyRate * 0.1;

    // Salary Adjustments
    const unpaidAmount = unpaidDays * dailyRate;

    // Gross & Deductions
    const grossSalary =
        basicPay + regHolidayPay + speHolidayPay + regularOTpay + restDayOtPay + restDayOtExcessPay +
        regularHolidayWorkedPay + regularHolidayWorkedExcessPay + specialHolidayWorkedPay + specialHolidayWorkedOTpay +
        specialHolidayRDworkedPay + specialHolidayRDworkedOTpay + nightDiffPay + regOTnightDiffPay +
        restDayNDPay + regHolNDpay + specialHolidayNDpay + salaryIncrease;

    const totalDeductions = amountAbsent + amountMinLateUT + unpaidAmount + sss + phic + hdmf + wisp + 
        totalSSScontribution + nonTaxableIncome + taxableIncome + withHoldingTax + sssSalaryLoan + hdmfLoan;

    const netPay = grossSalary - totalDeductions;

    // Assign computed values
    payroll.pay = { basicPay };
    payroll.holidays = { ...payroll.holidays, regHolidayPay, speHolidayPay };
    payroll.latesAndAbsent = { ...payroll.latesAndAbsent, amountAbsent, amountMinLateUT };
    payroll.salaryAdjustments = { ...payroll.salaryAdjustments, unpaidAmount };
    payroll.totalOvertime = { 
        ...payroll.totalOvertime, 
        regularOTpay, 
        restDayOtPay, 
        restDayOtExcessPay,
        regularHolidayWorkedPay,
        regularHolidayWorkedExcessPay,
        specialHolidayWorkedPay,
        specialHolidayWorkedOTpay,
        specialHolidayRDworkedPay,
        specialHolidayRDworkedOTpay,
        totalOvertime: regularOTpay + restDayOtPay + restDayOtExcessPay + regularHolidayWorkedPay + 
            regularHolidayWorkedExcessPay + specialHolidayWorkedPay + specialHolidayWorkedOTpay + 
            specialHolidayRDworkedPay + specialHolidayRDworkedOTpay
    };
    payroll.totalSupplementary = { 
        ...payroll.totalSupplementary, 
        nightDiffPay,
        regOTnightDiffPay,
        restDayNDPay,
        regHolNDpay,
        specialHolidayNDpay,
        totalSupplementaryIncome: nightDiffPay + regOTnightDiffPay + restDayNDPay + regHolNDpay + specialHolidayNDpay
    };
    payroll.grossSalary = { grossSalary, nonTaxableAllowance: 0, performanceBonus: 0 };
    payroll.totalDeductions = { 
        ...payroll.totalDeductions, 
        totalDeductions,
        wisp,
        totalSSScontribution,
        nonTaxableIncome,
        taxableIncome,
        withHoldingTax,
        sssSalaryLoan,
        hdmfLoan
    };
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

        // Enrich employee info from UserProfile if missing or incomplete
        if (payrollRate?.userId) {
            const profile = await UserProfile.findOne({ userId: payrollRate.userId }).lean();
            if (profile) {
                const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
                payroll.employee = payroll.employee || {};
                payroll.employee.userId = payrollRate.userId;
                payroll.employee.email = profile.emailAddress || profile.email || payroll.employee.email;
                payroll.employee.fullName = fullName || payroll.employee.fullName;
                payroll.employee.position = profile.jobPosition || profile.position || payroll.employee.position;
            }
        }

        // Compute all payroll fields
        computePayroll(payroll);

        // Attempt save; handle duplicate key gracefully
        try {
            await payroll.save();
        } catch (e) {
            if (e && e.code === 11000) {
                return res.status(409).json({ status: "Error", message: "Payroll already exists for this user" });
            }
            throw e;
        }

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

exports.updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;   // ✅ get payrollId from URL
    const updatedPayroll = await Payroll.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedPayroll) {
      return res.status(404).json({ status: "Error", message: `No payroll record found for ID ${id}` });
    }

    res.json(updatedPayroll);
  } catch (error) {
    console.error(`Payroll update failed for payroll ${req.params.id}:`, error); // ✅ use req.params.id
    res.status(500).json({ status: "Error", message: "Payroll update failed", error });
  }
};

