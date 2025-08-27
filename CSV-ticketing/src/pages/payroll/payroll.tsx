import { useEffect, useState } from "react"
import { columns, type Payroll } from "@/components/kit/column"
import PayrollTable from "@/components/kit/payrollTable"
import BackButton from "@/components/kit/BackButton"

const Payroll = () => {
    const [data, setData] = useState<Payroll[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const result: Payroll[] = [
                {
                    id: "728ed52f",
                    giveName: "Leester",
                    middleName: "Q.",
                    surName: "Cruspero",
                    email: "lcruspero@csvnow.com",
                    shift: "Monday-Friday",
                    position: "IT Specialist",
                    category: "Regular",
                    hireDate: new Date("2021-03-15"),
                    dob: new Date("1995-06-20"),
                    bankAcc: 1234567890,
                    tin: 123456789,
                    sss: 33242,
                    hdmf: 3242423,
                    monthRate: 3453,
                    dailyRate: 567
                },
                {
                    id: "829ed53a",
                    giveName: "Joriz",
                    middleName: "D.",
                    surName: "Cabrera",
                    email: "jcabrera@csvnow.com",
                    shift: "Tuesday-Saturday",
                    position: "IT Specialist",
                    category: "Probationary",
                    hireDate: new Date("2022-01-10"),
                    dob: new Date("1997-11-05"),
                    bankAcc: 9876543210,
                    tin: 987654321,
                    sss: 556677,
                    hdmf: 9988776,
                    monthRate: 4200,
                    dailyRate: 600
                },
            ]
            setData(result)
        }

        fetchData()
    }, [])

    return (
        <div className="w-full mx-auto py-10">
            <BackButton />
            <PayrollTable columns={columns} data={data} />
        </div>
    )
}

export default Payroll
