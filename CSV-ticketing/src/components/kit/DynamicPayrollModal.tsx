import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { payrollAPI } from "@/API/endpoint";
import { Calendar, Calculator, Clock } from "lucide-react";
import LoadingComponent from "@/components/ui/loading";

interface DynamicPayrollModalProps {
    onCalculate: (result: any) => void;
}

interface TimeTrackerData {
    totalHoursWorked: number;
    totalBreakTime: number;
    totalLunchTime: number;
    regularDays: number;
    absentDays: number;
    minutesLate: number;
}

interface PayrollResult {
    payroll: any;
    timeTrackerData: TimeTrackerData;
    dateRange: {
        startDate: string;
        endDate: string;
    };
}

export const DynamicPayrollModal: React.FC<DynamicPayrollModalProps> = ({
    onCalculate,
}) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [monthlyRate, setMonthlyRate] = useState("");
    const [result, setResult] = useState<PayrollResult | null>(null);
    const { toast } = useToast();

    // Mock user data - in real app, this would come from API
    const users = [
        { id: "user1", name: "John Doe", email: "john@csv.com" },
        { id: "user2", name: "Jane Smith", email: "jane@csv.com" },
        { id: "user3", name: "Mike Johnson", email: "mike@csv.com" },
    ];

    const handleCalculate = async () => {
        if (!selectedUser || !startDate || !endDate || !monthlyRate) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await payrollAPI.calculateFromTimeTracker({
                userId: selectedUser,
                startDate,
                endDate,
                payrollRate: {
                    userId: selectedUser,
                    monthlyRate: parseFloat(monthlyRate),
                },
            });

            const payrollResult: PayrollResult = response.data;
            setResult(payrollResult);
            onCalculate(payrollResult);

            toast({
                title: "Success",
                description: "Payroll calculated from time tracker data",
                variant: "default",
            });
        } catch (error) {
            console.error("Error calculating payroll:", error);
            toast({
                title: "Error",
                description: "Failed to calculate payroll from time tracker",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    const formatHours = (hours: number) => {
        const wholeHours = Math.floor(hours);
        const minutes = Math.round((hours - wholeHours) * 60);
        return `${wholeHours}h ${minutes}m`;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculate from Time Tracker
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Dynamic Payroll Calculation
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Input Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="user">Select Employee</Label>
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="monthlyRate">Monthly Rate (PHP)</Label>
                            <Input
                                id="monthlyRate"
                                type="number"
                                placeholder="e.g., 25000"
                                value={monthlyRate}
                                onChange={(e) => setMonthlyRate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleCalculate}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <LoadingComponent />
                                Calculating...
                            </>
                        ) : (
                            <>
                                <Calculator className="h-4 w-4 mr-2" />
                                Calculate Payroll
                            </>
                        )}
                    </Button>

                    {/* Results Section */}
                    {result && (
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Calculation Results
                            </h3>

                            {/* Time Tracker Data */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900">Time Worked</h4>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {formatHours(result.timeTrackerData.totalHoursWorked)}
                                    </p>
                                    <p className="text-sm text-blue-600">
                                        {result.timeTrackerData.regularDays} days worked
                                    </p>
                                </div>

                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-orange-900">Break Time</h4>
                                    <p className="text-2xl font-bold text-orange-700">
                                        {formatHours(result.timeTrackerData.totalBreakTime)}
                                    </p>
                                    <p className="text-sm text-orange-600">
                                        Lunch: {formatHours(result.timeTrackerData.totalLunchTime)}
                                    </p>
                                </div>

                                <div className="bg-red-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-red-900">Attendance</h4>
                                    <p className="text-2xl font-bold text-red-700">
                                        {result.timeTrackerData.absentDays} absent
                                    </p>
                                    <p className="text-sm text-red-600">
                                        {result.timeTrackerData.minutesLate} min late
                                    </p>
                                </div>
                            </div>

                            {/* Payroll Summary */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">Payroll Summary</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-green-600">Basic Pay</p>
                                        <p className="font-bold text-green-800">
                                            {formatCurrency(result.payroll.pay?.basicPay || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-600">Overtime</p>
                                        <p className="font-bold text-green-800">
                                            {formatCurrency(result.payroll.totalOvertime?.regularOTpay || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-600">Gross Salary</p>
                                        <p className="font-bold text-green-800">
                                            {formatCurrency(result.payroll.grossSalary?.grossSalary || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-600">Net Pay</p>
                                        <p className="font-bold text-green-800">
                                            {formatCurrency(result.payroll.grandtotal?.grandtotal || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setResult(null)}>
                                    Clear Results
                                </Button>
                                <Button onClick={() => setOpen(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DynamicPayrollModal;
