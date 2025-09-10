/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
    payrollAPI, 
    UserProfileAPI 
} from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";

export interface UserProfile {
    _id: string;             // MongoDB document ID
    userId: string;
    firstName: string;
    middleName?: string;     // optional
    lastName: string;
    jobPosition: string;
    email: string;           // fixed from emailAddress → email
    fullName?: string;       // optional convenience field
}

export interface Payroll {
    _id?: string;
    employee: UserProfile & { email?: string; fullName?: string; position?: string };
    payrollRate?: {
        userId: string;
        monthlyRate: number;
        dailyRate: number;
        hourlyRate: number;
    };
    pay?: { basicPay: number };
    workDays?: { regularDays: number; absentDays: number; minsLate: number };
    holidays?: {
        regHoliday: number;
        regHolidayPay: number;
        speHoliday: number;
        speHolidayPay: number;
    };
    totalOvertime?: any;
    salaryAdjustments?: any;
    totalSupplementary?: any;
    grossSalary?: any;
    totalDeductions?: any;
    grandtotal?: any;
}

const PayrollModal = ({ onAdd }: { onAdd: (p: Payroll) => void }) => {
    const [open, setOpen] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Form with all fields
    const [form, setForm] = useState({
        monthlyRate: 0,
        regularDays: 0,
        absentDays: 0,
        minsLate: 0,
        regHoliday: 0,
        speHoliday: 0,
        regularOT: 0,
        restDayOT: 0,
        restDayOTExcess: 0,
        regularHolidayWorked: 0,
        regularHolidayWorkedExcess: 0,
        specialHolidayWorked: 0,
        specialHolidayWorkedOT: 0,
        specialHolidayRDworkedHours: 0,
        specialHolidayRDworkedOT: 0,
        ndHours: 0,
        regOTnightDiffHours: 0,
        restDayNDhours: 0,
        regHolNDHours: 0,
        specialHolidayNDhours: 0,
        // Deductions
        sssEmployeeShare: 0,
        phicEmployeeShare: 0,
        hdmfEmployeeShare: 0,
        wisp: 0,
        totalSSScontribution: 0,
        nonTaxableIncome: 0,
        taxableIncome: 0,
        withHoldingTax: 0,
        sssSalaryLoan: 0,
        hdmfLoan: 0,
        // Salary Adjustments
        unpaid: 0,
        increase: 0,
        // Gross Salary
        nonTaxableAllowance: 0,
        performanceBonus: 0,
    });

    const [payrollPreview, setPayrollPreview] = useState<Payroll | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await UserProfileAPI.getAllUsers();
                setEmployees(res.data || []);
            } catch (err) {
                console.error("Error fetching employees:", err);
            }
        };
        fetchUsers();
    }, []);

    console.log('Selected User:', selectedUser);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: Number(value) }));
    };

    // Payroll preview
    useEffect(() => {
        if (!selectedUser) return;

        const monthlyRate = form.monthlyRate || 0;
        const dailyRate = monthlyRate / 26; 
        const hourlyRate = dailyRate / 8;

        const basicPay = form.regularDays * dailyRate;
        const absentDeduction = form.absentDays * dailyRate;
        const lateDeduction = (form.minsLate / 60) * hourlyRate;

        const regHolidayPay = form.regHoliday * dailyRate;
        const speHolidayPay = form.speHoliday * dailyRate * 0.3;

        const regularOTpay = form.regularOT * hourlyRate * 1.25;
        const restDayOtPay = form.restDayOT * hourlyRate * 1.3;
        const restDayOtExcessPay = form.restDayOTExcess * hourlyRate * 1.5;
        const regularHolidayWorkedPay = form.regularHolidayWorked * dailyRate * 2;
        const regularHolidayWorkedExcessPay =
            form.regularHolidayWorkedExcess * hourlyRate * 2.6;
        const specialHolidayWorkedPay = form.specialHolidayWorked * dailyRate * 1.3;
        const specialHolidayWorkedOTpay =
            form.specialHolidayWorkedOT * hourlyRate * 1.69;
        const specialHolidayRDworkedPay =
            form.specialHolidayRDworkedHours * hourlyRate * 1.69;
        const specialHolidayRDworkedOTpay =
            form.specialHolidayRDworkedOT * hourlyRate * 2;

        const nightDiffPay = form.ndHours * hourlyRate * 0.1;
        const regOTnightDiffPay = form.regOTnightDiffHours * hourlyRate * 0.1;
        const restDayNDPay = form.restDayNDhours * hourlyRate * 0.1;
        const regHolNDPay = form.regHolNDHours * hourlyRate * 0.1;
        const specialHolidayNDpay = form.specialHolidayNDhours * hourlyRate * 0.1;

        const grossSalary =
            basicPay +
            regHolidayPay +
            speHolidayPay +
            regularOTpay +
            restDayOtPay +
            restDayOtExcessPay +
            regularHolidayWorkedPay +
            regularHolidayWorkedExcessPay +
            specialHolidayWorkedPay +
            specialHolidayWorkedOTpay +
            specialHolidayRDworkedPay +
            specialHolidayRDworkedOTpay +
            nightDiffPay +
            regOTnightDiffPay +
            restDayNDPay +
            regHolNDPay +
            specialHolidayNDpay +
            form.increase +
            form.nonTaxableAllowance +
            form.performanceBonus;

        const totalDeductions = absentDeduction + lateDeduction + 
            form.sssEmployeeShare + form.phicEmployeeShare + form.hdmfEmployeeShare +
            form.wisp + form.totalSSScontribution + form.nonTaxableIncome + 
            form.taxableIncome + form.withHoldingTax + form.sssSalaryLoan + form.hdmfLoan +
            (form.unpaid * dailyRate);
        const netPay = grossSalary - totalDeductions;

        setPayrollPreview({
            employee: {
                ...selectedUser, // now includes firstName, lastName, email, etc.
                fullName: `${selectedUser.firstName} ${selectedUser.lastName}`,
                position: selectedUser.jobPosition,
            },
            payrollRate: {
                userId: selectedUser.userId || selectedUser._id,
                monthlyRate,
                dailyRate,
                hourlyRate,
            },
            pay: { basicPay },
            workDays: {
                regularDays: form.regularDays,
                absentDays: form.absentDays,
                minsLate: form.minsLate,
            },
            holidays: {
                regHoliday: form.regHoliday,
                regHolidayPay,
                speHoliday: form.speHoliday,
                speHolidayPay,
            },
            totalOvertime: {
                regularOT: form.regularOT,
                regularOTpay,
                restDayOtHours: form.restDayOT,
                restDayOtPay,
                restDayOtHoursExcess: form.restDayOTExcess,
                regularHolidayWorked: form.regularHolidayWorked,
                regularHolidayWorkedPay,
                regularHolidayWorkedExcess: form.regularHolidayWorkedExcess,
                regularHolidayWorkedExcessPay,
                specialHolidayWorked: form.specialHolidayWorked,
                specialHolidayWorkedPay,
                specialHolidayWorkedOT: form.specialHolidayWorkedOT,
                specialHolidayWorkedOTpay,
                specialHolidayRDworkedHours: form.specialHolidayRDworkedHours,
                specialHolidayRDworkedPay,
                specialHolidayRDworkedOT: form.specialHolidayRDworkedOT,
                specialHolidayRDworkedOTpay,
                totalOvertime:
                    regularOTpay +
                    restDayOtPay +
                    restDayOtExcessPay +
                    regularHolidayWorkedPay +
                    regularHolidayWorkedExcessPay +
                    specialHolidayWorkedPay +
                    specialHolidayWorkedOTpay +
                    specialHolidayRDworkedPay +
                    specialHolidayRDworkedOTpay,
            },
            salaryAdjustments: { 
                unpaid: form.unpaid, 
                unpaidAmount: form.unpaid * dailyRate, 
                increase: form.increase 
            },
            totalSupplementary: {
                nightDiffHours: form.ndHours,
                nightDiffPay,
                regOTnightDiffHours: form.regOTnightDiffHours,
                regOTnightDiffPay,
                restDayNDhours: form.restDayNDhours,
                restDayNDPay,
                regHolNDHours: form.regHolNDHours,
                regHolNDpay: regHolNDPay,
                specialHolidayNDhours: form.specialHolidayNDhours,
                specialHolidayNDpay,
                totalSupplementaryIncome:
                    nightDiffPay +
                    regOTnightDiffPay +
                    restDayNDPay +
                    regHolNDPay +
                    specialHolidayNDpay,
            },
            grossSalary: { 
                grossSalary, 
                nonTaxableAllowance: form.nonTaxableAllowance, 
                performanceBonus: form.performanceBonus 
            },
            totalDeductions: {
                totalDeductions,
                sssEmployeeShare: form.sssEmployeeShare,
                wisp: form.wisp,
                totalSSScontribution: form.totalSSScontribution,
                phicEmployeeShare: form.phicEmployeeShare,
                hdmfEmployeeShare: form.hdmfEmployeeShare,
                nonTaxableIncome: form.nonTaxableIncome,
                taxableIncome: form.taxableIncome,
                withHoldingTax: form.withHoldingTax,
                sssSalaryLoan: form.sssSalaryLoan,
                hdmfLoan: form.hdmfLoan,
            },
            grandtotal: { grandtotal: netPay },
        });
    }, [form, selectedUser]);

    const handleCreate = async () => {
        if (!selectedUser || !payrollPreview)
            return alert("Select an employee and fill the form.");
        try {
            const res = await payrollAPI.processPayroll(payrollPreview);
            onAdd(res.data.payroll || res.data);
            setOpen(false);
        } catch (err) {
            console.error("Error creating payroll:", err);
        }
    };

    const formFields = Object.keys(form) as (keyof typeof form)[];

    return (
        <>
            <Button onClick={() => setOpen(true)}>Create Payroll</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-7xl w-full">
                    {" "}
                    {/* Wider dialog */}
                    <DialogHeader>
                        <DialogTitle>Create Payroll</DialogTitle>
                    </DialogHeader>

                    {/* Employee Select */}
                    <div className="mb-6">
                        <label className="text-sm font-medium">Select Employee</label>
                        <select
                            value={selectedUser?._id || ""}
                            onChange={(e) =>
                                setSelectedUser(
                                    employees.find((emp) => emp._id === e.target.value)
                                )
                            }
                            className="border rounded px-2 py-1 w-full"
                        >
                            <option value="">-- Choose Employee --</option>
                            {employees.map((emp) => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.firstName} {emp.lastName} ({emp.jobPosition})
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Form Fields Grouped */}
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 py-4">
                        {/* Existing fields */}
                        {formFields.map((key) => (
                            <div key={key} className="flex flex-col">
                                <label className="text-sm capitalize">{key}</label>
                                <input
                                    type="number"
                                    name={key}
                                    value={form[key]}
                                    onChange={handleChange}
                                    className="border rounded px-2 py-1"
                                />
                            </div>
                        ))}

                        {/* Deductions - Editable */}
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">SSS Employee Share</label>
                            <input
                                type="number"
                                name="sssEmployeeShare"
                                value={form.sssEmployeeShare}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">PhilHealth Employee Share</label>
                            <input
                                type="number"
                                name="phicEmployeeShare"
                                value={form.phicEmployeeShare}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">Pag-IBIG Employee Share</label>
                            <input
                                type="number"
                                name="hdmfEmployeeShare"
                                value={form.hdmfEmployeeShare}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">WISP</label>
                            <input
                                type="number"
                                name="wisp"
                                value={form.wisp}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">Total SSS Contribution</label>
                            <input
                                type="number"
                                name="totalSSScontribution"
                                value={form.totalSSScontribution}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">Non-Taxable Income</label>
                            <input
                                type="number"
                                name="nonTaxableIncome"
                                value={form.nonTaxableIncome}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">Taxable Income</label>
                            <input
                                type="number"
                                name="taxableIncome"
                                value={form.taxableIncome}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">Withholding Tax</label>
                            <input
                                type="number"
                                name="withHoldingTax"
                                value={form.withHoldingTax}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">SSS Salary Loan</label>
                            <input
                                type="number"
                                name="sssSalaryLoan"
                                value={form.sssSalaryLoan}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">HDMF Loan</label>
                            <input
                                type="number"
                                name="hdmfLoan"
                                value={form.hdmfLoan}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">Unpaid Days</label>
                            <input
                                type="number"
                                name="unpaid"
                                value={form.unpaid}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">Salary Increase</label>
                            <input
                                type="number"
                                name="increase"
                                value={form.increase}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">Non-Taxable Allowance</label>
                            <input
                                type="number"
                                name="nonTaxableAllowance"
                                value={form.nonTaxableAllowance}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold">Performance Bonus</label>
                            <input
                                type="number"
                                name="performanceBonus"
                                value={form.performanceBonus}
                                onChange={handleChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                    </div>
                    {/* Payroll Preview */}
                    {payrollPreview && (
                        <div className="bg-gray-50 border rounded-lg p-4 mt-4">
                            <h3 className="font-semibold mb-4 text-lg">Payroll Preview</h3>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                                {/* Employee Info */}
                                <div>
                                    <h4 className="font-semibold mb-2">Employee Info</h4>
                                    <ul>
                                        <li>
                                            <b>Full Name:</b> {payrollPreview.employee.fullName}
                                        </li>
                                        <li>
                                            <b>Email:</b> {payrollPreview.employee.email}
                                        </li>
                                        <li>
                                            <b>Position:</b> {payrollPreview.employee.position}
                                        </li>
                                    </ul>
                                </div>

                                {/* Payroll Rate */}
                                <div>
                                    <h4 className="font-semibold mb-2">Payroll Rate</h4>
                                    <ul>
                                        <li>
                                            <b>Monthly:</b>{" "}
                                            {payrollPreview.payrollRate?.monthlyRate.toFixed(2) ?? 0}
                                        </li>
                                        <li>
                                            <b>Daily:</b>{" "}
                                            {payrollPreview.payrollRate?.dailyRate.toFixed(2) ?? 0}
                                        </li>
                                        <li>
                                            <b>Hourly:</b>{" "}
                                            {payrollPreview.payrollRate?.hourlyRate.toFixed(2) ?? 0}
                                        </li>
                                    </ul>
                                </div>

                                {/* Work Days */}
                                <div>
                                    <h4 className="font-semibold mb-2">Work Days</h4>
                                    <ul>
                                        <li>
                                            <b>Regular Days:</b>{" "}
                                            {payrollPreview.workDays?.regularDays ?? 0}
                                        </li>
                                        <li>
                                            <b>Absent Days:</b>{" "}
                                            {payrollPreview.workDays?.absentDays ?? 0}
                                        </li>
                                        <li>
                                            <b>Minutes Late:</b>{" "}
                                            {payrollPreview.workDays?.minsLate ?? 0}
                                        </li>
                                    </ul>
                                </div>

                                {/* Holidays */}
                                <div>
                                    <h4 className="font-semibold mb-2">Holidays</h4>
                                    <ul>
                                        <li>
                                            <b>Reg Holiday Days:</b>{" "}
                                            {payrollPreview.holidays?.regHoliday ?? 0}
                                        </li>
                                        <li>
                                            <b>Reg Holiday Pay:</b>{" "}
                                            {payrollPreview.holidays?.regHolidayPay?.toFixed(2) ?? 0}
                                        </li>
                                        <li>
                                            <b>Spe Holiday Days:</b>{" "}
                                            {payrollPreview.holidays?.speHoliday ?? 0}
                                        </li>
                                        <li>
                                            <b>Spe Holiday Pay:</b>{" "}
                                            {payrollPreview.holidays?.speHolidayPay?.toFixed(2) ?? 0}
                                        </li>
                                    </ul>
                                </div>

                                {/* Total Overtime */}
                                <div>
                                    <h4 className="font-semibold mb-2">Overtime</h4>
                                    <ul>
                                        <li>
                                            <b>Regular OT Hours:</b>{" "}
                                            {payrollPreview.totalOvertime?.regularOT ?? 0}
                                        </li>
                                        <li>
                                            <b>Regular OT Pay:</b>{" "}
                                            {payrollPreview.totalOvertime?.regularOTpay?.toFixed(2) ?? 0}
                                        </li>
                                        <li>
                                            <b>Rest Day OT Hours:</b>{" "}
                                            {payrollPreview.totalOvertime?.restDayOtHours ?? 0}
                                        </li>
                                        <li>
                                            <b>Rest Day OT Pay:</b>{" "}
                                            {payrollPreview.totalOvertime?.restDayOtPay?.toFixed(2) ?? 0}
                                        </li>
                                        <li>
                                            <b>Total OT Pay:</b>{" "}
                                            {payrollPreview.totalOvertime?.totalOvertime?.toFixed(2) ?? 0}
                                        </li>
                                    </ul>
                                </div>

                                {/* Supplementary Income */}
                                <div>
                                    <h4 className="font-semibold mb-2">Supplementary</h4>
                                    <ul>
                                        <li>
                                            <b>Night Diff Hours:</b>{" "}
                                            {payrollPreview.totalSupplementary?.nightDiffHours ?? 0}
                                        </li>
                                        <li>
                                            <b>Night Diff Pay:</b>{" "}
                                            {payrollPreview.totalSupplementary?.nightDiffPay?.toFixed(2) ?? 0}
                                        </li>
                                        <li>
                                            <b>Total Supplementary:</b>{" "}
                                            {payrollPreview.totalSupplementary?.totalSupplementaryIncome?.toFixed(2) ?? 0}
                                        </li>
                                    </ul>
                                </div>

                                {/* Deductions */}
                                <div>
                                    <h4 className="font-semibold mb-2">Deductions</h4>
                                    <ul>
                                        <li>
                                            <b>Total Deductions:</b>{" "}
                                            {payrollPreview.totalDeductions?.totalDeductions?.toFixed(2) ?? 0}
                                        </li>
                                        <li>
                                            <b>SSS:</b>{" "}
                                            {payrollPreview.totalDeductions?.sssEmployeeShare?.toFixed(2) ?? 0}
                                        </li>
                                        <li>
                                            <b>PhilHealth:</b>{" "}
                                            {payrollPreview.totalDeductions?.phicEmployeeShare?.toFixed(2) ?? 0}
                                        </li>
                                        <li>
                                            <b>Pag-IBIG:</b>{" "}
                                            {payrollPreview.totalDeductions?.hdmfEmployeeShare?.toFixed(2) ?? 0}
                                        </li>
                                    </ul>
                                </div>

                                {/* Net Pay */}
                                <div>
                                    <h4 className="font-semibold mb-2">Net Pay</h4>
                                    <ul>
                                        <li>
                                            <b>Grand Total:</b>{" "}
                                            {payrollPreview.grandtotal?.grandtotal?.toFixed(2) ?? 0}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="mt-6">
                        <Button onClick={handleCreate}>Save Payroll</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PayrollModal;
