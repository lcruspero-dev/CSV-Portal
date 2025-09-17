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

  // Minimal form (only requested editable fields)
  const [form, setForm] = useState({
    monthlyRate: 0,
    sssEmployeeShare: 0,
    wisp: 0,
    hdmfEmployeeShare: 0, // Pag-IBIG
    taxableIncome: 0,
    hdmfLoan: 0,
  });

  // Auto-computed fields fetched from backend (disabled in UI, not editable)
  const [autoComputed, setAutoComputed] = useState({
    dailyRate: 0,
    hourlyRate: 0,
    totalHoursWorked: 0,
    minsLate: 0,
    undertimeMinutes: 0,
    regularDays: 0,
    absentDays: 0,
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

  // Payroll preview (uses auto-computed values and selected deductions only)
  useEffect(() => {
    if (!selectedUser) return;

    const monthlyRate = round2(form.monthlyRate || 0);
    const dailyRate = round2(monthlyRate / 26);
    const hourlyRate = round2(dailyRate / 8);

    const basicPay = round2(autoComputed.totalHoursWorked * hourlyRate);
    const lateDeduction = round2((autoComputed.minsLate / 60) * hourlyRate);

    const grossSalary = round2(basicPay);

    const totalDeductions = round2(
      (form.sssEmployeeShare || 0) +
        (form.wisp || 0) +
        (form.hdmfEmployeeShare || 0) +
        (form.taxableIncome || 0) +
        (form.hdmfLoan || 0) +
        lateDeduction
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
        regularDays: autoComputed.regularDays,
        absentDays: autoComputed.absentDays,
        minsLate: autoComputed.minsLate,
        totalHoursWorked: autoComputed.totalHoursWorked,
        undertimeMinutes: autoComputed.undertimeMinutes,
      },
      grossSalary: {
        grossSalary,
        nonTaxableAllowance: 0,
        performanceBonus: 0,
      },
      totalDeductions: {
        totalDeductions,
        sssEmployeeShare: form.sssEmployeeShare,
        wisp: form.wisp,
        hdmfEmployeeShare: form.hdmfEmployeeShare,
        taxableIncome: form.taxableIncome,
        hdmfLoan: form.hdmfLoan,
      },
      grandtotal: { grandtotal: netPay },
    });
  }, [form, selectedUser, autoComputed]);

  // Auto-fetch computed data when employee changes (no button)
  useEffect(() => {
    const run = async () => {
      if (!selectedUser) return;
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const formatDate = (date: Date) => {
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        };
        const startDate = formatDate(startOfMonth);
        const endDate = formatDate(endOfMonth);

        console.log('Auto-fetching payroll data for:', selectedUser.firstName, selectedUser.lastName);
        console.log('Date range:', startDate, 'to', endDate);

        const res = await payrollAPI.autoCalculatePayroll(
          selectedUser.userId || selectedUser._id,
          { startDate, endDate }
        );

        console.log('Auto-fetch response:', res.data);

        if (res.data?.payroll) {
          const p = res.data.payroll;
          console.log('Setting auto-computed values:', {
            totalHoursWorked: p.workDays?.totalHoursWorked,
            minsLate: p.workDays?.minsLate,
            undertimeMinutes: p.workDays?.undertimeMinutes,
            regularDays: p.workDays?.regularDays,
            absentDays: p.workDays?.absentDays,
          });

          setAutoComputed({
            dailyRate: p.payrollRate?.dailyRate || 0,
            hourlyRate: p.payrollRate?.hourlyRate || 0,
            totalHoursWorked: p.workDays?.totalHoursWorked || 0,
            minsLate: p.workDays?.minsLate || 0,
            undertimeMinutes: p.workDays?.undertimeMinutes || 0,
            regularDays: p.workDays?.regularDays || 0,
            absentDays: p.workDays?.absentDays || 0,
          });

          setForm(prev => ({
            ...prev,
            monthlyRate: p.payrollRate?.monthlyRate ?? prev.monthlyRate,
          }));
        } else {
          console.log('No payroll data found, setting defaults');
          setAutoComputed({
            dailyRate: 0,
            hourlyRate: 0,
            totalHoursWorked: 0,
            minsLate: 0,
            undertimeMinutes: 0,
            regularDays: 0,
            absentDays: 0,
          });
        }
      } catch (err) {
        console.error('Auto-fetch payroll data failed:', err);
        // Set defaults on error
        setAutoComputed({
          dailyRate: 0,
          hourlyRate: 0,
          totalHoursWorked: 0,
          minsLate: 0,
          undertimeMinutes: 0,
          regularDays: 0,
          absentDays: 0,
        });
      }
    };
    run();
  }, [selectedUser]);

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

  const handleSendPayroll = async () => {
    if (!selectedUser || !payrollPreview)
      return alert("Select an employee and fill the form.");
    
    const confirmSend = window.confirm(
      `Are you sure you want to send this payroll to ${selectedUser.firstName} ${selectedUser.lastName}?\n\nThis will:\n- Send the payroll to the employee\n- Reset payroll calculations for next cycle\n- Keep their monthly rate and deductions\n- Preserve time tracker data (continues accumulating)`
    );
    
    if (!confirmSend) return;

    try {
      // First, create/update the payroll
      const res = await payrollAPI.processPayroll(
        payrollPreview as unknown as PayrollPayload
      );
      
      // Then send the payroll (resets calculations only)
      await payrollAPI.sendPayroll(
        selectedUser.userId || selectedUser._id,
        { 
          payrollId: res.data.payroll?._id || res.data._id
        }
      );
      
      alert("Payroll sent successfully! Calculations reset for next cycle. Time tracker data preserved.");
      onAdd(res.data.payroll || res.data);
      setOpen(false);
    } catch (err) {
      console.error("Error sending payroll:", err);
      alert("Error sending payroll. Please try again.");
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
                </div>
              </div>
              {/* Form Fields (only required ones) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">Monthly Rate</label>
                  <input
                    type="number"
                    name="monthlyRate"
                    value={form.monthlyRate}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
                {/* Auto (disabled) derived from monthly rate */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600">Daily Rate (Auto)</label>
                  <input
                    type="number"
                    value={round2((form.monthlyRate || 0) / 26)}
                    disabled
                    className="border rounded px-2 py-1 bg-gray-100 text-gray-600"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600">Hourly Rate (Auto)</label>
                  <input
                    type="number"
                    value={round2(((form.monthlyRate || 0) / 26) / 8)}
                    disabled
                    className="border rounded px-2 py-1 bg-gray-100 text-gray-600"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600">Hours Worked (Auto)</label>
                  <input
                    type="number"
                    value={round2(autoComputed.totalHoursWorked || 0)}
                    disabled
                    className="border rounded px-2 py-1 bg-gray-100 text-gray-600"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">SSS</label>
                  <input
                    type="number"
                    name="sssEmployeeShare"
                    value={form.sssEmployeeShare}
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
                  <label className="text-sm font-semibold">PAG-IBIG</label>
                  <input
                    type="number"
                    name="hdmfEmployeeShare"
                    value={form.hdmfEmployeeShare}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">TAXABLE INCOME</label>
                  <input
                    type="number"
                    name="taxableIncome"
                    value={form.taxableIncome}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">HDMF LOAN</label>
                  <input
                    type="number"
                    name="hdmfLoan"
                    value={form.hdmfLoan}
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
                      <ul className="space-y-1">
                        <li>
                          <b>Monthly Rate:</b> {payrollPreview.payrollRate?.monthlyRate.toFixed(2) ?? 0}
                        </li>
                        <li>
                          <b>Hours Worked:</b> {payrollPreview.workDays?.totalHoursWorked?.toFixed(2) ?? 0}
                        </li>
                        <li>
                          <b>SSS:</b> {payrollPreview.totalDeductions?.sssEmployeeShare?.toFixed(2) ?? 0}
                        </li>
                        <li>
                          <b>WISP:</b> {payrollPreview.totalDeductions?.wisp?.toFixed(2) ?? 0}
                        </li>
                        <li>
                          <b>PAG-IBIG:</b> {payrollPreview.totalDeductions?.hdmfEmployeeShare?.toFixed(2) ?? 0}
                        </li>
                        <li>
                          <b>TAXABLE INCOME:</b> {payrollPreview.totalDeductions?.taxableIncome?.toFixed(2) ?? 0}
                        </li>
                        <li>
                          <b>HDMF LOAN:</b> {payrollPreview.totalDeductions?.hdmfLoan?.toFixed(2) ?? 0}
                        </li>
                        <li className="pt-2">
                          <b>Net Pay:</b> {payrollPreview.grandtotal?.grandtotal?.toFixed(2) ?? 0}
                        </li>
                        <li>
                          <b>Grand Total:</b> 0.00
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
          <DialogFooter className="mt-6">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCreate}>
                Save Payroll
              </Button>
              <Button onClick={handleSendPayroll} className="bg-green-600 hover:bg-green-700">
                Send Payroll
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PayrollModal;
