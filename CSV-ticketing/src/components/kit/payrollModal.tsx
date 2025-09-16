/* eslint-disable @typescript-eslint/no-explicit-any */
import { payrollAPI, PayrollPayload, UserProfileAPI } from "@/API/endpoint";
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
  _id: string;
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  jobPosition: string;
  email: string;
  fullName?: string;
}

export interface Payroll {
  _id?: string;
  employee: UserProfile & {
    email?: string;
    fullName?: string;
    position?: string;
  };
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
type PayrollModal = Payroll & {
  _id?: string;
  basicSalary: number;
};

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
    totalHoursWorked: 0,
    undertimeMinutes: 0,
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

  console.log("Selected User:", selectedUser);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const round2 = (n: number) => Math.round((n || 0) * 100) / 100;

  // Payroll preview
  useEffect(() => {
    if (!selectedUser) return;

    const monthlyRate = round2(form.monthlyRate || 0);
    const dailyRate = round2(monthlyRate / 26);
    const hourlyRate = round2(dailyRate / 8);

    const basicPay = round2(form.regularDays * dailyRate);
    const absentDeduction = round2(form.absentDays * dailyRate);
    const lateDeduction = round2((form.minsLate / 60) * hourlyRate);

    const regHolidayPay = round2(form.regHoliday * dailyRate);
    const speHolidayPay = round2(form.speHoliday * dailyRate * 0.3);

    const regularOTpay = round2(form.regularOT * hourlyRate * 1.25);
    const restDayOtPay = round2(form.restDayOT * hourlyRate * 1.3);
    const restDayOtExcessPay = round2(form.restDayOTExcess * hourlyRate * 1.5);
    const regularHolidayWorkedPay = round2(
      form.regularHolidayWorked * dailyRate * 2
    );
    const regularHolidayWorkedExcessPay = round2(
      form.regularHolidayWorkedExcess * hourlyRate * 2.6
    );
    const specialHolidayWorkedPay = round2(
      form.specialHolidayWorked * dailyRate * 1.3
    );
    const specialHolidayWorkedOTpay = round2(
      form.specialHolidayWorkedOT * hourlyRate * 1.69
    );
    const specialHolidayRDworkedPay = round2(
      form.specialHolidayRDworkedHours * hourlyRate * 1.69
    );
    const specialHolidayRDworkedOTpay = round2(
      form.specialHolidayRDworkedOT * hourlyRate * 2
    );

    const nightDiffPay = round2(form.ndHours * hourlyRate * 0.1);
    const regOTnightDiffPay = round2(
      form.regOTnightDiffHours * hourlyRate * 0.1
    );
    const restDayNDPay = round2(form.restDayNDhours * hourlyRate * 0.1);
    const regHolNDPay = round2(form.regHolNDHours * hourlyRate * 0.1);
    const specialHolidayNDpay = round2(
      form.specialHolidayNDhours * hourlyRate * 0.1
    );

    const grossSalary = round2(
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
        (form.increase || 0) +
        (form.nonTaxableAllowance || 0) +
        (form.performanceBonus || 0)
    );

    const totalDeductions = round2(
      absentDeduction +
        lateDeduction +
        (form.sssEmployeeShare || 0) +
        (form.phicEmployeeShare || 0) +
        (form.hdmfEmployeeShare || 0) +
        (form.wisp || 0) +
        (form.totalSSScontribution || 0) +
        (form.withHoldingTax || 0) +
        (form.sssSalaryLoan || 0) +
        (form.hdmfLoan || 0) +
        form.unpaid * dailyRate
    );
    const netPay = round2(grossSalary - totalDeductions);

    setPayrollPreview({
      employee: {
        ...selectedUser,
        email:
          (selectedUser.email as string) ||
          (selectedUser.emailAddress as string) ||
          (selectedUser.personalEmail as string) ||
          (selectedUser?.user?.email as string) ||
          "",
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
        totalHoursWorked: form.totalHoursWorked,
        undertimeMinutes: form.undertimeMinutes,
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
        increase: form.increase,
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
        performanceBonus: form.performanceBonus,
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

  const handleAutoCalculate = async () => {
    if (!selectedUser) return alert("Please select an employee first.");
    
    try {
      // Get current month date range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Format dates as strings (MM/DD/YYYY)
      const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };
      
      const startDate = formatDate(startOfMonth);
      const endDate = formatDate(endOfMonth);
      
      const res = await payrollAPI.autoCalculatePayroll(selectedUser.userId || selectedUser._id, {
        startDate,
        endDate
      });
      
      // Update form with auto-calculated data
      if (res.data.payroll) {
        const payroll = res.data.payroll;
        setForm(prev => ({
          ...prev,
          monthlyRate: payroll.payrollRate?.monthlyRate || 0,
          regularDays: payroll.workDays?.regularDays || 0,
          absentDays: payroll.workDays?.absentDays || 0,
          minsLate: payroll.workDays?.minsLate || 0,
          totalHoursWorked: payroll.workDays?.totalHoursWorked || 0,
          undertimeMinutes: payroll.workDays?.undertimeMinutes || 0,
        }));
      }
      
      alert("Payroll data auto-calculated successfully!");
    } catch (err) {
      console.error("Error auto-calculating payroll:", err);
      alert("Failed to auto-calculate payroll data. Please check if the employee has time tracker and schedule data.");
    }
  };

  const handleCreate = async () => {
    if (!selectedUser || !payrollPreview)
      return alert("Select an employee and fill the form.");
    try {
      const res = await payrollAPI.processPayroll(
        payrollPreview as unknown as PayrollPayload
      );
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
        <DialogContent className="max-w-[90vw] w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Payroll</DialogTitle>
          </DialogHeader>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-2">
              {/* Employee Select */}
              <div className="mb-6">
                <label className="text-sm font-medium">Select Employee</label>
                <div className="flex gap-2">
                  <select
                    value={selectedUser?._id || ""}
                    onChange={(e) =>
                      setSelectedUser(
                        employees.find((emp) => emp._id === e.target.value)
                      )
                    }
                    className="border rounded px-2 py-1 flex-1"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} ({emp.jobPosition})
                      </option>
                    ))}
                  </select>
                  <Button 
                    type="button" 
                    onClick={handleAutoCalculate}
                    variant="outline"
                    disabled={!selectedUser}
                  >
                    Auto-Calculate
                  </Button>
                </div>
              </div>
              {/* Form Fields Grouped */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 py-4">
                {/* Auto-calculated fields (disabled) */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600">Daily Rate (Auto)</label>
                  <input
                    type="number"
                    value={round2(form.monthlyRate / 26)}
                    disabled
                    className="border rounded px-2 py-1 bg-gray-100 text-gray-600"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600">Hourly Rate (Auto)</label>
                  <input
                    type="number"
                    value={round2((form.monthlyRate / 26) / 8)}
                    disabled
                    className="border rounded px-2 py-1 bg-gray-100 text-gray-600"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600">Hours Worked (Auto)</label>
                  <input
                    type="number"
                    value={form.totalHoursWorked}
                    disabled
                    className="border rounded px-2 py-1 bg-gray-100 text-gray-600"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600">Late Minutes (Auto)</label>
                  <input
                    type="number"
                    value={form.minsLate}
                    disabled
                    className="border rounded px-2 py-1 bg-gray-100 text-gray-600"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600">Undertime Minutes (Auto)</label>
                  <input
                    type="number"
                    value={form.undertimeMinutes}
                    disabled
                    className="border rounded px-2 py-1 bg-gray-100 text-gray-600"
                  />
                </div>
                
                {/* Editable fields */}
                {formFields.filter(key => !['totalHoursWorked', 'undertimeMinutes'].includes(key)).map((key) => (
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
                  <label className="text-sm font-semibold">
                    SSS Employee Share
                  </label>
                  <input
                    type="number"
                    name="sssEmployeeShare"
                    value={form.sssEmployeeShare}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">
                    PhilHealth Employee Share
                  </label>
                  <input
                    type="number"
                    name="phicEmployeeShare"
                    value={form.phicEmployeeShare}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">
                    Pag-IBIG Employee Share
                  </label>
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
                  <label className="text-sm font-semibold">
                    Total SSS Contribution
                  </label>
                  <input
                    type="number"
                    name="totalSSScontribution"
                    value={form.totalSSScontribution}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">
                    Non-Taxable Income
                  </label>
                  <input
                    type="number"
                    name="nonTaxableIncome"
                    value={form.nonTaxableIncome}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">
                    Taxable Income
                  </label>
                  <input
                    type="number"
                    name="taxableIncome"
                    value={form.taxableIncome}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">
                    Withholding Tax
                  </label>
                  <input
                    type="number"
                    name="withHoldingTax"
                    value={form.withHoldingTax}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">
                    SSS Salary Loan
                  </label>
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
                  <label className="text-sm font-semibold">
                    Salary Increase
                  </label>
                  <input
                    type="number"
                    name="increase"
                    value={form.increase}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">
                    Non-Taxable Allowance
                  </label>
                  <input
                    type="number"
                    name="nonTaxableAllowance"
                    value={form.nonTaxableAllowance}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">
                    Performance Bonus
                  </label>
                  <input
                    type="number"
                    name="performanceBonus"
                    value={form.performanceBonus}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
              </div>
            </div>
            {/* Right: Preview */}
            <aside className="lg:col-span-1">
              {payrollPreview && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h3 className="font-semibold mb-4 text-lg">
                    Payroll Preview
                  </h3>
                  <div className="grid grid-cols-1 gap-4 text-sm">
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
                    <div>
                      <h4 className="font-semibold mb-2">Payroll Rate</h4>
                      <ul>
                        <li>
                          <b>Monthly:</b>{" "}
                          {payrollPreview.payrollRate?.monthlyRate.toFixed(2) ??
                            0}
                        </li>
                        <li>
                          <b>Daily:</b>{" "}
                          {payrollPreview.payrollRate?.dailyRate.toFixed(2) ??
                            0}
                        </li>
                        <li>
                          <b>Hourly:</b>{" "}
                          {payrollPreview.payrollRate?.hourlyRate.toFixed(2) ??
                            0}
                        </li>
                      </ul>
                    </div>
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
                        <li>
                          <b>Hours Worked:</b>{" "}
                          {payrollPreview.workDays?.totalHoursWorked?.toFixed(2) ?? 0}
                        </li>
                        <li>
                          <b>Undertime Minutes:</b>{" "}
                          {payrollPreview.workDays?.undertimeMinutes ?? 0}
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Holidays</h4>
                      <ul>
                        <li>
                          <b>Reg Holiday Days:</b>{" "}
                          {payrollPreview.holidays?.regHoliday ?? 0}
                        </li>
                        <li>
                          <b>Reg Holiday Pay:</b>{" "}
                          {payrollPreview.holidays?.regHolidayPay?.toFixed(2) ??
                            0}
                        </li>
                        <li>
                          <b>Spe Holiday Days:</b>{" "}
                          {payrollPreview.holidays?.speHoliday ?? 0}
                        </li>
                        <li>
                          <b>Spe Holiday Pay:</b>{" "}
                          {payrollPreview.holidays?.speHolidayPay?.toFixed(2) ??
                            0}
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Overtime</h4>
                      <ul>
                        <li>
                          <b>Regular OT Hours:</b>{" "}
                          {payrollPreview.totalOvertime?.regularOT ?? 0}
                        </li>
                        <li>
                          <b>Regular OT Pay:</b>{" "}
                          {payrollPreview.totalOvertime?.regularOTpay?.toFixed(
                            2
                          ) ?? 0}
                        </li>
                        <li>
                          <b>Rest Day OT Hours:</b>{" "}
                          {payrollPreview.totalOvertime?.restDayOtHours ?? 0}
                        </li>
                        <li>
                          <b>Rest Day OT Pay:</b>{" "}
                          {payrollPreview.totalOvertime?.restDayOtPay?.toFixed(
                            2
                          ) ?? 0}
                        </li>
                        <li>
                          <b>Total OT Pay:</b>{" "}
                          {payrollPreview.totalOvertime?.totalOvertime?.toFixed(
                            2
                          ) ?? 0}
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Supplementary</h4>
                      <ul>
                        <li>
                          <b>Night Diff Hours:</b>{" "}
                          {payrollPreview.totalSupplementary?.nightDiffHours ??
                            0}
                        </li>
                        <li>
                          <b>Night Diff Pay:</b>{" "}
                          {payrollPreview.totalSupplementary?.nightDiffPay?.toFixed(
                            2
                          ) ?? 0}
                        </li>
                        <li>
                          <b>Total Supplementary:</b>{" "}
                          {payrollPreview.totalSupplementary?.totalSupplementaryIncome?.toFixed(
                            2
                          ) ?? 0}
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Deductions</h4>
                      <ul>
                        <li>
                          <b>Total Deductions:</b>{" "}
                          {payrollPreview.totalDeductions?.totalDeductions?.toFixed(
                            2
                          ) ?? 0}
                        </li>
                        <li>
                          <b>SSS:</b>{" "}
                          {payrollPreview.totalDeductions?.sssEmployeeShare?.toFixed(
                            2
                          ) ?? 0}
                        </li>
                        <li>
                          <b>PhilHealth:</b>{" "}
                          {payrollPreview.totalDeductions?.phicEmployeeShare?.toFixed(
                            2
                          ) ?? 0}
                        </li>
                        <li>
                          <b>Pag-IBIG:</b>{" "}
                          {payrollPreview.totalDeductions?.hdmfEmployeeShare?.toFixed(
                            2
                          ) ?? 0}
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Net Pay</h4>
                      <ul>
                        <li>
                          <b>Grand Total:</b>{" "}
                          {payrollPreview.grandtotal?.grandtotal?.toFixed(2) ??
                            0}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={handleCreate}>Save Payroll</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PayrollModal;
