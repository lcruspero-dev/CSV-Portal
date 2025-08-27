const mongoose = require("mongoose");

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
        required: true,
    },
    hourlyRate: {
        type: Number,
        required: true,
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

const latesTotalAmountSchema = new mongoose.Schema({
    totalAbsentAmount: {
        type: Number,
        default: 0,
    },
    tardyLateAmount: {
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

// Example: combining them into one Payroll schema
const payrollSchema = new mongoose.Schema({
    payrollRate: payrollRateSchema,
    pay: paySchema,
    workDays: workDaysSchema,
    holidays: holidaysSchema,
    latesTotalAmount: latesTotalAmountSchema,
    salaryAdjustments: salaryAdjustmentsSchema,
});

module.exports = mongoose.model("Payroll", payrollSchema);
