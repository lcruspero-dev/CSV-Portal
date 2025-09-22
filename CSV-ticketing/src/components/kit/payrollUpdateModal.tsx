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
        <DialogContent className="max-w-[98vw] w-full max-h-[95vh] overflow-y-auto rounded-md p-4">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-base">
              Update Payroll: {payroll.employee.fullName}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* Editable fields - takes 3/4 width */}
            <div className="lg:col-span-3 space-y-2">
              {formSections.map((section) => (
                <div key={section.title} className="border rounded-md p-2 bg-white">
                  <h3 className="text-sm font-semibold mb-1">
                    {section.title}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-1.5">
                    {section.fields.map(({ path, label, editable = true }) => (
                      <div key={path} className="flex flex-col min-w-0">
                        <label className={`text-xs font-medium mb-0.5 ${!editable ? 'text-gray-600' : ''}`}>
                          {label}
                        </label>
                        <Input
                          type="number"
                          value={getValue(formData, path)}
                          onChange={(e) =>
                            editable ? handleChange(path, parseFloat(e.target.value) || 0) : undefined
                          }
                          disabled={!editable}
                          className={`text-xs h-7 px-2 ${!editable ? 'bg-gray-100 text-gray-600' : ''}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Preview - takes 1/4 width */}
            <aside className="lg:col-span-1">
              <div className="border rounded-md p-2 bg-gray-50 h-full">
                <h3 className="text-sm font-semibold mb-1">Preview</h3>
                <div className="space-y-1.5 text-xs max-h-[70vh] overflow-y-auto">
                  <div>
                    <h4 className="font-semibold text-xs mb-0.5">Pay Period</h4>
                    <div className="text-gray-700 text-xs">
                      {new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs mb-0.5">Employee</h4>
                    <div className="text-gray-700 text-xs truncate">
                      {formData.employee?.fullName}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs mb-0.5">Rates</h4>
                    <div className="grid grid-cols-2 gap-0.5 text-xs">
                      <span>Monthly:</span><span>{preview.monthlyRate.toFixed(0)}</span>
                      <span>Daily:</span><span>{preview.dailyRate.toFixed(0)}</span>
                      <span>Hourly:</span><span>{preview.hourlyRate.toFixed(0)}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs mb-0.5">Work</h4>
                    <div className="grid grid-cols-2 gap-0.5 text-xs">
                      <span>Reg Days:</span><span>{formData.workDays?.regularDays ?? 0}</span>
                      <span>Absent:</span><span>{formData.workDays?.absentDays ?? 0}</span>
                      <span>Late(min):</span><span>{formData.workDays?.minsLate ?? 0}</span>
                      <span>Hours:</span><span>{formData.workDays?.totalHoursWorked?.toFixed(1) ?? 0}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs mb-0.5">Holidays</h4>
                    <div className="grid grid-cols-2 gap-0.5 text-xs">
                      <span>Regular:</span><span>{preview.regHolidayPay.toFixed(0)}</span>
                      <span>Special:</span><span>{preview.speHolidayPay.toFixed(0)}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs mb-0.5">Overtime</h4>
                    <div className="grid grid-cols-2 gap-0.5 text-xs">
                      <span>Reg OT:</span><span>{preview.regularOTpay.toFixed(0)}</span>
                      <span>Rest OT:</span><span>{preview.restDayOtPay.toFixed(0)}</span>
                      <span>Total OT:</span><span>{preview.totalOvertime.toFixed(0)}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs mb-0.5">Supplementary</h4>
                    <div className="grid grid-cols-2 gap-0.5 text-xs">
                      <span>Night Diff:</span><span>{preview.nightDiffPay.toFixed(0)}</span>
                      <span>Total Suppl:</span><span>{preview.totalSupplementaryIncome.toFixed(0)}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs mb-0.5">Deductions</h4>
                    <div className="grid grid-cols-2 gap-0.5 text-xs">
                      <span>Absent:</span><span>{preview.absentDeduction.toFixed(0)}</span>
                      <span>Late:</span><span>{preview.lateDeduction.toFixed(0)}</span>
                      <span>Unpaid:</span><span>{preview.unpaidAmount.toFixed(0)}</span>
                      <span>Total Deduct:</span><span className="text-red-600">{preview.totalDeductions.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t">
                    <h4 className="font-semibold text-xs mb-0.5">Summary</h4>
                    <div className="grid grid-cols-2 gap-0.5 text-xs">
                      <span>Basic:</span><span>{preview.basicPay.toFixed(0)}</span>
                      <span>Deductions:</span><span className="text-red-600">-{preview.totalDeductions.toFixed(0)}</span>
                      <span className="font-semibold">Net:</span>
                      <span className="font-semibold text-green-700">{preview.netPay.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-1.5 mt-3">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="h-7 px-3 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdate} className="h-7 px-3 text-xs">Save</Button>
            <Button size="sm" onClick={handleSendPayroll} className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700">
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog> 
    </>
  );
};

export default UpdatePayrollModal;
