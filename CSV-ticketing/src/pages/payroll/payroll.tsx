/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState, useRef } from "react";

import { payrollAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import PayrollModal, { Payroll } from "@/components/kit/payrollModal";
import UpdatePayrollModal from "@/components/kit/payrollUpdateModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, Check, Square, History, Archive } from "lucide-react";

// Improved Checkbox component with better accessibility and styling
const Checkbox = ({
  checked,
  indeterminate,
  onCheckedChange,
  disabled,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label": string;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when clicking checkbox
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={`
        flex h-4 w-4 items-center justify-center rounded border 
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${disabled
          ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
          : checked || indeterminate
            ? 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700'
            : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }
      `}
    >
      {indeterminate ? (
        <Square className="h-2 w-2 text-white fill-current" />
      ) : checked ? (
        <Check className="h-3 w-3 text-white" />
      ) : null}
    </button>
  );
};

// Enhanced helper for nested paths with better error handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getByPath = (obj: any, path: string): any => {
  if (!obj || typeof obj !== 'object') return undefined;
  
  try {
    return path
      .split(".")
      .reduce((acc, key) => {
        if (acc === null || acc === undefined) return undefined;
        return acc[key];
      }, obj);
  } catch (error) {
    console.warn(`Error accessing path "${path}":`, error);
    return undefined;
  }
};

{/** Payroll Inputs */ }
const payrollColumns: ColumnDef<Payroll>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
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

// ================= Sticky Column Helper =================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStickyStyle = (index: number, items: any[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDef = (item: any) =>
    item?.column?.columnDef ?? item?.columnDef ?? {};
  let leftOffset = 0;
  for (let i = 0; i < index; i++) {
    const prevDef = getDef(items[i]);
    if (prevDef?.meta?.sticky) leftOffset += prevDef.meta.width || 150;
  }
  const currentDef = getDef(items[index]);
  if (currentDef?.meta?.sticky) {
    return {
      className: "sticky bg-white z-10 border-r",
      style: { left: leftOffset, minWidth: currentDef.meta.width || 150 },
    };
  }
  return {};
};

{
  /** Payroll Table */
}
const PayrollTable = ({
  columns,
  data,
  onRowClick,
  onDeletePayroll,
  onViewPayroll,
  onBulkDelete,
  hideActions,
}: {
  columns: ColumnDef<Payroll>[];
  data: Payroll[];
  onRowClick: (payroll: Payroll) => void;
  onDeletePayroll: (payroll: Payroll) => void;
  onViewPayroll: (payroll: Payroll) => void;
  onBulkDelete: (payrolls: Payroll[]) => void;
  hideActions?: boolean;
}) => {
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  const leafColumns = table.getAllLeafColumns();
  const { columnTotals, columnIsNumeric } = useMemo(() => {
    const totals: Array<number | null> = [];
    const isNumeric: boolean[] = [];
    leafColumns.forEach((col) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accessorKey = (col.columnDef as any).accessorKey as
        | string
        | undefined;
      if (!accessorKey) {
        totals.push(null);
        isNumeric.push(false);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const numeric = data.some(
        (row) => typeof getByPath(row as any, accessorKey) === "number"
      );
      isNumeric.push(numeric);
      if (!numeric) {
        totals.push(null);
        return;
      }
      const sum = data.reduce((acc, row) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = getByPath(row as any, accessorKey);
        return acc + (typeof value === "number" ? value : 0);
      }, 0);
      totals.push(sum);
    });
    return { columnTotals: totals, columnIsNumeric: isNumeric };
  }, [data, leafColumns]);

  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
  const hasSelectedRows = selectedRows.length > 0;

  const handleAction = (payroll: Payroll, action: 'view' | 'update' | 'delete' | 'send' | 'history', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event

    switch (action) {
      case 'view':
        onViewPayroll(payroll);
        break;
      case 'update':
        onRowClick(payroll);
        break;
      case 'delete':
        onDeletePayroll(payroll);
        break;
      case 'send':
        const customEvent = new CustomEvent('send-payroll', { detail: payroll, bubbles: true });
        (e.target as HTMLElement).dispatchEvent(customEvent);
        break;
      case 'history':
        const historyEvent = new CustomEvent('view-payslip-history', { detail: payroll, bubbles: true });
        (e.target as HTMLElement).dispatchEvent(historyEvent);
        break;
    }
  };

  const handleBulkDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent event propagation
    if (hasSelectedRows) {
      onBulkDelete(selectedRows);
    }
  };

  const handleRowClick = (payroll: Payroll, e: React.MouseEvent) => {
    // Only trigger row click if the click wasn't on a checkbox or action button
    const target = e.target as HTMLElement;
    if (!target.closest('button') && !target.closest('[role="checkbox"]')) {
      onRowClick(payroll);
    }
  };

  return (
    <section className="w-full overflow-x-auto">
      {/* Bulk Actions Bar */}
      {hasSelectedRows && (
        <div className="bg-blue-50 border border-blue-200 rounded-t-lg p-3 flex items-center justify-between mb-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-800">
              {selectedRows.length} payroll record(s) selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRowSelection({})}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              Clear Selection
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({selectedRows.length})
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => {
                const stickyProps = getStickyStyle(i, headerGroup.headers);
                return (
                  <TableHead
                    key={header.id}
                    className="border"
                    {...stickyProps}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                );
              })}
              {!hideActions && (
                <TableHead className="border sticky right-0 bg-white z-10">
                  Actions
                </TableHead>
              )}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            <>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${row.getIsSelected() ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  onClick={(e) => handleRowClick(row.original, e)}
                >
                  {row.getVisibleCells().map((cell, i) => {
                    const stickyProps = getStickyStyle(
                      i,
                      row.getVisibleCells()
                    );
                    return (
                      <TableCell
                        key={cell.id}
                        className="border"
                        {...stickyProps}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                  {!hideActions && (
                    <TableCell className="border sticky right-0 bg-white z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            className="h-8 w-8 p-0 focus:z-50 focus:relative"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          onCloseAutoFocus={(e) => e.preventDefault()}
                          className="z-[100]"
                        >
                          <DropdownMenuItem
                            onClick={(e) => handleAction(row.original, 'view', e)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleAction(row.original, 'update', e)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleAction(row.original, 'history', e)}
                            className="flex items-center gap-2"
                          >
                            <History className="h-4 w-4" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleAction(row.original, 'send', e)}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Send Payroll
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleAction(row.original, 'delete', e)}
                            className="flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {/* Totals footer per column */}
              <TableRow className="bg-gray-50 font-semibold">
                {leafColumns.map((col, i) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const stickyProps = getStickyStyle(i, leafColumns as any);
                  const total = columnTotals[i];
                  const isNum = columnIsNumeric[i];
                  return (
                    <TableCell
                      key={col.id}
                      className="border"
                      {...stickyProps}
                    >
                      {i === 0
                        ? "Grand Total"
                        : isNum && typeof total === "number"
                          ? total.toFixed(2)
                          : ""}
                    </TableCell>
                  );
                })}
                {!hideActions && (
                  <TableCell className="border">
                    {/* Empty action cell for totals row */}
                  </TableCell>
                )}
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (hideActions ? 0 : 1)} className="h-24 text-center">
                No payroll records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
};

const computePayroll = (p: Payroll): Payroll => {
  const monthlyRate = p.payrollRate?.monthlyRate ?? 0;
  const dailyRate = p.payrollRate?.dailyRate ?? (monthlyRate / 26);
  const hourlyRate = p.payrollRate?.hourlyRate ?? (dailyRate / 8);
  
  const totalHoursWorked = p.workDays?.totalHoursWorked ?? 0;
  const basicPay = totalHoursWorked * hourlyRate;
  
  const absentDays = p.workDays?.absentDays ?? 0;
  const minsLate = p.workDays?.minsLate ?? 0;
  const undertimeMinutes = p.workDays?.undertimeMinutes ?? 0;
  
  // Calculate deductions from time
  const amountAbsent = absentDays * dailyRate;
  const amountMinLateUT = (minsLate / 60) * hourlyRate;
  const undertimeAmount = (undertimeMinutes / 60) * hourlyRate;
  
  // Holiday pay
  const regHolidayPay = (p.holidays?.regHoliday ?? 0) * dailyRate;
  const speHolidayPay = (p.holidays?.speHoliday ?? 0) * dailyRate * 0.3;
  
  // Overtime pay
  const regularOTpay = (p.totalOvertime?.regularOT ?? 0) * hourlyRate * 1.25;
  const restDayOtPay = (p.totalOvertime?.restDayOtHours ?? 0) * hourlyRate * 1.3;
  const totalOvertimePay = regularOTpay + restDayOtPay;
  
  // Night differential
  const nightDiffPay = (p.totalSupplementary?.nightDiffHours ?? 0) * hourlyRate * 0.1;
  
  // Salary adjustments
  const salaryIncrease = p.salaryAdjustments?.increase ?? 0;
  const unpaidAmount = (p.salaryAdjustments?.unpaid ?? 0) * dailyRate;
  
  // Allowances
  const nonTaxableAllowance = p.grossSalary?.nonTaxableAllowance ?? 0;
  const performanceBonus = p.grossSalary?.performanceBonus ?? 0;
  
  // Gross salary calculation
  const grossSalary = basicPay + regHolidayPay + speHolidayPay + totalOvertimePay + 
                     nightDiffPay + salaryIncrease + nonTaxableAllowance + performanceBonus;

  // Government deductions
  const sss = p.totalDeductions?.sssEmployeeShare ?? 0;
  const phic = p.totalDeductions?.phicEmployeeShare ?? 0;
  const hdmf = p.totalDeductions?.hdmfEmployeeShare ?? 0;
  const wisp = p.totalDeductions?.wisp ?? 0;
  const totalSSSContribution = p.totalDeductions?.totalSSScontribution ?? 0;
  const withHoldingTax = p.totalDeductions?.withHoldingTax ?? 0;
  const sssSalaryLoan = p.totalDeductions?.sssSalaryLoan ?? 0;
  const hdmfLoan = p.totalDeductions?.hdmfLoan ?? 0;

  const totalDeductions = amountAbsent + amountMinLateUT + undertimeAmount + unpaidAmount +
                         sss + phic + hdmf + wisp + totalSSSContribution + withHoldingTax + 
                         sssSalaryLoan + hdmfLoan;

  const netPay = grossSalary - totalDeductions;

  return {
    ...p,
    pay: { basicPay },
    holidays: { 
      regHoliday: p.holidays?.regHoliday ?? 0,
      regHolidayPay, 
      speHoliday: p.holidays?.speHoliday ?? 0,
      speHolidayPay 
    },
    latesAndAbsent: {
      ...p.latesAndAbsent,
      amountAbsent,
      amountMinLateUT,
      undertimeAmount
    },
    salaryAdjustments: {
      ...p.salaryAdjustments,
      unpaidAmount
    },
    totalOvertime: { 
      ...p.totalOvertime,
      regularOTpay,
      restDayOtPay,
      totalOvertime: totalOvertimePay
    },
    totalSupplementary: {
      ...p.totalSupplementary,
      nightDiffPay,
      totalSupplementaryIncome: nightDiffPay
    },
    grossSalary: { 
      ...p.grossSalary, 
      grossSalary,
      nonTaxableAllowance,
      performanceBonus
    },
    totalDeductions: { 
      ...p.totalDeductions, 
      totalDeductions 
    },
    grandtotal: { grandtotal: netPay },
  };
};

{
  /** Payroll Main Page */
}
const PayrollPage = () => {
  const [data, setData] = useState<Payroll[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [positionFilter, setPositionFilter] = useState<string>("All");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [csrTypes, setCsrTypes] = useState({
    US: false,
    CANADA: false,
    GENERAL: false,
    VIP: false
  });
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [historyEmployee, setHistoryEmployee] = useState<Payroll | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [archiveOpen, setArchiveOpen] = useState<boolean>(false);
  const [archivePayslips, setArchivePayslips] = useState<any[]>([]);
  const [archiveLoading, setArchiveLoading] = useState<boolean>(false);
  const [archiveStartDate, setArchiveStartDate] = useState<string>('');
  const [archiveEndDate, setArchiveEndDate] = useState<string>('');
  
  const historyNetSum = useMemo(() => {
    try {
      return (payslips || []).reduce((acc: number, ps: any) => acc + Number(ps?.grandtotal?.grandtotal || 0), 0);
    } catch {
      return 0;
    }
  }, [payslips]);

  const archiveNetSum = useMemo(() => {
    try {
      return (archivePayslips || []).reduce((acc: number, ps: any) => acc + Number(ps?.grandtotal?.grandtotal || 0), 0);
    } catch {
      return 0;
    }
  }, [archivePayslips]);

  // Use refs to track if we're in the middle of operations
  const isMounted = useRef(true);
  const isProcessingHistory = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const res = await payrollAPI.getAllPayrolls();
        const list = Array.isArray(res.data.payrolls) ? res.data.payrolls : [];
        setData(list.map((p: Payroll) => computePayroll(p)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchPayrolls();
  }, []);

  // Handle custom dispatched send-payroll events from table items
  useEffect(() => {
    const handler = async (evt: Event) => {
      const custom = evt as CustomEvent<Payroll>;
      const payroll = custom.detail;
      const userId = payroll?.payrollRate?.userId as unknown as string;
      const payrollId = (payroll as any)?._id as string;
      if (!userId || !payrollId) return;
      try {
        if (!confirm('Send this payroll and reset calculations for the next cycle?')) return;
        await payrollAPI.sendPayroll(userId, { payrollId });
        if (!isMounted.current) return;
        
        setData(prev => prev.map(p => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const same = ((p as any)._id === payrollId);
          if (!same) return p;
          
          // Preserve the original rates - they should NEVER change after send
          const preservedRates = {
            monthlyRate: p.payrollRate?.monthlyRate || 0,
            dailyRate: p.payrollRate?.dailyRate || 0,
            hourlyRate: p.payrollRate?.hourlyRate || 0,
            userId: p.payrollRate?.userId
          };
          
          const preservedDeductions = { ...p.totalDeductions };
          
          const updated: Payroll = {
            ...p,
            status: 'sent',
            // PRESERVE payroll rates - they should NEVER change
            payrollRate: preservedRates,
            workDays: { regularDays: 0, absentDays: 0, minsLate: 0, totalHoursWorked: 0, undertimeMinutes: 0 },
            latesAndAbsent: { absentDays: 0, minLateUT: 0, amountAbsent: 0, amountMinLateUT: 0 } as any,
            pay: { basicPay: 0 },
            totalOvertime: {},
            totalSupplementary: {},
            grossSalary: { ...(p.grossSalary || {}), nonTaxableAllowance: 0, performanceBonus: 0, grossSalary: 0 },
            grandtotal: { grandtotal: 0 },
            // PRESERVE deductions but reset calculated total
            totalDeductions: { ...preservedDeductions, totalDeductions: 0 }
          } as unknown as Payroll;
          return computePayroll(updated);
        }));
        alert('Payroll sent and snapshot stored successfully.');
      } catch (error) {
        console.error('Failed to send payroll:', error);
        alert('Failed to send payroll. Please try again.');
      }
    };

    document.addEventListener('send-payroll', handler as EventListener);
    return () => {
      document.removeEventListener('send-payroll', handler as EventListener);
    };
  }, []);

  // Listen for view history events and fetch payslips
  useEffect(() => {
    const handler = async (evt: Event) => {
      // Prevent multiple simultaneous history operations
      if (isProcessingHistory.current) return;
      
      isProcessingHistory.current = true;
      const custom = evt as CustomEvent<Payroll>;
      const payroll = custom.detail;
      const userId = payroll?.payrollRate?.userId as unknown as string;
      
      if (!userId) {
        isProcessingHistory.current = false;
        return;
      }
      
      try {
        setHistoryLoading(true);
        setHistoryEmployee(payroll);
        setHistoryOpen(true);
        const res = await payrollAPI.getEmployeePayslips(userId);
        if (!isMounted.current) return;
        
        const list = Array.isArray(res.data?.payslips) ? res.data.payslips : [];
        setPayslips(list);
      } catch (error) {
        console.error('Failed to load payslip history:', error);
        if (isMounted.current) {
          setPayslips([]);
        }
      } finally {
        if (isMounted.current) {
          setHistoryLoading(false);
        }
        isProcessingHistory.current = false;
      }
    };

    document.addEventListener('view-payslip-history', handler as EventListener);
    return () => {
      document.removeEventListener('view-payslip-history', handler as EventListener);
    };
  }, []);

  // Improved handler for closing history
  const handleHistoryOpenChange = (open: boolean) => {
    setHistoryOpen(open);
    
    if (!open) {
      // Use setTimeout to ensure the close animation completes before resetting state
      setTimeout(() => {
        if (isMounted.current) {
          setHistoryEmployee(null);
          setPayslips([]);
          setHistoryLoading(false);
        }
      }, 150); // Reduced delay for better responsiveness
    }
  };

  // Force close history if component unmounts
  useEffect(() => {
    return () => {
      if (isMounted.current) {
        setHistoryOpen(false);
        setHistoryEmployee(null);
        setPayslips([]);
        setHistoryLoading(false);
      }
    };
  }, []);

  // Handle archive view - fetch all archived payslips
  const handleViewArchive = async () => {
    try {
      setArchiveLoading(true);
      setArchiveOpen(true);
      
      // Set default date range to current month if not set
      if (!archiveStartDate || !archiveEndDate) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const formatDate = (date: Date) => {
          return date.toISOString().split('T')[0]; // YYYY-MM-DD format
        };
        
        setArchiveStartDate(formatDate(startOfMonth));
        setArchiveEndDate(formatDate(endOfMonth));
      }
      
      const res = await payrollAPI.getAllArchivedPayslips(archiveStartDate, archiveEndDate);
      const list = Array.isArray(res.data?.payslips) ? res.data.payslips : [];
      setArchivePayslips(list);
    } catch (error) {
      console.error('Failed to load archived payslips:', error);
      setArchivePayslips([]);
    } finally {
      setArchiveLoading(false);
    }
  };

  // Handle archive date filter
  const handleArchiveDateFilter = async () => {
    if (!archiveStartDate || !archiveEndDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    try {
      setArchiveLoading(true);
      const res = await payrollAPI.getAllArchivedPayslips(archiveStartDate, archiveEndDate);
      const list = Array.isArray(res.data?.payslips) ? res.data.payslips : [];
      setArchivePayslips(list);
    } catch (error) {
      console.error('Failed to filter archived payslips:', error);
      setArchivePayslips([]);
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleUpdate = (updated: Payroll) => {
    const recomputed = computePayroll(updated);
    setData((prev) =>
      prev.map((p) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p as any)._id === (recomputed as any)._id ? recomputed : p
      )
    );
    setSelectedPayroll(null);
  };

  const handleDeletePayroll = async (payroll: Payroll) => {
    const userId = payroll.payrollRate?.userId;

    if (!userId) {
      alert('Error: Cannot delete payroll record - missing user ID');
      return;
    }

    if (confirm('Are you sure you want to delete this payroll record?')) {
      try {
        await payrollAPI.deletePayroll(userId);
        setData((prev) =>
          prev.filter((p) =>
            p.payrollRate?.userId !== userId
          )
        );
        alert('Payroll record deleted successfully!');
      } catch (error) {
        console.error('Error deleting payroll:', error);
        alert('Error deleting payroll record. Please try again.');
      }
    }
  };

  const handleBulkDelete = async (payrolls: Payroll[]) => {
    if (!payrolls.length) return;

    const userIds = payrolls.map(p => p.payrollRate?.userId).filter(Boolean);

    if (userIds.length !== payrolls.length) {
      alert('Error: Some payroll records are missing user IDs and cannot be deleted');
      return;
    }

    if (confirm(`Are you sure you want to delete ${payrolls.length} payroll record(s)? This action cannot be undone.`)) {
      try {
        const deletePromises = userIds.map(userId => payrollAPI.deletePayroll(userId!));
        await Promise.all(deletePromises);
        setData((prev) =>
          prev.filter((p) => !userIds.includes(p.payrollRate?.userId))
        );
        alert(`${payrolls.length} payroll record(s) deleted successfully!`);
      } catch (error) {
        console.error('Error deleting payrolls:', error);
        alert('Error deleting payroll records. Please try again.');
      }
    }
  };

  const handleViewPayroll = (payroll: Payroll) => {
    alert(`Viewing payroll for: ${payroll.employee?.fullName}\nNet Pay: ₱${payroll.grandtotal?.grandtotal?.toFixed(2)}`);
  };

  const filteredData = useMemo(() => {
    if (positionFilter === "All") return data;
    const target = positionFilter.toLowerCase();
    return data.filter(
      (p) => (p.employee?.position || "").toLowerCase() === target
    );
  }, [data, positionFilter]);

  return (
    <section className="w-full mx-auto py-12 px-6">
      <article className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          CSV NOW OPC
        </h1>
        <h3 className="text-lg text-gray-600">Payroll Register</h3>
      </article>

      <div className="flex justify-between items-center gap-4 mb-6">
        <BackButton />
        <div className="flex items-center gap-3">
          <PayrollModal
            onAdd={(p) =>
              setData((prev) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const id = (p as any)._id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const exists = prev.some((x) => (x as any)._id === id);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return exists
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  prev.map((x) => ((x as any)._id === id ? p : x))
                  : [...prev, p];
              })
            }
          />
          <Button variant="outline" onClick={handleViewArchive} className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archive
          </Button>
          <Button variant="outline" onClick={() => setFilterOpen(true)}>
            Filter
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-gray-200 p-4">
        <PayrollTable
          columns={payrollColumns}
          data={filteredData}
          onRowClick={setSelectedPayroll}
          onDeletePayroll={handleDeletePayroll}
          onViewPayroll={handleViewPayroll}
          onBulkDelete={handleBulkDelete}
        />
      </div>

      {/* Right-side Filter Sidebar */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Payroll</SheetTitle>
            <SheetDescription>
              Filter payroll records by position and other criteria
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Job Position
              </label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="border rounded px-2 py-2 text-sm"
              >
                <option value="All">All</option>
                <option value="Accounting">Accounting</option>
                <option value="IT Specialist">IT</option>
                <option value="HR">HR</option>
                <option value="CSR">CSR</option>
              </select>
            </div>

            {/* CSR Sub-filter with Checkboxes */}
            {positionFilter === "CSR" && (
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-700">
                  CSR Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={csrTypes.US}
                      onChange={(e) => setCsrTypes(prev => ({ ...prev, US: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">US</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={csrTypes.CANADA}
                      onChange={(e) => setCsrTypes(prev => ({ ...prev, CANADA: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">CANADA</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={csrTypes.GENERAL}
                      onChange={(e) => setCsrTypes(prev => ({ ...prev, GENERAL: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">GENERAL</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={csrTypes.VIP}
                      onChange={(e) => setCsrTypes(prev => ({ ...prev, VIP: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">VIP</span>
                  </label>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setPositionFilter("All");
                  setCsrTypes({
                    US: false,
                    CANADA: false,
                    GENERAL: false,
                    VIP: false
                  });
                }}
              >
                Reset
              </Button>
              <Button onClick={() => setFilterOpen(false)}>Apply</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Payslip History Sheet */}
      <Sheet open={historyOpen} onOpenChange={handleHistoryOpenChange}>
        <SheetContent 
          side="right" 
          className="w-[100vw] sm:max-w-[100vw]"
          onInteractOutside={(e) => {
            // Allow outside clicks to close the sheet
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            // Allow escape key to close the sheet
            e.preventDefault();
          }}
        >
          <SheetHeader>
            <div className="flex items-center justify-between gap-3">
              <SheetTitle>
                Payslip History {historyEmployee?.employee?.fullName ? `— ${historyEmployee.employee.fullName}` : ''}
              </SheetTitle>
              {payslips.length > 0 && (
                <Badge variant="outline" className="text-green-700 border-green-700">
                  Total Net: PHP {historyNetSum.toFixed(2)}
                </Badge>
              )}
            </div>
            <SheetDescription>
              View historical payslip data for this employee
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 w-full overflow-x-auto">
            {historyLoading ? (
              <div className="text-sm text-gray-600">Loading history…</div>
            ) : payslips.length === 0 ? (
              <div className="text-sm text-gray-600">No payslips found for this employee.</div>
            ) : (
              <div className="bg-white rounded-sm border border-gray-200 p-4 min-w-[1200px]">
                <PayrollTable
                  columns={payrollColumns}
                  data={payslips as unknown as Payroll[]}
                  onRowClick={() => {}}
                  onDeletePayroll={() => {}}
                  onViewPayroll={() => {}}
                  onBulkDelete={() => {}}
                  hideActions
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Archive View Sheet - All archived payslips */}
      <Sheet open={archiveOpen} onOpenChange={setArchiveOpen}>
        <SheetContent side="right" className="w-[100vw] sm:max-w-[100vw]">
          <SheetHeader>
            <div className="flex items-center justify-between gap-3">
              <SheetTitle>
                Payroll Archive — All Sent Payslips
              </SheetTitle>
              {archivePayslips.length > 0 && (
                <Badge variant="outline" className="text-green-700 border-green-700">
                  Total Net: PHP {archiveNetSum.toFixed(2)} ({archivePayslips.length} payslips)
                </Badge>
              )}
            </div>
          </SheetHeader>
          
          {/* Date Range Filter */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="archive-start-date">Start Date</Label>
                <Input
                  id="archive-start-date"
                  type="date"
                  value={archiveStartDate}
                  onChange={(e) => setArchiveStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="archive-end-date">End Date</Label>
                <Input
                  id="archive-end-date"
                  type="date"
                  value={archiveEndDate}
                  onChange={(e) => setArchiveEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleArchiveDateFilter} disabled={archiveLoading}>
                {archiveLoading ? 'Loading...' : 'Filter'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setArchiveStartDate('');
                  setArchiveEndDate('');
                  handleViewArchive();
                }}
                disabled={archiveLoading}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="mt-4 w-full overflow-x-auto">
            {archiveLoading ? (
              <div className="text-sm text-gray-600">Loading archive data…</div>
            ) : archivePayslips.length === 0 ? (
              <div className="text-sm text-gray-600">No archived payslips found.</div>
            ) : (
              <div className="bg-white rounded-sm border border-gray-200 p-4 min-w-[1200px]">
                <PayrollTable
                  columns={payrollColumns}
                  data={archivePayslips as unknown as Payroll[]}
                  onRowClick={() => {}}
                  onDeletePayroll={() => {}}
                  onViewPayroll={() => {}}
                  onBulkDelete={() => {}}
                  hideActions
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Update Modal appears when a row is clicked */}
      {selectedPayroll && (
        <UpdatePayrollModal
          open={true}
          onOpenChange={(o) => !o && setSelectedPayroll(null)}
          payroll={selectedPayroll}
          onUpdated={handleUpdate}
        />
      )}
    </section>
  );
};

export default PayrollPage;