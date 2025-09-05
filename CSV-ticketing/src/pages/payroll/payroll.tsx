import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import BackButton from "@/components/kit/BackButton"

// ================= Payroll Interface =================
export interface Payroll {
    id: string
    employee: {
        email: string
        fullName: string
        position: string
    }
    payrollRate: {
        userId: string
        monthlyRate: number
        dailyRate: number
        hourlyRate: number
    }
    pay: { basicPay: number }
    workDays: { regularDays: number; absentDays: number; minsLate: number }
    holidays: {
        regHoliday: number
        regHolidayPay: number
        speHoliday: number
        speHolidayPay: number
    }
    totalOvertime: {
        regularOT: number
        regularOTpay: number
        restDayOtHours: number
        restDayOtPay: number
    }
    totalSupplementary: {
        nightDiffHours: number
        nightDiffPay: number
    }
    grossSalary: { grossSalary: number }
    totalDeductions: { totalDeductions: number }
    grandtotal: { grandtotal: number }
}

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

    { accessorKey: "holidays.regHoliday", header: "Reg Holiday" },
    { accessorKey: "holidays.regHolidayPay", header: "Reg Holiday Pay" },
    { accessorKey: "holidays.speHoliday", header: "Special Holiday" },
    { accessorKey: "holidays.speHolidayPay", header: "Special Holiday Pay" },

    { accessorKey: "totalOvertime.regularOT", header: "Regular OT Hours" },
    { accessorKey: "totalOvertime.regularOTpay", header: "Regular OT Pay" },
    { accessorKey: "totalOvertime.restDayOtHours", header: "Rest Day OT Hours" },
    { accessorKey: "totalOvertime.restDayOtPay", header: "Rest Day OT Pay" },

    { accessorKey: "totalSupplementary.nightDiffHours", header: "ND Hours" },
    { accessorKey: "totalSupplementary.nightDiffPay", header: "ND Pay" },

    { accessorKey: "grossSalary.grossSalary", header: "Gross Salary" },
    { accessorKey: "totalDeductions.totalDeductions", header: "Deductions" },
    { accessorKey: "grandtotal.grandtotal", header: "Net Pay" },
]

// ================= Sticky Helper =================
const getStickyStyle = (index: number, items: any[]) => {
    let leftOffset = 0
    for (let i = 0; i < index; i++) {
        const prevCol = items[i].column.columnDef
        if (prevCol.meta?.sticky) {
            leftOffset += prevCol.meta.width || 150
        }
    }
    const current = items[index].column.columnDef
    if (current.meta?.sticky) {
        return {
            className: "sticky bg-white z-10",
            style: { left: leftOffset, minWidth: current.meta.width || 150 },
        }
    }
    return {}
}

// ================= Payroll Computation =================
const computePayroll = (form: any): Payroll => {
    const dailyRate = form.monthlyRate / 26
    const hourlyRate = dailyRate / 8

    const basicPay = form.regularDays * dailyRate
    const regHolidayPay = form.regHoliday * dailyRate * 2 // 200%
    const speHolidayPay = form.speHoliday * dailyRate * 1.5 // 150%

    const regularOTpay = form.regularOT * hourlyRate * 1.25
    const restDayOtPay = form.restDayOT * hourlyRate * 1.3
    const ndPay = form.ndHours * hourlyRate * 0.1

    const grossSalary =
        basicPay + regHolidayPay + speHolidayPay + regularOTpay + restDayOtPay + ndPay

    const deductions =
        form.absentDays * dailyRate + (form.minsLate / 60) * hourlyRate + 500 // dummy fixed deduction
    const net = grossSalary - deductions

    return {
        id: crypto.randomUUID(),
        employee: {
            email: form.email,
            fullName: form.fullName,
            position: form.position,
        },
        payrollRate: {
            userId: "dummy",
            monthlyRate: form.monthlyRate,
            dailyRate,
            hourlyRate,
        },
        pay: { basicPay },
        workDays: {
            regularDays: form.regularDays,
            absentDays: form.absentDays,
            minsLate: form.minsLate,
        },
        holidays: {
            regHoliday: form.regHoliday,
            regHolidayPay,
            speHoliday: form.speHoliday,
            speHolidayPay,
        },
        totalOvertime: {
            regularOT: form.regularOT,
            regularOTpay,
            restDayOtHours: form.restDayOT,
            restDayOtPay,
        },
        totalSupplementary: {
            nightDiffHours: form.ndHours,
            nightDiffPay: ndPay,
        },
        grossSalary: { grossSalary },
        totalDeductions: { totalDeductions: deductions },
        grandtotal: { grandtotal: net },
    }
}

// ================= Table Component =================
const PayrollTable = ({ columns, data, onUpdate }: {
    columns: ColumnDef<Payroll>[];
    data: Payroll[];
    onUpdate: (updated: Payroll[]) => void
}) => {
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

    const handleEdit = (rowIndex: number, keyPath: string, value: any) => {
        const updated = [...data]
        // update nested property dynamically
        const keys = keyPath.split(".")
        let ref: any = updated[rowIndex]
        for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]]
        ref[keys[keys.length - 1]] = isNaN(value) ? value : Number(value)

        // re-compute payroll after edits
        updated[rowIndex] = computePayroll({
            ...updated[rowIndex].employee,
            ...updated[rowIndex].payrollRate,
            ...updated[rowIndex].workDays,
            ...updated[rowIndex].holidays,
            ...updated[rowIndex].totalOvertime,
            ...updated[rowIndex].totalSupplementary,
        })
        onUpdate(updated)
    }

    return (
        <section className="w-full overflow-x-auto">
            <Table className="border rounded-xl shadow-sm min-w-max">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header, i) => {
                                const stickyProps = getStickyStyle(i, headerGroup.headers)
                                return (
                                    <TableHead key={header.id} className="border border-r" {...stickyProps}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row, rowIndex) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell, i) => {
                                    const stickyProps = getStickyStyle(i, row.getVisibleCells())
                                    const accessorKey = cell.column.id as string

                                    return (
                                        <TableCell key={cell.id} className="border border-r" {...stickyProps}>
                                            {typeof cell.getValue() === "number" ? (
                                                <input
                                                    type="number"
                                                    className="w-24 border rounded px-1"
                                                    value={cell.getValue() as number}
                                                    onChange={(e) => handleEdit(rowIndex, accessorKey, e.target.value)}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="w-32 border rounded px-1"
                                                    value={cell.getValue() as string}
                                                    onChange={(e) => handleEdit(rowIndex, accessorKey, e.target.value)}
                                                />
                                            )}
                                        </TableCell>
                                    )
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
    )
}


// ================= Create Payroll Modal =================
const CreatePayrollModal = ({ onAdd }: { onAdd: (p: Payroll) => void }) => {
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<any>({
        email: "",
        fullName: "",
        position: "",
        monthlyRate: 30000,
        regularDays: 20,
        absentDays: 0,
        minsLate: 0,
        regHoliday: 0,
        speHoliday: 0,
        regularOT: 0,
        restDayOT: 0,
        ndHours: 0,
    })

    const handleChange = (e: any) => {
        const { name, value, type } = e.target
        setForm((prev: any) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }))
    }

    const payrollPreview = computePayroll(form)

    const handleCreate = () => {
        onAdd(payrollPreview)
        setOpen(false)
    }

    return (
        <>
            <Button onClick={() => setOpen(true)}>Create Payroll</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Create Payroll</DialogTitle>
                    </DialogHeader>

                    {/* FORM */}
                    <div className="grid grid-cols-2 gap-4 py-4">
                        {Object.keys(form).map((key) => (
                            <div key={key} className="flex flex-col">
                                <label className="text-sm capitalize">{key}</label>
                                <input
                                    type={typeof form[key] === "number" ? "number" : "text"}
                                    name={key}
                                    value={form[key]}
                                    onChange={handleChange}
                                    className="border rounded px-2 py-1"
                                />
                            </div>
                        ))}
                    </div>

                    {/* PREVIEW */}
                    <div className="bg-gray-50 border rounded-lg p-4 mt-4">
                        <h3 className="font-semibold mb-2">Payroll Preview</h3>
                        <ul className="grid grid-cols-2 gap-2 text-sm">
                            <li><b>Basic Pay:</b> {payrollPreview.pay.basicPay.toFixed(2)}</li>
                            <li><b>Reg Holiday Pay:</b> {payrollPreview.holidays.regHolidayPay.toFixed(2)}</li>
                            <li><b>Spe Holiday Pay:</b> {payrollPreview.holidays.speHolidayPay.toFixed(2)}</li>
                            <li><b>Regular OT Pay:</b> {payrollPreview.totalOvertime.regularOTpay.toFixed(2)}</li>
                            <li><b>Rest Day OT Pay:</b> {payrollPreview.totalOvertime.restDayOtPay.toFixed(2)}</li>
                            <li><b>Night Diff Pay:</b> {payrollPreview.totalSupplementary.nightDiffPay.toFixed(2)}</li>
                            <li><b>Gross Salary:</b> {payrollPreview.grossSalary.grossSalary.toFixed(2)}</li>
                            <li><b>Deductions:</b> {payrollPreview.totalDeductions.totalDeductions.toFixed(2)}</li>
                            <li><b>Net Pay:</b> {payrollPreview.grandtotal.grandtotal.toFixed(2)}</li>
                        </ul>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Generate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}


// ================= Page =================
const PayrollPage = () => {
    const [data, setData] = useState<Payroll[]>([])

    return (
        <div className="w-full mx-auto py-10">
            <BackButton />
            <div className="flex justify-end mb-4">
                <CreatePayrollModal onAdd={(p) => setData((prev) => [...prev, p])} />
            </div>
            <PayrollTable columns={payrollColumns} data={data} onUpdate={setData} />
        </div>
    )
}


export default PayrollPage
