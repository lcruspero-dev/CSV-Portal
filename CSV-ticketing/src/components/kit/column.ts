import type { ColumnDef } from "@tanstack/react-table"

export type Payroll = {
    id: string
    surName: string
    giveName: string
    middleName?: string
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

export const columns: ColumnDef<Payroll>[] = [
    {
        accessorKey: "id",
        header: "ID.NO.",
    },
    {
        accessorFn: (row) => {
            const middle = row.middleName ? ` ${row.middleName}` : ""
            return `${row.giveName}${middle} ${row.surName}`
        },
        id: "fullName",
        header: "Full Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "shift",
        header: "Shift",
    },
    {
        accessorKey: "position",
        header: "Position",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorFn: (row) => row.hireDate.toLocaleDateString(),
        id: "hireDate",
        header: "Hire Date",
    },
    {
        accessorFn: (row) => row.dob.toLocaleDateString(),
        id: "dob",
        header: "Date of Birth",
    },
    {
        accessorKey: "bankAcc",
        header: "Bank Account",
    },
    {
        accessorKey: "tin",
        header: "Tin Number",
    },
    {
        accessorKey: "sss",
        header: "SSS",
    },
    {
        accessorKey: "hdmf",
        header: "HDMF",
    },
    {
        accessorKey: "monthRate",
        header: "Monthly Rate",
    },
    {
        accessorKey: "dailyRate",
        header: "Daily Rate",
    },
]
