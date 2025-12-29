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
  Gift,
  Snowflake,
  TreePine,
  Star,
  Bell,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

// Christmas-themed shift colors
const getShiftColor = (shiftType: ShiftType): string => {
  if (!shiftType || !shiftType.type)
    return "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200";

  switch (shiftType.type) {
    case "Morning":
      return "bg-gradient-to-r from-green-100 to-green-200 text-green-900 border-green-300";
    case "Mid":
      return "bg-gradient-to-r from-red-100 to-red-200 text-red-900 border-red-300";
    case "Night":
      return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 border-blue-300";
    case "restday":
      return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 border-yellow-300";
    case "paidTimeOff":
      return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-900 border-purple-300";
    case "plannedLeave":
      return "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-900 border-pink-300";
    case "holiday":
      return "bg-gradient-to-r from-red-200 to-red-300 text-red-900 border-red-400";
    case "rdot":
      return "bg-gradient-to-r from-brown-100 to-brown-200 text-brown-900 border-brown-300";
    default:
      return "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200";
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
  shiftType: ShiftType
): { name: string; time: string; details?: string } => {
  if (!shiftType || !shiftType.type) return { name: "", time: "" };

  let displayName = "";
  let displayTime = "";
  let details = "";

  switch (shiftType.type) {
    case "Morning":
      displayName = "🌅 Morning";
      break;
    case "Mid":
      displayName = "☀️ Mid";
      break;
    case "Night":
      displayName = "🌙 Night";
      break;
    case "restday":
      displayName = " Rest Day";
      break;
    case "paidTimeOff":
      displayName = "🎁 PTO";
      break;
    case "plannedLeave":
      displayName = "⭐ Leave";
      break;
    case "holiday":
      displayName = "🎅 Holiday";
      break;
    case "rdot":
      displayName = "⏰ RDOT";
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
      shiftType.startTime
    )} - ${formatTimeToAMPM(shiftType.endTime)}`;

    const detailsParts = [];
    if (shiftType.startTime)
      detailsParts.push(`⏰ Login: ${formatTimeToAMPM(shiftType.startTime)}`);
    if (shiftType.endTime)
      detailsParts.push(`🚪 Logout: ${formatTimeToAMPM(shiftType.endTime)}`);
    if (shiftType.break1)
      detailsParts.push(`☕ Break1: ${formatTimeToAMPM(shiftType.break1)}`);
    if (shiftType.break2)
      detailsParts.push(`🍪 Break2: ${formatTimeToAMPM(shiftType.break2)}`);
    if (shiftType.lunch)
      detailsParts.push(` Lunch: ${formatTimeToAMPM(shiftType.lunch)}`);

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
    null
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
        <SelectTrigger className="w-48 border-green-300 bg-gradient-to-r from-green-50 to-red-50 text-green-900">
          <SelectValue placeholder="🎅 Select Team Leader" />
        </SelectTrigger>
        <SelectContent className="bg-gradient-to-r from-green-50 to-red-50 border-green-200">
          <SelectItem value="all" className="text-green-900 hover:bg-gradient-to-r hover:from-green-100 hover:to-red-100">
             All Elves
          </SelectItem>
          {Array.from(new Set(employees.map((emp) => emp.teamLeader)))
            .filter((leader) => leader && leader.trim() !== "")
            .sort()
            .map((leader) => (
              <SelectItem
                key={leader}
                value={leader}
                className="text-green-900 hover:bg-gradient-to-r hover:from-green-100 hover:to-red-100"
              >
                🎅 {leader}
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
          : `https://ui-avatars.com/api/?background=16A34A&color=fff&name=${entry.employeeName}`;

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
            curr: { userId: string; avatar: string }
          ) => {
            acc[curr.userId] = curr.avatar;
            return acc;
          },
          {}
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-red-50">
        <div className="text-center">
          <div className="animate-bounce">
            <TreePine className="h-12 w-12 text-green-600 mx-auto mb-4" />
          </div>
          <p className="text-green-600 font-medium">Loading Santa's Workshop...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4 text-red-700">
        ❌ {error}
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
        (prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() - 1))
      );
    } else if (viewMode === "dateRange" && fromDate && toDate) {
      const dayCount =
        Math.ceil(
          (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
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
        (prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() + 1))
      );
    } else if (viewMode === "dateRange" && fromDate && toDate) {
      const dayCount =
        Math.ceil(
          (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
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
      return ` Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`;
    } else if (viewMode === "monthly") {
      return format(currentDate, "🎅 MMMM yyyy");
    } else if (fromDate && toDate) {
      if (isSameDay(fromDate, toDate)) {
        return format(fromDate, "⭐ MMM d, yyyy");
      }
      return `${format(fromDate, "MMM d")} - ${format(toDate, "MMM d, yyyy")} `;
    }
    return "🎅 Select Date Range";
  };

  const findScheduleEntry = (
    employeeId: string,
    date: Date
  ): ScheduleEntry | undefined => {
    return schedule.find(
      (entry) =>
        entry.employeeId === employeeId &&
        entry.date &&
        isSameDay(new Date(entry.date), date)
    );
  };

  const findAttendanceEntry = (
    employeeId: string,
    date: Date
  ): AttendanceEntry | undefined => {
    return attendance.find(
      (entry) =>
        entry.employeeId === employeeId &&
        entry.date &&
        isSameDay(entry.date, date)
    );
  };

  const handleAddShift = async () => {
    if (selectedEmployee && selectedDate) {
      const updatedSchedule = [...schedule];

      const formattedDate = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
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
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

        const currentScheduleData = {
          ...scheduleData,
          date: currentFormattedDate,
        };

        const existingEntryIndex = updatedSchedule.findIndex(
          (entry) =>
            entry.employeeId === selectedEmployee.id &&
            isSameDay(new Date(entry.date), currentDate)
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
            currentScheduleData
          );
          console.log(`Successfully updated shift for ${currentFormattedDate}`);
        } catch (err) {
          console.error(
            `Error updating shift for ${currentFormattedDate}:`,
            err
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
                formattedDate
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
            "0"
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
              isSameDay(entry.date, selectedDate)
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
    <section className="bg-gradient-to-br from-green-50 via-white to-red-50 min-h-screen relative overflow-hidden">
      {/* Animated Snowflakes */}
      <div className="absolute top-4 left-4 opacity-5">
        <Snowflake className="h-16 w-16 text-blue-400 animate-pulse" />
      </div>
      <div className="absolute top-20 right-10 opacity-5">
        <Snowflake className="h-12 w-12 text-blue-300 animate-pulse delay-300" />
      </div>
      
      <BackButton />

      <div className="container mx-auto py-6">
        <Card className="w-full border-green-200 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-600 to-red-600 text-white rounded-t-lg border-b-4 border-green-400">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <TreePine className="h-6 w-6" />
                <CardTitle className="text-white">
                   Santa's Workshop Schedule & Attendance
                </CardTitle>
              </div>
              <CardDescription className="text-green-100">
                🎅 Manage your elves' schedules with holiday cheer! ⭐
              </CardDescription>
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
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
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
                  <TabsList className="bg-gradient-to-r from-green-100 to-red-100 border-green-200">
                    <TabsTrigger
                      value="weekly"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                    >
                      📅 Weekly
                    </TabsTrigger>
                    <TabsTrigger
                      value="monthly"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
                    >
                      🗓️ Monthly
                    </TabsTrigger>
                    <TabsTrigger
                      value="dateRange"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
                    >
                      ⭐ Date Range
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
                        className="w-[120px] justify-start text-left font-normal border-green-300 bg-gradient-to-r from-green-50 to-green-100 text-green-900 hover:from-green-100 hover:to-green-200"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
                        {fromDate ? format(fromDate, "MMM d") : "🎅 From"}
                      </Button>
                      {showFromCalendar && (
                        <div
                          className="absolute z-10 mt-1 bg-white border border-green-200 rounded-md shadow-lg"
                          ref={(node) => {
                            if (node) {
                              const handleClickOutside = (
                                event: MouseEvent
                              ) => {
                                if (!node.contains(event.target as Node)) {
                                  setShowFromCalendar(false);
                                  document.removeEventListener(
                                    "mousedown",
                                    handleClickOutside
                                  );
                                }
                              };
                              document.addEventListener(
                                "mousedown",
                                handleClickOutside
                              );
                            }
                          }}
                        >
                          <Calendar
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

                    <span className="text-green-700">to</span>

                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowFromCalendar(false);
                          setShowToCalendar(!showToCalendar);
                        }}
                        className="w-[120px] justify-start text-left font-normal border-red-300 bg-gradient-to-r from-red-50 to-red-100 text-red-900 hover:from-red-100 hover:to-red-200"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-red-600" />
                        {toDate ? format(toDate, "MMM d") : " To"}
                      </Button>
                      {showToCalendar && (
                        <div
                          className="absolute z-10 mt-1 bg-white border border-red-200 rounded-md shadow-lg"
                          ref={(node) => {
                            if (node) {
                              const handleClickOutside = (
                                event: MouseEvent
                              ) => {
                                if (!node.contains(event.target as Node)) {
                                  setShowToCalendar(false);
                                  document.removeEventListener(
                                    "mousedown",
                                    handleClickOutside
                                  );
                                }
                              };
                              document.addEventListener(
                                "mousedown",
                                handleClickOutside
                              );
                            }
                          }}
                        >
                          <Calendar
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
              <div>
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-green-600/50 to-red-600/50 px-3 py-1 rounded-lg">
                  {getHeaderText()}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPeriod}
                  className="border-green-300 bg-gradient-to-r from-green-50 to-green-100 text-green-900 hover:from-green-100 hover:to-green-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="border-gradient-to-r to-red-300 bg-gradient-to-r from-green-50 text-green-900 hover:from-green-100"
                >
                   Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPeriod}
                  className="border-red-300 bg-gradient-to-r from-red-50 to-red-100 text-red-900 hover:from-red-100 hover:to-red-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-gradient-to-br from-green-50/50 to-red-50/50">
            <Tabs defaultValue="schedule" onValueChange={setActiveTab}>
              <TabsList className="mb-0 bg-gradient-to-r from-green-100 to-red-100 border-green-200">
                <TabsTrigger
                  value="schedule"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                >
                  📅 Schedule
                </TabsTrigger>
                <TabsTrigger
                  value="attendance"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
                >
                  ✅ Attendance
                </TabsTrigger>
              </TabsList>
              <TabsContent value="schedule" className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-green-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-100 to-red-100">
                      <th className="p-2 border border-green-200 sticky left-0 bg-gradient-to-r from-green-100 to-green-200 z-10 min-w-40 text-green-900">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4" />
                          🎅 Elf
                        </div>
                      </th>
                      {days.map((day) => (
                        <th
                          key={day.toString()}
                          className="p-2 border border-green-200 text-center min-w-32 bg-gradient-to-r from-green-100 to-red-100"
                        >
                          <div
                            className={`font-medium ${
                              isToday(day)
                                ? "text-green-600 font-bold"
                                : "text-green-700"
                            }`}
                          >
                            {format(day, "EEE")}
                          </div>
                          <div
                            className={`text-sm ${
                              isToday(day)
                                ? "text-red-600 font-bold"
                                : "text-red-600"
                            }`}
                          >
                            {format(day, "MMM d")}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="group hover:bg-gradient-to-r hover:from-green-50 hover:to-red-50 transition-colors"
                      >
                        <td className="p-2 border border-green-200 sticky left-0 z-10 group-hover:bg-gradient-to-r group-hover:from-green-50 group-hover:to-red-50 bg-gradient-to-r from-green-50 to-green-100">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2 rounded-full overflow-hidden border-2 border-green-300">
                              <AvatarImage
                                src={employee.avatarUrl}
                                alt={employee.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-gradient-to-r from-green-500 to-red-500 text-white">
                                {employee.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-bold text-sm text-green-900">
                                {employee.name}
                              </div>
                              <div className="text-xs text-red-600">
                                {employee.department}
                              </div>
                            </div>
                          </div>
                        </td>
                        {days.map((day) => {
                          const scheduleEntry = findScheduleEntry(
                            employee.id,
                            day
                          );
                          return (
                            <td
                              key={day.toString()}
                              className={`p-2 border border-green-200 text-center cursor-pointer transition-all ${
                                isToday(day)
                                  ? "bg-gradient-to-r from-green-100 to-red-100 hover:!bg-gradient-to-r hover:!from-green-200 hover:!to-red-200"
                                  : ""
                              } hover:bg-gradient-to-r hover:from-green-50 hover:to-red-50`}
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
                                          className={`w-fit flex items-center justify-center px-3 py-1 min-w-24 ${getShiftColor(
                                            scheduleEntry.shiftType
                                          )}`}
                                        >
                                          {
                                            displayShiftInfo(
                                              scheduleEntry.shiftType
                                            ).name
                                          }
                                        </Badge>
                                        {displayShiftInfo(
                                          scheduleEntry.shiftType
                                        ).time && (
                                          <span className="text-xs text-green-600 mt-1">
                                            {
                                              displayShiftInfo(
                                                scheduleEntry.shiftType
                                              ).time
                                            }
                                          </span>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs whitespace-pre-line text-sm bg-gradient-to-r from-green-50 to-red-50 border-green-200 text-green-900">
                                      <div className="space-y-1">
                                        <p className="font-semibold">
                                          {
                                            displayShiftInfo(
                                              scheduleEntry.shiftType
                                            ).name
                                          }
                                        </p>
                                        {displayShiftInfo(
                                          scheduleEntry.shiftType
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
          <CardFooter className="flex justify-between bg-gradient-to-r from-green-100 to-red-100 border-t border-green-200">
            <div className="text-sm text-green-700 flex items-center">
              <Star className="h-3 w-3 mr-1" />
              Showing {filteredEmployees.length} elves 
            </div>
            <div className="flex gap-2 text-xs">
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
                        curr: { userId: string; avatar: string }
                      ) => {
                        acc[curr.userId] = curr.avatar;
                        return acc;
                      },
                      {}
                    );
                    await fetchEmployees(avatarMap);
                    await fetchAttendance();
                  } catch (err) {
                    console.error(
                      "Error refreshing after adding employee:",
                      err
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

        {/* Christmas-themed Dialog */}
        <Dialog
          open={isAddShiftOpen}
          onOpenChange={(open) => {
            setIsAddShiftOpen(open);
            if (!open) resetDialogState();
          }}
        >
          <DialogContent className="bg-gradient-to-r from-green-50 to-red-50 border-green-200">
            <DialogHeader>
              <DialogTitle className="text-green-900 flex items-center gap-2">
                <TreePine className="h-5 w-5" />
                {selectedEmployee && selectedDate ? (
                  <>
                     Update {format(selectedDate, "MMM d, yyyy")} for{" "}
                    {selectedEmployee.name}
                  </>
                ) : (
                  "🎅 Update Schedule"
                )}
              </DialogTitle>
              <DialogDescription className="text-green-700">
                ⭐ Manage schedules with holiday cheer and joy! 🎁
              </DialogDescription>
            </DialogHeader>
            <Tabs
              defaultValue={activeTab === "schedule" ? "shift" : "attendance"}
            >
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-green-100 to-red-100 border-green-200">
                <TabsTrigger
                  value="shift"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                >
                  📅 Shift Schedule
                </TabsTrigger>
                <TabsTrigger
                  value="attendance"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
                >
                  ✅ Attendance
                </TabsTrigger>
              </TabsList>
              <TabsContent value="shift">
                <div className="space-y-4 mt-4">
                  <Label htmlFor="shift-type" className="text-green-900">
                     Shift Type
                  </Label>
                  <RadioGroup
                    id="shift-type"
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
                    className="space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "Morning", label: "🌅 Morning" },
                        { value: "Mid", label: "☀️ Mid" },
                        { value: "Night", label: "🌙 Night" },
                        { value: "restday", label: " Rest Day" },
                        { value: "paidTimeOff", label: "🎁 PTO" },
                        { value: "plannedLeave", label: "⭐ Leave" },
                        { value: "holiday", label: "🎅 Holiday" },
                        { value: "rdot", label: "⏰ RDOT" },
                      ].map((shift) => (
                        <div
                          key={shift.value}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-gradient-to-r hover:from-green-100 hover:to-red-100"
                        >
                          <RadioGroupItem
                            value={shift.value}
                            id={shift.value}
                            className="text-green-500 border-green-300"
                          />
                          <Label htmlFor={shift.value} className="text-green-900">
                            {shift.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  {hasShiftTime(selectedShiftType) && (
                    <>
                      <div className="flex space-x-4">
                        <div>
                          <Label
                            htmlFor="start-time"
                            className="text-green-900"
                          >
                            ⏰ Shift Start
                          </Label>
                          <input
                            id="start-time"
                            type="time"
                            value={selectedStartTime}
                            onChange={(e) =>
                              setSelectedStartTime(e.target.value)
                            }
                            className="border border-green-300 p-2 rounded text-sm bg-gradient-to-r from-green-50 to-green-100 text-green-900"
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-time" className="text-green-900">
                            🚪 Shift End
                          </Label>
                          <input
                            id="end-time"
                            type="time"
                            value={selectedEndTime}
                            onChange={(e) => setSelectedEndTime(e.target.value)}
                            className="border border-red-300 p-2 rounded text-sm bg-gradient-to-r from-red-50 to-red-100 text-red-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="break1" className="text-green-900">
                            ☕ 1st Break
                          </Label>
                          <input
                            id="break1"
                            type="time"
                            value={selectedBreak1 || ""}
                            onChange={(e) =>
                              setSelectedBreak1(e.target.value || undefined)
                            }
                            className="border border-green-300 p-2 rounded text-sm w-full bg-gradient-to-r from-green-50 to-green-100 text-green-900"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lunch" className="text-green-900">
                             Lunch
                          </Label>
                          <input
                            id="lunch"
                            type="time"
                            value={selectedLunch || ""}
                            onChange={(e) =>
                              setSelectedLunch(e.target.value || undefined)
                            }
                            className="border border-red-300 p-2 rounded text-sm w-full bg-gradient-to-r from-red-50 to-red-100 text-red-900"
                          />
                        </div>
                        <div>
                          <Label htmlFor="break2" className="text-green-900">
                            🍪 2nd Break
                          </Label>
                          <input
                            id="break2"
                            type="time"
                            value={selectedBreak2 || ""}
                            onChange={(e) =>
                              setSelectedBreak2(e.target.value || undefined)
                            }
                            className="border border-green-300 p-2 rounded text-sm w-full bg-gradient-to-r from-green-50 to-green-100 text-green-900"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center space-x-2 text-sm p-2 bg-gradient-to-r from-green-100 to-red-100 rounded">
                    <span className="text-green-900">🎁 Repeat for</span>
                    <Select
                      value={repeatDays.toString()}
                      onValueChange={(value) => setRepeatDays(parseInt(value))}
                    >
                      <SelectTrigger className="w-40 text-sm border-green-300 bg-gradient-to-r from-green-50 to-red-50 text-green-900">
                        <SelectValue placeholder="Repeat days" />
                      </SelectTrigger>
                      <SelectContent className="bg-gradient-to-r from-green-50 to-red-50 border-green-200">
                        {[1, 2, 3, 4, 5, 6, 7, 15, 30].map((days) => (
                          <SelectItem
                            key={days}
                            value={days.toString()}
                            className="text-green-900 hover:bg-gradient-to-r hover:from-green-100 hover:to-red-100"
                          >
                            ⭐ {days} day{days !== 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="attendance">
                <div className="space-y-4 mt-4">
                  <Label htmlFor="attendance-status" className="text-green-900">
                    🎅 Attendance Status
                  </Label>
                  <RadioGroup
                    id="attendance-status"
                    value={selectedAttendanceStatus}
                    onValueChange={(value: string) => {
                      setSelectedAttendanceStatus(value as AttendanceStatus);
                    }}
                  >
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
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
                          className="flex items-center space-x-2 p-2 rounded hover:bg-gradient-to-r hover:from-green-100 hover:to-red-100"
                        >
                          <RadioGroupItem
                            value={status}
                            id={status.toLowerCase().replace(" ", "-")}
                            className="text-green-500 border-green-300"
                          />
                          <Label
                            htmlFor={status.toLowerCase().replace(" ", "-")}
                            className="text-green-900"
                          >
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  {selectedAttendanceStatus === "Present" && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 mt-6 p-2 bg-gradient-to-r from-green-100 to-red-100 rounded">
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
                          className="text-green-500 border-green-300"
                        />
                        <Label htmlFor="has-ot" className="text-green-900">
                           With Overtime?
                        </Label>
                      </div>

                      {showOtInput && (
                        <div className="grid grid-cols-2 gap-4 p-2 bg-gradient-to-r from-green-50 to-red-50 rounded border border-green-200">
                          <div>
                            <Label
                              htmlFor="ot-hours"
                              className="text-green-900"
                            >
                              ⏰ OT Hours
                            </Label>
                            <input
                              id="ot-hours"
                              type="number"
                              min="0"
                              max="24"
                              value={otHours}
                              onChange={(e) => setOtHours(e.target.value)}
                              className="border border-green-300 p-2 rounded text-sm w-full bg-white text-green-900"
                              placeholder="Hours"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="ot-minutes"
                              className="text-green-900"
                            >
                              ⏳ OT Minutes
                            </Label>
                            <input
                              id="ot-minutes"
                              type="number"
                              min="0"
                              max="59"
                              value={otMinutes}
                              onChange={(e) => setOtMinutes(e.target.value)}
                              className="border border-red-300 p-2 rounded text-sm w-full bg-white text-red-900"
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
                    <div className="text-sm text-green-700 bg-gradient-to-r from-green-100 to-red-100 p-2 rounded">
                      <p className="flex items-center">
                        <Bell className="h-3 w-3 mr-1" />
                        🎅 Time data will be automatically filled from time records.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="text-xs">
              <Button
                variant="outline"
                onClick={() => {
                  resetDialogState();
                  setIsAddShiftOpen(false);
                }}
                className="border-green-300 text-green-900 hover:bg-gradient-to-r hover:from-green-100 hover:to-green-200"
              >
                Cancel
              </Button>
              <Button
                onClick={
                  activeTab === "schedule"
                    ? handleAddShift
                    : handleUpdateAttendance
                }
                className="bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white"
              >
                 Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Christmas Footer */}
      <div className="mt-8 text-center bg-gradient-to-r from-green-50 to-red-50 p-4 rounded-xl border border-green-200 mx-auto max-w-4xl">
        <div className="text-green-600 text-sm flex items-center justify-center gap-2">
          <span></span>
          <span>May your workshop run smoothly this holiday season!</span>
          <span>🎅</span>
        </div>
        <div className="text-xs text-green-500 mt-1 flex items-center justify-center">
          <Snowflake className="h-3 w-3 mr-1" />
          From Santa's Workshop with Joy
        </div>
      </div>
    </section>
  );
};

export default ScheduleAndAttendance;