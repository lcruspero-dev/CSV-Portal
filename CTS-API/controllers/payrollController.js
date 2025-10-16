const Payroll = require("../models/payroll");
const EmployeeTime = require("../models/employeeTimeModel");
const Payslip = require("../models/payslipModel");
const { ScheduleEntry } = require("../models/ScheduleAndAttendanceModel");
const UserProfile = require("../models/userProfileModel");

// Helper function to convert time string to minutes since midnight
function timeToMinutes(timeString) {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Auto-calculation function for payroll data with dynamic periods
async function calculatePayrollData(userId, startDate, endDate) {
    try {
        // Get employee profile for monthly salary
        const userProfile = await UserProfile.findOne({ userId });
        const monthlySalary = userProfile?.monthlySalary || 0;

        // Get time tracker data for the period - find actual work days
        const timeRecords = await EmployeeTime.find({
            employeeId: userId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: 1 }); // Sort by date to get chronological order

        // If no time records, return zero values
        if (!timeRecords || timeRecords.length === 0) {
            return {
                monthlySalary,
                dailyRate: monthlySalary / 26,
                hourlyRate: (monthlySalary / 26) / 8,
                totalHoursWorked: 0,
                totalLateMinutes: 0,
                totalUndertimeMinutes: 0,
                regularDays: 0,
                absentDays: 0,
                actualStartDate: startDate,
                actualEndDate: endDate,
                workingDaysInPeriod: 0
            };
        }

        // Calculate actual working period from time tracker data
        const firstWorkDay = timeRecords[0].date;
        const lastWorkDay = timeRecords[timeRecords.length - 1].date;
        
        // Get schedule data
        const scheduleEntry = await ScheduleEntry.findOne({ employeeId: userId.toString() });

        let totalHoursWorked = 0;
        let totalLateMinutes = 0;
        let totalUndertimeMinutes = 0;
        let regularDays = 0;
        let absentDays = 0;

        // Process each time record
        for (const record of timeRecords) {
            if (!record.timeIn || !record.timeOut) continue;

            // Find schedule for this date
            const schedule = scheduleEntry?.schedule?.find(s => s.date === record.date);
            
            if (schedule && schedule.startTime && schedule.endTime) {
                // Convert times to minutes
                const timeInMinutes = timeToMinutes(record.timeIn);
                const timeOutMinutes = timeToMinutes(record.timeOut);
                const scheduledStartMinutes = timeToMinutes(schedule.startTime);
                const scheduledEndMinutes = timeToMinutes(schedule.endTime);

                // Calculate late minutes
                if (timeInMinutes > scheduledStartMinutes) {
                    totalLateMinutes += (timeInMinutes - scheduledStartMinutes);
                }

                // Calculate undertime minutes
                if (timeOutMinutes < scheduledEndMinutes) {
                    totalUndertimeMinutes += (scheduledEndMinutes - timeOutMinutes);
                }

                // Adjust time in: if earlier than scheduled start, use scheduled start
                const adjustedTimeIn = Math.max(timeInMinutes, scheduledStartMinutes);
                // Adjust time out: if earlier than scheduled end, count as undertime
                const adjustedTimeOut = Math.min(timeOutMinutes, scheduledEndMinutes);

                // Calculate hours worked (excluding lunch break)
                const hoursWorked = (adjustedTimeOut - adjustedTimeIn) / 60;
                totalHoursWorked += Math.max(0, hoursWorked);
            } else {
                // If no schedule, use actual time worked
                const timeInMinutes = timeToMinutes(record.timeIn);
                const timeOutMinutes = timeToMinutes(record.timeOut);
                const hoursWorked = (timeOutMinutes - timeInMinutes) / 60;
                totalHoursWorked += Math.max(0, hoursWorked);
            }
        }

        // Count unique work days from time records
        const uniqueWorkDays = new Set(timeRecords.map(record => record.date)).size;
        regularDays = uniqueWorkDays;

        // Calculate working days in the actual period (not monthly)
        const startDateObj = new Date(firstWorkDay);
        const endDateObj = new Date(lastWorkDay);
        let workingDaysInPeriod = 0;
        
        // Count weekdays between first and last work day
        for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
                workingDaysInPeriod++;
            }
        }

        // Calculate absent days based on actual working period
        absentDays = Math.max(0, workingDaysInPeriod - regularDays);

        // Calculate rates based on actual working days, not monthly
        const dailyRate = workingDaysInPeriod > 0 ? monthlySalary / 26 : 0; // Keep standard daily rate
        const hourlyRate = dailyRate / 8; // Assuming 8 hours per day

        return {
            monthlySalary,
            dailyRate,
            hourlyRate,
            totalHoursWorked,
            totalLateMinutes,
            totalUndertimeMinutes,
            regularDays,
            absentDays,
            actualStartDate: firstWorkDay,
            actualEndDate: lastWorkDay,
            workingDaysInPeriod
        };

    } catch (error) {
        console.error('Error calculating payroll data:', error);
        throw error;
    }
}

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
    const dailyRate = payroll.payrollRate?.dailyRate || monthlyRate / 26;
    const hourlyRate = payroll.payrollRate?.hourlyRate || dailyRate / 8;

    const regularDays = payroll.workDays?.regularDays || 0;
    const absentDays = payroll.workDays?.absentDays || 0;
    const minsLate = payroll.workDays?.minsLate || 0;
    const totalHoursWorked = payroll.workDays?.totalHoursWorked || 0;
    const undertimeMinutes = payroll.workDays?.undertimeMinutes || 0;
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
    const wisp = payroll.totalDeductions?.wisp || 0;
    const totalSSScontribution = payroll.totalDeductions?.totalSSScontribution || 0;
    const withHoldingTax = payroll.totalDeductions?.withHoldingTax || 0;
    const sssSalaryLoan = payroll.totalDeductions?.sssSalaryLoan || 0;
    const hdmfLoan = payroll.totalDeductions?.hdmfLoan || 0;
    const nonTaxableAllowance = payroll.grossSalary?.nonTaxableAllowance || 0;
    const performanceBonus = payroll.grossSalary?.performanceBonus || 0;

    // Basic Pay - use auto-calculated hours worked
    const basicPay = totalHoursWorked * hourlyRate;

    // Late & Absences
    const amountAbsent = absentDays * dailyRate;
    const amountMinLateUT = (minsLate / 60) * hourlyRate;
    const undertimeAmount = (undertimeMinutes / 60) * hourlyRate;

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

    // Gross Salary calculation
    const grossSalary = basicPay + regHolidayPay + speHolidayPay + regularOTpay + restDayOtPay + 
                       nightDiffPay + salaryIncrease + nonTaxableAllowance + performanceBonus;

    // Total deductions
    const totalDeductions = amountAbsent + amountMinLateUT + undertimeAmount + unpaidAmount + 
                           sss + phic + hdmf + wisp + totalSSScontribution + withHoldingTax + 
                           sssSalaryLoan + hdmfLoan;

    const netPay = grossSalary - totalDeductions;

    // Assign all computed values back to payroll object
    payroll.pay = { basicPay };
    payroll.holidays = { 
        regHoliday, 
        regHolidayPay, 
        speHoliday, 
        speHolidayPay 
    };
    payroll.latesAndAbsent = { 
        absentDays, 
        minLateUT: minsLate,
        amountAbsent, 
        amountMinLateUT,
        undertimeMinutes,
        undertimeAmount
    };
    payroll.salaryAdjustments = { 
        unpaid: unpaidDays,
        unpaidAmount, 
        increase: salaryIncrease 
    };
    payroll.totalOvertime = { 
        regularOT,
        regularOTpay, 
        restDayOtHours: restDayOT,
        restDayOtPay,
        totalOvertime: regularOTpay + restDayOtPay
    };
    payroll.totalSupplementary = { 
        nightDiffHours: ndHours,
        nightDiffPay,
        totalSupplementaryIncome: nightDiffPay
    };
    payroll.grossSalary = { 
        grossSalary, 
        nonTaxableAllowance, 
        performanceBonus 
    };
    payroll.totalDeductions = { 
        ...payroll.totalDeductions, 
        totalDeductions 
    };
    payroll.grandtotal = { grandtotal: netPay };

    return payroll;
}

// Auto-update payroll from time tracker data
exports.autoUpdatePayrollFromTimeTracker = async (userId, startDate, endDate) => {
    try {
        // Calculate payroll data from time tracker
        const calculatedData = await calculatePayrollData(userId, startDate, endDate);

        // Find existing payroll or create new one
        let payroll = await Payroll.findOne({ "payrollRate.userId": userId });

        if (!payroll) {
            // Create new payroll with auto-calculated data
            payroll = new Payroll({
                employee: {
                    userId: userId,
                    email: "",
                    fullName: "",
                    position: ""
                },
                payrollRate: {
                    userId: userId,
                    monthlyRate: calculatedData.monthlySalary,
                    dailyRate: calculatedData.dailyRate,
                    hourlyRate: calculatedData.hourlyRate
                },
                workDays: {
                    regularDays: calculatedData.regularDays,
                    absentDays: calculatedData.absentDays,
                    minsLate: calculatedData.totalLateMinutes,
                    totalHoursWorked: calculatedData.totalHoursWorked,
                    undertimeMinutes: calculatedData.totalUndertimeMinutes
                },
                holidays: {
                    regHoliday: 0,
                    regHolidayPay: 0,
                    speHoliday: 0,
                    speHolidayPay: 0
                },
                latesAndAbsent: {
                    absentDays: calculatedData.absentDays,
                    minLateUT: calculatedData.totalLateMinutes,
                    amountAbsent: 0,
                    amountMinLateUT: 0
                },
                salaryAdjustments: {
                    unpaid: 0,
                    unpaidAmount: 0,
                    increase: 0
                },
                totalOvertime: {},
                totalSupplementary: {},
                grossSalary: {
                    nonTaxableAllowance: 0,
                    performanceBonus: 0,
                    grossSalary: 0
                },
                totalDeductions: {},
                grandtotal: { grandtotal: 0 }
            });
        } else {
            // Update existing payroll with auto-calculated data
            payroll.payrollRate.monthlyRate = calculatedData.monthlySalary;
            payroll.payrollRate.dailyRate = calculatedData.dailyRate;
            payroll.payrollRate.hourlyRate = calculatedData.hourlyRate;

            payroll.workDays.regularDays = calculatedData.regularDays;
            payroll.workDays.absentDays = calculatedData.absentDays;
            payroll.workDays.minsLate = calculatedData.totalLateMinutes;
            payroll.workDays.totalHoursWorked = calculatedData.totalHoursWorked;
            payroll.workDays.undertimeMinutes = calculatedData.totalUndertimeMinutes;

            payroll.latesAndAbsent.absentDays = calculatedData.absentDays;
            payroll.latesAndAbsent.minLateUT = calculatedData.totalLateMinutes;
        }

        // Recompute all payroll calculations
        computePayroll(payroll);

        // Save the payroll
        await payroll.save();

        return payroll;

    } catch (error) {
        console.error('Error auto-updating payroll:', error);
        throw error;
    }
};

// CREATE or UPDATE Payroll
exports.processPayroll = async (req, res) => {
    try {
        const { payrollRate } = req.body;

        if (!payrollRate || !payrollRate.userId) {
            return res.status(400).json({ status: "Error", message: "payrollRate.userId is required" });
        }

        let payroll = await Payroll.findOne({ "payrollRate.userId": payrollRate.userId });

        if (!payroll) {
            // For new payrolls, try to auto-calculate from unsent time tracker data
            try {
                // Get all time entries for this user
                const allTimeEntries = await EmployeeTime.find({
                    employeeId: payrollRate.userId
                }).sort({ date: 1 }).lean();

                // Filter out entries that are already in sent payslips
                const existingPayslips = await Payslip.find({ userId: payrollRate.userId }).lean();
                const sentDates = new Set();
                existingPayslips.forEach(payslip => {
                    if (payslip.timeEntries) {
                        payslip.timeEntries.forEach(entry => {
                            sentDates.add(entry.date);
                        });
                    }
                });

                const unsentEntries = allTimeEntries.filter(entry => !sentDates.has(entry.date));
                
                let startDate, endDate;
                if (unsentEntries.length > 0) {
                    startDate = unsentEntries[0].date;
                    endDate = unsentEntries[unsentEntries.length - 1].date;
                } else {
                    // Fallback to current date if no unsent entries
                    const now = new Date();
                    const formatDate = (date) => {
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const year = date.getFullYear();
                        return `${month}/${day}/${year}`;
                    };
                    startDate = formatDate(now);
                    endDate = formatDate(now);
                }

                // Auto-calculate payroll data for the dynamic period
                const calculatedData = await calculatePayrollData(payrollRate.userId, startDate, endDate);

                // Merge request body with calculated data
                const payrollData = {
                    ...req.body,
                    payrollRate: {
                        ...req.body.payrollRate,
                        monthlyRate: calculatedData.monthlySalary,
                        dailyRate: calculatedData.dailyRate,
                        hourlyRate: calculatedData.hourlyRate
                    },
                    workDays: {
                        ...req.body.workDays,
                        regularDays: calculatedData.regularDays,
                        absentDays: calculatedData.absentDays,
                        minsLate: calculatedData.totalLateMinutes,
                        totalHoursWorked: calculatedData.totalHoursWorked,
                        undertimeMinutes: calculatedData.totalUndertimeMinutes
                    }
                };

                payroll = new Payroll(payrollData);
            } catch (error) {
                console.error('Error auto-calculating payroll data:', error);
                // Fallback to manual data if auto-calculation fails
                payroll = new Payroll(req.body);
            }
        } else {
            deepUpdate(payroll, req.body);
        }

        // Backfill employee email if missing, from request body or linked profile fields
        if (payroll.employee) {
            const incomingEmp = req.body.employee || {};
            payroll.employee.email =
                payroll.employee.email ||
                incomingEmp.email ||
                incomingEmp.emailAddress ||
                incomingEmp.personalEmail ||
                "";
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

exports.updatePayroll = async (req, res) => {
    try {
        const { id } = req.params;   // ✅ get payrollId from URL
        const payroll = await Payroll.findById(id);

        if (!payroll) {
            return res.status(404).json({ status: "Error", message: `No payroll record found for ID ${id}` });
        }

        // Check if monthly salary is being updated
        if (req.body.payrollRate?.monthlyRate) {
            // Recalculate daily and hourly rates
            const monthlyRate = req.body.payrollRate.monthlyRate;
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();

            req.body.payrollRate.dailyRate = monthlyRate / totalWorkDays;
            req.body.payrollRate.hourlyRate = req.body.payrollRate.dailyRate / 8;
        }

        // Update the payroll
        deepUpdate(payroll, req.body);

        // Recompute all calculations
        computePayroll(payroll);

        // Save the updated payroll
        const updatedPayroll = await payroll.save();

        res.json(updatedPayroll);
    } catch (error) {
        console.error(`Payroll update failed for payroll ${req.params.id}:`, error);
        res.status(500).json({ status: "Error", message: "Payroll update failed", error });
    }
};

// GET SENT PAYROLLS FOR EMPLOYEE (PAYSLIPS)
exports.getEmployeePayslips = async (req, res) => {
    try {
        const { userId } = req.params;
        // Prefer real payslip snapshots if available
        let payslips = await Payslip.find({ userId }).sort({ sentAt: -1 }).lean();

        // Backward compatibility: if no snapshots yet, fall back to current Payroll marked sent
        if (!payslips || payslips.length === 0) {
            const sentPayrolls = await Payroll.find({
                "payrollRate.userId": userId,
                status: 'sent'
            }).sort({ sentAt: -1 }).lean();
            payslips = sentPayrolls;
        }

        if (!payslips || payslips.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "No payslips found for this employee"
            });
        }

        return res.status(200).json({
            status: "Success",
            count: payslips.length,
            payslips
        });

    } catch (error) {
        console.error('Error fetching employee payslips:', error);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch payslips",
            error: error.message
        });
    }
};

// SEND PAYROLL TO EMPLOYEE
exports.sendPayroll = async (req, res) => {
    try {
        const { userId } = req.params;
        const { payrollId } = req.body;

        // Find the payroll
        const payroll = await Payroll.findById(payrollId);
        if (!payroll) {
            return res.status(404).json({
                status: "Error",
                message: "Payroll not found"
            });
        }

        // Mark payroll as sent
        payroll.status = 'sent';
        payroll.sentAt = new Date();
        await payroll.save();

        // Get all unsent time tracker entries for this employee
        const timeEntriesRaw = await EmployeeTime.find({
            employeeId: userId
        }).sort({ date: 1 }).lean();

        // Filter time entries that haven't been included in any sent payslip yet
        const existingPayslips = await Payslip.find({ userId }).lean();
        const sentDates = new Set();
        existingPayslips.forEach(payslip => {
            if (payslip.timeEntries) {
                payslip.timeEntries.forEach(entry => {
                    sentDates.add(entry.date);
                });
            }
        });

        // Get unsent time entries
        const unsentTimeEntries = timeEntriesRaw.filter(entry => !sentDates.has(entry.date));
        
        if (unsentTimeEntries.length === 0) {
            return res.status(400).json({
                status: "Error",
                message: "No new time entries to include in payroll"
            });
        }

        // Determine period from actual work days
        const firstWorkDay = unsentTimeEntries[0].date;
        const lastWorkDay = unsentTimeEntries[unsentTimeEntries.length - 1].date;
        const periodStart = firstWorkDay;
        const periodEnd = lastWorkDay;

        // Map only the unsent time entries for this payslip
        const timeEntries = unsentTimeEntries.map((t) => ({
            date: t.date,
            hoursWorked: Number(t.totalHours || 0)
        }));

        // Snapshot a payslip document
        try {
            await Payslip.create({
                userId,
                sentAt: payroll.sentAt,
                periodStart,
                periodEnd,
                employee: payroll.employee,
                payrollRate: payroll.payrollRate,
                workDays: payroll.workDays,
                holidays: payroll.holidays,
                latesAndAbsent: payroll.latesAndAbsent,
                salaryAdjustments: payroll.salaryAdjustments,
                totalOvertime: payroll.totalOvertime,
                totalSupplementary: payroll.totalSupplementary,
                grossSalary: payroll.grossSalary,
                totalDeductions: payroll.totalDeductions,
                pay: payroll.pay,
                grandtotal: payroll.grandtotal,
                timeEntries,
                status: 'sent',
            });
        } catch (snapErr) {
            console.error('Failed to snapshot payslip:', snapErr);
            // proceed anyway
        }

        // Reset only the payroll calculation fields (NOT time tracker data and NOT rates)
        // This allows time tracker to continue accumulating data
        // but payroll calculations start fresh for next cycle
        // PRESERVE: payrollRate (monthly, daily, hourly) and totalDeductions

        // Store the rates before reset to preserve them
        const preservedRates = {
            monthlyRate: payroll.payrollRate?.monthlyRate || 0,
            dailyRate: payroll.payrollRate?.dailyRate || 0,
            hourlyRate: payroll.payrollRate?.hourlyRate || 0,
            userId: payroll.payrollRate?.userId
        };

        const preservedDeductions = { ...payroll.totalDeductions };

        // Reset work days and time-related calculations
        payroll.workDays = {
            regularDays: 0,
            absentDays: 0,
            minsLate: 0,
            totalHoursWorked: 0,
            undertimeMinutes: 0
        };

        // Reset lates and absent calculations
        payroll.latesAndAbsent = {
            absentDays: 0,
            minLateUT: 0,
            amountAbsent: 0,
            amountMinLateUT: 0
        };

        // Reset pay calculations
        payroll.pay = {
            basicPay: 0
        };

        // Reset overtime and supplementary income
        payroll.totalOvertime = {};
        payroll.totalSupplementary = {};

        // Reset gross salary but keep structure
        payroll.grossSalary = {
            nonTaxableAllowance: 0,
            performanceBonus: 0,
            grossSalary: 0
        };

        // Reset grand total
        payroll.grandtotal = {
            grandtotal: 0
        };

        // PRESERVE the payroll rates - they should NEVER change after send
        payroll.payrollRate = {
            ...preservedRates
        };

        // PRESERVE the deductions - they typically don't change
        payroll.totalDeductions = {
            ...preservedDeductions,
            totalDeductions: 0 // Reset only the calculated total
        };

        // Save the reset payroll
        await payroll.save();

        console.log(`Payroll calculations reset for user ${userId}. Time tracker data preserved.`);

        // TODO: Here you can add email notification logic
        // For example: send email to employee with payroll details

        res.status(200).json({
            status: "Success",
            message: "Payroll sent successfully. Calculations reset for next cycle.",
            payroll: {
                _id: payroll._id,
                status: payroll.status,
                sentAt: payroll.sentAt
            }
        });

    } catch (error) {
        console.error('Error sending payroll:', error);
        res.status(500).json({
            status: "Error",
            message: "Failed to send payroll",
            error: error.message
        });
    }
};

// GET ALL ARCHIVED PAYSLIPS
exports.getAllArchivedPayslips = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let query = {};
        
        // If date range is provided, filter by sentAt date
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);
            
            query.sentAt = {
                $gte: start,
                $lte: end
            };
        }

        const payslips = await Payslip.find(query).sort({ sentAt: -1 }).lean();

        return res.status(200).json({
            status: "Success",
            count: payslips.length,
            payslips,
            dateRange: startDate && endDate ? { start: startDate, end: endDate } : null
        });

    } catch (error) {
        console.error('Error fetching archived payslips:', error);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch archived payslips",
            error: error.message
        });
    }
};

// GENERATE PAYSLIP FOR CUSTOM DATE RANGE (without mutating payroll)
exports.generatePayslipForRange = async (req, res) => {
    try {
        const { userId } = req.params;
        let { startDate, endDate } = req.body || {};

        if (!startDate || !endDate) {
            return res.status(400).json({ status: "Error", message: "startDate and endDate are required (MM/DD/YYYY)" });
        }

        // Normalize and enforce date boundaries
        const parseMdY = (s) => {
            const [mm, dd, yyyy] = s.split('/').map((v) => Number(v));
            return new Date(yyyy, mm - 1, dd);
        };
        const fmtMdY = (d) => {
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const yyyy = d.getFullYear();
            return `${mm}/${dd}/${yyyy}`;
        };

        const start = parseMdY(startDate);
        const end = parseMdY(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ status: "Error", message: "Invalid date format. Use MM/DD/YYYY" });
        }
        if (end < start) {
            return res.status(400).json({ status: "Error", message: "endDate cannot be earlier than startDate" });
        }

        // Do not include future dates beyond today
        const effectiveEnd = end > today ? today : end;
        startDate = fmtMdY(start);
        endDate = fmtMdY(effectiveEnd);

        // Calculate payroll-like data from time tracker for range
        const calculatedData = await calculatePayrollData(userId, startDate, endDate);

        // Build a transient payroll-like object for computation
        const transientPayroll = {
            employee: { userId, email: "", fullName: "", position: "" },
            payrollRate: {
                userId,
                monthlyRate: calculatedData.monthlySalary,
                dailyRate: calculatedData.dailyRate,
                hourlyRate: calculatedData.hourlyRate,
            },
            workDays: {
                regularDays: calculatedData.regularDays,
                // For custom range, avoid month-wide absence penalty. Recompute within range below.
                absentDays: 0,
                minsLate: calculatedData.totalLateMinutes,
                totalHoursWorked: calculatedData.totalHoursWorked,
                undertimeMinutes: calculatedData.totalUndertimeMinutes,
            },
            holidays: {},
            latesAndAbsent: {},
            salaryAdjustments: {},
            totalOvertime: {},
            totalSupplementary: {},
            grossSalary: {},
            totalDeductions: {},
            pay: {},
            grandtotal: {},
        };

        computePayroll(transientPayroll);

        // Fetch time entries strictly within [startDate, endDate]
        const timeEntriesRaw = await EmployeeTime.find({
            employeeId: userId,
            date: { $gte: startDate, $lte: endDate }
        }).lean();

        const timeEntries = (timeEntriesRaw || []).map((t) => ({
            date: t.date,
            hoursWorked: Number(t.totalHours || 0),
        }));

        // Compute workdays and absences strictly within range (Mon-Fri only)
        const countWeekdaysInclusive = (a, b) => {
            const startD = parseMdY(a);
            const endD = parseMdY(b);
            let count = 0;
            for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
                const wd = d.getDay();
                if (wd >= 1 && wd <= 5) count++;
            }
            return count;
        };
        const uniqueWorkedDays = new Set((timeEntries || []).filter(te => te.hoursWorked > 0).map(te => te.date));
        const workdaysInRange = countWeekdaysInclusive(startDate, endDate);
        const absentInRange = Math.max(0, workdaysInRange - uniqueWorkedDays.size);
        transientPayroll.workDays.absentDays = absentInRange;

        const payload = {
            userId,
            sentAt: new Date(),
            periodStart: startDate,
            periodEnd: endDate,
            employee: transientPayroll.employee,
            payrollRate: transientPayroll.payrollRate,
            workDays: transientPayroll.workDays,
            holidays: transientPayroll.holidays,
            latesAndAbsent: transientPayroll.latesAndAbsent,
            salaryAdjustments: transientPayroll.salaryAdjustments,
            totalOvertime: transientPayroll.totalOvertime,
            totalSupplementary: transientPayroll.totalSupplementary,
            grossSalary: transientPayroll.grossSalary,
            totalDeductions: transientPayroll.totalDeductions,
            pay: transientPayroll.pay,
            grandtotal: transientPayroll.grandtotal,
            timeEntries,
            status: 'generated',
        };

        return res.status(200).json({ status: "Success", payslip: payload });
    } catch (error) {
        console.error('Error generating payslip for range:', error);
        return res.status(500).json({ status: "Error", message: "Failed to generate payslip", error: error.message });
    }
};

