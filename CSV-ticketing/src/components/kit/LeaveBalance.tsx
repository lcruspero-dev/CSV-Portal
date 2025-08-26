import { LeaveCreditAPI } from "@/API/endpoint"; // Make sure to import the API
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface LeaveBalance {
  currentBalance: number;
  nextAccrualDate: string;
}

const LeaveBalanceDisplay = () => {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        setIsLoading(true);
        // Using the LeaveCreditAPI instead of direct fetch
        const response = await LeaveCreditAPI.getLeaveCreditById();

        // if (!response.ok) {
        //   throw new Error("Failed to fetch leave balance");
        // }

        const data = await response.data; // Assuming the API returns data in a 'data' property
        setBalance(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: Error | any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveBalance();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
        <span className="text-sm text-gray-500">Loading balance...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">Error loading leave balance</div>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <div className="flex items-center pt-1">
      <span className="text-sm mr-2">Leave Balance:</span>
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 hover:bg-blue-100"
      >
        {balance.currentBalance} {balance.currentBalance <= 1 ? "day" : "days"}
      </Badge>
      <span className="text-xs text-gray-500 ml-2">
        Next accrual: {new Date(balance.nextAccrualDate).toLocaleDateString()}
      </span>
    </div>
  );
};

export default LeaveBalanceDisplay;
