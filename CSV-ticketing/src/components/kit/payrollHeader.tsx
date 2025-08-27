const PayrollHeader = () => {
    return (
        <section className="bg-white w-full shadow-md p-4">
            <nav className="flex flex-col md:flex-row justify-between items-center gap-4">

                {/* Left Section */}
                <div className="text-center md:text-left">
                    <h1 className="text-xl font-bold">CSV NOW OPC</h1>
                    <h4 className="text-gray-600">Payroll Register</h4>
                </div>

                {/* Right Section */}
                <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm md:text-base">
                    <h3 className="font-medium">
                        Pay-Out: <span className="font-normal text-gray-700">20-Aug-25</span>
                    </h3>
                    <h3 className="font-medium">
                        Cut-Off: <span className="font-normal text-gray-700">20-Aug-25</span>
                    </h3>
                </div>

            </nav>
        </section>

    )
}

export default PayrollHeader