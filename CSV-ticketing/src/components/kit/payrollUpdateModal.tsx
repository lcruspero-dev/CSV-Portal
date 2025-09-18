/* eslint-disable @typescript-eslint/no-explicit-any */
import { payrollAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import type { Payroll } from "./payrollModal";

interface Props {
  payroll: Payroll;
  onUpdated?: (updated: Payroll) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type PayrollPayload = Payroll & {
  _id?: string;
  basicSalary: number;
};

const formSections = [
  {
    title: "Payroll Rates",
    fields: [
      { path: "payrollRate.monthlyRate", label: "Monthly Rate", editable: true },
      { path: "payrollRate.dailyRate", label: "Daily Rate (Auto)", editable: false },
      { path: "payrollRate.hourlyRate", label: "Hourly Rate (Auto)", editable: false },
    ],
  },
  {
    title: "Work Days",
    fields: [
      { path: "workDays.regularDays", label: "Regular Days (Auto)", editable: false },
      { path: "workDays.absentDays", label: "Absent Days (Auto)", editable: false },
      { path: "workDays.minsLate", label: "Minutes Late (Auto)", editable: false },
      { path: "workDays.totalHoursWorked", label: "Hours Worked (Auto)", editable: false },
      { path: "workDays.undertimeMinutes", label: "Undertime Minutes (Auto)", editable: false },
    ],
  },
  {
    title: "Overtime",
    fields: [
      { path: "totalOvertime.regularOT", label: "Regular OT Hours" },
      { path: "totalOvertime.restDayOtHours", label: "Rest Day OT Hours" },
      {
        path: "totalOvertime.restDayOtHoursExcess",
        label: "Rest Day OT Excess Hours",
      },
      {
        path: "totalOvertime.regularHolidayWorked",
        label: "Regular Holiday Worked",
      },
      {
        path: "totalOvertime.regularHolidayWorkedExcess",
        label: "Regular Holiday Worked Excess",
      },
      {
        path: "totalOvertime.specialHolidayWorked",
        label: "Special Holiday Worked",
      },
      {
        path: "totalOvertime.specialHolidayWorkedOT",
        label: "Special Holiday Worked OT",
      },
      {
        path: "totalOvertime.specialHolidayRDworkedHours",
        label: "Special Holiday RD Worked Hours",
      },
      {
        path: "totalOvertime.specialHolidayRDworkedOT",
        label: "Special Holiday RD Worked OT",
      },
    ],
  },
  {
    title: "Holidays",
    fields: [
      { path: "holidays.regHoliday", label: "Regular Holidays (days)" },
      { path: "holidays.regHolidayPay", label: "Regular Holiday Pay (Auto)", editable: false },
      { path: "holidays.speHoliday", label: "Special Holidays (days)" },
      { path: "holidays.speHolidayPay", label: "Special Holiday Pay (Auto)", editable: false },
    ],
  },
  {
    title: "Night Differential",
    fields: [
      { path: "totalSupplementary.nightDiffHours", label: "Night Diff Hours" },
      {
        path: "totalSupplementary.regOTnightDiffHours",
        label: "Reg OT Night Diff Hours",
      },
      {
        path: "totalSupplementary.restDayNDhours",
        label: "Rest Day Night Diff Hours",
      },
      {
        path: "totalSupplementary.regHolNDHours",
        label: "Reg Holiday Night Diff Hours",
      },
      {
        path: "totalSupplementary.specialHolidayNDhours",
        label: "Special Holiday Night Diff Hours",
      },
    ],
  },
  {
    title: "Deductions",
    fields: [
      { path: "totalDeductions.sssEmployeeShare", label: "SSS Employee Share" },
      {
        path: "totalDeductions.phicEmployeeShare",
        label: "PhilHealth Employee Share",
      },
      {
        path: "totalDeductions.hdmfEmployeeShare",
        label: "Pag-IBIG Employee Share",
      },
      { path: "totalDeductions.wisp", label: "WISP" },
      {
        path: "totalDeductions.totalSSScontribution",
        label: "Total SSS Contribution",
      },
      { path: "totalDeductions.nonTaxableIncome", label: "Non-Taxable Income" },
      { path: "totalDeductions.taxableIncome", label: "Taxable Income" },
      { path: "totalDeductions.withHoldingTax", label: "Withholding Tax" },
      { path: "totalDeductions.sssSalaryLoan", label: "SSS Salary Loan" },
      { path: "totalDeductions.hdmfLoan", label: "HDMF Loan" },
    ],
  },
  {
    title: "Salary Adjustments",
    fields: [
      { path: "salaryAdjustments.unpaid", label: "Unpaid Days" },
      { path: "salaryAdjustments.unpaidAmount", label: "Unpaid Amount" },
      { path: "salaryAdjustments.increase", label: "Salary Increase" },
    ],
  },
  {
    title: "Gross Salary",
    fields: [
      {
        path: "grossSalary.nonTaxableAllowance",
        label: "Non-Taxable Allowance",
      },
      { path: "grossSalary.performanceBonus", label: "Performance Bonus" },
      { path: "grossSalary.grossSalary", label: "Gross Salary (Auto)", editable: false },
    ],
  },
  {
    title: "Totals (Computed)",
    fields: [{ path: "grandtotal.grandtotal", label: "Net Pay (Auto)", editable: false }],
  },
];

const UpdatePayrollModal = ({
  payroll,
  onUpdated,
  open,
  onOpenChange,
}: Props) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? (open as boolean) : internalOpen;
  const setOpen = (next: boolean) => {
    if (isControlled) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onOpenChange && onOpenChange(next);
    } else {
      setInternalOpen(next);
    }
  };
  const [formData, setFormData] = useState<Payroll>(payroll);

  // keep form data in sync when switching rows
  useEffect(() => {
    setFormData(payroll);
  }, [payroll]);

  // ✅ handle deep updates
  const handleChange = (path: string, value: any) => {
    setFormData((prev) => {
      const newData: any = { ...prev };
      const keys = path.split(".");
      let obj = newData;

      keys.forEach((key, idx) => {
        if (idx === keys.length - 1) {
          obj[key] = value;
        } else {
          obj[key] = { ...obj[key] };
          obj = obj[key];
        }
      });

      return newData;
    });
  };

  const getValue = (obj: any, path: string) => {
    // Auto-derive daily/hourly from monthly rate for display
    if (path === "payrollRate.dailyRate") {
      const monthly = Number(obj?.payrollRate?.monthlyRate ?? 0);
      return Math.round(((monthly / 26) || 0) * 100) / 100;
    }
    if (path === "payrollRate.hourlyRate") {
      const monthly = Number(obj?.payrollRate?.monthlyRate ?? 0);
      const daily = monthly / 26;
      return Math.round((((daily / 8) || 0) * 100)) / 100;
    }
    return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? 0;
  };

  const handleUpdate = async () => {
    try {
      // Ensure payrollRate is included with auto-derived daily/hourly
      const monthly = Number(formData.payrollRate?.monthlyRate ?? 0);
      const daily = monthly / 26;
      const hourly = daily / 8;

      const payload: Partial<PayrollPayload> = {
        payrollRate: {
          ...(formData.payrollRate as any),
          monthlyRate: monthly,
          dailyRate: Math.round((daily || 0) * 100) / 100,
          hourlyRate: Math.round((hourly || 0) * 100) / 100,
        } as any,
        pay: { basicPay: preview.basicPay },
        holidays: {
          ...(formData.holidays as any),
          regHoliday: formData.holidays?.regHoliday ?? 0,
          speHoliday: formData.holidays?.speHoliday ?? 0,
          regHolidayPay: preview.regHolidayPay,
          speHolidayPay: preview.speHolidayPay,
        } as any,
        totalOvertime: {
          ...(formData.totalOvertime as any),
          regularOTpay: preview.regularOTpay,
          restDayOtPay: preview.restDayOtPay,
          restDayOtHoursExcessPay: preview.restDayOtExcessPay,
          regularHolidayWorkedPay: preview.regularHolidayWorkedPay,
          regularHolidayWorkedExcessPay: preview.regularHolidayWorkedExcessPay,
          specialHolidayWorkedPay: preview.specialHolidayWorkedPay,
          specialHolidayWorkedOTpay: preview.specialHolidayWorkedOTpay,
          specialHolidayRDworkedPay: preview.specialHolidayRDworkedPay,
          specialHolidayRDworkedOTpay: preview.specialHolidayRDworkedOTpay,
          totalOvertime: preview.totalOvertime,
        } as any,
        totalSupplementary: {
          ...(formData.totalSupplementary as any),
          nightDiffPay: preview.nightDiffPay,
          regOTnightDiffPay: preview.regOTnightDiffPay,
          restDayNDPay: preview.restDayNDPay,
          regHolNDpay: preview.regHolNDPay,
          specialHolidayNDpay: preview.specialHolidayNDpay,
          totalSupplementaryIncome: preview.totalSupplementaryIncome,
        } as any,
        salaryAdjustments: {
          ...(formData.salaryAdjustments as any),
          unpaidAmount: preview.unpaidAmount,
        } as any,
        grossSalary: {
          ...(formData.grossSalary as any),
          grossSalary: preview.grossSalary,
        } as any,
        totalDeductions: {
          ...(formData.totalDeductions as any),
          totalDeductions: preview.totalDeductions,
        } as any,
        grandtotal: { grandtotal: preview.netPay } as any,
      };

      const res = await payrollAPI.updatePayroll((payroll as any)._id, payload);
      if (onUpdated) onUpdated(res.data);
      setOpen(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleSendPayroll = async () => {
    try {
      // Prepare same payload as update to persist latest edits before sending
      const monthly = Number(formData.payrollRate?.monthlyRate ?? 0);
      const daily = monthly / 26;
      const hourly = daily / 8;

      const payload: Partial<PayrollPayload> = {
        payrollRate: {
          ...(formData.payrollRate as any),
          monthlyRate: monthly,
          dailyRate: Math.round((daily || 0) * 100) / 100,
          hourlyRate: Math.round((hourly || 0) * 100) / 100,
        } as any,
        pay: { basicPay: preview.basicPay },
        holidays: {
          ...(formData.holidays as any),
          regHoliday: formData.holidays?.regHoliday ?? 0,
          speHoliday: formData.holidays?.speHoliday ?? 0,
          regHolidayPay: preview.regHolidayPay,
          speHolidayPay: preview.speHolidayPay,
        } as any,
        totalOvertime: {
          ...(formData.totalOvertime as any),
          regularOTpay: preview.regularOTpay,
          restDayOtPay: preview.restDayOtPay,
          restDayOtHoursExcessPay: preview.restDayOtExcessPay,
          regularHolidayWorkedPay: preview.regularHolidayWorkedPay,
          regularHolidayWorkedExcessPay: preview.regularHolidayWorkedExcessPay,
          specialHolidayWorkedPay: preview.specialHolidayWorkedPay,
          specialHolidayWorkedOTpay: preview.specialHolidayWorkedOTpay,
          specialHolidayRDworkedPay: preview.specialHolidayRDworkedPay,
          specialHolidayRDworkedOTpay: preview.specialHolidayRDworkedOTpay,
          totalOvertime: preview.totalOvertime,
        } as any,
        totalSupplementary: {
          ...(formData.totalSupplementary as any),
          nightDiffPay: preview.nightDiffPay,
          regOTnightDiffPay: preview.regOTnightDiffPay,
          restDayNDPay: preview.restDayNDPay,
          regHolNDpay: preview.regHolNDPay,
          specialHolidayNDpay: preview.specialHolidayNDpay,
          totalSupplementaryIncome: preview.totalSupplementaryIncome,
        } as any,
        salaryAdjustments: {
          ...(formData.salaryAdjustments as any),
          unpaidAmount: preview.unpaidAmount,
        } as any,
        grossSalary: {
          ...(formData.grossSalary as any),
          grossSalary: preview.grossSalary,
        } as any,
        totalDeductions: {
          ...(formData.totalDeductions as any),
          totalDeductions: preview.totalDeductions,
        } as any,
        grandtotal: { grandtotal: preview.netPay } as any,
      };

      const confirmSend = window.confirm(
        `Send this payroll to ${formData.employee?.fullName}? This will mark it as sent, snapshot a payslip, and reset computed fields for the next cycle. Monthly rate and deductions are preserved.`
      );
      if (!confirmSend) return;

      // 1) Save current edits
      const updated = await payrollAPI.updatePayroll((payroll as any)._id, payload);

      // 2) Send payroll (snapshot and reset on server)
      const userId = (formData.payrollRate as any)?.userId || (payroll as any)?.payrollRate?.userId;
      const payrollId = updated?.data?._id || (payroll as any)._id;
      await payrollAPI.sendPayroll(userId as string, { payrollId });

      if (onUpdated) onUpdated(updated.data);
      alert("Payroll sent successfully.");
      setOpen(false);
    } catch (err) {
      console.error("Send payroll failed:", err);
      alert("Failed to send payroll. Please try again.");
    }
  };

  // ===== Preview Computations (mirrors create modal) =====
  const round2 = (n: number) => Math.round((n || 0) * 100) / 100;

  const preview = useMemo(() => {
    const monthlyRate = formData.payrollRate?.monthlyRate ?? 0;
    const dailyRate = monthlyRate / 26; // auto-derive from monthly
    const hourlyRate = dailyRate / 8;

    const absentDays = formData.workDays?.absentDays ?? 0;
    const minsLate = formData.workDays?.minsLate ?? 0;

    const regHolidayDays = formData.holidays?.regHoliday ?? 0;
    const speHolidayDays = formData.holidays?.speHoliday ?? 0;

    const ot = formData.totalOvertime ?? ({} as any);
    const supp = formData.totalSupplementary ?? ({} as any);
    const adj = formData.salaryAdjustments ?? ({} as any);
    const gross = formData.grossSalary ?? ({} as any);
    const ded = formData.totalDeductions ?? ({} as any);

    const totalHoursWorked = formData.workDays?.totalHoursWorked || 0;
    const basicPay = round2(totalHoursWorked * hourlyRate);
    const absentDeduction = round2(absentDays * dailyRate);
    const lateDeduction = round2((minsLate / 60) * hourlyRate);

    const regHolidayPay = round2(regHolidayDays * dailyRate);
    const speHolidayPay = round2(speHolidayDays * dailyRate * 0.3);

    const regularOTpay = round2((ot.regularOT ?? 0) * hourlyRate * 1.25);
    const restDayOtPay = round2((ot.restDayOtHours ?? 0) * hourlyRate * 1.3);
    const restDayOtExcessPay = round2(
      (ot.restDayOtHoursExcess ?? 0) * hourlyRate * 1.5
    );
    const regularHolidayWorkedPay = round2(
      (ot.regularHolidayWorked ?? 0) * dailyRate * 2
    );
    const regularHolidayWorkedExcessPay = round2(
      (ot.regularHolidayWorkedExcess ?? 0) * hourlyRate * 2.6
    );
    const specialHolidayWorkedPay = round2(
      (ot.specialHolidayWorked ?? 0) * dailyRate * 1.3
    );
    const specialHolidayWorkedOTpay = round2(
      (ot.specialHolidayWorkedOT ?? 0) * hourlyRate * 1.69
    );
    const specialHolidayRDworkedPay = round2(
      (ot.specialHolidayRDworkedHours ?? 0) * hourlyRate * 1.69
    );
    const specialHolidayRDworkedOTpay = round2(
      (ot.specialHolidayRDworkedOT ?? 0) * hourlyRate * 2
    );

    const nightDiffPay = round2((supp.nightDiffHours ?? 0) * hourlyRate * 0.1);
    const regOTnightDiffPay = round2(
      (supp.regOTnightDiffHours ?? 0) * hourlyRate * 0.1
    );
    const restDayNDPay = round2((supp.restDayNDhours ?? 0) * hourlyRate * 0.1);
    const regHolNDPay = round2((supp.regHolNDHours ?? 0) * hourlyRate * 0.1);
    const specialHolidayNDpay = round2(
      (supp.specialHolidayNDhours ?? 0) * hourlyRate * 0.1
    );

    const totalOvertime = round2(
      regularOTpay +
      restDayOtPay +
      restDayOtExcessPay +
      regularHolidayWorkedPay +
      regularHolidayWorkedExcessPay +
      specialHolidayWorkedPay +
      specialHolidayWorkedOTpay +
      specialHolidayRDworkedPay +
      specialHolidayRDworkedOTpay
    );

    const totalSupplementaryIncome = round2(
      nightDiffPay +
      regOTnightDiffPay +
      restDayNDPay +
      regHolNDPay +
      specialHolidayNDpay
    );

    const grossSalary = round2(
      basicPay +
      regHolidayPay +
      speHolidayPay +
      totalOvertime +
      totalSupplementaryIncome +
      (adj.increase ?? 0) +
      (gross.nonTaxableAllowance ?? 0) +
      (gross.performanceBonus ?? 0)
    );

    const unpaidAmount = round2((adj.unpaid ?? 0) * dailyRate);

    const totalDeductions = round2(
      absentDeduction +
      lateDeduction +
      (ded.sssEmployeeShare ?? 0) +
      (ded.phicEmployeeShare ?? 0) +
      (ded.hdmfEmployeeShare ?? 0) +
      (ded.wisp ?? 0) +
      (ded.totalSSScontribution ?? 0) +
      (ded.withHoldingTax ?? 0) +
      (ded.sssSalaryLoan ?? 0) +
      (ded.hdmfLoan ?? 0) +
      unpaidAmount
    );

    const netPay = round2(grossSalary - totalDeductions);

    return {
      monthlyRate: round2(monthlyRate),
      dailyRate: round2(dailyRate),
      hourlyRate: round2(hourlyRate),
      totalHoursWorked: round2(totalHoursWorked),
      basicPay,
      absentDeduction,
      lateDeduction,
      regHolidayPay,
      speHolidayPay,
      regularOTpay,
      restDayOtPay,
      restDayOtExcessPay,
      regularHolidayWorkedPay,
      regularHolidayWorkedExcessPay,
      specialHolidayWorkedPay,
      specialHolidayWorkedOTpay,
      specialHolidayRDworkedPay,
      specialHolidayRDworkedOTpay,
      nightDiffPay,
      regOTnightDiffPay,
      restDayNDPay,
      regHolNDPay,
      specialHolidayNDpay,
      totalOvertime,
      totalSupplementaryIncome,
      unpaidAmount,
      grossSalary,
      totalDeductions,
      netPay,
    };
  }, [formData]);

  return (
    <>
      {!isControlled && (
        <Button onClick={() => setOpen(true)} size="sm" variant="outline">
          Update
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] w-full max-h-[85vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>
              Update Payroll for {payroll.employee.fullName}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editable fields */}
            <div className="lg:col-span-2 space-y-5">
              {formSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-lg font-semibold mb-4">
                    {section.title}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {section.fields.map(({ path, label, editable = true }) => (
                      <div key={path} className="flex flex-col">
                        <label className={`text-sm font-medium mb-1 ${!editable ? 'text-gray-600' : ''}`}>
                          {label}
                        </label>
                        <Input
                          type="number"
                          value={getValue(formData, path)}
                          onChange={(e) =>
                            editable ? handleChange(path, parseFloat(e.target.value) || 0) : undefined
                          }
                          disabled={!editable}
                          className={!editable ? 'bg-gray-100 text-gray-600' : ''}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Preview (matches create modal) */}
            <aside className="lg:col-span-1">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold mb-3">Payroll Preview</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">Pay Period</h4>
                    <div className="text-gray-700">
                      {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Employee Info</h4>
                    <ul>
                      <li>
                        <b>Full Name:</b> {formData.employee?.fullName}
                      </li>
                      <li>
                        <b>Email:</b> {formData.employee?.email}
                      </li>
                      <li>
                        <b>Position:</b> {formData.employee?.position}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Payroll Rate</h4>
                    <ul>
                      <li>
                        <b>Monthly:</b> {preview.monthlyRate.toFixed(2)}
                      </li>
                      <li>
                        <b>Daily:</b> {preview.dailyRate.toFixed(2)}
                      </li>
                      <li>
                        <b>Hourly:</b> {preview.hourlyRate.toFixed(2)}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Work Days</h4>
                    <ul>
                      <li>
                        <b>Regular Days:</b>{" "}
                        {formData.workDays?.regularDays ?? 0}
                      </li>
                      <li>
                        <b>Absent Days:</b> {formData.workDays?.absentDays ?? 0}
                      </li>
                      <li>
                        <b>Minutes Late:</b> {formData.workDays?.minsLate ?? 0}
                      </li>
                      <li>
                        <b>Hours Worked:</b> {formData.workDays?.totalHoursWorked?.toFixed(2) ?? 0}
                      </li>
                      <li>
                        <b>Undertime Minutes:</b> {formData.workDays?.undertimeMinutes ?? 0}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Holidays</h4>
                    <ul>
                      <li>
                        <b>Reg Holiday Pay:</b>{" "}
                        {preview.regHolidayPay.toFixed(2)}
                      </li>
                      <li>
                        <b>Spe Holiday Pay:</b>{" "}
                        {preview.speHolidayPay.toFixed(2)}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Overtime</h4>
                    <ul>
                      <li>
                        <b>Regular OT Pay:</b> {preview.regularOTpay.toFixed(2)}
                      </li>
                      <li>
                        <b>Rest Day OT Pay:</b>{" "}
                        {preview.restDayOtPay.toFixed(2)}
                      </li>
                      <li>
                        <b>Total OT Pay:</b> {preview.totalOvertime.toFixed(2)}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Supplementary</h4>
                    <ul>
                      <li>
                        <b>Night Diff Pay:</b> {preview.nightDiffPay.toFixed(2)}
                      </li>
                      <li>
                        <b>Total Supplementary:</b>{" "}
                        {preview.totalSupplementaryIncome.toFixed(2)}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Deductions</h4>
                    <ul>
                      <li>
                        <b>Absent Deduction:</b>{" "}
                        {preview.absentDeduction.toFixed(2)}
                      </li>
                      <li>
                        <b>Late Deduction:</b>{" "}
                        {preview.lateDeduction.toFixed(2)}
                      </li>
                      <li>
                        <b>Unpaid Amount:</b> {preview.unpaidAmount.toFixed(2)}
                      </li>
                      <li>
                        <b>Total Deductions:</b>{" "}
                        {preview.totalDeductions.toFixed(2)}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Net Pay</h4>
                    <div className="text-base font-semibold">
                      {preview.netPay.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Summary</h4>
                    <ul>
                      <li>
                        <b>Basic Pay:</b> {preview.basicPay.toFixed(2)}
                      </li>
                      <li>
                        <b>Total Deductions:</b> {preview.totalDeductions.toFixed(2)}
                      </li>
                      <li className="text-green-700 font-semibold">
                        <b>Net Pay:</b> {preview.netPay.toFixed(2)}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 mt-10">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
            <Button onClick={handleSendPayroll} className="bg-green-600 hover:bg-green-700">
              Send Payroll
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdatePayrollModal;
