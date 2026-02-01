import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import { Calendar, Download, Loader2 } from "lucide-react";

import { ExportDatas } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  secondBreakStart: string;
  secondBreakEnd: string;
  totalSecondBreakTime: number;
}

const ExportDataTime: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dateRangeError, setDateRangeError] = useState<string>("");
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      startDate: "",
      endDate: "",
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");


  const formatMinutesToHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const calculateOverbreak = (breakTime: number, allowedTime: number): number => {
    if (!breakTime || breakTime <= allowedTime) return 0;
    return Math.round((breakTime - allowedTime) * 60);
  };

  const validateDateRange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < start) {
        setDateRangeError("End date cannot be earlier than start date");
        return false;
      }
      
      // Optional: Limit date range to 1 year
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 365) {
        setDateRangeError("Date range cannot exceed 1 year");
        return false;
      }
    }
    setDateRangeError("");
    return true;
  };

  const onSubmit = async (formData: FormData): Promise<void> => {
    if (!validateDateRange()) return;

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
          return new Date(year, month - 1, day);
        }
        return new Date(dateString);
      };

      const filteredEmployeeTimes = allEmployeeTimes.filter((entry) => {
        const entryDate = parseDate(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate >= startDate && entryDate <= endDate;
      });

      if (filteredEmployeeTimes.length === 0) {
        alert("No data found for the selected date range");
        setIsLoading(false);
        return;
      }

      const detailedData = filteredEmployeeTimes.map((entry) => {
        const break1Minutes = entry.totalBreakTime ? Math.round(entry.totalBreakTime * 60) : 0;
        const break2Minutes = entry.totalSecondBreakTime ? Math.round(entry.totalSecondBreakTime * 60) : 0;
        const lunchMinutes = entry.totalLunchTime ? Math.round(entry.totalLunchTime * 60) : 0;
        
        const break1Overbreak = calculateOverbreak(entry.totalBreakTime || 0, 0.25);
        const break2Overbreak = calculateOverbreak(entry.totalSecondBreakTime || 0, 0.25);
        const lunchOverbreak = calculateOverbreak(entry.totalLunchTime || 0, 1);
        
        return {
          Date: entry.date,
          "Employee Name": entry.employeeName,
          Shift: entry.shift,
          "Time In": entry.timeIn || "-",
          "Time Out": entry.timeOut || "-",
          "Total Hours": entry.totalHours || "-",
          "Break 1 Start": entry.breakStart || "-",
          "Break 1 End": entry.breakEnd || "-",
          "Break 1 Duration": entry.totalBreakTime ? formatMinutesToHours(break1Minutes) : "-",
          "Break 1 Overbreak": break1Overbreak > 0 ? `${break1Overbreak}m` : "-",
          "Break 2 Start": entry.secondBreakStart || "-",
          "Break 2 End": entry.secondBreakEnd || "-",
          "Break 2 Duration": entry.totalSecondBreakTime ? formatMinutesToHours(break2Minutes) : "-",
          "Break 2 Overbreak": break2Overbreak > 0 ? `${break2Overbreak}m` : "-",
          "Lunch Start": entry.lunchStart || "-",
          "Lunch End": entry.lunchEnd || "-",
          "Lunch Duration": entry.totalLunchTime ? formatMinutesToHours(lunchMinutes) : "-",
          "Lunch Overbreak": lunchOverbreak > 0 ? `${lunchOverbreak}m` : "-",
          "Total Break Time": formatMinutesToHours(break1Minutes + break2Minutes + lunchMinutes),
          "Total Overbreak": break1Overbreak + break2Overbreak + lunchOverbreak > 0 
            ? `${break1Overbreak + break2Overbreak + lunchOverbreak}m` 
            : "-",
          Notes: entry.notes || "-",
        };
      });

      const workbook = XLSX.utils.book_new();
      const detailedWorksheet = XLSX.utils.json_to_sheet(detailedData);

      XLSX.utils.book_append_sheet(workbook, detailedWorksheet, "Time Records");

      const fileName = `Time_Report_${formData.startDate}_to_${formData.endDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Time Tracking Export
            </h1>
            <p className="text-gray-600 mt-1">
              Export detailed time records for payroll and analysis
            </p>
          </div>
        </div>

        <Tabs defaultValue="export" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </TabsTrigger>
            <TabsTrigger value="instructions" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Instructions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Export Time Data</CardTitle>
                <CardDescription>
                  Select a date range to generate detailed time tracking reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                        Start Date <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name="startDate"
                        control={control}
                        rules={{ required: "Start date is required" }}
                        render={({ field }) => (
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
                              type="date"
                              required
                              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                            />
                          </div>
                        )}
                      />
                      {errors.startDate && (
                        <p className="text-sm text-red-600">{errors.startDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                        End Date <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name="endDate"
                        control={control}
                        rules={{ required: "End date is required" }}
                        render={({ field }) => (
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
                              type="date"
                              required
                              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                            />
                          </div>
                        )}
                      />
                      {errors.endDate && (
                        <p className="text-sm text-red-600">{errors.endDate.message}</p>
                      )}
                    </div>
                  </div>

                  {dateRangeError && (
                    <Alert variant="destructive">
                      <AlertDescription>{dateRangeError}</AlertDescription>
                    </Alert>
                  )}

                  {startDate && endDate && !dateRangeError && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium">
                        Selected date range: {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full md:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Generate Excel Report
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Report Information</CardTitle>
                <CardDescription>
                  Understand what data will be included in your export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">📋 Time Records Sheet Includes:</h3>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Daily time in/out records for each employee</li>
                    <li>Break and lunch durations with overbreak calculations</li>
                    <li>Shift assignments and total hours worked</li>
                    <li>Employee notes and attendance remarks</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">⚠️ Important Notes</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Reports are generated in Excel (.xlsx) format</li>
                    <li>• Date range cannot exceed 1 year</li>
                    <li>• Break times exceeding policy limits are calculated as overbreak</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">Format</h3>
            <p className="text-sm text-gray-600">Excel (.xlsx) format</p>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">Data Included</h3>
            <p className="text-sm text-gray-600">Detailed time records and break data</p>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">Use Cases</h3>
            <p className="text-sm text-gray-600">Payroll, compliance, and attendance tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDataTime;