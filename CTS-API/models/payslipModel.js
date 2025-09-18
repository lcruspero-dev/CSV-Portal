const mongoose = require("mongoose");

const timeEntrySchema = new mongoose.Schema({
    date: { type: String, required: true },
    hoursWorked: { type: Number, default: 0 },
});

const payslipSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        sentAt: { type: Date, default: Date.now },
        periodStart: { type: String },
        periodEnd: { type: String },
        employee: {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            email: String,
            fullName: String,
            position: String,
        },
        payrollRate: {
            monthlyRate: Number,
            dailyRate: Number,
            hourlyRate: Number,
        },
        workDays: {
            regularDays: Number,
            absentDays: Number,
            minsLate: Number,
            totalHoursWorked: Number,
            undertimeMinutes: Number,
        },
        holidays: Object,
        latesAndAbsent: Object,
        salaryAdjustments: Object,
        totalOvertime: Object,
        totalSupplementary: Object,
        grossSalary: Object,
        totalDeductions: Object,
        pay: Object,
        grandtotal: Object,
        timeEntries: [timeEntrySchema],
        status: { type: String, default: "sent" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payslip", payslipSchema);


