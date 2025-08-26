// components/AbsenteeismAnalytics.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  endOfMonth,
  endOfWeek,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface AbsenteeismAnalyticsProps {
  employees: {
    id: string;
    name: string;
    department: string;
  }[];
  attendance: {
    employeeId: string;
    date: Date;
    status: string;
  }[];
  schedule: {
    employeeId: string;
    date: string;
    shiftType: {
      type: string;
    };
  }[];
  viewMode: "weekly" | "monthly" | "dateRange";
  currentDate: Date;
  filteredEmployees: string[];
  fromDate?: Date; // Add fromDate prop
  toDate?: Date; // Add toDate prop
}

export const AbsenteeismAnalytics: React.FC<AbsenteeismAnalyticsProps> = ({
  employees,
  attendance,
  schedule,
  viewMode,
  currentDate,
  filteredEmployees,
  fromDate,
  toDate,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [displayMode, setDisplayMode] = React.useState<"chart" | "list">(
    "chart"
  );

  // Calculate date range based on view mode
  const getDateRange = () => {
    if (viewMode === "weekly") {
      return {
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate),
      };
    } else if (viewMode === "monthly") {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      };
    } else if (viewMode === "dateRange" && fromDate && toDate) {
      return {
        start: fromDate,
        end: toDate,
      };
    }
    // Fallback to current week
    return {
      start: startOfWeek(new Date()),
      end: endOfWeek(new Date()),
    };
  };

  const calculateAbsenteeism = () => {
    const { start, end } = getDateRange();

    return employees
      .filter((employee) => filteredEmployees.includes(employee.id))
      .map((employee) => {
        // Filter scheduled days within date range and exclude rest days
        const scheduledDays = schedule.filter(
          (entry) =>
            entry.employeeId === employee.id &&
            entry.shiftType.type !== "restday" &&
            isWithinInterval(new Date(entry.date), { start, end })
        );

        // Filter attendance records within date range
        const attendanceRecords = attendance.filter(
          (record) =>
            record.employeeId === employee.id &&
            isWithinInterval(record.date, { start, end })
        );

        // Count absences (NCNS or Call In)
        const absences = attendanceRecords.filter((record) =>
          ["NCNS", "Call In"].includes(record.status)
        ).length;

        const totalScheduledDays = scheduledDays.length;
        const absenteeismRate =
          totalScheduledDays > 0 ? (absences / totalScheduledDays) * 100 : 0;

        return {
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          totalScheduledDays,
          absences,
          absenteeismRate,
        };
      });
  };

  const absenteeismData = calculateAbsenteeism();
  const chartData = [...absenteeismData]
    .sort((a, b) => b.absenteeismRate - a.absenteeismRate)
    .slice(0, 10);

  const totalAbsences = absenteeismData.reduce(
    (sum, data) => sum + data.absences,
    0
  );
  const totalScheduledDays = absenteeismData.reduce(
    (sum, data) => sum + data.totalScheduledDays,
    0
  );
  const overallAbsenteeismRate =
    totalScheduledDays > 0 ? (totalAbsences / totalScheduledDays) * 100 : 0;

  return (
    <Card className="w-full border-0 shadow-sm ">
      <CardHeader className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm text-gray-600">
              Absenteeism Analytics
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Compact summary in the header */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Overall:</span>
              <Badge
                variant="outline"
                className={`px-2 py-1 rounded-md ${
                  overallAbsenteeismRate > 5
                    ? "bg-red-50 text-red-700 border-red-100"
                    : "bg-green-50 text-green-700 border-green-100"
                }`}
              >
                {overallAbsenteeismRate.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Absences:</span>
              <span className="font-medium">{totalAbsences}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Employees:</span>
              <span className="font-medium">{absenteeismData.length}</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p className="text-xs">
                    Absenteeism is calculated as (Number of Absences / Total
                    Programmed Days) × 100. Programmed days exclude rest days.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-3 mb-2 border-t">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">
              Employee Analytics
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setDisplayMode("chart")}
                className={`px-3 py-1 text-sm rounded-md ${
                  displayMode === "chart"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Chart View
              </button>
              <button
                onClick={() => setDisplayMode("list")}
                className={`px-3 py-1 text-sm rounded-md ${
                  displayMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                List View
              </button>
            </div>
          </div>

          {displayMode === "chart" ? (
            <div className="h-80 w-full text-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="employeeName"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 text-sm shadow-md rounded-md border">
                            <p className="font-medium">
                              {data.absences} out of {data.totalScheduledDays}
                            </p>
                            <p>
                              {data.absenteeismRate.toFixed(2)}% absenteeism
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="absenteeismRate" name="Absenteeism Rate">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.absenteeismRate > 5 ? "#ef4444" : "#10b981"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {absenteeismData.map((data) => (
                  <div
                    key={data.employeeId}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">
                          {data.employeeName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {data.department}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`rounded-md ${
                          data.absenteeismRate > 5
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-green-50 text-green-700 border-green-100"
                        }`}
                      >
                        {data.absenteeismRate.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="mt-2 border-t border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Absences:</span>
                        <span className="font-medium">{data.absences}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Scheduled Days:</span>
                        <span className="font-medium">
                          {data.totalScheduledDays}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
