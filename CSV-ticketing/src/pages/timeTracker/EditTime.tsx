/* eslint-disable prefer-const */
import { TimeRecordAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit3,
  EyeIcon,
  EyeOffIcon,
  Key,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface TimeRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  totalHours: string;
  notes?: string | null;
  shift?: string | null;
  breakStart?: string | null;
  breakEnd?: string | null;
  totalBreakTime?: string | null;
  lunchStart?: string | null;
  lunchEnd?: string | null;
  totalLunchTime?: string | null;
  secondBreakStart?: string | null;
  secondBreakEnd?: string | null;
  totalSecondBreakTime?: string | null;
  secretKey?: string | null;
}

const calculateTotalHours = (
  record: TimeRecord,
): {
  totalHours: string;
  totalBreakTime: string;
  totalLunchTime: string;
  totalSecondBreakTime: string;
} => {
  if (!record.timeIn || !record.timeOut) {
    return {
      totalHours: "0.00",
      totalBreakTime: "0.00",
      totalLunchTime: "0.00",
      totalSecondBreakTime: "0.00",
    };
  }

  const parseTime = (time: string | null | undefined) => {
    if (!time) return { hours: 0, minutes: 0, seconds: 0 };

    const [timePart, modifier] = time.split(" ");
    let [hours, minutes, seconds] = timePart.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return { hours, minutes, seconds };
  };

  const convertToSeconds = (timeString: string | null | undefined) => {
    if (!timeString) return 0;

    const { hours, minutes, seconds } = parseTime(timeString);

    return hours * 3600 + minutes * 60 + seconds;
  };

  const inTotalSeconds = convertToSeconds(record.timeIn);
  let outTotalSeconds = convertToSeconds(record.timeOut);

  if (inTotalSeconds === 0 || outTotalSeconds === 0) {
    return {
      totalHours: "0.00",
      totalBreakTime: "0.00",
      totalLunchTime: "0.00",
      totalSecondBreakTime: "0.00",
    };
  }

  if (outTotalSeconds < inTotalSeconds) {
    outTotalSeconds += 24 * 3600;
  }

  let breakTimeSeconds = 0;
  let lunchTimeSeconds = 0;
  let secondBreakTimeSeconds = 0;

  let breakDeductionSeconds = 0;
  let lunchDeductionSeconds = 0;
  let secondBreakDeductionSeconds = 0;

  if (record.breakStart && record.breakEnd) {
    const breakStartSeconds = convertToSeconds(record.breakStart);
    let breakEndSeconds = convertToSeconds(record.breakEnd);

    if (breakStartSeconds > 0 && breakEndSeconds > 0) {
      if (breakEndSeconds < breakStartSeconds) {
        breakEndSeconds += 24 * 3600;
      }

      const totalBreakSeconds = breakEndSeconds - breakStartSeconds;

      breakTimeSeconds = totalBreakSeconds;

      breakDeductionSeconds =
        totalBreakSeconds > 900 ? totalBreakSeconds - 900 : 0;
    }
  }

  if (record.lunchStart && record.lunchEnd) {
    const lunchStartSeconds = convertToSeconds(record.lunchStart);
    let lunchEndSeconds = convertToSeconds(record.lunchEnd);

    if (lunchStartSeconds > 0 && lunchEndSeconds > 0) {
      if (lunchEndSeconds < lunchStartSeconds) {
        lunchEndSeconds += 24 * 3600;
      }

      lunchTimeSeconds = lunchEndSeconds - lunchStartSeconds;

      lunchDeductionSeconds = lunchTimeSeconds;
    }
  }

  if (record.secondBreakStart && record.secondBreakEnd) {
    const secondBreakStartSeconds = convertToSeconds(record.secondBreakStart);

    let secondBreakEndSeconds = convertToSeconds(record.secondBreakEnd);

    if (secondBreakStartSeconds > 0 && secondBreakEndSeconds > 0) {
      if (secondBreakEndSeconds < secondBreakStartSeconds) {
        secondBreakEndSeconds += 24 * 3600;
      }

      const totalSecondBreakSeconds =
        secondBreakEndSeconds - secondBreakStartSeconds;

      secondBreakTimeSeconds = totalSecondBreakSeconds;

      secondBreakDeductionSeconds =
        totalSecondBreakSeconds > 900 ? totalSecondBreakSeconds - 900 : 0;
    }
  }

  const totalWorkSeconds = outTotalSeconds - inTotalSeconds;

  const totalDeductionSeconds =
    breakDeductionSeconds + lunchDeductionSeconds + secondBreakDeductionSeconds;

  const netWorkSeconds = Math.max(0, totalWorkSeconds - totalDeductionSeconds);

  const totalHours = (netWorkSeconds / 3600).toFixed(2);
  const totalBreakTime = (breakTimeSeconds / 3600).toFixed(2);
  const totalLunchTime = (lunchTimeSeconds / 3600).toFixed(2);
  const totalSecondBreakTime = (secondBreakTimeSeconds / 3600).toFixed(2);

  return {
    totalHours,
    totalBreakTime,
    totalLunchTime,
    totalSecondBreakTime,
  };
};

const formatHoursToMinutes = (hoursString: string): string => {
  const hours = parseFloat(hoursString);

  if (isNaN(hours)) return "0 minutes";

  const totalMinutes = Math.round(hours * 60);

  const hoursPart = Math.floor(totalMinutes / 60);
  const minutesPart = totalMinutes % 60;

  if (hoursPart === 0) {
    return `${minutesPart} minutes`;
  } else if (minutesPart === 0) {
    return `${hoursPart} hours`;
  } else {
    return `${hoursPart}h ${minutesPart}m`;
  }
};

const employeeGroupOptions = [
  { label: "All Employees", value: "csv-all" },
  { label: "Morning Shift", value: "csv-shift1" },
  { label: "Mid Shift", value: "csv-shift2" },
  { label: "Night Shift", value: "csv-shift3" },
  { label: "Staff", value: "csv-staff" },
  { label: "Search by Name", value: "search-by-name" },
];

const AdminTimeRecordEdit: React.FC = () => {
  const [searchType, setSearchType] = useState("search-by-name");
  const [searchName, setSearchName] = useState("");

  // Changed from single date to date range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);

  const [secretKey, setSecretKey] = useState("");
  const [secretKeyError, setSecretKeyError] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const showToast = (
    title: string,
    description: string,
    variant: "default" | "destructive" = "default",
  ) => {
    toast({
      title,
      description,
      variant,
    });
  };

  const validateSecretKey = () => {
    if (!secretKey) {
      setSecretKeyError("Private key is required");
      return false;
    }

    setSecretKeyError("");

    return true;
  };

  // SEARCH EMPLOYEE TIME RECORDS BY DATE RANGE

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      showToast(
        "Validation Error",
        "Please select both start and end dates",
        "destructive",
      );

      return;
    }

    if (startDate > endDate) {
      showToast(
        "Validation Error",
        "Start date cannot be later than end date",
        "destructive",
      );

      return;
    }

    if (searchType === "search-by-name" && !searchName.trim()) {
      showToast(
        "Validation Error",
        "Please enter an employee name",
        "destructive",
      );

      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (searchType === "search-by-name") {
        response = await TimeRecordAPI.getTimeRecordsByNameAndDateRange(
          searchName.trim(),
          startDate,
          endDate,
        );
      } else {
        response = await TimeRecordAPI.getTimeRecordsByNameAndDateRange(
          searchType,
          startDate,
          endDate,
        );
      }

      setTimeRecords(response.data);

      if (response.data.length === 0) {
        showToast(
          "No Records Found",
          "No time records found for the selected criteria",
        );
      } else {
        showToast("Search Complete", `Found ${response.data.length} record(s)`);
      }
    } catch (error) {
      console.error("Search failed", error);

      setTimeRecords([]);

      showToast("Search Error", "Failed to fetch time records", "destructive");
    } finally {
      setIsLoading(false);
    }
  };

  // EDIT

  const handleEdit = (record: TimeRecord) => {
    setEditingRecord(record);
    setSecretKey("");
    setSecretKeyError("");
  };

  // UPDATE

  const handleUpdate = async () => {
    if (!editingRecord) return;

    if (!validateSecretKey()) {
      return;
    }

    setIsLoading(true);

    try {
      const {
        totalHours,
        totalBreakTime,
        totalLunchTime,
        totalSecondBreakTime,
      } = calculateTotalHours(editingRecord);

      const updatedRecord = {
        ...editingRecord,
        breakStart: editingRecord.breakStart || null,
        breakEnd: editingRecord.breakEnd || null,
        lunchStart: editingRecord.lunchStart || null,
        lunchEnd: editingRecord.lunchEnd || null,
        secondBreakStart: editingRecord.secondBreakStart || null,
        secondBreakEnd: editingRecord.secondBreakEnd || null,
        totalHours,
        totalBreakTime,
        totalLunchTime,
        totalSecondBreakTime,
      };

      await TimeRecordAPI.updateTimeRecord(updatedRecord._id, {
        ...updatedRecord,
        secretKey,
      });

      setTimeRecords((prev) =>
        prev.map((record) =>
          record._id === updatedRecord._id ? updatedRecord : record,
        ),
      );

      showToast("Success", "Time record updated successfully");

      setEditingRecord(null);
      setSecretKey("");
    } catch (error) {
      console.error("Update failed", error);

      showToast("Update Error", "Failed to update time record", "destructive");
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE

  const handleDelete = async (_id: string) => {
    try {
      await TimeRecordAPI.deleteTimeRecord(_id);

      setTimeRecords((prev) => prev.filter((record) => record._id !== _id));

      showToast("Record Deleted", "Time record removed successfully");
    } catch (error) {
      console.error("Delete failed", error);

      showToast("Delete Error", "Failed to delete time record", "destructive");
    }
  };

  // TIME INPUT

  const handleTimeInputChange = (
    field: keyof TimeRecord,
    value: string,
    record: TimeRecord,
  ) => {
    const updatedRecord = {
      ...record,
      [field]: value || null,
    };

    const { totalHours, totalBreakTime, totalLunchTime, totalSecondBreakTime } =
      calculateTotalHours(updatedRecord);

    setEditingRecord({
      ...updatedRecord,
      totalHours,
      totalBreakTime,
      totalLunchTime,
      totalSecondBreakTime,
    });
  };

  // SECRET KEY

  const toggleSecretKeyVisibility = () => {
    setShowSecretKey(!showSecretKey);
  };

  // HOURS COLOR

  const getHoursColor = (hours: string) => {
    const numHours = parseFloat(hours);

    if (numHours >= 8)
      return "bg-green-100 text-green-800 border border-green-200";

    if (numHours >= 6)
      return "bg-amber-100 text-amber-800 border border-amber-200";

    return "bg-red-100 text-red-800 border border-red-200";
  };

  // CLEAR SEARCH

  const clearSearch = () => {
    setSearchName("");
    setStartDate("");
    setEndDate("");
    setTimeRecords([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Time Records</h1>
              <p className="text-gray-600 text-sm">
                Edit and manage employee time
              </p>
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* SEARCH SECTION - SIMPLIFIED */}
        <Card className="border border-gray-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search Type */}
              <div>
                <Label className="text-xs font-medium text-gray-600 uppercase mb-2 block">
                  Employee
                </Label>
                <Select onValueChange={setSearchType} value={searchType}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeGroupOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employee Name */}
              {searchType === "search-by-name" && (
                <div>
                  <Label className="text-xs font-medium text-gray-600 uppercase mb-2 block">
                    Name
                  </Label>
                  <Input
                    placeholder="Enter name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="h-9"
                  />
                </div>
              )}

              {/* Date Range */}
              <div>
                <Label className="text-xs font-medium text-gray-600 uppercase mb-2 block">
                  From
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-600 uppercase mb-2 block">
                  To
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 items-end">
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  size="sm"
                  className="flex-1 h-9 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  size="sm"
                  className="h-9"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RESULTS TABLE - SIMPLIFIED */}
        {timeRecords.length > 0 && (
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Records
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {timeRecords.length} record(s) • {startDate} to {endDate}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{timeRecords.length}</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time In → Out</TableHead>
                      <TableHead className="text-center">Work</TableHead>
                      <TableHead className="text-center">Break</TableHead>
                      <TableHead className="text-center">Lunch</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {timeRecords.map((record) => (
                      <TableRow key={record._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                              {record.employeeName.charAt(0).toUpperCase()}
                            </div>
                            {record.employeeName}
                          </div>
                        </TableCell>

                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {record.date}
                          </div>
                        </TableCell>

                        <TableCell className="text-sm">
                          <div className="text-gray-900">
                            {record.timeIn
                              ? `${record.timeIn} → ${record.timeOut || "—"}`
                              : "—"}
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            className={getHoursColor(record.totalHours)}
                            variant="outline"
                          >
                            {record.totalHours}h
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center text-sm text-gray-600">
                          {record.totalBreakTime &&
                          record.totalBreakTime !== "0.00"
                            ? formatHoursToMinutes(record.totalBreakTime)
                            : "—"}
                        </TableCell>

                        <TableCell className="text-center text-sm text-gray-600">
                          {record.totalLunchTime &&
                          record.totalLunchTime !== "0.00"
                            ? formatHoursToMinutes(record.totalLunchTime)
                            : "—"}
                        </TableCell>

                        <TableCell>
                          {record.shift ? (
                            <Badge variant="outline" className="bg-gray-50">
                              {record.shift}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(record)}
                                  className="h-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>

                              {/* EDIT MODAL */}
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Edit3 className="h-5 w-5 text-blue-600" />
                                    Edit Time Record
                                  </DialogTitle>
                                </DialogHeader>

                                {editingRecord &&
                                  editingRecord._id === record._id && (
                                    <div className="space-y-5">
                                      {/* Employee Info */}
                                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">
                                            {editingRecord.employeeName
                                              .charAt(0)
                                              .toUpperCase()}
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-900">
                                              {editingRecord.employeeName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              {editingRecord.date}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Work Hours Section */}
                                      <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                          <Clock className="h-4 w-4 text-blue-600" />
                                          Work Hours
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div>
                                            <Label className="text-xs">
                                              Time In
                                            </Label>
                                            <Input
                                              value={editingRecord.timeIn || ""}
                                              onChange={(e) =>
                                                handleTimeInputChange(
                                                  "timeIn",
                                                  e.target.value,
                                                  editingRecord,
                                                )
                                              }
                                              placeholder="09:00 AM"
                                              className="h-9 text-sm"
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-xs">
                                              Time Out
                                            </Label>
                                            <Input
                                              value={
                                                editingRecord.timeOut || ""
                                              }
                                              onChange={(e) =>
                                                handleTimeInputChange(
                                                  "timeOut",
                                                  e.target.value,
                                                  editingRecord,
                                                )
                                              }
                                              placeholder="05:00 PM"
                                              className="h-9 text-sm"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Breaks Section - Collapsible */}
                                      <details className="border border-gray-200 rounded-lg p-3 open:bg-gray-50">
                                        <summary className="cursor-pointer font-semibold text-sm text-gray-900 flex items-center gap-2">
                                          <span>☕</span> Breaks
                                        </summary>
                                        <div className="mt-3 space-y-3 pt-3 border-t">
                                          <div>
                                            <Label className="text-xs">
                                              1st Break
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                              <Input
                                                value={
                                                  editingRecord.breakStart || ""
                                                }
                                                onChange={(e) =>
                                                  handleTimeInputChange(
                                                    "breakStart",
                                                    e.target.value,
                                                    editingRecord,
                                                  )
                                                }
                                                placeholder="Start"
                                                className="h-9 text-sm"
                                              />
                                              <Input
                                                value={
                                                  editingRecord.breakEnd || ""
                                                }
                                                onChange={(e) =>
                                                  handleTimeInputChange(
                                                    "breakEnd",
                                                    e.target.value,
                                                    editingRecord,
                                                  )
                                                }
                                                placeholder="End"
                                                className="h-9 text-sm"
                                              />
                                            </div>
                                          </div>

                                          <div>
                                            <Label className="text-xs">
                                              2nd Break
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                              <Input
                                                value={
                                                  editingRecord.secondBreakStart ||
                                                  ""
                                                }
                                                onChange={(e) =>
                                                  handleTimeInputChange(
                                                    "secondBreakStart",
                                                    e.target.value,
                                                    editingRecord,
                                                  )
                                                }
                                                placeholder="Start"
                                                className="h-9 text-sm"
                                              />
                                              <Input
                                                value={
                                                  editingRecord.secondBreakEnd ||
                                                  ""
                                                }
                                                onChange={(e) =>
                                                  handleTimeInputChange(
                                                    "secondBreakEnd",
                                                    e.target.value,
                                                    editingRecord,
                                                  )
                                                }
                                                placeholder="End"
                                                className="h-9 text-sm"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </details>

                                      {/* Lunch Section - Collapsible */}
                                      <details className="border border-gray-200 rounded-lg p-3 open:bg-gray-50">
                                        <summary className="cursor-pointer font-semibold text-sm text-gray-900 flex items-center gap-2">
                                          <span>🍽️</span> Lunch
                                        </summary>
                                        <div className="mt-3 space-y-3 pt-3 border-t">
                                          <Label className="text-xs">
                                            Lunch Time
                                          </Label>
                                          <div className="grid grid-cols-2 gap-2">
                                            <Input
                                              value={
                                                editingRecord.lunchStart || ""
                                              }
                                              onChange={(e) =>
                                                handleTimeInputChange(
                                                  "lunchStart",
                                                  e.target.value,
                                                  editingRecord,
                                                )
                                              }
                                              placeholder="Start"
                                              className="h-9 text-sm"
                                            />
                                            <Input
                                              value={
                                                editingRecord.lunchEnd || ""
                                              }
                                              onChange={(e) =>
                                                handleTimeInputChange(
                                                  "lunchEnd",
                                                  e.target.value,
                                                  editingRecord,
                                                )
                                              }
                                              placeholder="End"
                                              className="h-9 text-sm"
                                            />
                                          </div>
                                        </div>
                                      </details>

                                      {/* Summary */}
                                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                                        <div className="grid grid-cols-3 gap-3">
                                          <div className="text-center">
                                            <p className="text-xs text-gray-600">
                                              Total Hours
                                            </p>
                                            <p className="text-lg font-bold text-blue-700">
                                              {editingRecord.totalHours}
                                            </p>
                                          </div>
                                          <div className="text-center">
                                            <p className="text-xs text-gray-600">
                                              Break
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900">
                                              {formatHoursToMinutes(
                                                editingRecord.totalBreakTime ||
                                                  "0",
                                              )}
                                            </p>
                                          </div>
                                          <div className="text-center">
                                            <p className="text-xs text-gray-600">
                                              Lunch
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900">
                                              {formatHoursToMinutes(
                                                editingRecord.totalLunchTime ||
                                                  "0",
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Private Key */}
                                      <div>
                                        <Label className="text-xs flex items-center gap-2 mb-2">
                                          <Key className="h-4 w-4" />
                                          Verify with Private Key
                                        </Label>
                                        <div className="relative">
                                          <Input
                                            type={
                                              showSecretKey
                                                ? "text"
                                                : "password"
                                            }
                                            value={secretKey}
                                            onChange={(e) =>
                                              setSecretKey(e.target.value)
                                            }
                                            className={`pr-10 h-9 text-sm ${secretKeyError ? "border-red-500" : ""}`}
                                            placeholder="Enter private key"
                                          />
                                          <button
                                            type="button"
                                            onClick={toggleSecretKeyVisibility}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                          >
                                            {showSecretKey ? (
                                              <EyeOffIcon className="h-4 w-4" />
                                            ) : (
                                              <EyeIcon className="h-4 w-4" />
                                            )}
                                          </button>
                                        </div>
                                        {secretKeyError && (
                                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            {secretKeyError}
                                          </p>
                                        )}
                                      </div>

                                      {/* Actions */}
                                      <div className="flex gap-2 pt-2 border-t">
                                        <DialogClose asChild>
                                          <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                              setEditingRecord(null);
                                              setSecretKey("");
                                              setSecretKeyError("");
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        </DialogClose>
                                        <Button
                                          onClick={handleUpdate}
                                          disabled={isLoading}
                                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        >
                                          {isLoading ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <CheckCircle className="h-4 w-4" />
                                          )}
                                          {isLoading
                                            ? "Saving..."
                                            : "Save Changes"}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                              </DialogContent>
                            </Dialog>

                            {/* Delete Button */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>

                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    Delete Record?
                                  </DialogTitle>
                                </DialogHeader>

                                <p className="text-gray-700 text-sm">
                                  Are you sure you want to delete the time
                                  record for{" "}
                                  <strong>{record.employeeName}</strong> on{" "}
                                  {record.date}?
                                </p>
                                <p className="text-gray-500 text-xs">
                                  This action cannot be undone.
                                </p>

                                <div className="flex gap-2 pt-3 border-t">
                                  <DialogClose asChild>
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                    >
                                      Cancel
                                    </Button>
                                  </DialogClose>
                                  <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => {
                                      handleDelete(record._id);
                                      (
                                        document.querySelector(
                                          '[data-state="open"]',
                                        ) as HTMLElement
                                      )?.click?.();
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminTimeRecordEdit;
