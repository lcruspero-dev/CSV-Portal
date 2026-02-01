/* eslint-disable @typescript-eslint/no-explicit-any */
import { payrollAPI } from "@/API/endpoint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Calculator,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Edit3,
  Eye,
  Send,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Payroll } from "./payrollModal";

interface Props {
  payroll: Payroll;
  onUpdated?: (updated: Payroll) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const tabSections = [
  {
    id: "basic",
    title: "Basic Info",
    icon: User,
    fields: [
      {
        title: "Payroll Rates",
        fields: [
          {
            path: "payrollRate.monthlyRate",
            label: "Monthly Rate",
            editable: true,
            type: "currency",
          },
          {
            path: "payrollRate.dailyRate",
            label: "Daily Rate",
            editable: false,
            type: "currency",
          },
          {
            path: "payrollRate.hourlyRate",
            label: "Hourly Rate",
            editable: false,
            type: "currency",
          },
        ],
      },
      {
        title: "Work Days & Hours",
        fields: [
          {
            path: "workDays.regularDays",
            label: "Regular Days",
            editable: false,
          },
          { path: "workDays.absentDays", label: "Absent Days", editable: true },
          { path: "workDays.minsLate", label: "Minutes Late", editable: true },
          {
            path: "workDays.totalHoursWorked",
            label: "Hours Worked",
            editable: true,
          },
          {
            path: "workDays.undertimeMinutes",
            label: "Undertime Minutes",
            editable: true,
          },
        ],
      },
    ],
  },
  {
    id: "overtime",
    title: "Overtime & Holidays",
    icon: Clock,
    fields: [
      {
        title: "Overtime Hours",
        fields: [
          {
            path: "totalOvertime.regularOT",
            label: "Regular OT Hours",
            editable: true,
          },
          {
            path: "totalOvertime.restDayOtHours",
            label: "Rest Day OT Hours",
            editable: true,
          },
          {
            path: "totalOvertime.restDayOtHoursExcess",
            label: "Rest Day OT Excess Hours",
            editable: true,
          },
          {
            path: "totalOvertime.regularHolidayWorked",
            label: "Regular Holiday Worked",
            editable: true,
          },
          {
            path: "totalOvertime.regularHolidayWorkedExcess",
            label: "Regular Holiday Worked Excess",
            editable: true,
          },
          {
            path: "totalOvertime.specialHolidayWorked",
            label: "Special Holiday Worked",
            editable: true,
          },
          {
            path: "totalOvertime.specialHolidayWorkedOT",
            label: "Special Holiday Worked OT",
            editable: true,
          },
          {
            path: "totalOvertime.specialHolidayRDworkedHours",
            label: "Special Holiday RD Worked Hours",
            editable: true,
          },
          {
            path: "totalOvertime.specialHolidayRDworkedOT",
            label: "Special Holiday RD Worked OT",
            editable: true,
          },
        ],
      },
      {
        title: "Holidays",
        fields: [
          {
            path: "holidays.regHoliday",
            label: "Regular Holidays (days)",
            editable: true,
          },
          {
            path: "holidays.speHoliday",
            label: "Special Holidays (days)",
            editable: true,
          },
        ],
      },
    ],
  },
  {
    id: "supplementary",
    title: "Supplementary",
    icon: Calculator,
    fields: [
      {
        title: "Night Differential Hours",
        fields: [
          {
            path: "totalSupplementary.nightDiffHours",
            label: "Night Diff Hours",
            editable: true,
          },
          {
            path: "totalSupplementary.regOTnightDiffHours",
            label: "Reg OT Night Diff Hours",
            editable: true,
          },
          {
            path: "totalSupplementary.restDayNDhours",
            label: "Rest Day Night Diff Hours",
            editable: true,
          },
          {
            path: "totalSupplementary.regHolNDHours",
            label: "Reg Holiday Night Diff Hours",
            editable: true,
          },
          {
            path: "totalSupplementary.specialHolidayNDhours",
            label: "Special Holiday Night Diff Hours",
            editable: true,
          },
        ],
      },
    ],
  },
  {
    id: "adjustments",
    title: "Adjustments",
    icon: Edit3,
    fields: [
      {
        title: "Salary Adjustments",
        fields: [
          {
            path: "salaryAdjustments.unpaid",
            label: "Unpaid Days",
            editable: true,
          },
          {
            path: "salaryAdjustments.increase",
            label: "Salary Increase",
            editable: true,
            type: "currency",
          },
        ],
      },
      {
        title: "Allowances & Bonuses",
        fields: [
          {
            path: "grossSalary.nonTaxableAllowance",
            label: "Non-Taxable Allowance",
            editable: true,
            type: "currency",
          },
          {
            path: "grossSalary.performanceBonus",
            label: "Performance Bonus",
            editable: true,
            type: "currency",
          },
        ],
      },
    ],
  },
  {
    id: "deductions",
    title: "Deductions",
    icon: DollarSign,
    fields: [
      {
        title: "Government Deductions",
        fields: [
          {
            path: "totalDeductions.sssEmployeeShare",
            label: "SSS Employee Share",
            editable: true,
            type: "currency",
          },
          {
            path: "totalDeductions.phicEmployeeShare",
            label: "PhilHealth Employee Share",
            editable: true,
            type: "currency",
          },
          {
            path: "totalDeductions.hdmfEmployeeShare",
            label: "Pag-IBIG Employee Share",
            editable: true,
            type: "currency",
          },
          {
            path: "totalDeductions.wisp",
            label: "WISP",
            editable: true,
            type: "currency",
          },
          {
            path: "totalDeductions.totalSSScontribution",
            label: "Total SSS Contribution",
            editable: true,
            type: "currency",
          },
        ],
      },
      {
        title: "Tax & Loans",
        fields: [
          {
            path: "totalDeductions.withHoldingTax",
            label: "Withholding Tax",
            editable: true,
            type: "currency",
          },
          {
            path: "totalDeductions.sssSalaryLoan",
            label: "SSS Salary Loan",
            editable: true,
            type: "currency",
          },
          {
            path: "totalDeductions.hdmfLoan",
            label: "HDMF Loan",
            editable: true,
            type: "currency",
          },
        ],
      },
    ],
  },
];

const UpdatePayrollModal = ({
  payroll,
  onUpdated,
  open,
  onOpenChange,
}: Props) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [loadingAuto] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? (open as boolean) : internalOpen;
  const setOpen = (next: boolean) => {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
  };
  
  const [formData, setFormData] = useState<Payroll>(() => ({
    ...payroll,
    // Ensure all nested objects exist
    payrollRate: {
      userId: '',
      monthlyRate: 0,
      dailyRate: 0,
      hourlyRate: 0,
      ...(payroll.payrollRate || {}),
    },
    workDays: {
      regularDays: 0,
      absentDays: 0,
      minsLate: 0,
      totalHoursWorked: 0,
      undertimeMinutes: 0,
      ...(payroll.workDays || {}),
    },
    holidays: {
      regHoliday: 0,
      speHoliday: 0,
      regHolidayPay: 0,
      speHolidayPay: 0,
      ...(payroll.holidays || {}),
    },
    totalOvertime: {
      regularOT: 0,
      restDayOtHours: 0,
      restDayOtHoursExcess: 0,
      regularHolidayWorked: 0,
      regularHolidayWorkedExcess: 0,
      specialHolidayWorked: 0,
      specialHolidayWorkedOT: 0,
      specialHolidayRDworkedHours: 0,
      specialHolidayRDworkedOT: 0,
      ...(payroll.totalOvertime || {}),
    },
    totalSupplementary: {
      nightDiffHours: 0,
      regOTnightDiffHours: 0,
      restDayNDhours: 0,
      regHolNDHours: 0,
      specialHolidayNDhours: 0,
      ...(payroll.totalSupplementary || {}),
    },
    salaryAdjustments: {
      unpaid: 0,
      increase: 0,
      ...(payroll.salaryAdjustments || {}),
    },
    grossSalary: {
      nonTaxableAllowance: 0,
      performanceBonus: 0,
      ...(payroll.grossSalary || {}),
    },
    totalDeductions: {
      sssEmployeeShare: 0,
      phicEmployeeShare: 0,
      hdmfEmployeeShare: 0,
      wisp: 0,
      totalSSScontribution: 0,
      withHoldingTax: 0,
      sssSalaryLoan: 0,
      hdmfLoan: 0,
      ...(payroll.totalDeductions || {}),
    },
  }));

  // Keep form data in sync when switching rows
  useEffect(() => {
    if (payroll && payroll._id !== formData._id) {
      setFormData({
        ...payroll,
        payrollRate: {
          userId: '',
          monthlyRate: 0,
          dailyRate: 0,
          hourlyRate: 0,
          ...payroll.payrollRate,
        },
        workDays: {
          regularDays: 0,
          absentDays: 0,
          minsLate: 0,
          totalHoursWorked: 0,
          undertimeMinutes: 0,
          ...payroll.workDays,
        },
        holidays: {
          regHoliday: 0,
          regHolidayPay: 0,
          speHoliday: 0,
          speHolidayPay: 0,
          ...payroll.holidays,
        },
        totalOvertime: {
          regularOT: 0,
          restDayOtHours: 0,
          restDayOtHoursExcess: 0,
          regularHolidayWorked: 0,
          regularHolidayWorkedExcess: 0,
          specialHolidayWorked: 0,
          specialHolidayWorkedOT: 0,
          specialHolidayRDworkedHours: 0,
          specialHolidayRDworkedOT: 0,
          ...payroll.totalOvertime,
        },
        totalSupplementary: {
          nightDiffHours: 0,
          regOTnightDiffHours: 0,
          restDayNDhours: 0,
          regHolNDHours: 0,
          specialHolidayNDhours: 0,
          ...payroll.totalSupplementary,
        },
        salaryAdjustments: {
          unpaid: 0,
          increase: 0,
          ...payroll.salaryAdjustments,
        },
        grossSalary: {
          nonTaxableAllowance: 0,
          performanceBonus: 0,
          ...payroll.grossSalary,
        },
        totalDeductions: {
          sssEmployeeShare: 0,
          phicEmployeeShare: 0,
          hdmfEmployeeShare: 0,
          wisp: 0,
          totalSSScontribution: 0,
          withHoldingTax: 0,
          sssSalaryLoan: 0,
          hdmfLoan: 0,
          ...payroll.totalDeductions,
        },
      });
      setActiveTab("basic");
    }
  }, [payroll, formData._id]);

  // Handle deep updates
const handleChange = (path: string, value: any) => {
  setFormData((prev) => {
    const newData: any = { ...prev };
    const keys = path.split(".");
    let obj = newData;

    // Ensure nested objects exist
    keys.slice(0, -1).forEach((key) => {
      if (!obj[key] || typeof obj[key] !== 'object') {
        obj[key] = {};
      }
      obj = obj[key];
    });

    // Update value
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    obj[keys[keys.length - 1]] = numValue;
    
    // Auto-calculate derived rates if monthly rate changes
    if (path === "payrollRate.monthlyRate") {
      const monthly = numValue;
      const daily = monthly / 26;
      const hourly = daily / 8;
      
      if (newData.payrollRate) {
        newData.payrollRate = {
          ...newData.payrollRate,
          dailyRate: Math.round(daily * 100) / 100, // Round to 2 decimals
          hourlyRate: Math.round(hourly * 100) / 100, // Round to 2 decimals
        };
      }
    }

    return newData;
  });
};

const getValue = (obj: any, path: string) => {
  try {
    if (path === "payrollRate.dailyRate") {
      const monthly = Number(obj?.payrollRate?.monthlyRate ?? 0);
      const daily = monthly / 26;
      return Math.round(daily * 100) / 100; // Round to 2 decimals
    }
    if (path === "payrollRate.hourlyRate") {
      const monthly = Number(obj?.payrollRate?.monthlyRate ?? 0);
      const daily = monthly / 26;
      const hourly = daily / 8;
      return Math.round(hourly * 100) / 100; // Round to 2 decimals
    }
    
    const value = path.split(".").reduce((acc, key) => {
      if (acc === null || acc === undefined) return 0;
      return acc[key];
    }, obj) ?? 0;
    
    // Round numeric values to 2 decimals if they look like currency
    if (typeof value === 'number' && (path.includes('Rate') || path.includes('Salary') || path.includes('Pay') || path.includes('Allowance') || path.includes('Bonus') || path.includes('Deduction'))) {
      return Math.round(value * 100) / 100;
    }
    
    return value;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return 0;
  }
};

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const monthly = Number(formData.payrollRate?.monthlyRate ?? 0);
      const daily = monthly / 26;
      const hourly = daily / 8;

      // Build proper payload structure
      const payload: Partial<Payroll> = {
        employee: formData.employee,
        payrollRate: {
          userId: formData.payrollRate?.userId || '',
          monthlyRate: monthly,
          dailyRate: Math.round((daily || 0) * 100) / 100,
          hourlyRate: Math.round((hourly || 0) * 100) / 100,
        },
        workDays: {
          regularDays: formData.workDays?.regularDays || 0,
          absentDays: formData.workDays?.absentDays || 0,
          minsLate: formData.workDays?.minsLate || 0,
          totalHoursWorked: formData.workDays?.totalHoursWorked || 0,
          undertimeMinutes: formData.workDays?.undertimeMinutes || 0,
        },
        holidays: {
          regHoliday: formData.holidays?.regHoliday || 0,
          speHoliday: formData.holidays?.speHoliday || 0,
          regHolidayPay: formData.holidays?.regHolidayPay ?? 0,
          speHolidayPay: formData.holidays?.speHolidayPay ?? 0,
        },
        totalOvertime: {
          regularOT: formData.totalOvertime?.regularOT || 0,
          restDayOtHours: formData.totalOvertime?.restDayOtHours || 0,
          restDayOtHoursExcess: formData.totalOvertime?.restDayOtHoursExcess || 0,
          regularHolidayWorked: formData.totalOvertime?.regularHolidayWorked || 0,
          regularHolidayWorkedExcess: formData.totalOvertime?.regularHolidayWorkedExcess || 0,
          specialHolidayWorked: formData.totalOvertime?.specialHolidayWorked || 0,
          specialHolidayWorkedOT: formData.totalOvertime?.specialHolidayWorkedOT || 0,
          specialHolidayRDworkedHours: formData.totalOvertime?.specialHolidayRDworkedHours || 0,
          specialHolidayRDworkedOT: formData.totalOvertime?.specialHolidayRDworkedOT || 0,
        },
        totalSupplementary: {
          nightDiffHours: formData.totalSupplementary?.nightDiffHours || 0,
          regOTnightDiffHours: formData.totalSupplementary?.regOTnightDiffHours || 0,
          restDayNDhours: formData.totalSupplementary?.restDayNDhours || 0,
          regHolNDHours: formData.totalSupplementary?.regHolNDHours || 0,
          specialHolidayNDhours: formData.totalSupplementary?.specialHolidayNDhours || 0,
        },
        salaryAdjustments: {
          unpaid: formData.salaryAdjustments?.unpaid || 0,
          increase: formData.salaryAdjustments?.increase || 0,
        },
        grossSalary: {
          nonTaxableAllowance: formData.grossSalary?.nonTaxableAllowance || 0,
          performanceBonus: formData.grossSalary?.performanceBonus || 0,
        },
        totalDeductions: {
          sssEmployeeShare: formData.totalDeductions?.sssEmployeeShare || 0,
          phicEmployeeShare: formData.totalDeductions?.phicEmployeeShare || 0,
          hdmfEmployeeShare: formData.totalDeductions?.hdmfEmployeeShare || 0,
          wisp: formData.totalDeductions?.wisp || 0,
          totalSSScontribution: formData.totalDeductions?.totalSSScontribution || 0,
          withHoldingTax: formData.totalDeductions?.withHoldingTax || 0,
          sssSalaryLoan: formData.totalDeductions?.sssSalaryLoan || 0,
          hdmfLoan: formData.totalDeductions?.hdmfLoan || 0,
        },
      };

      const res = await payrollAPI.updatePayroll((payroll as any)._id, payload as any);
      onUpdated?.(res.data);
      setOpen(false);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update payroll. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendPayroll = async () => {
    try {
      setIsSending(true);
      const monthly = Number(formData.payrollRate?.monthlyRate ?? 0);
      const daily = monthly / 26;
      const hourly = daily / 8;

      const confirmSend = window.confirm(
        `Send payroll to ${formData.employee?.fullName}? This will finalize the payroll and reset time-sensitive fields for the next cycle.`
      );
      if (!confirmSend) return;

      // First update the payroll with current data
      const payload: any = {
        employee: formData.employee,
        payrollRate: {
          userId: formData.payrollRate?.userId || '',
          monthlyRate: monthly,
          dailyRate: Math.round((daily || 0) * 100) / 100,
          hourlyRate: Math.round((hourly || 0) * 100) / 100,
        },
        workDays: {
          regularDays: formData.workDays?.regularDays || 0,
          absentDays: formData.workDays?.absentDays || 0,
          minsLate: formData.workDays?.minsLate || 0,
          totalHoursWorked: formData.workDays?.totalHoursWorked || 0,
          undertimeMinutes: formData.workDays?.undertimeMinutes || 0,
        },
        holidays: {
          regHoliday: formData.holidays?.regHoliday || 0,
          speHoliday: formData.holidays?.speHoliday || 0,
          regHolidayPay: formData.holidays?.regHolidayPay ?? 0,
          speHolidayPay: formData.holidays?.speHolidayPay ?? 0,
        },
        totalOvertime: {
          regularOT: formData.totalOvertime?.regularOT || 0,
          restDayOtHours: formData.totalOvertime?.restDayOtHours || 0,
          restDayOtHoursExcess: formData.totalOvertime?.restDayOtHoursExcess || 0,
          regularHolidayWorked: formData.totalOvertime?.regularHolidayWorked || 0,
          regularHolidayWorkedExcess: formData.totalOvertime?.regularHolidayWorkedExcess || 0,
          specialHolidayWorked: formData.totalOvertime?.specialHolidayWorked || 0,
          specialHolidayWorkedOT: formData.totalOvertime?.specialHolidayWorkedOT || 0,
          specialHolidayRDworkedHours: formData.totalOvertime?.specialHolidayRDworkedHours || 0,
          specialHolidayRDworkedOT: formData.totalOvertime?.specialHolidayRDworkedOT || 0,
        },
        totalSupplementary: {
          nightDiffHours: formData.totalSupplementary?.nightDiffHours || 0,
          regOTnightDiffHours: formData.totalSupplementary?.regOTnightDiffHours || 0,
          restDayNDhours: formData.totalSupplementary?.restDayNDhours || 0,
          regHolNDHours: formData.totalSupplementary?.regHolNDHours || 0,
          specialHolidayNDhours: formData.totalSupplementary?.specialHolidayNDhours || 0,
        },
        salaryAdjustments: {
          unpaid: formData.salaryAdjustments?.unpaid || 0,
          increase: formData.salaryAdjustments?.increase || 0,
        },
        grossSalary: {
          nonTaxableAllowance: formData.grossSalary?.nonTaxableAllowance || 0,
          performanceBonus: formData.grossSalary?.performanceBonus || 0,
        },
        totalDeductions: {
          sssEmployeeShare: formData.totalDeductions?.sssEmployeeShare || 0,
          phicEmployeeShare: formData.totalDeductions?.phicEmployeeShare || 0,
          hdmfEmployeeShare: formData.totalDeductions?.hdmfEmployeeShare || 0,
          wisp: formData.totalDeductions?.wisp || 0,
          totalSSScontribution: formData.totalDeductions?.totalSSScontribution || 0,
          withHoldingTax: formData.totalDeductions?.withHoldingTax || 0,
          sssSalaryLoan: formData.totalDeductions?.sssSalaryLoan || 0,
          hdmfLoan: formData.totalDeductions?.hdmfLoan || 0,
        },
      };

      // Update payroll first
      const updated = await payrollAPI.updatePayroll(
        (payroll as any)._id,
        payload as any
      );
      
      // Then send it
      const userId = formData.payrollRate?.userId || '';
      const payrollId = updated?.data?._id || (payroll as any)._id;

      await payrollAPI.sendPayroll(userId, { payrollId });
      onUpdated?.(updated.data);

      alert("Payroll sent successfully!");
      setOpen(false);
    } catch (err: any) {
      console.error("Send payroll failed:", err);
      alert(`Failed to send payroll: ${err.message || "Please try again."}`);
    } finally {
      setIsSending(false);
    }
  };

  // Preview Computations
  const round2 = (n: number) => Math.round((n || 0) * 100) / 100;

  const preview = useMemo(() => {
    const monthlyRate = formData.payrollRate?.monthlyRate ?? 0;
    const dailyRate = monthlyRate / 26;
    const hourlyRate = dailyRate / 8;

    const totalHoursWorked = formData.workDays?.totalHoursWorked || 0;
    const absentDays = formData.workDays?.absentDays || 0;
    const minsLate = formData.workDays?.minsLate || 0;
    const undertimeMinutes = formData.workDays?.undertimeMinutes || 0;

    // Basic pay
    const basicPay = round2(totalHoursWorked * hourlyRate);
    
    // Deductions
    const absentDeduction = round2(absentDays * dailyRate);
    const lateDeduction = round2((minsLate / 60) * hourlyRate);
    const undertimeDeduction = round2((undertimeMinutes / 60) * hourlyRate);
    
    // Holidays
    const regHolidayDays = formData.holidays?.regHoliday || 0;
    const speHolidayDays = formData.holidays?.speHoliday || 0;
    const regHolidayPay = round2(regHolidayDays * dailyRate);
    const speHolidayPay = round2(speHolidayDays * dailyRate * 0.3);

    // Overtime calculations
    const ot = formData.totalOvertime ?? ({} as any);
    const regularOTpay = round2((ot.regularOT ?? 0) * hourlyRate * 1.25);
    const restDayOtPay = round2((ot.restDayOtHours ?? 0) * hourlyRate * 1.3);
    const restDayOtExcessPay = round2((ot.restDayOtHoursExcess ?? 0) * hourlyRate * 1.5);
    const regularHolidayWorkedPay = round2((ot.regularHolidayWorked ?? 0) * dailyRate * 2);
    const regularHolidayWorkedExcessPay = round2((ot.regularHolidayWorkedExcess ?? 0) * hourlyRate * 2.6);
    const specialHolidayWorkedPay = round2((ot.specialHolidayWorked ?? 0) * dailyRate * 1.3);
    const specialHolidayWorkedOTpay = round2((ot.specialHolidayWorkedOT ?? 0) * hourlyRate * 1.69);
    const specialHolidayRDworkedPay = round2((ot.specialHolidayRDworkedHours ?? 0) * hourlyRate * 1.69);
    const specialHolidayRDworkedOTpay = round2((ot.specialHolidayRDworkedOT ?? 0) * hourlyRate * 2);

    // Supplementary calculations
    const supp = formData.totalSupplementary ?? ({} as any);
    const nightDiffPay = round2((supp.nightDiffHours ?? 0) * hourlyRate * 0.1);
    const regOTnightDiffPay = round2((supp.regOTnightDiffHours ?? 0) * hourlyRate * 0.1);
    const restDayNDPay = round2((supp.restDayNDhours ?? 0) * hourlyRate * 0.1);
    const regHolNDPay = round2((supp.regHolNDHours ?? 0) * hourlyRate * 0.1);
    const specialHolidayNDpay = round2((supp.specialHolidayNDhours ?? 0) * hourlyRate * 0.1);

    // Totals
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

    // Adjustments
    const adj = formData.salaryAdjustments ?? ({} as any);
    const gross = formData.grossSalary ?? ({} as any);
    const ded = formData.totalDeductions ?? ({} as any);
    
    const salaryIncrease = adj.increase || 0;
    const nonTaxableAllowance = gross.nonTaxableAllowance || 0;
    const performanceBonus = gross.performanceBonus || 0;
    const unpaidAmount = round2((adj.unpaid || 0) * dailyRate);

    // Gross Salary
    const grossSalary = round2(
      basicPay +
      regHolidayPay +
      speHolidayPay +
      totalOvertime +
      totalSupplementaryIncome +
      salaryIncrease +
      nonTaxableAllowance +
      performanceBonus
    );

    // Total Deductions
    const totalDeductions = round2(
      absentDeduction +
      lateDeduction +
      undertimeDeduction +
      unpaidAmount +
      (ded.sssEmployeeShare || 0) +
      (ded.phicEmployeeShare || 0) +
      (ded.hdmfEmployeeShare || 0) +
      (ded.wisp || 0) +
      (ded.totalSSScontribution || 0) +
      (ded.withHoldingTax || 0) +
      (ded.sssSalaryLoan || 0) +
      (ded.hdmfLoan || 0)
    );

    const netPay = round2(grossSalary - totalDeductions);

    return {
      monthlyRate: round2(monthlyRate),
      dailyRate: round2(dailyRate),
      hourlyRate: round2(hourlyRate),
      basicPay,
      absentDeduction,
      lateDeduction,
      undertimeDeduction,
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
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[70vh] rounded-lg p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    {formData.employee?.fullName || "Unknown Employee"}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    {formData.employee?.position || "No position"} • {formData.employee?.email || "No email"}
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="outline" className="px-3 py-1 bg-white">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex h-full">
            {/* Left Panel - Form Fields */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col"
              >
                <TabsList className="grid grid-cols-5 rounded-none border-b px-6 py-0 h-12">
                  {tabSections.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex items-center gap-2 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
                      >
                        <Icon className="h-4 w-4" />
                        {tab.title}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    {loadingAuto && (
                      <div className="text-xs text-gray-500 mb-2">
                        Auto-calculating hours from time tracker…
                      </div>
                    )}
                    {tabSections.map((tab) => (
                      <TabsContent
                        key={tab.id}
                        value={tab.id}
                        className="space-y-6 m-0"
                      >
                        {tab.fields.map((section) => (
                          <Card key={section.title}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-semibold text-gray-700">
                                {section.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {section.fields.map(
                                  ({ path, label, editable = true, type }) => {
                                    const value = getValue(formData, path);
                                    return (
                                      <div key={path} className="space-y-2">
                                        <Label className="text-xs font-medium text-gray-600">
                                          {label}
                                          {!editable && (
                                            <Badge
                                              variant="secondary"
                                              className="ml-2 text-xs"
                                            >
                                              Auto
                                            </Badge>
                                          )}
                                        </Label>
                                        <Input
                                          type="number"
                                          value={value}
                                          onChange={(e) =>
                                            editable
                                              ? handleChange(
                                                  path,
                                                  parseFloat(e.target.value) || 0
                                                )
                                              : undefined
                                          }
                                          disabled={!editable}
                                          className={`
                                            ${!editable ? "bg-gray-50 text-gray-600" : ""}
                                            ${type === "currency" ? "font-mono" : ""}
                                          `}
                                          step={type === "currency" ? "0.01" : "1"}
                                        />
                                        {type === "currency" && (
                                          <p className="text-xs text-gray-500 font-mono">
                                            {formatCurrency(value)}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </TabsContent>
                    ))}
                  </div>
                </div>
              </Tabs>
            </div>

            {/* Right Panel - Preview */}
            <div className="w-[400px] border-l bg-gradient-to-b from-gray-50 to-white flex flex-col overflow-hidden">
              <div className="h-full overflow-y-auto" style={{ maxHeight: "calc(70vh - 80px)" }}>
                <div className="p-5 space-y-4">
                  {/* Summary Card */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Payroll Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-base">
                        <div className="text-gray-600">Basic Pay:</div>
                        <div className="font-semibold text-right font-mono">
                          {formatCurrency(preview.basicPay)}
                        </div>

                        <div className="text-gray-600">Overtime:</div>
                        <div className="text-right font-mono text-blue-600">
                          +{formatCurrency(preview.totalOvertime)}
                        </div>

                        <div className="text-gray-600">Supplementary:</div>
                        <div className="text-right font-mono text-green-600">
                          +{formatCurrency(preview.totalSupplementaryIncome)}
                        </div>

                        <div className="text-gray-600">Allowances:</div>
                        <div className="text-right font-mono text-green-600">
                          +
                          {formatCurrency(
                            (formData.grossSalary?.nonTaxableAllowance || 0) +
                            (formData.grossSalary?.performanceBonus || 0)
                          )}
                        </div>

                        <Separator className="col-span-2 my-1" />

                        <div className="text-gray-600 font-semibold">
                          Gross Salary:
                        </div>
                        <div className="font-bold text-right font-mono text-green-700">
                          {formatCurrency(preview.grossSalary)}
                        </div>

                        <div className="text-gray-600">Deductions:</div>
                        <div className="text-right font-mono text-red-600">
                          -{formatCurrency(preview.totalDeductions)}
                        </div>

                        <Separator className="col-span-2 my-1" />

                        <div className="font-bold text-gray-900">Net Pay:</div>
                        <div className="font-bold text-right font-mono text-lg text-green-700">
                          {formatCurrency(preview.netPay)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Rates Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">
                        Rates
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monthly:</span>
                        <span className="font-mono">
                          {formatCurrency(preview.monthlyRate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily:</span>
                        <span className="font-mono">
                          {formatCurrency(preview.dailyRate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hourly:</span>
                        <span className="font-mono">
                          {formatCurrency(preview.hourlyRate)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Work Details Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">
                        Work Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Hours Worked:</span>
                        <span>
                          {formData.workDays?.totalHoursWorked?.toFixed(1) || 0}
                          h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Absent Days:</span>
                        <span className="text-red-600">
                          {formData.workDays?.absentDays || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Late Minutes:</span>
                        <span className="text-orange-600">
                          {formData.workDays?.minsLate || 0}m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Undertime Minutes:</span>
                        <span className="text-yellow-600">
                          {formData.workDays?.undertimeMinutes || 0}m
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">
                        Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={handleUpdate}
                        className="w-full gap-2"
                        variant="outline"
                        disabled={isUpdating}
                      >
                        <Eye className="h-4 w-4" />
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        onClick={handleSendPayroll}
                        className="w-full gap-2 bg-green-600 hover:bg-green-700"
                        disabled={isSending}
                      >
                        <Send className="h-4 w-4" />
                        {isSending ? "Sending..." : "Send Payroll"}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setOpen(false)}
                      >
                        <Download className="h-4 w-4" />
                        Export PDF
                      </Button>
                    </CardContent>
                  </Card>
                  <div className="h-4"></div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdatePayrollModal;