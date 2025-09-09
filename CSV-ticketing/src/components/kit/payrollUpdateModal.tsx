import { useState, useEffect } from "react";
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
      { path: "overtime.regularOT", label: "Regular OT Hours" },
      { path: "overtime.restDayOT", label: "Rest Day OT Hours" },
      { path: "overtime.nightShiftOT", label: "Night Shift OT Hours" },
      { path: "overtime.holidayOT", label: "Holiday OT Hours" },
    ],
  },
  {
    title: "Holidays",
    fields: [
      { path: "holidays.regHolidayPay", label: "Regular Holiday Pay" },
      { path: "holidays.speHolidayPay", label: "Special Holiday Pay" },
      { path: "holidays.regularHoliday", label: "No. of Regular Holidays" },
      { path: "holidays.specialHoliday", label: "No. of Special Holidays" },
    ],
  },
  {
    title: "Contributions",
    fields: [
      { path: "contributions.sss", label: "SSS" },
      { path: "contributions.philhealth", label: "PhilHealth" },
      { path: "contributions.pagibig", label: "Pag-IBIG" },
      { path: "contributions.tax", label: "Tax" },
    ],
  },
  {
    title: "Allowances",
    fields: [
      { path: "allowances.meal", label: "Meal Allowance" },
      { path: "allowances.transportation", label: "Transportation Allowance" },
      { path: "allowances.other", label: "Other Allowances" },
    ],
  },
  {
    title: "Deductions",
    fields: [
      { path: "deductions.cashAdvance", label: "Cash Advance" },
      { path: "deductions.loans", label: "Loans" },
      { path: "deductions.other", label: "Other Deductions" },
    ],
  },
  {
    title: "Salary Adjustments",
    fields: [
      { path: "salaryAdjustments.unpaidAmount", label: "Unpaid Amount" },
      { path: "salaryAdjustments.increase", label: "Salary Increase" },
      { path: "salaryAdjustments.bonus", label: "Bonus" },
    ],
  },
  {
    title: "Totals (Computed)",
    fields: [
      { path: "totals.grossSalary", label: "Gross Salary" },
      { path: "totals.netSalary", label: "Net Salary" },
    ],
  },
];

const UpdatePayrollModal = ({ open, onOpenChange, payroll, onUpdated }: Props) => {
  const [formData, setFormData] = useState<Payroll>(payroll);

  // Reset form when payroll changes
  useEffect(() => {
    setFormData(payroll);
  }, [payroll]);

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
      const res = await payrollAPI.updatePayroll(payroll.employee.userId, formData);
      if (onUpdated) onUpdated(res.data);
      onOpenChange(false); // close modal after save
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Update Payroll for {payroll.employee.fullName}</DialogTitle>
        </DialogHeader>

        {/* Editable fields */}
        <div className="space-y-5 mt-5">
          {formSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {section.fields.map(({ path, label }) => (
                  <div key={path} className="flex flex-col">
                    <label className="text-sm font-medium mb-1">{label}</label>
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

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePayrollModal;
