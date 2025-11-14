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
  Leaf,
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
  { label: "All Family Members", value: "csv-all" },
  { label: "Leaf Shift 1", value: "csv-shift1" },
  { label: "Leaf Shift 2", value: "csv-shift2" },
  { label: "Leaf Shift 3", value: "csv-shift3" },
  { label: "Family Staff", value: "csv-staff" },
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

  // Thanksgiving-themed toast
  const showThanksgivingToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    toast({
      title,
      description,
      variant,
      className: variant === "default" 
        ? "bg-gradient-to-r from-amber-600 to-orange-600 border border-amber-400 text-white"
        : "bg-red-600 border border-red-400 text-white"
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const validateSecretKey = () => {
    if (!secretKey) {
      setSecretKeyError("Leaf key is required");
      return false;
    }
    setSecretKeyError("");
    return true;
  };

  const handleSearch = async () => {
    if (!searchDate) {
      showThanksgivingToast(
        "Validation Error",
        "Please select a Leaf date",
        "destructive"
      );
      return;
    }

    if (searchType === "search-by-name" && !searchName) {
      showThanksgivingToast(
        "Validation Error",
        "Please enter a family member name",
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
        showThanksgivingToast(
          "No Records Found",
          "No Leaf time records found for the given criteria"
        );
      } else {
        showThanksgivingToast(
          "Leaf Search Complete! 🦃",
          `Found ${response.data.length} grateful record(s)`
        );
      }
    } catch (error) {
      console.error("Search failed", error);
      showThanksgivingToast(
        "Search Error",
        "Failed to fetch Leaf time records",
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

      showThanksgivingToast(
        "Success! 🍂",
        "Leaf time record updated with gratitude"
      );

      setEditingRecord(null);
      setSecretKey("");
    } catch (error) {
      console.error("Update failed", error);
      showThanksgivingToast(
        "Update Error",
        "Failed to update Leaf time record",
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

      showThanksgivingToast(
        "Record Cleared! 🍁",
        "Leaf time record removed with gratitude"
      );
    } catch (error) {
      console.error("Delete failed", error);
      showThanksgivingToast(
        "Delete Error",
        "Failed to clear Leaf time record",
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
    if (numHours >= 8) return "text-green-600 bg-green-50 border border-green-200";
    if (numHours >= 6) return "text-amber-600 bg-amber-50 border border-amber-200";
    return "text-red-600 bg-red-50 border border-red-200";
  };

  const clearSearch = () => {
    setSearchName("");
    setSearchDate("");
    setTimeRecords([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100/30 py-6">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                🦃 Leaf Time Records
              </h1>
              <p className="text-amber-700 mt-2">
                Manage and edit family member Leaf time with gratitude
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-100">
              <Download className="h-4 w-4" />
              Export Leaf
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6 shadow-sm border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-amber-800">
              <Filter className="h-5 w-5 text-amber-600" />
              Search Records
            </CardTitle>
            <CardDescription className="text-amber-600">
              Find time records by family member or Leaf group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-3">
                <Label className="flex items-center gap-2 mb-2 text-amber-700">
                  <Leaf className="h-4 w-4 text-amber-600" />
                  Search Type
                </Label>
                <Select onValueChange={setSearchType} value={searchType}>
                  <SelectTrigger className="border-amber-300 bg-white">
                    <SelectValue placeholder="Select Leaf type" />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-50 border-amber-300">
                    {employeeGroupOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="hover:bg-amber-200">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {searchType === "search-by-name" && (
                <div className="lg:col-span-3">
                  <Label className="flex items-center gap-2 mb-2 text-amber-700">
                    <User className="h-4 w-4 text-amber-600" />
                    Family Member Name
                  </Label>
                  <Input
                    placeholder="Enter family member name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="border-amber-300 bg-white"
                  />
                </div>
              )}

              <div className="lg:col-span-3">
                <Label className="flex items-center gap-2 mb-2 text-amber-700">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  Date
                </Label>
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="border-amber-300 bg-white"
                />
              </div>

              <div className="lg:col-span-3 flex items-end gap-2">
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading}
                  className="flex items-center gap-2 flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-amber-400"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {isLoading ? "Leafing..." : "Search Records"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearSearch}
                  className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        {editingRecord && (
          <Card className="mb-6 shadow-sm border-2 border-amber-200 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-amber-800">
                <Pencil className="h-5 w-5 text-amber-600" />
                Edit  Record
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
                  {editingRecord.employeeName}
                </Badge>
              </CardTitle>
              <CardDescription className="text-amber-600">
                Update the  time record details below with gratitude
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Basic Information */}
                <div className="space-y-3">
                  <Label className="text-amber-700"> Date</Label>
                  <Input
                    value={editingRecord.date}
                    onChange={(e) =>
                      handleTimeInputChange("date", e.target.value, editingRecord)
                    }
                    className="border-amber-300 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-amber-700"> Shift</Label>
                  <Input
                    value={editingRecord.shift || ""}
                    onChange={(e) =>
                      handleTimeInputChange("shift", e.target.value, editingRecord)
                    }
                    className="border-amber-300 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-amber-700">Time In</Label>
                  <Input
                    value={editingRecord.timeIn || ""}
                    onChange={(e) =>
                      handleTimeInputChange("timeIn", e.target.value, editingRecord)
                    }
                    className="border-amber-300 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-amber-700">Time Out</Label>
                  <Input
                    value={editingRecord.timeOut || ""}
                    onChange={(e) =>
                      handleTimeInputChange("timeOut", e.target.value, editingRecord)
                    }
                    className="border-amber-300 bg-white"
                  />
                </div>
              </div>

              {/* Break Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-3">
                  <Label className="text-amber-700">Break Start</Label>
                  <Input
                    value={editingRecord.breakStart || ""}
                    onChange={(e) =>
                      handleTimeInputChange("breakStart", e.target.value, editingRecord)
                    }
                    className="border-amber-300 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-amber-700">Break End</Label>
                  <Input
                    value={editingRecord.breakEnd || ""}
                    onChange={(e) =>
                      handleTimeInputChange("breakEnd", e.target.value, editingRecord)
                    }
                    className="border-amber-300 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-amber-700"> Start</Label>
                  <Input
                    value={editingRecord.lunchStart || ""}
                    onChange={(e) =>
                      handleTimeInputChange("lunchStart", e.target.value, editingRecord)
                    }
                    className="border-amber-300 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-amber-700"> End</Label>
                  <Input
                    value={editingRecord.lunchEnd || ""}
                    onChange={(e) =>
                      handleTimeInputChange("lunchEnd", e.target.value, editingRecord)
                    }
                    className="border-amber-300 bg-white"
                  />
                </div>
              </div>

              {/* Second Break Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-3">
                  <Label className="text-amber-700">2nd Break Start</Label>
                  <Input
                    value={editingRecord.secondBreakStart || ""}
                    onChange={(e) =>
                      handleTimeInputChange("secondBreakStart", e.target.value, editingRecord)
                    }
                    className="border-amber-300 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-amber-700">2nd Break End</Label>
                  <Input
                    value={editingRecord.secondBreakEnd || ""}
                    onChange={(e) =>
                      handleTimeInputChange("secondBreakEnd", e.target.value, editingRecord)
                    }
                    className="border-amber-300 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-amber-700">Grateful Notes</Label>
                  <Input
                    value={editingRecord.notes || ""}
                    onChange={(e) =>
                      handleTimeInputChange("notes", e.target.value, editingRecord)
                    }
                    className="border-amber-300 bg-white"
                    placeholder="Add grateful notes..."
                  />
                </div>
              </div>

              {/* Calculated Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-amber-100 rounded-lg border border-amber-300">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-amber-800">Total Hours</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingRecord.totalHours}
                      readOnly
                      className={`font-semibold border-amber-300 ${getHoursColor(editingRecord.totalHours)}`}
                    />
                    <span className="text-xs text-amber-600">
                      {formatHoursToMinutes(editingRecord.totalHours)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-amber-800">Break Time</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingRecord.totalBreakTime || "0.00"}
                      readOnly
                      className="border-amber-300"
                    />
                    <span className="text-xs text-amber-600">
                      {formatHoursToMinutes(editingRecord.totalBreakTime || "0.00")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-amber-800">Time</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingRecord.totalLunchTime || "0.00"}
                      readOnly
                      className="border-amber-300"
                    />
                    <span className="text-xs text-amber-600">
                      {formatHoursToMinutes(editingRecord.totalLunchTime || "0.00")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-amber-800">2nd Break</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingRecord.totalSecondBreakTime || "0.00"}
                      readOnly
                      className="border-amber-300"
                    />
                    <span className="text-xs text-amber-600">
                      {formatHoursToMinutes(editingRecord.totalSecondBreakTime || "0.00")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="border-t border-amber-300 pt-4">
                <Label className="flex items-center gap-2 mb-3 text-sm font-medium text-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                   Verification
                </Label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="relative">
                    <Label className="text-amber-700">Key</Label>
                    <Input
                      type={showSecretKey ? "text" : "password"}
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className={`border-amber-300 bg-white ${secretKeyError ? "border-red-500" : ""}`}
                      placeholder="Enter  key"
                    />
                    <button
                      type="button"
                      onClick={toggleSecretKeyVisibility}
                      className="absolute right-3 top-8 text-amber-500 hover:text-amber-700"
                    >
                      {showSecretKey ? (
                        <EyeOffIcon size={18} />
                      ) : (
                        <EyeIcon size={18} />
                      )}
                    </button>
                    {secretKeyError && (
                      <p className="text-red-500 text-sm mt-1">
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
                      className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpdate} 
                      disabled={isLoading}
                      className="flex-1 flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-amber-400"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {isLoading ? "Updating..." : "Update with Gratitude"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Table */}
        {timeRecords.length > 0 && (
          <Card className="shadow-sm border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-amber-800">
                <Clock className="h-5 w-5 text-amber-600" />
                Leaf Time Records
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
                  {timeRecords.length} grateful records
                </Badge>
              </CardTitle>
              <CardDescription className="text-amber-600">
                Found {timeRecords.length} Leaf time record(s) for the selected criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-amber-100">
                    <TableRow>
                      <TableHead className="font-semibold text-amber-800">Family Member</TableHead>
                      <TableHead className="font-semibold text-amber-800">Date</TableHead>
                      <TableHead className="font-semibold text-amber-800">Time In</TableHead>
                      <TableHead className="font-semibold text-amber-800">Time Out</TableHead>
                      <TableHead className="font-semibold text-amber-800">Total Hours</TableHead>
                      <TableHead className="font-semibold text-amber-800">Break</TableHead>
                      <TableHead className="font-semibold text-amber-800">Feast</TableHead>
                      <TableHead className="font-semibold text-amber-800">2nd Break</TableHead>
                      <TableHead className="font-semibold text-amber-800">Shift</TableHead>
                      <TableHead className="font-semibold text-amber-800">Grateful Notes</TableHead>
                      <TableHead className="font-semibold text-amber-800 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeRecords.map((record) => (
                      <TableRow key={record._id} className="hover:bg-amber-50/50 border-amber-200">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-amber-500" />
                            {record.employeeName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-amber-500" />
                            {record.date}
                          </div>
                        </TableCell>
                        <TableCell className="text-amber-700">{record.timeIn || "-"}</TableCell>
                        <TableCell className="text-amber-700">{record.timeOut || "-"}</TableCell>
                        <TableCell>
                          <Badge className={getHoursColor(record.totalHours)}>
                            {record.totalHours}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-amber-700">{record.totalBreakTime || "0.00"}</TableCell>
                        <TableCell className="text-amber-700">{record.totalLunchTime || "0.00"}</TableCell>
                        <TableCell className="text-amber-700">{record.totalSecondBreakTime || "0.00"}</TableCell>
                        <TableCell>
                          {record.shift ? (
                            <Badge variant="outline" className="border-amber-300 text-amber-700">{record.shift}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-amber-700">
                          {record.notes || "🦃"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(record)}
                              className="flex items-center gap-1 border-amber-300 text-amber-700 hover:bg-amber-100"
                            >
                              <Pencil size={14} />
                              Edit
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="flex items-center gap-1">
                                  <Trash2 size={14} />
                                  Clear
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-300">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2 text-amber-800">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    Confirm Leaf Clearance
                                  </DialogTitle>
                                </DialogHeader>
                                <p className="text-amber-700">
                                  Are you sure you want to clear the Leaf time record for{" "}
                                  <strong>{record.employeeName}</strong> on {record.date}?
                                  This action cannot be undone.
                                </p>
                                <div className="flex justify-end gap-3">
                                  <DialogClose asChild>
                                    <Button variant="outline" className="border-amber-300 text-amber-700">Cancel</Button>
                                  </DialogClose>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(record._id)}
                                    className="flex items-center gap-2"
                                  >
                                    <Trash2 size={14} />
                                    Clear Record
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