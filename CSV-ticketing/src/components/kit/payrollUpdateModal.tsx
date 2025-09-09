import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { payrollAPI } from "@/API/endpoint";
import type { Payroll } from "./payrollModal";

interface Props {
  payroll: Payroll;
  onUpdated?: (updated: Payroll) => void;
}

const formSections = [
  {
    title: "Payroll Rates",
    fields: [
      { path: "payrollRate.monthlyRate", label: "Monthly Rate" },
      { path: "payrollRate.dailyRate", label: "Daily Rate" },
      { path: "payrollRate.hourlyRate", label: "Hourly Rate" },
    ],
  },
  {
    title: "Work Days",
    fields: [
      { path: "workDays.regularDays", label: "Regular Days" },
      { path: "workDays.absentDays", label: "Absent Days" },
      { path: "workDays.minsLate", label: "Minutes Late" },
    ],
  },
  {
    title: "Overtime",
    fields: [
      { path: "totalOvertime.regularOT", label: "Regular OT Hours" },
      { path: "totalOvertime.restDayOtHours", label: "Rest Day OT Hours" },
      { path: "totalOvertime.restDayOtHoursExcess", label: "Rest Day OT Excess Hours" },
      { path: "totalOvertime.regularHolidayWorked", label: "Regular Holiday Worked" },
      { path: "totalOvertime.regularHolidayWorkedExcess", label: "Regular Holiday Worked Excess" },
      { path: "totalOvertime.specialHolidayWorked", label: "Special Holiday Worked" },
      { path: "totalOvertime.specialHolidayWorkedOT", label: "Special Holiday Worked OT" },
      { path: "totalOvertime.specialHolidayRDworkedHours", label: "Special Holiday RD Worked Hours" },
      { path: "totalOvertime.specialHolidayRDworkedOT", label: "Special Holiday RD Worked OT" },
    ],
  },
  {
    title: "Holidays",
    fields: [
      { path: "holidays.regHoliday", label: "Regular Holidays (days)" },
      { path: "holidays.regHolidayPay", label: "Regular Holiday Pay" },
      { path: "holidays.speHoliday", label: "Special Holidays (days)" },
      { path: "holidays.speHolidayPay", label: "Special Holiday Pay" },
    ],
  },
  {
    title: "Night Differential",
    fields: [
      { path: "totalSupplementary.nightDiffHours", label: "Night Diff Hours" },
      { path: "totalSupplementary.regOTnightDiffHours", label: "Reg OT Night Diff Hours" },
      { path: "totalSupplementary.restDayNDhours", label: "Rest Day Night Diff Hours" },
      { path: "totalSupplementary.regHolNDHours", label: "Reg Holiday Night Diff Hours" },
      { path: "totalSupplementary.specialHolidayNDhours", label: "Special Holiday Night Diff Hours" },
    ],
  },
  {
    title: "Deductions",
    fields: [
      { path: "totalDeductions.sssEmployeeShare", label: "SSS Employee Share" },
      { path: "totalDeductions.phicEmployeeShare", label: "PhilHealth Employee Share" },
      { path: "totalDeductions.hdmfEmployeeShare", label: "Pag-IBIG Employee Share" },
      { path: "totalDeductions.wisp", label: "WISP" },
      { path: "totalDeductions.totalSSScontribution", label: "Total SSS Contribution" },
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
      { path: "grossSalary.nonTaxableAllowance", label: "Non-Taxable Allowance" },
      { path: "grossSalary.performanceBonus", label: "Performance Bonus" },
      { path: "grossSalary.grossSalary", label: "Gross Salary" },
    ],
  },
  {
    title: "Totals (Computed)",
    fields: [
      { path: "grandtotal.grandtotal", label: "Net Pay" },
    ],
  },
];


const UpdatePayrollModal = ({ payroll, onUpdated }: Props) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Payroll>(payroll);

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
    return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? 0;
  };

  const handleUpdate = async () => {
    try {
      const res = await payrollAPI.updatePayroll(
        (payroll as any)._id,
        formData
      );
      if (onUpdated) onUpdated(res.data);
      setOpen(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="outline">
        Update
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-7xl w-full overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>
              Update Payroll for {payroll.employee.fullName}
            </DialogTitle>
          </DialogHeader>

          {/* Editable fields */}
          <div className="space-y-5 mt-5">
            {formSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-lg font-semibold mb-4">
                  {section.title}
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {section.fields.map(({ path, label }) => (
                    <div key={path} className="flex flex-col">
                      <label className="text-sm font-medium mb-1">
                        {label}
                      </label>
                      <Input
                        type="number"
                        value={getValue(formData, path)}
                        onChange={(e) =>
                          handleChange(path, parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 mt-10">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </div>

        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdatePayrollModal;
