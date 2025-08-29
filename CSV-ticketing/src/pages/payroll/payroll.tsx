// src/pages/payroll/PayrollPage.tsx
import { useEffect, useState } from "react"
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
import { payrollAPI } from "@/API/endpoint"

// ✅ Define Payroll type
export interface Payroll {
    id: string
    giveName: string
    middleName: string
    surName: string
    email: string
    shift: string
    position: string
    category: string
    hireDate: Date
    dob: Date
    bankAcc: number
    tin: number
    sss: number
    hdmf: number
    monthRate: number
    dailyRate: number
}

// ✅ Define payroll columns
const payrollColumns: ColumnDef<Payroll>[] = [
    { accessorKey: "giveName", header: "First Name" },
    { accessorKey: "middleName", header: "Middle Name" },
    { accessorKey: "surName", header: "Last Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "shift", header: "Shift" },
    { accessorKey: "position", header: "Position" },
    { accessorKey: "category", header: "Category" },
    {
        accessorKey: "hireDate",
        header: "Hire Date",
        cell: ({ row }) => new Date(row.original.hireDate).toLocaleDateString(),
    },
    {
        accessorKey: "dob",
        header: "Date of Birth",
        cell: ({ row }) => new Date(row.original.dob).toLocaleDateString(),
    },
    { accessorKey: "bankAcc", header: "Bank Account" },
    { accessorKey: "tin", header: "TIN" },
    { accessorKey: "sss", header: "SSS" },
    { accessorKey: "hdmf", header: "HDMF" },
    { accessorKey: "monthRate", header: "Monthly Rate" },
    { accessorKey: "dailyRate", header: "Daily Rate" },
]

// ✅ Reusable table
interface PayrollTableProps {
    columns: ColumnDef<Payroll, any>[]
    data: Payroll[]
}
const PayrollTable = ({ columns, data }: PayrollTableProps) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <section className="w-full">
            <Table className="border rounded-xl shadow-sm">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No payroll records found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </section>
    )
}

// ✅ Page that fetches payrolls
const PayrollPage = () => {
    const [data, setData] = useState<Payroll[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await payrollAPI.getAllPayrolls()
                if (res.data?.status === "Success") {
                    setData(res.data.payrolls || (res.data.payroll ? [res.data.payroll] : []))
                }
            } catch (error) {
                console.error("Error fetching payroll:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="w-full mx-auto py-10">
            <BackButton />

            {loading ? (
                <p className="text-center py-4">Loading payroll records...</p>
            ) : (
                <PayrollTable columns={payrollColumns} data={data} />
            )}
        </div>
    )
}

export default PayrollPage
