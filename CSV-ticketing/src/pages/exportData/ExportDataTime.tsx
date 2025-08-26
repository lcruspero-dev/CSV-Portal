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
        return { start: "14:00", end: "22:00" }; // 2 PM - 10 PM
      case "Shift 2":
        return { start: "22:00", end: "06:00" }; // 10 PM - 6 AM
      case "Shift 3":
        return { start: "06:00", end: "14:00" }; // 6 AM - 2 PM
      default:
        return { start: "09:00", end: "17:00" }; // Default shift for Staff
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

      // Count days present
      summary.daysPresent++;

      // Count shifts
      if (entry.shift in summary.shiftsBreakdown) {
        summary.shiftsBreakdown[
          entry.shift as keyof typeof summary.shiftsBreakdown
        ]++;
      }

      // Calculate late minutes and early out (excluding Staff shifts)
      if (entry.timeIn && entry.timeOut && entry.shift !== "Staff") {
        const shiftTimes = getShiftTimes(entry.shift);
        const actualTimeIn = convertTo24Hour(entry.timeIn);
        const actualTimeOut = convertTo24Hour(entry.timeOut);

        // Calculate late minutes
        const lateMinutes = calculateTimeDifference(
          shiftTimes.start,
          actualTimeIn
        );
        if (lateMinutes > 0) {
          summary.lateMinutes += lateMinutes;
        }

        // Calculate early out minutes
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
      // Fetch data and filter as before
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

      // Generate detailed data for first sheet
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
        Notes: entry.notes,
      }));

      // Generate summary data
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

      // Create workbook and add sheets
      const workbook = XLSX.utils.book_new();

      // Add detailed sheet
      const detailedWorksheet = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(
        workbook,
        detailedWorksheet,
        "Detailed Time Records"
      );

      // Add summary sheet
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

      // Set column widths for both sheets
      detailedWorksheet["!cols"] = [
        { wch: 15 }, // date
        { wch: 20 }, // EmployeeName
        { wch: 10 }, // Shift
        { wch: 15 }, // TimeIn
        { wch: 15 }, // TimeOut
        { wch: 10 }, // TotalHours
        { wch: 10 }, // totalBreakTime
        { wch: 15 }, // breakStart
        { wch: 15 }, // breakEnd
        { wch: 30 }, // Notes
      ];

      summaryWorksheet["!cols"] = [
        { wch: 20 }, // Employee Name
        { wch: 12 }, // Days Present
        { wch: 12 }, // Shift 1
        { wch: 12 }, // Shift 2
        { wch: 12 }, // Shift 3
        { wch: 15 }, // Staff Shift
        { wch: 15 }, // Late Minutes
        { wch: 15 }, // Early Out Minutes
      ];

      // Generate filename and save
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
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold py-1 sm:py-1 md:py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Export Time Tracker Data
          </h1>
          <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-black">
            Please select the date range
          </p>
        </div>

        <Label htmlFor="startDate" className="text-base font-bold">
          <p>Start Date</p>
        </Label>
        <Controller
          name="startDate"
          control={control}
          rules={{ required: "Start date is required" }}
          render={({ field }) => (
            <Input {...field} type="date" required className="!mb-2" />
          )}
        />
        {errors.startDate && (
          <p className="text-red-500">{errors.startDate.message}</p>
        )}

        <Label htmlFor="endDate" className="text-base font-bold">
          <p>End Date</p>
        </Label>
        <Controller
          name="endDate"
          control={control}
          rules={{ required: "End date is required" }}
          render={({ field }) => (
            <Input {...field} type="date" required className="!mb-2" />
          )}
        />
        {errors.endDate && (
          <p className="text-red-500">{errors.endDate.message}</p>
        )}

        <Button className="w-full mt-2" type="submit" disabled={isLoading}>
          {isLoading ? "Exporting..." : "Export Data"}
        </Button>
      </form>
    </div>
  );
};

export default ExportDataTime;
