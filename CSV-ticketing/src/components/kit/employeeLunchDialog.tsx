// components/kit/EmployeesOnLunchDialog.tsx
import { timer, TimeRecordAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useCallback, useEffect, useRef, useState } from "react";

type IncompleteBreak = {
    employeeId: string;
    employeeName: string;
    date: string;
    type: string;
    start: string;
    end: string | null;
};

export const EmployeesOnLunchDialog = () => {
    const [breakData, setBreakData] = useState<{
        breaks: IncompleteBreak[];
        timeConsumed: { [key: string]: string };
        timeSeconds: { [key: string]: number };
    }>({ breaks: [], timeConsumed: {}, timeSeconds: {} });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Use refs for values that don't need to trigger re-renders
    const serverTimeOffset = useRef<number>(0);
    const currentTimeRef = useRef<Date>(new Date());

    // Function to calculate time consumed in seconds (current time - start time)
    const calculateTimeConsumed = useCallback(
        (startTime: string): { display: string; seconds: number } => {
            if (!startTime) return { display: "N/A", seconds: 0 };

            try {
                // Parse start time (assuming format like "HH:MM:SS AM/PM")
                const [startTimeStr, startPeriod] = startTime.split(" ");
                const [startHours, startMinutes, startSeconds] = startTimeStr
                    .split(":")
                    .map(Number);

                // Convert start time to 24-hour format
                let start24Hour = startHours;
                if (startPeriod === "PM" && start24Hour !== 12) {
                    start24Hour += 12;
                } else if (startPeriod === "AM" && start24Hour === 12) {
                    start24Hour = 0;
                }

                // Get current time components from ref
                const currentHours = currentTimeRef.current.getHours();
                const currentMinutes = currentTimeRef.current.getMinutes();
                const currentSecs = currentTimeRef.current.getSeconds();

                // Calculate difference in seconds
                const currentTotalSeconds =
                    currentHours * 3600 + currentMinutes * 60 + currentSecs;
                const startTotalSeconds =
                    start24Hour * 3600 + startMinutes * 60 + startSeconds;

                let diffSeconds = currentTotalSeconds - startTotalSeconds;

                // Handle cross-day scenario (if current time is next day)
                if (diffSeconds < 0) {
                    diffSeconds += 24 * 3600; // Add 24 hours
                }

                // Convert back to hours, minutes, seconds for display
                const hours = Math.floor(diffSeconds / 3600);
                const minutes = Math.floor((diffSeconds % 3600) / 60);
                const seconds = diffSeconds % 60;

                const display = `${hours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

                return { display, seconds: diffSeconds };
            } catch (error) {
                console.error("Error calculating time consumed:", error);
                return { display: "Error", seconds: 0 };
            }
        },
        []
    );

    // Function to determine color based on lunch break duration
    const getTimeConsumedColor = (seconds: number): string => {
        // For lunch breaks: green if less than 1 hour, red if 1 hour or more
        return seconds < 3600
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";
    };

    // Update all time consumed values
    const updateTimeConsumedValues = useCallback(() => {
        if (breakData.breaks.length === 0) return;

        const newDisplayValues: { [key: string]: string } = {};
        const newSecondsValues: { [key: string]: number } = {};

        breakData.breaks.forEach((breakItem) => {
            const key = `${breakItem.employeeId}-${breakItem.type}-${breakItem.date}`;
            const result = calculateTimeConsumed(breakItem.start);
            newDisplayValues[key] = result.display;
            newSecondsValues[key] = result.seconds;
        });

        // Update both breaks and time data together to maintain consistency
        setBreakData((prev) => ({
            ...prev,
            timeConsumed: newDisplayValues,
            timeSeconds: newSecondsValues,
        }));
    }, [breakData.breaks, calculateTimeConsumed]);

    const fetchServerTime = async () => {
        try {
            const response = await timer.getServerTime();
            const serverTimeData = response.data;

            // Calculate offset between server time and local time
            const serverTimeDate = new Date(
                `${serverTimeData.date} ${serverTimeData.time}`
            );
            const localTime = new Date();
            serverTimeOffset.current = serverTimeDate.getTime() - localTime.getTime();

            // Initialize current time reference
            currentTimeRef.current = new Date(
                localTime.getTime() + serverTimeOffset.current
            );

            return serverTimeData;
        } catch (err) {
            console.error("Error fetching server time:", err);
            return null;
        }
    };

    const fetchIncompleteBreaks = async (isBackgroundRefresh = false) => {
        if (!isBackgroundRefresh) {
            setLoading(true);
        }

        setError(null);
        try {
            // Fetch server time first
            await fetchServerTime();

            // Then fetch incomplete breaks
            const response = await TimeRecordAPI.getAllEmployeeOnBreak();

            if (response.data && Array.isArray(response.data.data)) {
                // Filter for lunch breaks only
                const newBreaks = response.data.data.filter((breakItem: any) =>
                    breakItem.type.toLowerCase().includes('lunch')
                );

                // Calculate time consumed values immediately
                const newDisplayValues: { [key: string]: string } = {};
                const newSecondsValues: { [key: string]: number } = {};

                newBreaks.forEach(
                    (breakItem: {
                        employeeId: string;
                        type: string;
                        date: string;
                        start: string;
                    }) => {
                        const key = `${breakItem.employeeId}-${breakItem.type}-${breakItem.date}`;
                        const result = calculateTimeConsumed(breakItem.start);
                        newDisplayValues[key] = result.display;
                        newSecondsValues[key] = result.seconds;
                    }
                );

                // Update all data at once to prevent inconsistencies
                setBreakData({
                    breaks: newBreaks,
                    timeConsumed: newDisplayValues,
                    timeSeconds: newSecondsValues,
                });

                setLastUpdated(new Date());
            } else {
                throw new Error("No lunch breaks found. All lunch breaks have been ended!");
            }
        } catch (err) {
            console.error("Error fetching lunch breaks:", err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to fetch lunch breaks. Please try again.");
            }
        } finally {
            if (!isBackgroundRefresh) {
                setLoading(false);
            }
        }
    };

    const refreshData = () => {
        fetchIncompleteBreaks();
    };

    // Fetch data when dialog opens
    useEffect(() => {
        if (isOpen) {
            fetchIncompleteBreaks();
        }
    }, [isOpen]);

    // Set up interval to update current time and time consumed values
    useEffect(() => {
        const interval = setInterval(() => {
            // Update current time using the offset
            const now = new Date();
            currentTimeRef.current = new Date(
                now.getTime() + serverTimeOffset.current
            );

            // Update time consumed values
            updateTimeConsumedValues();
        }, 1000);

        return () => clearInterval(interval);
    }, [updateTimeConsumedValues]);

    // Set up interval for background auto-refresh every 5 seconds ONLY when modal is open
    useEffect(() => {
        let refreshInterval: NodeJS.Timeout | null = null;

        if (isOpen) {
            refreshInterval = setInterval(() => {
                fetchIncompleteBreaks(true);
            }, 5000);
        }

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [isOpen]); // Only re-run when isOpen changes

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="text-xs">
                    View employees on lunch break
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Lunch Breaks Monitoring</DialogTitle>
                    <DialogDescription>
                        View employees currently on lunch break
                        <span className="ml-2 text-xs text-green-600">
                            Current Time: {currentTimeRef.current.toLocaleTimeString()}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-end">
                        <Button
                            onClick={refreshData}
                            variant="outline"
                            disabled={loading}
                            className="text-xs"
                        >
                            {loading ? "Refreshing..." : "Refresh Data"}
                        </Button>
                    </div>

                    <div>
                        <div className="overflow-auto max-h-[60vh] relative">
                            {error && (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-2xl mb-2">✅</div>
                                    No lunch breaks found. All lunch breaks have been ended!
                                </div>
                            )}

                            {!error && (
                                <>
                                    <table className="min-w-full divide-y divide-gray-200 border">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                                    #
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                                    Employee Name
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                                    Date
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                                    Break Type
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                                    Start Time
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                                    Elapsed Time
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {breakData.breaks.map((breakItem, index) => {
                                                const key = `${breakItem.employeeId}-${breakItem.type}-${breakItem.date}`;
                                                const timeConsumed =
                                                    breakData.timeConsumed[key] || "N/A";
                                                const seconds = breakData.timeSeconds[key] || 0;
                                                const colorClass = getTimeConsumedColor(seconds);

                                                return (
                                                    <tr key={key} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm border text-gray-700">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm border text-gray-700 font-medium">
                                                            {breakItem.employeeName}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm border text-gray-700">
                                                            {breakItem.date}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm border text-gray-700">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                                {breakItem.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm border text-gray-700">
                                                            {breakItem.start}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm border text-gray-700 font-mono">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
                                                            >
                                                                {timeConsumed}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {loading && (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                                            Loading lunch breaks data...
                                        </div>
                                    )}

                                    {!loading && breakData.breaks.length === 0 && !error && (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="text-2xl mb-2">✅</div>
                                            No lunch breaks found. All lunch breaks have been ended!
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {breakData.breaks.length > 0 && !loading && (
                            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-orange-800">
                                        <span className="font-semibold">
                                            {breakData.breaks.length}
                                        </span>{" "}
                                        lunch break(s) found
                                    </div>
                                    <div className="text-xs text-orange-600">
                                        Last updated: {lastUpdated?.toLocaleTimeString()}
                                        {isOpen && (
                                            <span className="ml-2 text-green-600">
                                                • Auto-refresh enabled (5s)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};