/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
  Calendar,
  Clock,
  AlertCircle,
  TrendingUp,
  Eye,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import {
  ScheduleAndAttendanceAPI,
  TimeRecordAPI,
  UserProfileAPI,
} from "@/API/endpoint";
import { AbsenteeismAnalytics } from "@/components/kit/AbsenteeismAnalytics";
import AddEmployee from "@/components/kit/AddEmployee";
import { Attendance } from "@/components/kit/EmployeeAttendance";
import { IncompleteBreaksDialog } from "@/components/kit/IncompleteBreaksDialog";
import { EmployeesOnLunchDialog } from "@/components/kit/employeeLunchDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BackButton from "@/components/kit/BackButton";

// Types
export type Employee = {
  id: string;
  name: string;
  department: string;
  teamLeader: string;
  avatarUrl?: string;
  schedule: { date: string; shiftType: ShiftType }[];
};

type ShiftTypeValue =
  | "Morning"
  | "Mid"
  | "Night"
  | "restday"
  | "paidTimeOff"
  | "plannedLeave"
  | "holiday"
  | "rdot";

export type ShiftType = {
  type: ShiftTypeValue;
  startTime?: string;
  endTime?: string;
  break1?: string;
  break2?: string;
  lunch?: string;
};

export type AttendanceStatus =
  | "Present"
  | "NCNS"
  | "Call In"
  | "Rest Day"
  | "Tardy"
  | "RDOT"
  | "Suspended"
  | "Attrition"
  | "LOA"
  | "PTO"
  | "Half Day"
  | "Early Log Out"
  | "VTO"
  | "TB"
  | "Pending";

export type ScheduleEntry = {
  date: string;
  shiftType: ShiftType;
  _id: string;
  employeeId: string;
  employeeName: string;
  teamLeader: string;
  position: string;
  schedule: {
    date: string;
    shiftType: ShiftType;
    _id: string;
  }[];
  __v: number;
};

export type AttendanceEntry = {
  shift?: string;
  employeeId: string;
  date: Date;
  status: AttendanceStatus;
  logIn?: string;
  logOut?: string;
  totalHours?: string;
  ot?: string;
};

type ViewMode = "weekly" | "monthly" | "dateRange";

// Professional shift colors with purple theme
const getShiftColor = (shiftType: ShiftType): string => {
  if (!shiftType || !shiftType.type)
    return "bg-gray-100 text-gray-800 border-gray-200";

  switch (shiftType.type) {
    case "Morning":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Mid":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "Night":
      return "bg-violet-100 text-violet-800 border-violet-200";
    case "restday":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "paidTimeOff":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "plannedLeave":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "holiday":
      return "bg-red-100 text-red-800 border-red-200";
    case "rdot":
      return "bg-teal-100 text-teal-800 border-teal-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Helper to check if a shift type has time
const hasShiftTime = (shiftType: ShiftTypeValue): boolean => {
  return ["Morning", "Mid", "Night", "rdot"].includes(shiftType);
};

const formatTimeToAMPM = (time: string): string => {
  if (!time) return "";

  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
};

// Helper function to display shift information
const displayShiftInfo = (
  shiftType: ShiftType,
): { name: string; time: string; details?: string } => {
  if (!shiftType || !shiftType.type) return { name: "", time: "" };

  let displayName = "";
  let displayTime = "";
  let details = "";

  switch (shiftType.type) {
    case "Morning":
      displayName = "Morning Shift";
      break;
    case "Mid":
      displayName = "Mid Shift";
      break;
    case "Night":
      displayName = "Night Shift";
      break;
    case "restday":
      displayName = "Rest Day";
      break;
    case "paidTimeOff":
      displayName = "Paid Time Off";
      break;
    case "plannedLeave":
      displayName = "Planned Leave";
      break;
    case "holiday":
      displayName = "Holiday";
      break;
    case "rdot":
      displayName = "RDOT";
      break;
    default:
      displayName = shiftType.type;
  }

  if (
    hasShiftTime(shiftType.type) &&
    shiftType.startTime &&
    shiftType.endTime
  ) {
    displayTime = `${formatTimeToAMPM(
      shiftType.startTime,
    )} - ${formatTimeToAMPM(shiftType.endTime)}`;

    const detailsParts = [];
    if (shiftType.startTime)
      detailsParts.push(`Login: ${formatTimeToAMPM(shiftType.startTime)}`);
    if (shiftType.endTime)
      detailsParts.push(`Logout: ${formatTimeToAMPM(shiftType.endTime)}`);
    if (shiftType.break1)
      detailsParts.push(`Break 1: ${formatTimeToAMPM(shiftType.break1)}`);
    if (shiftType.break2)
      detailsParts.push(`Break 2: ${formatTimeToAMPM(shiftType.break2)}`);
    if (shiftType.lunch)
      detailsParts.push(`Lunch: ${formatTimeToAMPM(shiftType.lunch)}`);

    details = detailsParts.join("\n");
  }

  return {
    name: displayName,
    time: displayTime,
    details,
  };
};

const ScheduleAndAttendance: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [fromDate, setFromDate] = useState<Date>(startOfWeek(new Date()));
  const [toDate, setToDate] = useState<Date>(endOfWeek(new Date()));
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShiftType, setSelectedShiftType] =
    useState<ShiftTypeValue>("Morning");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("00:00");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("00:00");
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] =
    useState<AttendanceStatus>("Present");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repeatDays, setRepeatDays] = useState<number>(1);
  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedBreak1, setSelectedBreak1] = useState<string | undefined>();
  const [selectedBreak2, setSelectedBreak2] = useState<string | undefined>();
  const [selectedLunch, setSelectedLunch] = useState<string | undefined>();
  const [otHours, setOtHours] = useState<string>("");
  const [otMinutes, setOtMinutes] = useState<string>("");
  const [showOtInput, setShowOtInput] = useState<boolean>(false);

  const DepartmentFilterDropdown = () => {
    return (
      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select Team Leader" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Employees</SelectItem>
          {Array.from(new Set(employees.map((emp) => emp.teamLeader)))
            .filter((leader) => leader && leader.trim() !== "")
            .sort()
            .map((leader) => (
              <SelectItem key={leader} value={leader}>
                {leader}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    );
  };

  const resetDialogState = () => {
    setSelectedEmployee(null);
    setSelectedDate(null);
    setSelectedShiftType("Morning");
    setSelectedStartTime("00:00");
    setSelectedEndTime("00:00");
    setSelectedBreak1(undefined);
    setSelectedLunch(undefined);
    setSelectedBreak2(undefined);
    setSelectedAttendanceStatus("Present");
    setRepeatDays(1);
    setShowOtInput(false);
    setOtHours("");
    setOtMinutes("");
  };

  const fetchEmployees = async (avatarMap: Record<string, string>) => {
    try {
      setLoading(true);
      const response = await ScheduleAndAttendanceAPI.getScheduleEntries();

      const formattedEmployees = response.data.map((entry: any) => {
        const schedule = Array.isArray(entry.schedule) ? entry.schedule : [];
        const avatarFilename = avatarMap[entry.employeeId];
        const avatarUrl = avatarFilename
          ? `${import.meta.env.VITE_UPLOADFILES_URL}/avatars/${avatarFilename}`
          : `https://ui-avatars.com/api/?background=7C3AED&color=fff&name=${entry.employeeName}`;

        return {
          id: entry.employeeId,
          name: entry.employeeName,
          department: entry.position,
          teamLeader: entry.teamLeader,
          avatarUrl: avatarUrl,
          schedule: schedule,
        };
      });

      setEmployees(formattedEmployees);

      let flattenedSchedule: ScheduleEntry[] = [];
      response.data.forEach((entry: any) => {
        if (Array.isArray(entry.schedule)) {
          const employeeSchedules = entry.schedule.map((sched: any) => {
            const shiftType: ShiftType = {
              type: sched.shiftType as ShiftTypeValue,
            };

            if (hasShiftTime(sched.shiftType as ShiftTypeValue)) {
              if (sched.startTime) shiftType.startTime = sched.startTime;
              if (sched.endTime) shiftType.endTime = sched.endTime;
              if (sched.break1) shiftType.break1 = sched.break1;
              if (sched.break2) shiftType.break2 = sched.break2;
              if (sched.lunch) shiftType.lunch = sched.lunch;
            }

            return {
              date: sched.date,
              shiftType: shiftType,
              _id: sched._id || Date.now().toString(),
              employeeId: entry.employeeId,
              employeeName: entry.employeeName,
              teamLeader: entry.teamLeader,
              position: entry.position,
              schedule: [],
              __v: 0,
            };
          });

          flattenedSchedule = [...flattenedSchedule, ...employeeSchedules];
        }
      });

      setSchedule(flattenedSchedule);
    } catch (err) {
      console.error("Error fetching employee data:", err);
      setError("Failed to fetch employee data");
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await ScheduleAndAttendanceAPI.getAttendanceEntries();
      const formattedAttendance = response.data.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      }));
      setAttendance(formattedAttendance);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Failed to fetch attendance data");
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const avatarResponse = await UserProfileAPI.getAllUserAvatar();
        const avatarMap = avatarResponse.data.reduce(
          (
            acc: Record<string, string>,
            curr: { userId: string; avatar: string },
          ) => {
            acc[curr.userId] = curr.avatar;
            return acc;
          },
          {},
        );

        await fetchEmployees(avatarMap);
        await fetchAttendance();
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const filteredEmployees =
    selectedDepartment === "all"
      ? employees
      : employees.filter((emp) => emp.teamLeader === selectedDepartment);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading employee data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <AlertCircle className="inline h-5 w-5 mr-2" />
        {error}
      </div>
    );

  const getDaysInView = () => {
    if (viewMode === "weekly") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    } else if (viewMode === "monthly") {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    } else if (viewMode === "dateRange") {
      if (fromDate && toDate) {
        return eachDayOfInterval({ start: fromDate, end: toDate });
      }
      const start = startOfWeek(new Date());
      const end = endOfWeek(new Date());
      return eachDayOfInterval({ start, end });
    }
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const days = getDaysInView();

  const goToPreviousPeriod = () => {
    if (viewMode === "weekly") {
      setCurrentDate((prevDate) => addDays(prevDate, -7));
    } else if (viewMode === "monthly") {
      setCurrentDate(
        (prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() - 1)),
      );
    } else if (viewMode === "dateRange" && fromDate && toDate) {
      const dayCount =
        Math.ceil(
          (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;
      setFromDate(addDays(fromDate, -dayCount));
      setToDate(addDays(toDate, -dayCount));
    }
  };

  const goToNextPeriod = () => {
    if (viewMode === "weekly") {
      setCurrentDate((prevDate) => addDays(prevDate, 7));
    } else if (viewMode === "monthly") {
      setCurrentDate(
        (prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() + 1)),
      );
    } else if (viewMode === "dateRange" && fromDate && toDate) {
      const dayCount =
        Math.ceil(
          (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;
      setFromDate(addDays(fromDate, dayCount));
      setToDate(addDays(toDate, dayCount));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    if (viewMode === "weekly") {
      setFromDate(startOfWeek(new Date()));
      setToDate(endOfWeek(new Date()));
    } else if (viewMode === "monthly") {
      setFromDate(startOfMonth(new Date()));
      setToDate(endOfMonth(new Date()));
    } else {
      setFromDate(startOfWeek(new Date()));
      setToDate(endOfWeek(new Date()));
    }
  };

  const handleFromDateSelect = (date: Date | undefined) => {
    if (date) {
      setFromDate(date);
      setShowFromCalendar(false);
      if (toDate && date > toDate) {
        setToDate(date);
      }
    }
  };

  const handleToDateSelect = (date: Date | undefined) => {
    if (date) {
      setToDate(date);
      setShowToCalendar(false);
      if (fromDate && date < fromDate) {
        setFromDate(date);
      }
    }
  };

  const getHeaderText = () => {
    if (viewMode === "weekly") {
      return `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`;
    } else if (viewMode === "monthly") {
      return format(currentDate, "MMMM yyyy");
    } else if (fromDate && toDate) {
      if (isSameDay(fromDate, toDate)) {
        return format(fromDate, "MMM d, yyyy");
      }
      return `${format(fromDate, "MMM d")} - ${format(toDate, "MMM d, yyyy")}`;
    }
    return "Select Date Range";
  };

  const findScheduleEntry = (
    employeeId: string,
    date: Date,
  ): ScheduleEntry | undefined => {
    return schedule.find(
      (entry) =>
        entry.employeeId === employeeId &&
        entry.date &&
        isSameDay(new Date(entry.date), date),
    );
  };

  const findAttendanceEntry = (
    employeeId: string,
    date: Date,
  ): AttendanceEntry | undefined => {
    return attendance.find(
      (entry) =>
        entry.employeeId === employeeId &&
        entry.date &&
        isSameDay(entry.date, date),
    );
  };

  const handleAddShift = async () => {
    if (selectedEmployee && selectedDate) {
      const updatedSchedule = [...schedule];

      const formattedDate = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1,
      ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

      const scheduleData = {
        date: formattedDate,
        shiftType: selectedShiftType,
        startTime: "",
        endTime: "",
        break1: selectedBreak1 || "",
        break2: selectedBreak2 || "",
        lunch: selectedLunch || "",
      };

      if (hasShiftTime(selectedShiftType)) {
        scheduleData.startTime = selectedStartTime;
        scheduleData.endTime = selectedEndTime;
      } else {
        scheduleData.startTime = "";
        scheduleData.endTime = "";
        scheduleData.break1 = "";
        scheduleData.break2 = "";
        scheduleData.lunch = "";
      }

      for (let i = 0; i < repeatDays; i++) {
        const currentDate = addDays(selectedDate, i);
        const currentFormattedDate = `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1,
        ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

        const currentScheduleData = {
          ...scheduleData,
          date: currentFormattedDate,
        };

        const existingEntryIndex = updatedSchedule.findIndex(
          (entry) =>
            entry.employeeId === selectedEmployee.id &&
            isSameDay(new Date(entry.date), currentDate),
        );

        if (existingEntryIndex !== -1) {
          updatedSchedule[existingEntryIndex] = {
            ...updatedSchedule[existingEntryIndex],
            shiftType: {
              type: selectedShiftType,
              ...(hasShiftTime(selectedShiftType) && {
                startTime: selectedStartTime,
                endTime: selectedEndTime,
                break1: selectedBreak1,
                break2: selectedBreak2,
                lunch: selectedLunch,
              }),
            },
          };
        } else {
          const newEntry: ScheduleEntry = {
            date: currentFormattedDate,
            shiftType: {
              type: selectedShiftType,
              ...(hasShiftTime(selectedShiftType) && {
                startTime: selectedStartTime,
                endTime: selectedEndTime,
                break1: selectedBreak1,
                break2: selectedBreak2,
                lunch: selectedLunch,
              }),
            },
            _id: Date.now().toString() + i,
            employeeId: selectedEmployee.id,
            employeeName: selectedEmployee.name,
            teamLeader: selectedEmployee.teamLeader,
            position: selectedEmployee.department,
            schedule: [],
            __v: 0,
          };
          updatedSchedule.push(newEntry);
        }

        try {
          await ScheduleAndAttendanceAPI.updateScheduleEntry(
            selectedEmployee.id,
            currentScheduleData,
          );
          console.log(`Successfully updated shift for ${currentFormattedDate}`);
        } catch (err) {
          console.error(
            `Error updating shift for ${currentFormattedDate}:`,
            err,
          );
          setError(`Failed to update shift for ${currentFormattedDate}`);
        }
      }

      setSchedule(updatedSchedule);
      setIsAddShiftOpen(false);
      setRepeatDays(1);
    }
  };

  const handleScheduleCellClick = (employee: Employee, date: Date) => {
    setSelectedEmployee(employee);
    setSelectedDate(date);

    const entry = findScheduleEntry(employee.id, date);

    if (entry && entry.shiftType) {
      setSelectedShiftType(entry.shiftType.type);

      if (hasShiftTime(entry.shiftType.type)) {
        if (entry.shiftType.startTime) {
          setSelectedStartTime(entry.shiftType.startTime);
        } else {
          setSelectedStartTime("00:00");
        }

        if (entry.shiftType.endTime) {
          setSelectedEndTime(entry.shiftType.endTime);
        } else {
          setSelectedEndTime("00:00");
        }

        setSelectedBreak1(entry.shiftType.break1 || undefined);
        setSelectedLunch(entry.shiftType.lunch || undefined);
        setSelectedBreak2(entry.shiftType.break2 || undefined);
      }
    } else {
      setSelectedShiftType("Morning");
      setSelectedStartTime("00:00");
      setSelectedEndTime("00:00");
      setSelectedBreak1(undefined);
      setSelectedLunch(undefined);
      setSelectedBreak2(undefined);
    }

    setIsAddShiftOpen(true);
  };

  const handleAttendanceCellClick = (employee: Employee, date: Date) => {
    if (date > new Date()) return;
    setSelectedEmployee(employee);
    setSelectedDate(date);
    const entry = findAttendanceEntry(employee.id, date);
    setSelectedAttendanceStatus(entry ? entry.status : "Present");
    setIsAddShiftOpen(true);
  };

  const handleUpdateAttendance = async () => {
    if (selectedEmployee && selectedDate) {
      try {
        const formattedDate = `${
          selectedDate.getMonth() + 1
        }/${selectedDate.getDate()}/${selectedDate.getFullYear()}`;

        const needsTimeData = [
          "Tardy",
          "Half Day",
          "RDOT",
          "Early Log Out",
          "Present",
        ].includes(selectedAttendanceStatus);

        let timeRecordData = null;
        if (needsTimeData) {
          try {
            const response =
              await TimeRecordAPI.getEmployeeTimeByEmployeeIdandDate(
                selectedEmployee.id,
                formattedDate,
              );
            timeRecordData = response.data;
          } catch (err) {
            console.error("Error fetching time record:", err);
          }
        }

        const attendanceData: any = {
          employeeId: selectedEmployee.id,
          date: formattedDate,
          status: selectedAttendanceStatus,
        };

        if (needsTimeData && showOtInput && (otHours || otMinutes)) {
          const hours = otHours || "0";
          const minutes = otMinutes || "0";
          attendanceData.ot = `${hours.padStart(2, "0")}:${minutes.padStart(
            2,
            "0",
          )}`;
        } else if (!needsTimeData) {
          attendanceData.ot = null;
        }

        if (needsTimeData && timeRecordData) {
          if (timeRecordData.timeIn) {
            attendanceData.logIn = timeRecordData.timeIn;
          }
          if (timeRecordData.timeOut) {
            attendanceData.logOut = timeRecordData.timeOut;
          }
          if (timeRecordData.totalHours) {
            attendanceData.totalHours = timeRecordData.totalHours;
          }
          if (timeRecordData.shift) {
            attendanceData.shift = timeRecordData.shift;
          }
        } else if (!needsTimeData) {
          attendanceData.logIn = null;
          attendanceData.logOut = null;
          attendanceData.totalHours = null;
          attendanceData.shift = null;
        }

        await ScheduleAndAttendanceAPI.createAttendanceEntry(attendanceData);

        const updatedEntry = {
          employeeId: selectedEmployee.id,
          date: selectedDate,
          status: selectedAttendanceStatus,
          ...(needsTimeData && {
            ...(attendanceData.logIn && { logIn: attendanceData.logIn }),
            ...(attendanceData.logOut && { logOut: attendanceData.logOut }),
            ...(attendanceData.totalHours && {
              totalHours: attendanceData.totalHours,
            }),
            ...(attendanceData.ot && { ot: attendanceData.ot }),
            ...(attendanceData.shift && { shift: attendanceData.shift }),
          }),
        };

        setAttendance((prev) => {
          const existingIndex = prev.findIndex(
            (entry) =>
              entry.employeeId === selectedEmployee.id &&
              isSameDay(entry.date, selectedDate),
          );
          if (existingIndex >= 0) {
            const newAttendance = [...prev];
            newAttendance[existingIndex] = updatedEntry;
            return newAttendance;
          }
          return [...prev, updatedEntry];
        });

        setIsAddShiftOpen(false);
      } catch (err) {
        console.error("Error updating attendance:", err);
        setError("Failed to update attendance");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Schedule & Attendance Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage employee schedules and track attendance records
            </p>
          </div>
          <div className="flex items-center gap-3">
            <BackButton />
          </div>
        </div>

        {/* Analytics Section */}
        <AbsenteeismAnalytics
          employees={employees}
          attendance={attendance}
          schedule={schedule}
          viewMode={viewMode}
          currentDate={currentDate}
          filteredEmployees={filteredEmployees.map((emp) => emp.id)}
          fromDate={fromDate}
          toDate={toDate}
        />

        {/* Main Card */}
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <DepartmentFilterDropdown />

                <Tabs
                  value={viewMode}
                  onValueChange={(value) => {
                    const mode = value as ViewMode;
                    setViewMode(mode);
                    if (mode === "weekly") {
                      setFromDate(startOfWeek(currentDate));
                      setToDate(endOfWeek(currentDate));
                    } else if (mode === "monthly") {
                      setFromDate(startOfMonth(currentDate));
                      setToDate(endOfMonth(currentDate));
                    }
                  }}
                >
                  <TabsList>
                    <TabsTrigger value="weekly">
                      <Calendar className="h-4 w-4 mr-2" />
                      Weekly
                    </TabsTrigger>
                    <TabsTrigger value="monthly">
                      <Calendar className="h-4 w-4 mr-2" />
                      Monthly
                    </TabsTrigger>
                    <TabsTrigger value="dateRange">
                      <Filter className="h-4 w-4 mr-2" />
                      Date Range
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {viewMode === "dateRange" && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowToCalendar(false);
                          setShowFromCalendar(!showFromCalendar);
                        }}
                        className="w-[140px] justify-start"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate ? format(fromDate, "MMM d") : "From"}
                      </Button>
                      {showFromCalendar && (
                        <div
                          className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
                          ref={(node) => {
                            if (node) {
                              const handleClickOutside = (
                                event: MouseEvent,
                              ) => {
                                if (!node.contains(event.target as Node)) {
                                  setShowFromCalendar(false);
                                  document.removeEventListener(
                                    "mousedown",
                                    handleClickOutside,
                                  );
                                }
                              };
                              document.addEventListener(
                                "mousedown",
                                handleClickOutside,
                              );
                            }
                          }}
                        >
                          <CalendarComponent
                            mode="single"
                            selected={fromDate}
                            onSelect={(date) => {
                              handleFromDateSelect(date);
                              setShowFromCalendar(false);
                            }}
                            initialFocus
                          />
                        </div>
                      )}
                    </div>

                    <span className="text-gray-500">to</span>

                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowFromCalendar(false);
                          setShowToCalendar(!showToCalendar);
                        }}
                        className="w-[140px] justify-start"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, "MMM d") : "To"}
                      </Button>
                      {showToCalendar && (
                        <div
                          className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
                          ref={(node) => {
                            if (node) {
                              const handleClickOutside = (
                                event: MouseEvent,
                              ) => {
                                if (!node.contains(event.target as Node)) {
                                  setShowToCalendar(false);
                                  document.removeEventListener(
                                    "mousedown",
                                    handleClickOutside,
                                  );
                                }
                              };
                              document.addEventListener(
                                "mousedown",
                                handleClickOutside,
                              );
                            }
                          }}
                        >
                          <CalendarComponent
                            mode="single"
                            selected={toDate}
                            onSelect={(date) => {
                              handleToDateSelect(date);
                              setShowToCalendar(false);
                            }}
                            initialFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {getHeaderText()}
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPeriod}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToNextPeriod}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="schedule" onValueChange={setActiveTab}>
              <div className="border-b border-gray-200 px-6 pt-4">
                <TabsList>
                  <TabsTrigger value="schedule" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule
                  </TabsTrigger>
                  <TabsTrigger value="attendance" className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Attendance
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="schedule" className="m-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 border border-gray-200 sticky left-0 bg-gray-50 z-10 min-w-48">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-700">
                              Employee
                            </span>
                          </div>
                        </th>
                        {days.map((day) => (
                          <th
                            key={day.toString()}
                            className="p-3 border border-gray-200 text-center min-w-36"
                          >
                            <div
                              className={`font-medium ${
                                isToday(day)
                                  ? "text-purple-600 font-semibold"
                                  : "text-gray-700"
                              }`}
                            >
                              {format(day, "EEE")}
                            </div>
                            <div
                              className={`text-sm ${
                                isToday(day)
                                  ? "text-purple-600 font-semibold"
                                  : "text-gray-600"
                              }`}
                            >
                              {format(day, "MMM d")}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredEmployees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-3 border border-gray-200 sticky left-0 z-10 bg-white">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage
                                  src={employee.avatarUrl}
                                  alt={employee.name}
                                />
                                <AvatarFallback className="bg-purple-100 text-purple-700">
                                  {employee.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {employee.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {employee.department}
                                </div>
                              </div>
                            </div>
                          </td>
                          {days.map((day) => {
                            const scheduleEntry = findScheduleEntry(
                              employee.id,
                              day,
                            );
                            return (
                              <td
                                key={day.toString()}
                                className={`p-3 border border-gray-200 text-center cursor-pointer ${
                                  isToday(day) ? "bg-purple-50" : ""
                                } hover:bg-gray-50`}
                                onClick={() =>
                                  handleScheduleCellClick(employee, day)
                                }
                              >
                                {scheduleEntry && scheduleEntry.shiftType && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex flex-col items-center">
                                          <Badge
                                            variant="outline"
                                            className={`w-full flex items-center justify-center px-2 py-1 ${getShiftColor(
                                              scheduleEntry.shiftType,
                                            )}`}
                                          >
                                            {
                                              displayShiftInfo(
                                                scheduleEntry.shiftType,
                                              ).name
                                            }
                                          </Badge>
                                          {displayShiftInfo(
                                            scheduleEntry.shiftType,
                                          ).time && (
                                            <span className="text-xs text-gray-600 mt-1">
                                              {
                                                displayShiftInfo(
                                                  scheduleEntry.shiftType,
                                                ).time
                                              }
                                            </span>
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs whitespace-pre-line text-sm">
                                        <div className="space-y-1">
                                          <p className="font-semibold">
                                            {
                                              displayShiftInfo(
                                                scheduleEntry.shiftType,
                                              ).name
                                            }
                                          </p>
                                          {displayShiftInfo(
                                            scheduleEntry.shiftType,
                                          )
                                            .details?.split("\n")
                                            .map((line, i) => (
                                              <p key={i}>{line}</p>
                                            ))}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="attendance">
                <Attendance
                  viewMode={viewMode}
                  currentDate={currentDate}
                  filteredEmployees={filteredEmployees}
                  attendance={attendance}
                  handleAttendanceCellClick={handleAttendanceCellClick}
                  fromDate={fromDate}
                  toDate={toDate}
                />
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Showing {filteredEmployees.length} employees
            </div>
            <div className="flex gap-3">
              <IncompleteBreaksDialog />
              <EmployeesOnLunchDialog />

              <AddEmployee
                onEmployeeAdded={async () => {
                  try {
                    setLoading(true);
                    const avatarResponse =
                      await UserProfileAPI.getAllUserAvatar();
                    const avatarMap = avatarResponse.data.reduce(
                      (
                        acc: Record<string, string>,
                        curr: { userId: string; avatar: string },
                      ) => {
                        acc[curr.userId] = curr.avatar;
                        return acc;
                      },
                      {},
                    );
                    await fetchEmployees(avatarMap);
                    await fetchAttendance();
                  } catch (err) {
                    console.error(
                      "Error refreshing after adding employee:",
                      err,
                    );
                    setError("Failed to refresh data after adding employee");
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </div>
          </CardFooter>
        </Card>

        {/* Edit Dialog */}
        <Dialog
          open={isAddShiftOpen}
          onOpenChange={(open) => {
            setIsAddShiftOpen(open);
            if (!open) resetDialogState();
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedEmployee && selectedDate ? (
                  <>
                    Update {format(selectedDate, "MMM d, yyyy")} for{" "}
                    {selectedEmployee.name}
                  </>
                ) : (
                  "Update Schedule"
                )}
              </DialogTitle>
              <DialogDescription>
                Modify shift details or attendance status
              </DialogDescription>
            </DialogHeader>

            <Tabs
              defaultValue={activeTab === "schedule" ? "shift" : "attendance"}
              className="mt-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="shift">Shift Schedule</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
              </TabsList>

              <TabsContent value="shift" className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Shift Type
                  </Label>
                  <RadioGroup
                    value={selectedShiftType}
                    onValueChange={(value: string) => {
                      setSelectedShiftType(value as ShiftTypeValue);
                      if (hasShiftTime(value as ShiftTypeValue)) {
                        setSelectedStartTime("00:00");
                        setSelectedEndTime("00:00");
                      } else {
                        setSelectedBreak1(undefined);
                        setSelectedLunch(undefined);
                        setSelectedBreak2(undefined);
                      }
                    }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {[
                      { value: "Morning", label: "Morning" },
                      { value: "Mid", label: "Mid" },
                      { value: "Night", label: "Night" },
                      { value: "restday", label: "Rest Day" },
                      { value: "paidTimeOff", label: "Paid Time Off" },
                      { value: "plannedLeave", label: "Planned Leave" },
                      { value: "holiday", label: "Holiday" },
                      { value: "rdot", label: "RDOT" },
                    ].map((shift) => (
                      <div
                        key={shift.value}
                        className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <RadioGroupItem
                          value={shift.value}
                          id={`shift-${shift.value}`}
                        />
                        <Label htmlFor={`shift-${shift.value}`}>
                          {shift.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {hasShiftTime(selectedShiftType) && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Shift Start
                        </Label>
                        <input
                          type="time"
                          value={selectedStartTime}
                          onChange={(e) => setSelectedStartTime(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Shift End
                        </Label>
                        <input
                          type="time"
                          value={selectedEndTime}
                          onChange={(e) => setSelectedEndTime(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          1st Break
                        </Label>
                        <input
                          type="time"
                          value={selectedBreak1 || ""}
                          onChange={(e) =>
                            setSelectedBreak1(e.target.value || undefined)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Lunch
                        </Label>
                        <input
                          type="time"
                          value={selectedLunch || ""}
                          onChange={(e) =>
                            setSelectedLunch(e.target.value || undefined)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          2nd Break
                        </Label>
                        <input
                          type="time"
                          value={selectedBreak2 || ""}
                          onChange={(e) =>
                            setSelectedBreak2(e.target.value || undefined)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Repeat for
                  </Label>
                  <Select
                    value={repeatDays.toString()}
                    onValueChange={(value) => setRepeatDays(parseInt(value))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Repeat days" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 15, 30].map((days) => (
                        <SelectItem key={days} value={days.toString()}>
                          {days} day{days !== 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Attendance Status
                  </Label>
                  <RadioGroup
                    value={selectedAttendanceStatus}
                    onValueChange={(value: string) => {
                      setSelectedAttendanceStatus(value as AttendanceStatus);
                    }}
                    className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto"
                  >
                    {[
                      "Present",
                      "NCNS",
                      "Call In",
                      "Rest Day",
                      "Tardy",
                      "RDOT",
                      "Suspended",
                      "Attrition",
                      "LOA",
                      "PTO",
                      "Half Day",
                      "Early Log Out",
                      "VTO",
                      "TB",
                    ].map((status) => (
                      <div
                        key={status}
                        className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <RadioGroupItem
                          value={status}
                          id={`status-${status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        />
                        <Label
                          htmlFor={`status-${status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {status}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {selectedAttendanceStatus === "Present" && (
                  <div className="space-y-3 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has-ot"
                        checked={showOtInput}
                        onCheckedChange={(checked) => {
                          setShowOtInput(!!checked);
                          if (!checked) {
                            setOtHours("");
                            setOtMinutes("");
                          }
                        }}
                      />
                      <Label
                        htmlFor="has-ot"
                        className="text-sm font-medium text-gray-700"
                      >
                        Include Overtime
                      </Label>
                    </div>

                    {showOtInput && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            OT Hours
                          </Label>
                          <input
                            type="number"
                            min="0"
                            max="24"
                            value={otHours}
                            onChange={(e) => setOtHours(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Hours"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            OT Minutes
                          </Label>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={otMinutes}
                            onChange={(e) => setOtMinutes(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Minutes"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(selectedAttendanceStatus === "Tardy" ||
                  selectedAttendanceStatus === "Half Day" ||
                  selectedAttendanceStatus === "Present" ||
                  selectedAttendanceStatus === "RDOT" ||
                  selectedAttendanceStatus === "Early Log Out") && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Time data will be automatically filled from time records.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetDialogState();
                  setIsAddShiftOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={
                  activeTab === "schedule"
                    ? handleAddShift
                    : handleUpdateAttendance
                }
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ScheduleAndAttendance;
