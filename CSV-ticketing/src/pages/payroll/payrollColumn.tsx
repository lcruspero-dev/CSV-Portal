import { ColumnDef } from "@tanstack/react-table";
import { Payroll } from "@/components/kit/payrollModal";
import { getByPath } from "./payrollTable";

export const payrollColumns: ColumnDef<Payroll>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <button
          type="button"
          role="checkbox"
          aria-checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
          aria-label="Select all"
          onClick={() => table.toggleAllPageRowsSelected()}
          className={`
            flex h-4 w-4 items-center justify-center rounded border 
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${table.getIsAllPageRowsSelected()
              ? 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700'
              : table.getIsSomePageRowsSelected()
                ? 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700'
                : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }
          `}
        >
          {table.getIsAllPageRowsSelected() ? (
            <span className="h-3 w-3 text-white">✓</span>
          ) : table.getIsSomePageRowsSelected() ? (
            <span className="h-2 w-2 bg-white" />
          ) : null}
        </button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <button
          type="button"
          role="checkbox"
          aria-checked={row.getIsSelected()}
          aria-label="Select row"
          onClick={(e) => {
            e.stopPropagation();
            row.toggleSelected();
          }}
          className={`
            flex h-4 w-4 items-center justify-center rounded border 
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${row.getIsSelected()
              ? 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700'
              : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }
          `}
        >
          {row.getIsSelected() && (
            <span className="h-3 w-3 text-white">✓</span>
          )}
        </button>
      </div>
    ),
    meta: { sticky: true, width: 60 },
  },
  {
    accessorKey: "employee.email",
    header: "Email",
    cell: ({ row }) => getByPath(row.original, "employee.email") || "-",
    meta: { sticky: true, width: 200 },
  },
  {
    accessorKey: "employee.fullName",
    header: "Full Name",
    cell: ({ row }) => getByPath(row.original, "employee.fullName") || "-",
    meta: { sticky: true, width: 200 },
  },
  {
    accessorKey: "employee.position",
    header: "Position",
    cell: ({ row }) => getByPath(row.original, "employee.position") || "-",
    meta: { sticky: true, width: 150 },
  },
  { 
    accessorKey: "payrollRate.monthlyRate", 
    header: "Monthly Rate",
    cell: ({ row }) => {
      const value = getByPath(row.original, "payrollRate.monthlyRate");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "payrollRate.dailyRate", 
    header: "Daily Rate",
    cell: ({ row }) => {
      const value = getByPath(row.original, "payrollRate.dailyRate");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "payrollRate.hourlyRate", 
    header: "Hourly Rate",
    cell: ({ row }) => {
      const value = getByPath(row.original, "payrollRate.hourlyRate");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "pay.basicPay", 
    header: "Basic Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "pay.basicPay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "workDays.regularDays", 
    header: "Regular Days",
    cell: ({ row }) => {
      const value = getByPath(row.original, "workDays.regularDays");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "workDays.absentDays", 
    header: "Absent Days",
    cell: ({ row }) => {
      const value = getByPath(row.original, "workDays.absentDays");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "workDays.minsLate", 
    header: "Minutes Late",
    cell: ({ row }) => {
      const value = getByPath(row.original, "workDays.minsLate");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "workDays.totalHoursWorked", 
    header: "Hours Worked",
    cell: ({ row }) => {
      const value = getByPath(row.original, "workDays.totalHoursWorked");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "holidays.regHolidayPay", 
    header: "Reg Holiday Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "holidays.regHolidayPay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "holidays.speHolidayPay", 
    header: "Special Holiday Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "holidays.speHolidayPay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "totalOvertime.regularOTpay", 
    header: "Regular OT Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalOvertime.regularOTpay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "totalOvertime.restDayOtPay", 
    header: "Rest Day OT Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalOvertime.restDayOtPay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalOvertime.restDayOtHoursExcessPay",
    header: "Rest Day OT Excess Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalOvertime.restDayOtHoursExcessPay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalOvertime.regularHolidayWorkedPay",
    header: "Regular Holiday Worked Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalOvertime.regularHolidayWorkedPay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalOvertime.regularHolidayWorkedExcessPay",
    header: "Regular Holiday Worked Excess Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalOvertime.regularHolidayWorkedExcessPay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalOvertime.specialHolidayWorkedPay",
    header: "Special Holiday Worked Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalOvertime.specialHolidayWorkedPay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalOvertime.specialHolidayWorkedOTpay",
    header: "Special Holiday Worked OT Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalOvertime.specialHolidayWorkedOTpay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalOvertime.specialHolidayRDworkedPay",
    header: "Special Holiday RD Worked Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalOvertime.specialHolidayRDworkedPay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalOvertime.specialHolidayRDworkedOTpay",
    header: "Special Holiday RD Worked OT Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalOvertime.specialHolidayRDworkedOTpay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "totalOvertime.totalOvertime", 
    header: "Total Overtime",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalOvertime.totalOvertime");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "salaryAdjustments.unpaidAmount", 
    header: "Unpaid Amount",
    cell: ({ row }) => {
      const value = getByPath(row.original, "salaryAdjustments.unpaidAmount");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "salaryAdjustments.increase", 
    header: "Salary Increase",
    cell: ({ row }) => {
      const value = getByPath(row.original, "salaryAdjustments.increase");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "totalSupplementary.nightDiffPay", 
    header: "Night Diff Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalSupplementary.nightDiffPay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalSupplementary.regOTnightDiffPay",
    header: "Reg OT Night Diff Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalSupplementary.regOTnightDiffPay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalSupplementary.restDayNDPay",
    header: "Rest Day Night Diff Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalSupplementary.restDayNDPay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalSupplementary.regHolNDpay",
    header: "Reg Holiday Night Diff Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalSupplementary.regHolNDpay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalSupplementary.specialHolidayNDpay",
    header: "Special Holiday Night Diff Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalSupplementary.specialHolidayNDpay");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalSupplementary.totalSupplementaryIncome",
    header: "Total Supplementary",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalSupplementary.totalSupplementaryIncome");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "grossSalary.grossSalary", 
    header: "Gross Salary",
    cell: ({ row }) => {
      const value = getByPath(row.original, "grossSalary.grossSalary");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "grossSalary.nonTaxableAllowance",
    header: "Non-Taxable Allowance",
    cell: ({ row }) => {
      const value = getByPath(row.original, "grossSalary.nonTaxableAllowance");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "grossSalary.performanceBonus", 
    header: "Performance Bonus",
    cell: ({ row }) => {
      const value = getByPath(row.original, "grossSalary.performanceBonus");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "totalDeductions.sssEmployeeShare", 
    header: "SSS",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalDeductions.sssEmployeeShare");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "totalDeductions.phicEmployeeShare", 
    header: "PhilHealth",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalDeductions.phicEmployeeShare");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "totalDeductions.hdmfEmployeeShare", 
    header: "Pag-IBIG",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalDeductions.hdmfEmployeeShare");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "totalDeductions.wisp", 
    header: "WISP",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalDeductions.wisp");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalDeductions.totalSSSContribution",
    header: "Total SSS Contribution",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalDeductions.totalSSSContribution");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  {
    accessorKey: "totalDeductions.totalDeductions",
    header: "Total Deductions",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalDeductions.totalDeductions");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "grandtotal.grandtotal", 
    header: "Net Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "grandtotal.grandtotal");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
];

// Optional: You can also create a simplified version of columns for specific views
export const simplifiedPayrollColumns: ColumnDef<Payroll>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <button
          type="button"
          role="checkbox"
          aria-checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
          aria-label="Select all"
          onClick={() => table.toggleAllPageRowsSelected()}
          className={`
            flex h-4 w-4 items-center justify-center rounded border 
            ${table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()
              ? 'bg-blue-600 border-blue-600'
              : 'bg-white border-gray-300'
            }
          `}
        >
          {(table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()) && (
            <span className="h-3 w-3 text-white">✓</span>
          )}
        </button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <button
          type="button"
          role="checkbox"
          aria-checked={row.getIsSelected()}
          aria-label="Select row"
          onClick={(e) => {
            e.stopPropagation();
            row.toggleSelected();
          }}
          className={`
            flex h-4 w-4 items-center justify-center rounded border 
            ${row.getIsSelected()
              ? 'bg-blue-600 border-blue-600'
              : 'bg-white border-gray-300'
            }
          `}
        >
          {row.getIsSelected() && (
            <span className="h-3 w-3 text-white">✓</span>
          )}
        </button>
      </div>
    ),
    meta: { sticky: true, width: 60 },
  },
  {
    accessorKey: "employee.email",
    header: "Email",
    cell: ({ row }) => getByPath(row.original, "employee.email") || "-",
    meta: { sticky: true, width: 200 },
  },
  {
    accessorKey: "employee.fullName",
    header: "Full Name",
    cell: ({ row }) => getByPath(row.original, "employee.fullName") || "-",
    meta: { sticky: true, width: 200 },
  },
  {
    accessorKey: "employee.position",
    header: "Position",
    cell: ({ row }) => getByPath(row.original, "employee.position") || "-",
    meta: { sticky: true, width: 150 },
  },
  { 
    accessorKey: "pay.basicPay", 
    header: "Basic Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "pay.basicPay");
      return value !== undefined && value !== null ? value.toFixed(2) : "0.00";
    }
  },
  { 
    accessorKey: "workDays.totalHoursWorked", 
    header: "Hours Worked",
    cell: ({ row }) => {
      const value = getByPath(row.original, "workDays.totalHoursWorked");
      return value !== undefined && value !== null ? value : "0.00";
    }
  },
  { 
    accessorKey: "grossSalary.grossSalary", 
    header: "Gross Salary",
    cell: ({ row }) => {
      const value = getByPath(row.original, "grossSalary.grossSalary");
      return value !== undefined && value !== null ? value.toFixed(2) : "0.00";
    }
  },
  { 
    accessorKey: "totalDeductions.totalDeductions", 
    header: "Total Deductions",
    cell: ({ row }) => {
      const value = getByPath(row.original, "totalDeductions.totalDeductions");
      return value !== undefined && value !== null ? value.toFixed(2) : "0.00";
    }
  },
  { 
    accessorKey: "grandtotal.grandtotal", 
    header: "Net Pay",
    cell: ({ row }) => {
      const value = getByPath(row.original, "grandtotal.grandtotal");
      return value !== undefined && value !== null ? value.toFixed(2) : "0.00";
    }
  },
];