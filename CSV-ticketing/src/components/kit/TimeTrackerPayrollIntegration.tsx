import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { payrollAPI } from "@/API/endpoint";
import { Calculator, Clock, DollarSign, TrendingUp } from "lucide-react";

interface TimeTrackerPayrollIntegrationProps {
    userId: string;
    currentEntry?: any;
}

interface PayrollSummary {
    totalHoursWorked: number;
    estimatedBasicPay: number;
    estimatedOvertime: number;
    estimatedNetPay: number;
    regularDays: number;
    absentDays: number;
}

export const TimeTrackerPayrollIntegration: React.FC<TimeTrackerPayrollIntegrationProps> = ({
    userId,
    currentEntry,
}) => {
    const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [monthlyRate, setMonthlyRate] = useState(25000); // Default rate
    const { toast } = useToast();

    // Calculate current month date range
    const getCurrentMonthRange = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const formatDate = (date: Date) => {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            return `${month}/${day}/${year}`;
        };

        return {
            startDate: formatDate(startOfMonth),
            endDate: formatDate(endOfMonth),
        };
    };

    const calculatePayrollPreview = async () => {
        setIsLoading(true);
        try {
            const { startDate, endDate } = getCurrentMonthRange();

            const response = await payrollAPI.calculateFromTimeTracker({
                userId,
                startDate,
                endDate,
                payrollRate: {
                    userId,
                    monthlyRate,
                },
            });

            const result = response.data;
            const summary: PayrollSummary = {
                totalHoursWorked: result.timeTrackerData.totalHoursWorked,
                estimatedBasicPay: result.payroll.pay?.basicPay || 0,
                estimatedOvertime: result.payroll.totalOvertime?.regularOTpay || 0,
                estimatedNetPay: result.payroll.grandtotal?.grandtotal || 0,
                regularDays: result.timeTrackerData.regularDays,
                absentDays: result.timeTrackerData.absentDays,
            };

            setPayrollSummary(summary);

            toast({
                title: "Payroll Preview Updated",
                description: "Current month payroll calculated from time tracker data",
                variant: "default",
            });
        } catch (error) {
            console.error("Error calculating payroll preview:", error);
            toast({
                title: "Error",
                description: "Failed to calculate payroll preview",
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

    const getEstimatedCurrentDayPay = () => {
        if (!currentEntry || !currentEntry.timeIn || currentEntry.timeOut) return 0;

        const timeIn = new Date(`${currentEntry.date} ${currentEntry.timeIn}`);
        const now = new Date();
        const hoursWorked = (now.getTime() - timeIn.getTime()) / (1000 * 60 * 60);

        // Deduct break and lunch time if available
        let breakTime = 0;
        if (currentEntry.totalBreakTime) breakTime += parseFloat(currentEntry.totalBreakTime);
        if (currentEntry.totalSecondBreakTime) breakTime += parseFloat(currentEntry.totalSecondBreakTime);
        if (currentEntry.totalLunchTime) breakTime += parseFloat(currentEntry.totalLunchTime);

        const netHours = Math.max(0, hoursWorked - breakTime);
        const hourlyRate = monthlyRate / (26 * 8); // Monthly rate / 26 days / 8 hours

        return netHours * hourlyRate;
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payroll Integration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Session Preview */}
                {currentEntry && currentEntry.timeIn && !currentEntry.timeOut && (
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Current Session
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-green-600">Estimated Pay Today</p>
                                <p className="text-lg font-bold text-green-800">
                                    {formatCurrency(getEstimatedCurrentDayPay())}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-green-600">Time Logged</p>
                                <p className="text-sm text-green-800">
                                    {currentEntry.timeIn} - Present
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Monthly Summary */}
                {payrollSummary && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            This Month Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-blue-600">Hours Worked</p>
                                <p className="text-lg font-bold text-blue-800">
                                    {formatHours(payrollSummary.totalHoursWorked)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-blue-600">Days Worked</p>
                                <p className="text-lg font-bold text-blue-800">
                                    {payrollSummary.regularDays}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-blue-600">Basic Pay</p>
                                <p className="font-bold text-blue-800">
                                    {formatCurrency(payrollSummary.estimatedBasicPay)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-blue-600">Overtime</p>
                                <p className="font-bold text-blue-800">
                                    {formatCurrency(payrollSummary.estimatedOvertime)}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-blue-600">Estimated Net Pay</p>
                                <p className="text-xl font-bold text-blue-800">
                                    {formatCurrency(payrollSummary.estimatedNetPay)}
                                </p>
                            </div>
                        </div>

                        {payrollSummary.absentDays > 0 && (
                            <div className="mt-2">
                                <Badge variant="destructive">
                                    {payrollSummary.absentDays} absent day(s)
                                </Badge>
                            </div>
                        )}
                    </div>
                )}

                {/* Controls */}
                <div className="flex gap-2">
                    <Button
                        onClick={calculatePayrollPreview}
                        disabled={isLoading}
                        size="sm"
                        className="flex-1"
                    >
                        {isLoading ? (
                            "Calculating..."
                        ) : (
                            <>
                                <Calculator className="h-4 w-4 mr-2" />
                                Calculate This Month
                            </>
                        )}
                    </Button>
                </div>

                <div className="text-xs text-gray-500">
                    <p>• Payroll is automatically calculated based on your time tracker data</p>
                    <p>• Break and lunch times are automatically deducted</p>
                    <p>• Overtime is calculated for hours worked beyond 8 hours per day</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default TimeTrackerPayrollIntegration;
