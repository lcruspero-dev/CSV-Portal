import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface LeaveHistoryItem {
  date: string;
  description: string;
  days: number;
  ticket: string;
  status: string;
  _id: string;
}

interface EmployeeLeaveCredit {
  _id: string;
  employeeId: string;
  employeeName: string;
  annualLeaveCredit: number;
  currentBalance: number;
  startDate: string;
  accrualRate: number;
  lastAccrualDate: string;
  nextAccrualDate: string;
  timezone: string;
  history: LeaveHistoryItem[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  isActive?: boolean;
  startingLeaveCredit?: number;
  employmentStatus?: "Probationary" | "Regular";
}

interface ExportLeaveCreditsProps {
  employees: EmployeeLeaveCredit[];
}

const ExportLeaveCredits = ({ employees }: ExportLeaveCreditsProps) => {
  const formattedDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateUsedDays = (history: LeaveHistoryItem[]): number => {
    if (!history || history.length === 0) return 0;
    return history.reduce((total, item) => {
      if (item.status === "Approved") {
        return total + item.days;
      }
      return total;
    }, 0);
  };

  const calculateDaysTenure = (startDate: string): number => {
    const start = new Date(startDate);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleExport = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Prepare main data
    const mainData = employees.map((employee) => {
      const usedDays = calculateUsedDays(employee.history);
      const daysTenure = calculateDaysTenure(employee.startDate);

      return {
        Employee: employee.employeeName,
        "Start Date": formattedDate(employee.startDate),
        Status: employee.employmentStatus || "Probationary",
        "Days Tenure": daysTenure,
        Starting: employee.startingLeaveCredit,
        Used: usedDays,
        Current: employee.currentBalance,
        "Next Accrual": formattedDate(employee.nextAccrualDate),
      };
    });

    // Create main worksheet
    const mainWorksheet = XLSX.utils.json_to_sheet(mainData);
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Leave Credits");

    // Prepare history data for all employees
    const allHistoryData: {
      Employee: string;
      Date: string;
      "Leave Type": string | undefined;
      Days: number;
      Status: string;
      Ticket: string;
    }[] = [];

    employees.forEach((employee) => {
      if (employee.history && employee.history.length > 0) {
        employee.history.forEach((historyItem) => {
          allHistoryData.push({
            Employee: employee.employeeName,
            Date: formattedDate(historyItem.date),
            "Leave Type": historyItem.description
              .split("\n")
              .find((line) => line.includes("Leave Type:"))
              ?.split("Leave Type:")[1]
              ?.trim(),
            Days: historyItem.days,
            Status: historyItem.status,
            Ticket: historyItem.ticket,
          });
        });
      }
    });

    // Create history worksheet if there's history data
    if (allHistoryData.length > 0) {
      const historyWorksheet = XLSX.utils.json_to_sheet(allHistoryData);
      XLSX.utils.book_append_sheet(workbook, historyWorksheet, "Leave History");
    }

    // Generate file name with current date
    const fileName = `Leave_Credits_Export_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    // Save the file
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Button variant="outline" onClick={handleExport} className="ml-2 text-xs">
      <Download className="mr-2 h-3 w-3" />
      Export to Excel
    </Button>
  );
};

export default ExportLeaveCredits;
