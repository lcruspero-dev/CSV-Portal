const PayrollHeader = () => {
    return (
        <section className="bg-white w-full border-b border-gray-100 px-6 py-5">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

                {/* Left Section */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900">Payroll Register</h1>
                    <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">CSV NOW OPC</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm">Current Period</span>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex gap-6">
                    <div className="text-right">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pay-Out</div>
                        <div className="font-semibold text-gray-900">August 20, 2025</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cut-Off</div>
                        <div className="font-semibold text-gray-900">August 20, 2025</div>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default PayrollHeader