import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  personalEmail: {
    type: String,
  },
  fullName: {
    type: String,
  },
  position: {
    type: String,
  }
});

const payrollRateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  monthlyRate: {
    type: Number,
    required: true,
  },
  dailyRate: {
    type: Number,
  },
  hourlyRate: {
    type: Number,
  },
});

const paySchema = new mongoose.Schema({
  basicPay: {
    type: Number,
    required: true,
  },
});

const workDaysSchema = new mongoose.Schema({
  regularDays: {
    type: Number, // count of days worked
    required: true,
  },
  absentDays: {
    type: Number, // count of days absent
    required: true,
  },
  minsLate: {
    type: Number, // total minutes late
    required: true,
  },
  totalHoursWorked: {
    type: Number, // total hours worked from time tracker
    default: 0,
  },
  undertimeMinutes: {
    type: Number, // total undertime minutes
    default: 0,
  },
});

const holidaysSchema = new mongoose.Schema({
  regHoliday: {
    type: Number, // count of regular holidays
    required: true,
  },
  regHolidayPay: {
    type: Number, // pay for regular holidays
    required: true,
  },
  speHoliday: {
    type: Number, // count of special holidays
    required: true,
  },
  speHolidayPay: {
    type: Number, // pay for special holidays
    required: true,
  },
});

const latesAndAbsentSchema = new mongoose.Schema({
  absentDays: {
    type: Number,
    default: 0,
  },
  minLateUT: {
    type: Number,
    default: 0,
  },
  amountAbsent: {
    type: Number,
    default: 0,
  },
  amountMinLateUT: {
    type: Number,
    default: 0,
  },
});

const salaryAdjustmentsSchema = new mongoose.Schema({
  unpaid: {
    type: Number,
    default: 0,
  },
  unpaidAmount: {
    type: Number,
    default: 0,
  },
  increase: {
    type: Number,
    default: 0,
  },
});

const totalOvertimeSchema = new mongoose.Schema({
  overtimeAdjustND: {
    type: Number,
    default: 0,
  },
  regularOT: {
    type: Number,
    default: 0,
  },
  regularOTpay: {
    type: Number,
    default: 0,
  },
  restDayOtHours: {
    type: Number,
    default: 0,
  },
  restDayOtPay: {
    type: Number,
    default: 0,
  },
  restDayOtHoursExcess: {
    type: Number,
    default: 0,
  },
  restDayOtHoursExcessPay: {
    type: Number,
    default: 0,
  },
  regularHolidayWorked: {
    type: Number,
    default: 0,
  },
  regularHolidayWorkedPay: {
    type: Number,
    default: 0,
  },
  regularHolidayWorkedExcess: {
    type: Number,
    default: 0,
  },
  regularHolidayWorkedExcessPay: {
    type: Number,
    default: 0,
  },
  specialHolidayWorked: {
    type: Number,
    default: 0,
  },
  specialHolidayWorkedPay: {
    type: Number,
    default: 0,
  },
  specialHolidayWorkedOT: {
    type: Number,
    default: 0,
  },
  specialHolidayWorkedOTpay: {
    type: Number,
    default: 0,
  },
  specialHolidayRDworkedHours: {
    type: Number,
    default: 0,
  },
  specialHolidayRDworkedPay: {
    type: Number,
    default: 0,
  },
  specialHolidayRDworkedOT: {
    type: Number,
    default: 0,
  },
  specialHolidayRDworkedOTpay: {
    type: Number,
    default: 0,
  },
  totalOvertime: {
    type: Number,
    default: 0,
  },
});

const totalSupplementary = new mongoose.Schema({
  nightDiffHours: {
    type: Number,
    default: 0,
  },
  nightDiffPay: {
    type: Number,
    default: 0,
  },
  regOTnightDiffHours: {
    type: Number,
    default: 0,
  },
  regOTnightDiffPay: {
    type: Number,
    default: 0,
  },
  restDayNDhours: {
    type: Number,
    default: 0,
  },
  restDayNDPay: {
    type: Number,
    default: 0,
  },
  regHolNDHours: {
    type: Number,
    default: 0,
  },
  regHolNDpay: {
    type: Number,
    default: 0,
  },
  specialHolidayNDhours: {
    type: Number,
    default: 0,
  },
  specialHolidayNDpay: {
    type: Number,
    default: 0,
  },
  totalSupplementaryIncome: {
    type: Number,
    default: 0,
  },
});

const grossSalarySchema = new mongoose.Schema({
  nonTaxableAllowance: {
    type: Number,
    default: 0,
  },
  performanceBonus: {
    type: Number,
    default: 0,
  },
  grossSalary: {
    type: Number,
    default: 0,
  },
});

const totalDeductionsSchema = new mongoose.Schema({
  sssEmployeeShare: {
    type: Number,
    default: 0,
  },
  wisp: {
    type: Number,
    default: 0,
  },
  totalSSScontribution: {
    type: Number,
    default: 0,
  },
  phicEmployeeShare: {
    type: Number,
    default: 0,
  },
  hdmfEmployeeShare: {
    type: Number,
    default: 0,
  },
  nonTaxableIncome: {
    type: Number,
    default: 0,
  },
  taxableIncome: {
    type: Number,
    default: 0,
  },
  withHoldingTax: {
    type: Number,
    default: 0,
  },
  sssSalaryLoan: {
    type: Number,
    default: 0,
  },
  hdmfLoan: {
    type: Number,
    default: 0,
  },
  totalDeductions: {
    type: Number,
    default: 0,
  },
});

const grandtotalSchema = new mongoose.Schema({
  grandtotal: {
    type: Number,
    default: 0,
  },
});

const payrollSchema = new mongoose.Schema({
  employee: employeeSchema,
  payrollRate: payrollRateSchema,
  pay: paySchema,
  workDays: workDaysSchema,
  holidays: holidaysSchema,
  latesAndAbsent: latesAndAbsentSchema,
  salaryAdjustments: salaryAdjustmentsSchema,
  totalOvertime: totalOvertimeSchema,
  totalSupplementary: totalSupplementary,
  grossSalary: grossSalarySchema,
  totalDeductions: totalDeductionsSchema,
  grandtotal: grandtotalSchema,
  status: {
    type: String,
    enum: ['draft', 'sent'],
    default: 'draft'
  },
  sentAt: {
    type: Date,
    default: null
  }
});

// Ensure one payroll per user
payrollSchema.index({ "payrollRate.userId": 1 }, { unique: true, sparse: true });

export default mongoose.model("Payroll", payrollSchema);
