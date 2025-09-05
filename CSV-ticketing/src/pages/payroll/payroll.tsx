import { useState, useEffect } from "react";
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

import BackButton from "@/components/kit/BackButton";
import PayrollModal, { Payroll } from "@/components/kit/payrollModal";
import { payrollAPI } from "@/API/endpoint";

// ================= Payroll Columns =================
// ================= Payroll Columns =================
const payrollColumns: ColumnDef<Payroll>[] = [
    { accessorKey: "employee.email", header: "Email", meta: { sticky: true, width: 200 } },
    { accessorKey: "employee.fullName", header: "Full Name", meta: { sticky: true, width: 200 } },
    { accessorKey: "employee.position", header: "Position", meta: { sticky: true, width: 150 } },
    { accessorKey: "payrollRate.monthlyRate", header: "Monthly Rate" },
    { accessorKey: "payrollRate.dailyRate", header: "Daily Rate" },
    { accessorKey: "payrollRate.hourlyRate", header: "Hourly Rate" },
    { accessorKey: "pay.basicPay", header: "Basic Pay" },
    { accessorKey: "workDays.regularDays", header: "Regular Days" },
    { accessorKey: "workDays.absentDays", header: "Absent Days" },
    { accessorKey: "workDays.minsLate", header: "Minutes Late" },
    { accessorKey: "holidays.regHolidayPay", header: "Reg Holiday Pay" },
    { accessorKey: "holidays.speHolidayPay", header: "Special Holiday Pay" },
    // Total Overtime fields
    { accessorKey: "totalOvertime.regularOTpay", header: "Regular OT Pay" },
    { accessorKey: "totalOvertime.restDayOtPay", header: "Rest Day OT Pay" },
    { accessorKey: "totalOvertime.restDayOtHoursExcessPay", header: "Rest Day OT Excess Pay" },
    { accessorKey: "totalOvertime.regularHolidayWorkedPay", header: "Regular Holiday Worked Pay" },
    { accessorKey: "totalOvertime.regularHolidayWorkedExcessPay", header: "Regular Holiday Worked Excess Pay" },
    { accessorKey: "totalOvertime.specialHolidayWorkedPay", header: "Special Holiday Worked Pay" },
    { accessorKey: "totalOvertime.specialHolidayWorkedOTpay", header: "Special Holiday Worked OT Pay" },
    { accessorKey: "totalOvertime.specialHolidayRDworkedPay", header: "Special Holiday RD Worked Pay" },
    { accessorKey: "totalOvertime.specialHolidayRDworkedOTpay", header: "Special Holiday RD Worked OT Pay" },
    { accessorKey: "totalOvertime.totalOvertime", header: "Total Overtime" },
    // Salary Adjustments
    { accessorKey: "salaryAdjustments.unpaidAmount", header: "Unpaid Amount" },
    { accessorKey: "salaryAdjustments.increase", header: "Salary Increase" },
    // Total Supplementary
    { accessorKey: "totalSupplementary.nightDiffPay", header: "Night Diff Pay" },
    { accessorKey: "totalSupplementary.regOTnightDiffPay", header: "Reg OT Night Diff Pay" },
    { accessorKey: "totalSupplementary.restDayNDPay", header: "Rest Day Night Diff Pay" },
    { accessorKey: "totalSupplementary.regHolNDpay", header: "Reg Holiday Night Diff Pay" },
    { accessorKey: "totalSupplementary.specialHolidayNDpay", header: "Special Holiday Night Diff Pay" },
    { accessorKey: "totalSupplementary.totalSupplementaryIncome", header: "Total Supplementary" },
    // Gross Salary
    { accessorKey: "grossSalary.grossSalary", header: "Gross Salary" },
    { accessorKey: "grossSalary.nonTaxableAllowance", header: "Non-Taxable Allowance" },
    { accessorKey: "grossSalary.performanceBonus", header: "Performance Bonus" },
    // Total Deductions
    { accessorKey: "totalDeductions.sssEmployeeShare", header: "SSS" },
    { accessorKey: "totalDeductions.phicEmployeeShare", header: "PhilHealth" },
    { accessorKey: "totalDeductions.hdmfEmployeeShare", header: "Pag-IBIG" },
    { accessorKey: "totalDeductions.totalDeductions", header: "Total Deductions" },
    // Grand Total
    { accessorKey: "grandtotal.grandtotal", header: "Net Pay" },
];


// ================= Sticky Column Helper =================
const getStickyStyle = (index: number, items: any[]) => {
    let leftOffset = 0;
    for (let i = 0; i < index; i++) {
        const prevCol = items[i].column.columnDef;
        if (prevCol.meta?.sticky) leftOffset += prevCol.meta.width || 150;
    }
    const current = items[index].column.columnDef;
    if (current.meta?.sticky) {
        return { className: "sticky bg-white z-10 border-r", style: { left: leftOffset, minWidth: current.meta.width || 150 } };
    }
    return {};
};

// ================= Payroll Table =================
const PayrollTable = ({ columns, data }: { columns: ColumnDef<Payroll>[]; data: Payroll[] }) => {
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <section className="w-full overflow-x-auto">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header, i) => {
                                const stickyProps = getStickyStyle(i, headerGroup.headers);
                                return <TableHead key={header.id} className="border" {...stickyProps}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>;
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell, i) => {
                                    const stickyProps = getStickyStyle(i, row.getVisibleCells());
                                    const value = cell.getValue() ?? 0;
                                    return <TableCell key={cell.id} className="border" {...stickyProps}>
                                        {typeof value === "number"
                                            ? value.toFixed(2)
                                            : typeof value === "string"
                                                ? value
                                                : ""}
                                    </TableCell>;
                                })}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No payroll records found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </section>
    );
};

// ================= Main Page =================
const PayrollPage = () => {
    const [data, setData] = useState<Payroll[]>([]);

    useEffect(() => {
        const fetchPayrolls = async () => {
            try {
                const res = await payrollAPI.getAllPayrolls();
                setData(Array.isArray(res.data.payrolls) ? res.data.payrolls : []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPayrolls();
    }, []);

    return (
        <section className="w-full mx-auto py-12 px-6">
            <article className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">CSV NOW OPC</h1>
                <h3 className="text-lg text-gray-600">Payroll Register</h3>
            </article>

            <div className="flex justify-between mb-6">
                <BackButton />
                <PayrollModal onAdd={p => setData(prev => [...prev, p])} />
            </div>

            <div className="bg-white rounded-sm border border-gray-200 p-4">
                <PayrollTable columns={payrollColumns} data={data} />
            </div>
        </section>
    );
};

export default PayrollPage;
