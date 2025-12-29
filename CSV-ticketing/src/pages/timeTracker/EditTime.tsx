/* eslint-disable prefer-const */
import { TimeRecordAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  EyeIcon, 
  EyeOffIcon, 
  Pencil, 
  Search, 
  Trash2, 
  Clock,
  Calendar,
  User,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Gift,
  Snowflake,
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
  record: TimeRecord
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

  let inTotalSeconds = convertToSeconds(record.timeIn);
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
    let breakStartSeconds = convertToSeconds(record.breakStart);
    let breakEndSeconds = convertToSeconds(record.breakEnd);

    if (breakStartSeconds > 0 && breakEndSeconds > 0) {
      if (breakEndSeconds < breakStartSeconds) {
        breakEndSeconds += 24 * 3600;
      }
      const totalBreakSeconds = breakEndSeconds - breakStartSeconds;
      breakTimeSeconds = totalBreakSeconds;
      breakDeductionSeconds = totalBreakSeconds > 900 ? totalBreakSeconds - 900 : 0;
    }
  }

  if (record.lunchStart && record.lunchEnd) {
    let lunchStartSeconds = convertToSeconds(record.lunchStart);
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
    let secondBreakStartSeconds = convertToSeconds(record.secondBreakStart);
    let secondBreakEndSeconds = convertToSeconds(record.secondBreakEnd);

    if (secondBreakStartSeconds > 0 && secondBreakEndSeconds > 0) {
      if (secondBreakEndSeconds < secondBreakStartSeconds) {
        secondBreakEndSeconds += 24 * 3600;
      }
      const totalSecondBreakSeconds = secondBreakEndSeconds - secondBreakStartSeconds;
      secondBreakTimeSeconds = totalSecondBreakSeconds;
      secondBreakDeductionSeconds = totalSecondBreakSeconds > 900 ? totalSecondBreakSeconds - 900 : 0;
    }
  }

  const totalWorkSeconds = outTotalSeconds - inTotalSeconds;
  const totalDeductionSeconds = breakDeductionSeconds + lunchDeductionSeconds + secondBreakDeductionSeconds;
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
  { label: "All Elves", value: "csv-all" },
  { label: "Morning Shift", value: "csv-shift1" },
  { label: "Mid Shift", value: "csv-shift2" },
  { label: "Night Shift", value: "csv-shift3" },
  { label: "Agents", value: "csv-staff" },
  { label: "Search by Name", value: "search-by-name" },
];

const AdminTimeRecordEdit: React.FC = () => {
  const [searchType, setSearchType] = useState("search-by-name");
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);
  const [secretKey, setSecretKey] = useState("");
  const [secretKeyError, setSecretKeyError] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const showChristmasToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    toast({
      title,
      description,
      variant,
      className: variant === "default" 
        ? "bg-gradient-to-r from-green-600 to-red-600 border border-green-400 text-white"
        : "bg-red-600 border border-red-400 text-white"
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const validateSecretKey = () => {
    if (!secretKey) {
      setSecretKeyError("Private key is required");
      return false;
    }
    setSecretKeyError("");
    return true;
  };

  const handleSearch = async () => {
    if (!searchDate) {
      showChristmasToast(
        "Validation Error",
        "Please select a date",
        "destructive"
      );
      return;
    }

    if (searchType === "search-by-name" && !searchName) {
      showChristmasToast(
        "Validation Error",
        "Please enter an elf's name",
        "destructive"
      );
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (searchType === "search-by-name") {
        response = await TimeRecordAPI.getTimeRecordsByNameAndDate(
          searchName,
          formatDate(searchDate)
        );
      } else {
        response = await TimeRecordAPI.getTimeRecordsByNameAndDate(
          searchType,
          formatDate(searchDate)
        );
      }

      setTimeRecords(response.data);

      if (response.data.length === 0) {
        showChristmasToast(
          " No Records Found",
          "No time records found for the given criteria"
        );
      } else {
        showChristmasToast(
          " Search Complete!",
          `Found ${response.data.length} festive record(s)`
        );
      }
    } catch (error) {
      console.error("Search failed", error);
      showChristmasToast(
        " Search Error",
        "Failed to fetch time records",
        "destructive"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record: TimeRecord) => {
    setEditingRecord(record);
    setSecretKey("");
    setSecretKeyError("");
  };

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
          record._id === updatedRecord._id ? updatedRecord : record
        )
      );

      showChristmasToast(
        " Success!",
        "Time record updated !"
      );

      setEditingRecord(null);
      setSecretKey("");
    } catch (error) {
      console.error("Update failed", error);
      showChristmasToast(
        " Update Error",
        "Failed to update time record",
        "destructive"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (_id: string) => {
    try {
      await TimeRecordAPI.deleteTimeRecord(_id);
      setTimeRecords((prev) => prev.filter((record) => record._id !== _id));

      showChristmasToast(
        " Record Cleared!",
        "Time record removed successfully"
      );
    } catch (error) {
      console.error("Delete failed", error);
      showChristmasToast(
        " Delete Error",
        "Failed to clear time record",
        "destructive"
      );
    }
  };

  const handleTimeInputChange = (
    field: keyof TimeRecord,
    value: string,
    record: TimeRecord
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

  const toggleSecretKeyVisibility = () => {
    setShowSecretKey(!showSecretKey);
  };

  const getHoursColor = (hours: string) => {
    const numHours = parseFloat(hours);
    if (numHours >= 8) return "bg-gradient-to-r from-green-100 to-green-200 text-green-900 border border-green-300";
    if (numHours >= 6) return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 border border-yellow-300";
    return "bg-gradient-to-r from-red-100 to-red-200 text-red-900 border border-red-300";
  };

  const clearSearch = () => {
    setSearchName("");
    setSearchDate("");
    setTimeRecords([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 py-6 relative overflow-hidden">
      {/* Animated Snowflakes Background */}
      <div className="absolute top-4 right-10 opacity-5">
        <Snowflake className="h-16 w-16 text-blue-400 animate-pulse" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-5">
        <Snowflake className="h-12 w-12 text-blue-300 animate-pulse delay-300" />
      </div>
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">
                Edit time records
              </h1>
              <p className="text-green-700 mt-2 flex items-center">
                Manage and edit employee time records 
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 border-green-300 bg-gradient-to-r from-green-50 to-red-50 text-green-900 hover:from-green-100 hover:to-red-100">
              <Download className="h-4 w-4" />
              Export 
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6 shadow-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-green-800">
              <Filter className="h-5 w-5 text-green-600" />
               Search Records
            </CardTitle>
            <CardDescription className="text-green-600">
              Find time records by employee name 
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-3">
                <Label className="flex items-center gap-2 mb-2 text-green-700">
                  <Gift className="h-4 w-4 text-green-600" />
                  Search Type
                </Label>
                <Select onValueChange={setSearchType} value={searchType}>
                  <SelectTrigger className="border-green-300 bg-gradient-to-r from-green-50 to-red-50">
                    <SelectValue placeholder="Select search type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gradient-to-r from-green-50 to-red-50 border-green-300">
                    {employeeGroupOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="hover:bg-gradient-to-r hover:from-green-100 hover:to-red-100">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {searchType === "search-by-name" && (
                <div className="lg:col-span-3">
                  <Label className="flex items-center gap-2 mb-2 text-green-700">
                    <User className="h-4 w-4 text-green-600" />
                    Employee Name
                  </Label>
                  <Input
                    placeholder="Enter employee name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="border-green-300 bg-gradient-to-r from-green-50 to-red-50"
                  />
                </div>
              )}

              <div className="lg:col-span-3">
                <Label className="flex items-center gap-2 mb-2 text-green-700">
                  <Calendar className="h-4 w-4 text-green-600" />
                  Date
                </Label>
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="border-green-300 bg-gradient-to-r from-green-50 to-red-50"
                />
              </div>

              <div className="lg:col-span-3 flex items-end gap-2">
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading}
                  className="flex items-center gap-2 flex-1 bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white border-green-400"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {isLoading ? "Searching Workshop..." : " Search Records"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearSearch}
                  className="flex-1 border-green-300 text-green-900 hover:bg-gradient-to-r hover:from-green-100 hover:to-green-200"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        {editingRecord && (
          <Card className="mb-6 shadow-lg border-2 border-green-200 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-green-800">
                <Pencil className="h-5 w-5 text-green-600" />
                 Edit Employee Record
                <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-green-100 to-green-200 text-green-900 border border-green-300">
                  {editingRecord.employeeName}
                </Badge>
              </CardTitle>
              <CardDescription className="text-green-600">
                Update the employee time record details below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Basic Information */}
                <div className="space-y-3">
                  <Label className="text-green-700">Date</Label>
                  <Input
                    value={editingRecord.date}
                    onChange={(e) =>
                      handleTimeInputChange("date", e.target.value, editingRecord)
                    }
                    className="border-green-300 bg-gradient-to-r from-green-50 to-green-100"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-green-700"> Shift</Label>
                  <Input
                    value={editingRecord.shift || ""}
                    onChange={(e) =>
                      handleTimeInputChange("shift", e.target.value, editingRecord)
                    }
                    className="border-green-300 bg-gradient-to-r from-green-50 to-green-100"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-green-700"> Time In</Label>
                  <Input
                    value={editingRecord.timeIn || ""}
                    onChange={(e) =>
                      handleTimeInputChange("timeIn", e.target.value, editingRecord)
                    }
                    className="border-green-300 bg-gradient-to-r from-green-50 to-green-100"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-green-700"> Time Out</Label>
                  <Input
                    value={editingRecord.timeOut || ""}
                    onChange={(e) =>
                      handleTimeInputChange("timeOut", e.target.value, editingRecord)
                    }
                    className="border-red-300 bg-gradient-to-r from-red-50 to-red-100"
                  />
                </div>
              </div>

              {/* Break Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-3">
                  <Label className="text-green-700"> Break Start</Label>
                  <Input
                    value={editingRecord.breakStart || ""}
                    onChange={(e) =>
                      handleTimeInputChange("breakStart", e.target.value, editingRecord)
                    }
                    className="border-green-300 bg-gradient-to-r from-green-50 to-green-100"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-green-700"> Break End</Label>
                  <Input
                    value={editingRecord.breakEnd || ""}
                    onChange={(e) =>
                      handleTimeInputChange("breakEnd", e.target.value, editingRecord)
                    }
                    className="border-green-300 bg-gradient-to-r from-green-50 to-green-100"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-green-700"> Feast Start</Label>
                  <Input
                    value={editingRecord.lunchStart || ""}
                    onChange={(e) =>
                      handleTimeInputChange("lunchStart", e.target.value, editingRecord)
                    }
                    className="border-red-300 bg-gradient-to-r from-red-50 to-red-100"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-green-700"> Feast End</Label>
                  <Input
                    value={editingRecord.lunchEnd || ""}
                    onChange={(e) =>
                      handleTimeInputChange("lunchEnd", e.target.value, editingRecord)
                    }
                    className="border-red-300 bg-gradient-to-r from-red-50 to-red-100"
                  />
                </div>
              </div>

              {/* Second Break Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-3">
                  <Label className="text-green-700"> 2nd Break Start</Label>
                  <Input
                    value={editingRecord.secondBreakStart || ""}
                    onChange={(e) =>
                      handleTimeInputChange("secondBreakStart", e.target.value, editingRecord)
                    }
                    className="border-green-300 bg-gradient-to-r from-green-50 to-green-100"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-green-700"> 2nd Break End</Label>
                  <Input
                    value={editingRecord.secondBreakEnd || ""}
                    onChange={(e) =>
                      handleTimeInputChange("secondBreakEnd", e.target.value, editingRecord)
                    }
                    className="border-green-300 bg-gradient-to-r from-green-50 to-green-100"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-green-700">  Notes</Label>
                  <Input
                    value={editingRecord.notes || ""}
                    onChange={(e) =>
                      handleTimeInputChange("notes", e.target.value, editingRecord)
                    }
                    className="border-green-300 bg-gradient-to-r from-green-50 to-green-100"
                    placeholder="Add festive notes..."
                  />
                </div>
              </div>

              {/* Calculated Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-green-100 to-red-100 rounded-lg border border-green-300">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-800"> Total Hours</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingRecord.totalHours}
                      readOnly
                      className={`font-semibold border-green-300 ${getHoursColor(editingRecord.totalHours)}`}
                    />
                    <span className="text-xs text-green-600">
                      {formatHoursToMinutes(editingRecord.totalHours)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-800"> Break Time</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingRecord.totalBreakTime || "0.00"}
                      readOnly
                      className="border-green-300 bg-gradient-to-r from-green-50 to-green-100"
                    />
                    <span className="text-xs text-green-600">
                      {formatHoursToMinutes(editingRecord.totalBreakTime || "0.00")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-800"> Feast Time</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingRecord.totalLunchTime || "0.00"}
                      readOnly
                      className="border-red-300 bg-gradient-to-r from-red-50 to-red-100"
                    />
                    <span className="text-xs text-red-600">
                      {formatHoursToMinutes(editingRecord.totalLunchTime || "0.00")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-800"> 2nd Break</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingRecord.totalSecondBreakTime || "0.00"}
                      readOnly
                      className="border-green-300 bg-gradient-to-r from-green-50 to-green-100"
                    />
                    <span className="text-xs text-green-600">
                      {formatHoursToMinutes(editingRecord.totalSecondBreakTime || "0.00")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="border-t border-green-300 pt-4">
                <Label className="flex items-center gap-2 mb-3 text-sm font-medium text-green-800">
                  <AlertTriangle className="h-4 w-4 text-green-600" />
                  Santa's Verification
                </Label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="relative">
                    <Label className="text-green-700">Private Key</Label>
                    <Input
                      type={showSecretKey ? "text" : "password"}
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className={`border-green-300 bg-gradient-to-r from-green-50 to-green-100 ${secretKeyError ? "border-red-500" : ""}`}
                      placeholder="Enter private key"
                    />
                    <button
                      type="button"
                      onClick={toggleSecretKeyVisibility}
                      className="absolute right-3 top-8 text-green-500 hover:text-green-700"
                    >
                      {showSecretKey ? (
                        <EyeOffIcon size={18} />
                      ) : (
                        <EyeIcon size={18} />
                      )}
                    </button>
                    {secretKeyError && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {secretKeyError}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingRecord(null);
                        setSecretKey("");
                        setSecretKeyError("");
                      }}
                      className="flex-1 border-green-300 text-green-900 hover:bg-gradient-to-r hover:from-green-100 hover:to-green-200"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpdate} 
                      disabled={isLoading}
                      className="flex-1 flex items-center gap-2 bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white border-green-400"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {isLoading ? "Updating..." : " Update Record"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Table */}
        {timeRecords.length > 0 && (
          <Card className="shadow-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-green-800">
                <Clock className="h-5 w-5 text-green-600" />
                 Employee Time Records
                <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-green-100 to-green-200 text-green-900 border border-green-300">
                  {timeRecords.length} records
                </Badge>
              </CardTitle>
              <CardDescription className="text-green-600">
                Found {timeRecords.length} time record(s) for the selected criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-green-100 to-red-100">
                    <TableRow>
                      <TableHead className="font-semibold text-green-800">Employee</TableHead>
                      <TableHead className="font-semibold text-green-800">Date</TableHead>
                      <TableHead className="font-semibold text-green-800"> Time In</TableHead>
                      <TableHead className="font-semibold text-green-800">Time Out</TableHead>
                      <TableHead className="font-semibold text-green-800"> Total Hours</TableHead>
                      <TableHead className="font-semibold text-green-800"> Break</TableHead>
                      <TableHead className="font-semibold text-green-800"> Feast</TableHead>
                      <TableHead className="font-semibold text-green-800"> 2nd Break</TableHead>
                      <TableHead className="font-semibold text-green-800"> Shift</TableHead>
                      <TableHead className="font-semibold text-green-800"> Notes</TableHead>
                      <TableHead className="font-semibold text-green-800 text-right"> Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeRecords.map((record) => (
                      <TableRow key={record._id} className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-red-50/50 border-green-200">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-green-500" />
                            {record.employeeName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-500" />
                            {record.date}
                          </div>
                        </TableCell>
                        <TableCell className="text-green-700">{record.timeIn || "-"}</TableCell>
                        <TableCell className="text-red-700">{record.timeOut || "-"}</TableCell>
                        <TableCell>
                          <Badge className={getHoursColor(record.totalHours)}>
                            {record.totalHours}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-700">{record.totalBreakTime || "0.00"}</TableCell>
                        <TableCell className="text-red-700">{record.totalLunchTime || "0.00"}</TableCell>
                        <TableCell className="text-green-700">{record.totalSecondBreakTime || "0.00"}</TableCell>
                        <TableCell>
                          {record.shift ? (
                            <Badge variant="outline" className="border-green-300 text-green-700">{record.shift}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-green-700">
                          {record.notes || ""}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(record)}
                              className="flex items-center gap-1 border-green-300 text-green-900 hover:bg-gradient-to-r hover:from-green-100 hover:to-green-200"
                            >
                              <Pencil size={14} />
                              Edit
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-red-700">
                                  <Trash2 size={14} />
                                  Remove
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gradient-to-br from-green-50 to-red-100 border-2 border-green-300">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2 text-green-800">
                                    <AlertTriangle className="h-5 w-5 text-green-600" />
                                    Confirm Record Removal
                                  </DialogTitle>
                                </DialogHeader>
                                <p className="text-green-700">
                                  Are you sure you want to remove the time record for{" "}
                                  <strong>{record.employeeName}</strong> on {record.date}?
                                  This action cannot be undone.
                                </p>
                                <div className="flex justify-end gap-3">
                                  <DialogClose asChild>
                                    <Button variant="outline" className="border-green-300 text-green-900">Cancel</Button>
                                  </DialogClose>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(record._id)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700"
                                  >
                                    <Trash2 size={14} />
                                    Remove Record
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