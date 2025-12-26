/* eslint-disable prefer-const */
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as XLSX from "xlsx";

import { ExportDatas } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  startDate: string;
  endDate: string;
}

interface EmployeeTimes {
  _id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  timeIn: string;
  timeOut: string;
  totalHours: string;
  notes: string;
  shift: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  breakEnd: string;
  breakStart: string;
  totalBreakTime: number;
  lunchStart: string;
  lunchEnd: string;
  totalLunchTime: number;
}

interface EmployeeSummary {
  name: string;
  daysPresent: number;
  shiftsBreakdown: {
    "Shift 1": number;
    "Shift 2": number;
    "Shift 3": number;
    Staff: number;
  };
  lateMinutes: number;
  earlyOutMinutes: number;
}

const ExportDataTime: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      startDate: "",
      endDate: "",
    },
  });

  const getShiftTimes = (shift: string): { start: string; end: string } => {
    switch (shift) {
      case "Shift 1":
        return { start: "14:00", end: "22:00" };
      case "Shift 2":
        return { start: "22:00", end: "06:00" };
      case "Shift 3":
        return { start: "06:00", end: "14:00" };
      default:
        return { start: "09:00", end: "17:00" };
    }
  };

  const calculateTimeDifference = (time1: string, time2: string): number => {
    const [hours1, minutes1] = time1.split(":").map(Number);
    const [hours2, minutes2] = time2.split(":").map(Number);
    return hours2 * 60 + minutes2 - (hours1 * 60 + minutes1);
  };

  const convertTo24Hour = (timeStr: string): string => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const generateSummary = (
    employeeTimes: EmployeeTimes[]
  ): EmployeeSummary[] => {
    const summaryMap = new Map<string, EmployeeSummary>();

    employeeTimes.forEach((entry) => {
      if (!summaryMap.has(entry.employeeName)) {
        summaryMap.set(entry.employeeName, {
          name: entry.employeeName,
          daysPresent: 0,
          shiftsBreakdown: {
            "Shift 1": 0,
            "Shift 2": 0,
            "Shift 3": 0,
            Staff: 0,
          },
          lateMinutes: 0,
          earlyOutMinutes: 0,
        });
      }

      const summary = summaryMap.get(entry.employeeName)!;

      summary.daysPresent++;

      if (entry.shift in summary.shiftsBreakdown) {
        summary.shiftsBreakdown[
          entry.shift as keyof typeof summary.shiftsBreakdown
        ]++;
      }

      if (entry.timeIn && entry.timeOut && entry.shift !== "Staff") {
        const shiftTimes = getShiftTimes(entry.shift);
        const actualTimeIn = convertTo24Hour(entry.timeIn);
        const actualTimeOut = convertTo24Hour(entry.timeOut);

        const lateMinutes = calculateTimeDifference(
          shiftTimes.start,
          actualTimeIn
        );
        if (lateMinutes > 0) {
          summary.lateMinutes += lateMinutes;
        }

        const earlyOutMinutes = calculateTimeDifference(
          actualTimeOut,
          shiftTimes.end
        );
        if (earlyOutMinutes > 0) {
          summary.earlyOutMinutes += earlyOutMinutes;
        }
      }
    });

    return Array.from(summaryMap.values());
  };

  const onSubmit = async (formData: FormData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await ExportDatas.getEmployeeTimes();
      const allEmployeeTimes: EmployeeTimes[] = response.data;

      const startDate = new Date(formData.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(formData.endDate);
      endDate.setHours(23, 59, 59, 999);

      const parseDate = (dateString: string): Date => {
        if (dateString.includes("/")) {
          const [month, day, year] = dateString.split("/").map(Number);
          const date = new Date(year, month - 1, day);
          date.setHours(0, 0, 0, 0);
          return date;
        }
        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);
        return date;
      };

      const filteredEmployeeTimes = allEmployeeTimes.filter((entry) => {
        const entryDate = parseDate(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });

      if (filteredEmployeeTimes.length === 0) {
        alert("No data found for the selected date range");
        setIsLoading(false);
        return;
      }

      const detailedData = filteredEmployeeTimes.map((entry) => ({
        Date: entry.date,
        EmployeeName: entry.employeeName,
        Shift: entry.shift,
        TimeIn: entry.timeIn,
        TimeOut: entry.timeOut,
        TotalHours: entry.totalHours,
        TotalBreakTime: entry.totalBreakTime
          ? `${Math.round(entry.totalBreakTime * 60)} minutes`
          : " ",
        BreakStart: entry.breakStart,
        BreakEnd: entry.breakEnd,
        LunchStart: entry.lunchStart || " ",
        LunchEnd: entry.lunchEnd || " ",
        TotalLunchTime: entry.totalLunchTime
          ? `${Math.round(entry.totalLunchTime * 60)} minutes`
          : " ",
        Notes: entry.notes,
      }));

      const summaryData = generateSummary(filteredEmployeeTimes).map(
        (summary) => ({
          "Employee Name": summary.name,
          "Days Present": summary.daysPresent,
          "Shift 1 Days": summary.shiftsBreakdown["Shift 1"],
          "Shift 2 Days": summary.shiftsBreakdown["Shift 2"],
          "Shift 3 Days": summary.shiftsBreakdown["Shift 3"],
          "Staff Shift Days": summary.shiftsBreakdown["Staff"],
          "Total Late (Minutes)": summary.lateMinutes,
          "Total Early Out (Minutes)": summary.earlyOutMinutes,
        })
      );

      const workbook = XLSX.utils.book_new();

      const detailedWorksheet = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(
        workbook,
        detailedWorksheet,
        "Detailed Time Records"
      );

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

      // Adjust column widths to accommodate new columns
      detailedWorksheet["!cols"] = [
        { wch: 15 },  // Date
        { wch: 20 },  // EmployeeName
        { wch: 10 },  // Shift
        { wch: 15 },  // TimeIn
        { wch: 15 },  // TimeOut
        { wch: 10 },  // TotalHours
        { wch: 15 },  // TotalBreakTime
        { wch: 15 },  // BreakStart
        { wch: 15 },  // BreakEnd
        { wch: 15 },  // LunchStart
        { wch: 15 },  // LunchEnd
        { wch: 15 },  // TotalLunchTime
        { wch: 30 },  // Notes
      ];

      summaryWorksheet["!cols"] = [
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];

      const fileName = `Employee_Time_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex justify-center p-3">
      <BackButton />
      <form className="mt-5 w-1/2" onSubmit={handleSubmit(onSubmit)}>
        <div className="text-center">
          {/* Thanksgiving-themed header */}
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold py-1 sm:py-1 md:py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#8B4513] to-[#D2691E]">
            🦃 Give Thanks for Your Team's Time 🍂
          </h1>
          <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-amber-800">
            Select dates to harvest your time tracking data
          </p>
          <p className="text-sm text-amber-600 mt-2">
            We're grateful for your team's hard work!
          </p>
        </div>

        {/* Thanksgiving-styled form fields */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <Label htmlFor="startDate" className="text-base font-bold text-amber-800">
            <p>🦃 Start Date</p>
          </Label>
          <Controller
            name="startDate"
            control={control}
            rules={{ required: "Start date is required" }}
            render={({ field }) => (
              <Input 
                {...field} 
                type="date" 
                required 
                className="!mb-2 border-amber-300 focus:border-amber-500 bg-white"
              />
            )}
          />
          {errors.startDate && (
            <p className="text-red-600">{errors.startDate.message}</p>
          )}

          <Label htmlFor="endDate" className="text-base font-bold text-amber-800 mt-4">
            <p>🍂 End Date</p>
          </Label>
          <Controller
            name="endDate"
            control={control}
            rules={{ required: "End date is required" }}
            render={({ field }) => (
              <Input 
                {...field} 
                type="date" 
                required 
                className="!mb-2 border-amber-300 focus:border-amber-500 bg-white"
              />
            )}
          />
          {errors.endDate && (
            <p className="text-red-600">{errors.endDate.message}</p>
          )}
        </div>

        {/* Thanksgiving-themed button */}
        <Button 
          className="w-full mt-4 bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#A0522D] hover:to-[#CD853F] text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? (
            "🦃 Gathering Your Harvest..."
          ) : (
            "🍁 Export with Gratitude 🍂"
          )}
        </Button>

        {/* Thanksgiving message */}
        <div className="text-center mt-4 p-3 bg-amber-100 rounded-lg border border-amber-300">
          <p className="text-amber-700 text-sm">
            <strong>Thankful for your team's dedication!</strong>
            <br />
            Export their time data and celebrate their contributions.
          </p>
        </div>
      </form>
    </div>
  );
};

export default ExportDataTime;