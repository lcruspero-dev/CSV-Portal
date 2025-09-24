/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
import { useEffect, useMemo, useState } from "react";

import { payrollAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import PayrollModal, { Payroll } from "@/components/kit/payrollModal";
import UpdatePayrollModal from "@/components/kit/payrollUpdateModal";

{/** Payroll Inputs */ }
const payrollColumns: ColumnDef<Payroll>[] = [
  {
    accessorKey: "employee.email",
    header: "Email",
    meta: { sticky: true, width: 200 },
  },
  {
    accessorKey: "employee.fullName",
    header: "Full Name",
    meta: { sticky: true, width: 200 },
  },
  {
    accessorKey: "employee.position",
    header: "Position",
    meta: { sticky: true, width: 150 },
  },
  { accessorKey: "payrollRate.monthlyRate", header: "Monthly Rate" },
  { accessorKey: "payrollRate.dailyRate", header: "Daily Rate" },
  { accessorKey: "payrollRate.hourlyRate", header: "Hourly Rate" },
  { accessorKey: "pay.basicPay", header: "Basic Pay" },
  { accessorKey: "workDays.regularDays", header: "Regular Days" },
  { accessorKey: "workDays.absentDays", header: "Absent Days" },
  { accessorKey: "workDays.minsLate", header: "Minutes Late" },
  { accessorKey: "workDays.totalHoursWorked", header: "Hours Worked" },
  { accessorKey: "holidays.regHolidayPay", header: "Reg Holiday Pay" },
  { accessorKey: "holidays.speHolidayPay", header: "Special Holiday Pay" },
  { accessorKey: "totalOvertime.regularOTpay", header: "Regular OT Pay" },
  { accessorKey: "totalOvertime.restDayOtPay", header: "Rest Day OT Pay" },
  {
    accessorKey: "totalOvertime.restDayOtHoursExcessPay",
    header: "Rest Day OT Excess Pay",
  },
  {
    accessorKey: "totalOvertime.regularHolidayWorkedPay",
    header: "Regular Holiday Worked Pay",
  },
  {
    accessorKey: "totalOvertime.regularHolidayWorkedExcessPay",
    header: "Regular Holiday Worked Excess Pay",
  },
  {
    accessorKey: "totalOvertime.specialHolidayWorkedPay",
    header: "Special Holiday Worked Pay",
  },
  {
    accessorKey: "totalOvertime.specialHolidayWorkedOTpay",
    header: "Special Holiday Worked OT Pay",
  },
  {
    accessorKey: "totalOvertime.specialHolidayRDworkedPay",
    header: "Special Holiday RD Worked Pay",
  },
  {
    accessorKey: "totalOvertime.specialHolidayRDworkedOTpay",
    header: "Special Holiday RD Worked OT Pay",
  },
  { accessorKey: "totalOvertime.totalOvertime", header: "Total Overtime" },
  { accessorKey: "salaryAdjustments.unpaidAmount", header: "Unpaid Amount" },
  { accessorKey: "salaryAdjustments.increase", header: "Salary Increase" },
  { accessorKey: "totalSupplementary.nightDiffPay", header: "Night Diff Pay" },
  {
    accessorKey: "totalSupplementary.regOTnightDiffPay",
    header: "Reg OT Night Diff Pay",
  },
  {
    accessorKey: "totalSupplementary.restDayNDPay",
    header: "Rest Day Night Diff Pay",
  },
  {
    accessorKey: "totalSupplementary.regHolNDpay",
    header: "Reg Holiday Night Diff Pay",
  },
  {
    accessorKey: "totalSupplementary.specialHolidayNDpay",
    header: "Special Holiday Night Diff Pay",
  },
  {
    accessorKey: "totalSupplementary.totalSupplementaryIncome",
    header: "Total Supplementary",
  },
  { accessorKey: "grossSalary.grossSalary", header: "Gross Salary" },
  {
    accessorKey: "grossSalary.nonTaxableAllowance",
    header: "Non-Taxable Allowance",
  },
  { accessorKey: "grossSalary.performanceBonus", header: "Performance Bonus" },
  { accessorKey: "totalDeductions.sssEmployeeShare", header: "SSS" },
  { accessorKey: "totalDeductions.phicEmployeeShare", header: "PhilHealth" },
  { accessorKey: "totalDeductions.hdmfEmployeeShare", header: "Pag-IBIG" },
  { accessorKey: "totalDeductions.wisp", header: "WISP" },
  { accessorKey: "totalDeductions.totalSSSContribution", header: "Total SSS Contribution" },
  {
    accessorKey: "totalDeductions.totalDeductions",
    header: "Total Deductions",
  },
  { accessorKey: "grandtotal.grandtotal", header: "Net Pay" },
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

// helper for nested paths (e.g., "a.b.c")
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getByPath = (obj: any, path: string): any => {
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

// ================= Reset Payroll Data Function =================
const resetPayrollData = (payroll: Payroll): Payroll => {
  // Preserve only the specific fields mentioned
  const preservedPayrollRate = {
    userId: payroll.payrollRate?.userId || "",
    monthlyRate: payroll.payrollRate?.monthlyRate || 0,
    dailyRate: payroll.payrollRate?.dailyRate || 0,
    hourlyRate: payroll.payrollRate?.hourlyRate || 0,
  };

  const preservedDeductions = {
    sssEmployeeShare: payroll.totalDeductions?.sssEmployeeShare || 0,
    phicEmployeeShare: payroll.totalDeductions?.phicEmployeeShare || 0,
    hdmfEmployeeShare: payroll.totalDeductions?.hdmfEmployeeShare || 0,
    wisp: payroll.totalDeductions?.wisp || 0,
    totalSSSContribution: payroll.totalDeductions?.totalSSSContribution || 0,
  };

  return {
    ...payroll,
    // Keep preserved payroll rates
    payrollRate: preservedPayrollRate,

    // Reset work days and related fields
    workDays: {
      regularDays: 0,
      absentDays: 0,
      minsLate: 0,
      totalHoursWorked: 0,
      undertimeMinutes: 0
    },

    // Reset holidays
    holidays: {
      regHolidayPay: 0,
      speHolidayPay: 0,
      regHoliday: 0,
      speHoliday: 0
    },

    // Reset overtime
    totalOvertime: {
      regularOTpay: 0,
      restDayOtPay: 0,
      restDayOtHoursExcessPay: 0,
      regularHolidayWorkedPay: 0,
      regularHolidayWorkedExcessPay: 0,
      specialHolidayWorkedPay: 0,
      specialHolidayWorkedOTpay: 0,
      specialHolidayRDworkedPay: 0,
      specialHolidayRDworkedOTpay: 0,
      totalOvertime: 0,
    },

    // Reset salary adjustments
    salaryAdjustments: {
      unpaidAmount: 0,
      increase: 0,
    },

    // Reset supplementary income
    totalSupplementary: {
      nightDiffPay: 0,
      regOTnightDiffPay: 0,
      restDayNDPay: 0,
      regHolNDpay: 0,
      specialHolidayNDpay: 0,
      totalSupplementaryIncome: 0,
    },

    // Reset gross salary components
    grossSalary: {
      grossSalary: 0,
      nonTaxableAllowance: 0,
      performanceBonus: 0,
    },

    // Keep only the preserved deductions, reset totalDeductions to 0 (will be recalculated)
    totalDeductions: {
      ...preservedDeductions,
      totalDeductions: 0,
    },

    // Reset grand total
    grandtotal: {
      grandtotal: 0,
    },

    // Reset basic pay
    pay: {
      basicPay: 0,
    },
  };
};

{
  /** Payroll Table */
}
const PayrollTable = ({
  columns,
  data,
  onRowClick,
  onSendPayroll,
}: {
  columns: ColumnDef<Payroll>[];
  data: Payroll[];
  onRowClick: (payroll: Payroll) => void;
  onSendPayroll: (payroll: Payroll) => void;
}) => {
  const table = useReactTable({
    data,
    columns,
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

  const handleSendPayroll = (payroll: Payroll, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    onSendPayroll(payroll);
  };

  return (
    <section className="w-full overflow-x-auto">
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
              <TableHead className="border sticky bg-white z-10 border-r">
                Actions
              </TableHead>
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            <>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell, i) => {
                    const stickyProps = getStickyStyle(
                      i,
                      row.getVisibleCells()
                    );
                    const value = cell.getValue() ?? 0;
                    return (
                      <TableCell
                        key={cell.id}
                        className="border"
                        {...stickyProps}
                      >
                        {typeof value === "number"
                          ? value.toFixed(2)
                          : typeof value === "string"
                            ? value
                            : ""}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border sticky bg-white z-10 border-r">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleSendPayroll(row.original, e)}
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      Send
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals footer per column */}
              <TableRow className="bg-gray-50">
                {leafColumns.map((col, i) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const stickyProps = getStickyStyle(i, leafColumns as any);
                  const total = columnTotals[i];
                  const isNum = columnIsNumeric[i];
                  return (
                    <TableCell
                      key={col.id}
                      className="border font-semibold"
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
                <TableCell className="border font-semibold">
                  {/* Empty action cell for totals row */}
                </TableCell>
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center">
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
  const basicPay =
    (p.workDays?.regularDays ?? 0) * (p.payrollRate?.dailyRate ?? 0);
  const grossSalary =
    basicPay +
    (p.holidays?.regHolidayPay ?? 0) +
    (p.holidays?.speHolidayPay ?? 0) +
    (p.totalOvertime?.totalOvertime ?? 0) +
    (p.totalSupplementary?.totalSupplementaryIncome ?? 0) +
    (p.salaryAdjustments?.increase ?? 0);

  const totalDeductions =
    (p.totalDeductions?.sssEmployeeShare ?? 0) +
    (p.totalDeductions?.phicEmployeeShare ?? 0) +
    (p.totalDeductions?.hdmfEmployeeShare ?? 0) +
    (p.totalDeductions?.wisp ?? 0) +
    (p.totalDeductions?.totalSSSContribution ?? 0);

  const netPay =
    grossSalary - totalDeductions - (p.salaryAdjustments?.unpaidAmount ?? 0);

  return {
    ...p,
    pay: { basicPay },
    grossSalary: { ...p.grossSalary, grossSalary },
    totalDeductions: { ...p.totalDeductions, totalDeductions },
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

  const handleUpdate = (updated: Payroll) => {
    const recomputed = computePayroll(updated);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData((prev) =>
      prev.map((p) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p as any)._id === (recomputed as any)._id ? recomputed : p
      )
    );
    setSelectedPayroll(null);
  };

  const handleSendPayroll = async (payroll: Payroll) => {
    try {
      // Here you would typically send the payroll data to the employee
      // For now, we'll just simulate the API call and reset the data
      console.log('Sending payroll to employee:', payroll);

      // Simulate API call to send payroll
      // await payrollAPI.sendPayrollToEmployee(payroll);

      // Reset the payroll data for this employee (preserving specific fields)
      const resetPayroll = resetPayrollData(payroll);
      const recomputed = computePayroll(resetPayroll);

      // Update the data with reset values
      setData((prev) =>
        prev.map((p) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p as any)._id === (recomputed as any)._id ? recomputed : p
        )
      );

      // Show success message
      alert('Payroll sent successfully and reset for next period!');

    } catch (error) {
      console.error('Error sending payroll:', error);
      alert('Error sending payroll. Please try again.');
    }
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
          <Button variant="outline" onClick={() => setFilterOpen(true)}>
            Filter
          </Button>
        </div>
      </div>

      {/* Dynamic Calculation Results */}

      <div className="bg-white rounded-sm border border-gray-200 p-4">
        <PayrollTable
          columns={payrollColumns}
          data={filteredData}
          onRowClick={setSelectedPayroll}
          onSendPayroll={handleSendPayroll}
        />
      </div>

      {/* Right-side Filter Sidebar */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Payroll</SheetTitle>
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