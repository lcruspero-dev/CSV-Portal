/* eslint-disable prefer-const */
import { TimeRecordAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Key,
  Edit3,
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
      breakDeductionSeconds =
        totalBreakSeconds > 900 ? totalBreakSeconds - 900 : 0;
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
  const [searchDate, setSearchDate] = useState("");
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
    variant: "default" | "destructive" = "default"
  ) => {
    toast({
      title,
      description,
      variant,
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
      showToast("Validation Error", "Please select a date", "destructive");
      return;
    }

    if (searchType === "search-by-name" && !searchName) {
      showToast(
        "Validation Error",
        "Please enter an employee name",
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
        showToast(
          "No Records Found",
          "No time records found for the given criteria"
        );
      } else {
        showToast("Search Complete", `Found ${response.data.length} record(s)`);
      }
    } catch (error) {
      console.error("Search failed", error);
      showToast("Search Error", "Failed to fetch time records", "destructive");
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
    if (numHours >= 8)
      return "bg-green-100 text-green-800 border border-green-200";
    if (numHours >= 6)
      return "bg-amber-100 text-amber-800 border border-amber-200";
    return "bg-red-100 text-red-800 border border-red-200";
  };

  const clearSearch = () => {
    setSearchName("");
    setSearchDate("");
    setTimeRecords([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Edit Time Records
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and edit employee time records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              Search Records
            </CardTitle>
            <CardDescription>
              Find time records by employee name or group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-3">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Search Type
                </Label>
                <Select onValueChange={setSearchType} value={searchType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select search type" />
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

              {searchType === "search-by-name" && (
                <div className="lg:col-span-3">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Employee Name
                  </Label>
                  <Input
                    placeholder="Enter employee name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
              )}

              <div className="lg:col-span-3">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Date
                </Label>
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>

              <div className="lg:col-span-3 flex items-end gap-2">
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="flex items-center gap-2 flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {isLoading ? "Searching..." : "Search Records"}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        {editingRecord && (
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-purple-600" />
                Edit Employee Record
                <Badge
                  variant="secondary"
                  className="ml-2 bg-purple-100 text-purple-800 border border-purple-200"
                >
                  {editingRecord.employeeName}
                </Badge>
              </CardTitle>
              <CardDescription>
                Update the employee time record details below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      value={editingRecord.date}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "date",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Shift</Label>
                    <Input
                      value={editingRecord.shift || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "shift",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time In</Label>
                    <Input
                      value={editingRecord.timeIn || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "timeIn",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Out</Label>
                    <Input
                      value={editingRecord.timeOut || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "timeOut",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                </div>

                {/* Break Times */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Break Start</Label>
                    <Input
                      value={editingRecord.breakStart || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "breakStart",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Break End</Label>
                    <Input
                      value={editingRecord.breakEnd || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "breakEnd",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lunch Start</Label>
                    <Input
                      value={editingRecord.lunchStart || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "lunchStart",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lunch End</Label>
                    <Input
                      value={editingRecord.lunchEnd || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "lunchEnd",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                </div>

                {/* Second Break Times */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>2nd Break Start</Label>
                    <Input
                      value={editingRecord.secondBreakStart || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "secondBreakStart",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>2nd Break End</Label>
                    <Input
                      value={editingRecord.secondBreakEnd || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "secondBreakEnd",
                          e.target.value,
                          editingRecord
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input
                      value={editingRecord.notes || ""}
                      onChange={(e) =>
                        handleTimeInputChange(
                          "notes",
                          e.target.value,
                          editingRecord
                        )
                      }
                      placeholder="Add notes..."
                    />
                  </div>
                </div>

                {/* Calculated Totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Total Hours
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingRecord.totalHours}
                        readOnly
                        className={`font-semibold ${getHoursColor(
                          editingRecord.totalHours
                        )}`}
                      />
                      <span className="text-xs text-gray-600">
                        {formatHoursToMinutes(editingRecord.totalHours)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Break Time
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingRecord.totalBreakTime || "0.00"}
                        readOnly
                        className="bg-gray-50"
                      />
                      <span className="text-xs text-gray-600">
                        {formatHoursToMinutes(
                          editingRecord.totalBreakTime || "0.00"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Lunch Time
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingRecord.totalLunchTime || "0.00"}
                        readOnly
                        className="bg-gray-50"
                      />
                      <span className="text-xs text-gray-600">
                        {formatHoursToMinutes(
                          editingRecord.totalLunchTime || "0.00"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      2nd Break
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingRecord.totalSecondBreakTime || "0.00"}
                        readOnly
                        className="bg-gray-50"
                      />
                      <span className="text-xs text-gray-600">
                        {formatHoursToMinutes(
                          editingRecord.totalSecondBreakTime || "0.00"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="border-t border-gray-200 pt-4">
                  <Label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                    <Key className="h-4 w-4 text-gray-600" />
                    Security Verification
                  </Label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Private Key</Label>
                      <div className="relative">
                        <Input
                          type={showSecretKey ? "text" : "password"}
                          value={secretKey}
                          onChange={(e) => setSecretKey(e.target.value)}
                          className={`pr-10 ${
                            secretKeyError ? "border-red-500" : ""
                          }`}
                          placeholder="Enter private key"
                        />
                        <button
                          type="button"
                          onClick={toggleSecretKeyVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecretKey ? (
                            <EyeOffIcon size={18} />
                          ) : (
                            <EyeIcon size={18} />
                          )}
                        </button>
                      </div>
                      {secretKeyError && (
                        <p className="text-red-500 text-sm flex items-center">
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
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdate}
                        disabled={isLoading}
                        className="flex-1 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        {isLoading ? "Updating..." : "Update Record"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Table */}
        {timeRecords.length > 0 && (
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                Employee Time Records
                <Badge variant="secondary" className="ml-2">
                  {timeRecords.length} records
                </Badge>
              </CardTitle>
              <CardDescription>
                Found {timeRecords.length} time record(s) for the selected
                criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time In</TableHead>
                      <TableHead>Time Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Break</TableHead>
                      <TableHead>Lunch</TableHead>
                      <TableHead>2nd Break</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeRecords.map((record) => (
                      <TableRow key={record._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {record.employeeName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {record.date}
                          </div>
                        </TableCell>
                        <TableCell>{record.timeIn || "-"}</TableCell>
                        <TableCell>{record.timeOut || "-"}</TableCell>
                        <TableCell>
                          <Badge className={getHoursColor(record.totalHours)}>
                            {record.totalHours}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.totalBreakTime || "0.00"}</TableCell>
                        <TableCell>{record.totalLunchTime || "0.00"}</TableCell>
                        <TableCell>
                          {record.totalSecondBreakTime || "0.00"}
                        </TableCell>
                        <TableCell>
                          {record.shift ? (
                            <Badge
                              variant="outline"
                              className="border-gray-300"
                            >
                              {record.shift}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {record.notes || ""}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(record)}
                              className="flex items-center gap-1"
                            >
                              <Pencil size={14} />
                              Edit
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-gray-600" />
                                    Confirm Record Deletion
                                  </DialogTitle>
                                </DialogHeader>
                                <p className="text-gray-700">
                                  Are you sure you want to delete the time
                                  record for{" "}
                                  <strong>{record.employeeName}</strong> on{" "}
                                  {record.date}? This action cannot be undone.
                                </p>
                                <div className="flex justify-end gap-3">
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(record._id)}
                                    className="flex items-center gap-2"
                                  >
                                    <Trash2 size={14} />
                                    Delete Record
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
