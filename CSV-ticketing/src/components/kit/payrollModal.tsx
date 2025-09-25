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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  workDays?: {
    regularDays: number;
    absentDays: number;
    minsLate: number;
    totalHoursWorked: number;
    undertimeMinutes: number;
  };
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

  const [form, setForm] = useState({
    monthlyRate: 0,
    sssEmployeeShare: 0,
    wisp: 0,
    hdmfEmployeeShare: 0,
    taxableIncome: 0,
    hdmfLoan: 0,
  });

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
  const [loadingAuto, setLoadingAuto] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const round2 = (n: number) => Math.round((n || 0) * 100) / 100;

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
        email: selectedUser.email || selectedUser.emailAddress || selectedUser.personalEmail || selectedUser?.user?.email || "",
        fullName: `${selectedUser.firstName} ${selectedUser.lastName}`,
        position: selectedUser.jobPosition,
      },
      payrollRate: { userId: selectedUser.userId || selectedUser._id, monthlyRate, dailyRate, hourlyRate },
      pay: { basicPay },
      workDays: {
        regularDays: autoComputed.regularDays,
        absentDays: autoComputed.absentDays,
        minsLate: autoComputed.minsLate,
        totalHoursWorked: autoComputed.totalHoursWorked,
        undertimeMinutes: autoComputed.undertimeMinutes,
      },
      grossSalary: { grossSalary, nonTaxableAllowance: 0, performanceBonus: 0 },
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

  useEffect(() => {
    const run = async () => {
      if (!selectedUser) return;
      try {
        setLoadingAuto(true);
        // Auto-calc for current month-to-date
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = now;
        const toMdY = (d: Date) => {
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const year = d.getFullYear();
          return `${month}/${day}/${year}`;
        };
        const startDate = toMdY(start);
        const endDate = toMdY(end);

        const res = await payrollAPI.autoCalculatePayroll(
          selectedUser.userId || selectedUser._id,
          { startDate, endDate }
        );

        if (res.data?.payroll) {
          const p = res.data.payroll;
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
        setAutoComputed({
          dailyRate: 0,
          hourlyRate: 0,
          totalHoursWorked: 0,
          minsLate: 0,
          undertimeMinutes: 0,
          regularDays: 0,
          absentDays: 0,
        });
      } finally {
        setLoadingAuto(false);
      }
    };
    run();
  }, [selectedUser]);

  const handleCreate = async () => {
    if (!selectedUser || !payrollPreview) return alert("Select an employee and fill the form.");
    try {
      const res = await payrollAPI.processPayroll(payrollPreview as unknown as PayrollPayload);
      onAdd(res.data.payroll || res.data);
      setOpen(false);
    } catch (err) {
      console.error("Error creating payroll:", err);
    }
  };

  const handleSendPayroll = async () => {
    if (!selectedUser || !payrollPreview) return alert("Select an employee and fill the form.");

    const confirmSend = window.confirm(
      `Are you sure you want to send this payroll to ${selectedUser.firstName} ${selectedUser.lastName}?\n\nThis will:\n- Send the payroll to the employee\n- Reset payroll calculations for next cycle\n- Keep their monthly rate and deductions\n- Preserve time tracker data (continues accumulating)`
    );

    if (!confirmSend) return;

    try {
      const res = await payrollAPI.processPayroll(payrollPreview as unknown as PayrollPayload);
      await payrollAPI.sendPayroll(selectedUser.userId || selectedUser._id, {
        payrollId: res.data.payroll?._id || res.data._id
      });

      <Alert variant="default">
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          Payroll sent successfully! Calculations reset for next cycle. Time tracker data preserved.
        </AlertDescription>
      </Alert>

      onAdd(res.data.payroll || res.data);
      setOpen(false);
    } catch (err) {
      console.error("Error sending payroll:", err);
      alert("Error sending payroll. Please try again.");
    }
  };

  // Calculate values for the math breakdown
  const hourlyRate = round2(((form.monthlyRate || 0) / 26) / 8);
  const basicPay = round2(autoComputed.totalHoursWorked * hourlyRate);
  const lateDeduction = round2((autoComputed.minsLate / 60) * hourlyRate);
  const totalDeductions = round2(
    form.sssEmployeeShare + form.wisp + form.hdmfEmployeeShare +
    form.taxableIncome + form.hdmfLoan + lateDeduction
  );
  const netPay = round2(basicPay - totalDeductions);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Payroll</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Create Payroll
              {selectedUser && (
                <Badge variant="secondary">
                  {selectedUser.firstName} {selectedUser.lastName}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Employee Selection and Form */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employee Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="employee">Select Employee</Label>
                      <Select
                        value={selectedUser?._id || ""}
                        onValueChange={(value) => setSelectedUser(employees.find((emp) => emp._id === value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose employee..." />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp._id} value={emp._id}>
                              {emp.firstName} {emp.lastName} • {emp.jobPosition}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedUser && (
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Position: <span className="font-normal">{selectedUser.jobPosition}</span></div>
                        <div>Email: <span className="font-normal">{selectedUser.email}</span></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedUser && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payroll Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Rates Section */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm border-b pb-1">Rates & Hours</h4>
                        {loadingAuto && (
                          <div className="text-xs text-gray-500">Auto-calculating from time tracker…</div>
                        )}
                        <div>
                          <Label htmlFor="monthlyRate">Monthly Rate</Label>
                          <Input
                            id="monthlyRate"
                            type="number"
                            name="monthlyRate"
                            value={form.monthlyRate}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Daily Rate (Auto)</Label>
                            <Input value={round2((form.monthlyRate || 0) / 26)} disabled className="bg-muted" />
                          </div>
                          <div>
                            <Label className="text-xs">Hourly Rate (Auto)</Label>
                            <Input value={round2(((form.monthlyRate || 0) / 26) / 8)} disabled className="bg-muted" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Hours Worked (Auto)</Label>
                            <Input value={round2(autoComputed.totalHoursWorked || 0)} disabled className="bg-muted" />
                          </div>
                          <div>
                            <Label className="text-xs">Late Minutes (Auto)</Label>
                            <Input value={autoComputed.minsLate || 0} disabled className="bg-muted" />
                          </div>
                        </div>
                      </div>

                      {/* Deductions Section */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm border-b pb-1">Deductions</h4>
                        {[
                          {
                            id: "sssEmployeeShare",
                            label: "SSS"
                          },
                          {
                            id: "wisp",
                            label: "WISP"
                          },
                          { id: "hdmfEmployeeShare", label: "PAG-IBIG" },
                          { id: "taxableIncome", label: "TAXABLE INCOME" },
                          { id: "hdmfLoan", label: "HDMF LOAN" },
                        ].map((field) => (
                          <div key={field.id}>
                            <Label htmlFor={field.id}>{field.label}</Label>
                            <Input
                              id={field.id}
                              type="number"
                              name={field.id}
                              value={form[field.id as keyof typeof form]}
                              onChange={handleChange}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Preview */}
            <div className="lg:col-span-1">
              {payrollPreview && (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Payroll Breakdown
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        PHP {netPay.toFixed(2)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {/* Earnings */}
                      <div className="space-y-2">
                        <div className="font-medium text-green-600">EARNINGS</div>
                        <div className="flex justify-between">
                          <span>Basic Pay ({autoComputed.totalHoursWorked.toFixed(1)}h × {hourlyRate.toFixed(2)})</span>
                          <span>+ {basicPay.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div className="space-y-2 border-t pt-2">
                        <div className="font-medium text-red-600">DEDUCTIONS</div>
                        {form.sssEmployeeShare > 0 && (
                          <div className="flex justify-between">
                            <span>SSS</span>
                            <span>- {form.sssEmployeeShare.toFixed(2)}</span>
                          </div>
                        )}
                        {form.wisp > 0 && (
                          <div className="flex justify-between">
                            <span>WISP</span>
                            <span>- {form.wisp.toFixed(2)}</span>
                          </div>
                        )}
                        {form.hdmfEmployeeShare > 0 && (
                          <div className="flex justify-between">
                            <span>PAG-IBIG</span>
                            <span>- {form.hdmfEmployeeShare.toFixed(2)}</span>
                          </div>
                        )}
                        {form.taxableIncome > 0 && (
                          <div className="flex justify-between">
                            <span>Taxable Income</span>
                            <span>- {form.taxableIncome.toFixed(2)}</span>
                          </div>
                        )}
                        {form.hdmfLoan > 0 && (
                          <div className="flex justify-between">
                            <span>HDMF Loan</span>
                            <span>- {form.hdmfLoan.toFixed(2)}</span>
                          </div>
                        )}
                        {lateDeduction > 0 && (
                          <div className="flex justify-between">
                            <span>Late Deduction ({autoComputed.minsLate}m)</span>
                            <span>- {lateDeduction.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Total Calculation */}
                      <div className="border-t pt-2 space-y-1">
                        <div className="flex justify-between font-medium">
                          <span>Gross Salary</span>
                          <span>{basicPay.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total Deductions</span>
                          <span className="text-red-600">- {totalDeductions.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-1 text-base">
                          <span>NET PAY</span>
                          <span className="text-green-600">PHP {netPay.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleCreate} disabled={!selectedUser}>
              Save Draft
            </Button>
            <Button onClick={handleSendPayroll} disabled={!selectedUser} className="bg-green-600 hover:bg-green-700">
              Send Payroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PayrollModal;