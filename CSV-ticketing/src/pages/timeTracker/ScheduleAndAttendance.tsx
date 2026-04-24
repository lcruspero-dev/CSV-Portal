/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";

// Dates
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  isWeekend,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

// Icons
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clock3,
  Coffee,
  Eye,
  Filter,
  Gift,
  Heart,
  Home,
  Loader2,
  Moon,
  Plane,
  RefreshCw,
  Star,
  Sun,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

// API Endpoints
import {
  ScheduleAndAttendanceAPI,
  TimeRecordAPI,
  UserProfileAPI,
} from "@/API/endpoint";

// Shadcn UIs components
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Kit Components
import { AbsenteeismAnalytics } from "@/components/kit/AbsenteeismAnalytics";
import AddEmployee from "@/components/kit/AddEmployee";
import BackButton from "@/components/kit/BackButton";
import { IncompleteBreaksDialog } from "@/components/kit/IncompleteBreaksDialog";
import { EmployeesOnLunchDialog } from "@/components/kit/employeeLunchDialog";

// Types
import type {
  AttendanceEntry,
  AttendanceStatus,
  Employee,
  ScheduleEntry,
  ShiftType,
  ShiftTypeValue,
  ViewMode,
} from "@/types/schedule";

// Helpers
import {
  displayShiftInfo,
  getShiftColor,
  hasShiftTime,
} from "@/utils/scheduleHelper";

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
  const [hoveredCell, setHoveredCell] = useState<{
    employeeId: string;
    date: string;
  } | null>(null);

  // Refs for click outside detection
  const fromCalendarRef = useRef<HTMLDivElement>(null);
  const toCalendarRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Shift type icons mapping
  const getShiftIcon = (shiftType: ShiftTypeValue) => {
    const icons: Record<ShiftTypeValue, any> = {
      Morning: Sun,
      Mid: Clock3,
      Night: Moon,
      restday: Home,
      paidTimeOff: Gift,
      plannedLeave: Plane,
      holiday: Star,
      rdot: Heart,
    };
    const Icon = icons[shiftType] || Clock;
    return <Icon className="h-3 w-3 mr-1" />;
  };

  // Attendance status icons
  const getAttendanceIcon = (status: AttendanceStatus) => {
    const icons: Partial<Record<AttendanceStatus, any>> = {
      Present: CheckCircle2,
      NCNS: XCircle,
      "Rest Day": Home,
      Tardy: AlertCircle,
      Suspended: XCircle,
      Attrition: XCircle,
      LOA: Briefcase,
      PTO: Gift,
      "Half Day": Clock3,
      "Early Log Out": Clock3,
      VTO: Gift,
      TB: Heart,
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="h-3 w-3 mr-1" />;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fromCalendarRef.current &&
        !fromCalendarRef.current.contains(event.target as Node)
      ) {
        setShowFromCalendar(false);
      }
      if (
        toCalendarRef.current &&
        !toCalendarRef.current.contains(event.target as Node)
      ) {
        setShowToCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const DepartmentFilterDropdown = () => {
    const uniqueLeaders = Array.from(
      new Set(employees.map((emp) => emp.teamLeader)),
    )
      .filter((leader) => leader && leader.trim() !== "")
      .sort();

    return (
      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
        <SelectTrigger className="w-48 bg-white border-gray-200 hover:border-purple-300 transition-colors">
          <SelectValue placeholder="Select Team Leader" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              All Employees
            </div>
          </SelectItem>
          {uniqueLeaders.map((leader) => (
            <SelectItem key={leader} value={leader}>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                {leader}
              </div>
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
        status: entry.status as AttendanceStatus,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-purple-300 animate-pulse" />
          </div>
          <p className="text-gray-700 font-medium mt-4">
            Loading employee data...
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Please wait while we fetch the latest information
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto border-red-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 rounded-full p-3 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Data
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
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
    const today = new Date();
    setCurrentDate(today);
    if (viewMode === "weekly") {
      setFromDate(startOfWeek(today));
      setToDate(endOfWeek(today));
    } else if (viewMode === "monthly") {
      setFromDate(startOfMonth(today));
      setToDate(endOfMonth(today));
    } else {
      setFromDate(startOfWeek(today));
      setToDate(endOfWeek(today));
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
        isSameDay(parseISO(entry.date), date),
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
            isSameDay(parseISO(entry.date), currentDate),
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
      resetDialogState();
    }
  };

  const handleScheduleCellClick = (employee: Employee, date: Date) => {
    setSelectedEmployee(employee);
    setSelectedDate(date);

    const entry = findScheduleEntry(employee.id, date);

    if (entry && entry.shiftType) {
      setSelectedShiftType(entry.shiftType.type);

      if (hasShiftTime(entry.shiftType.type)) {
        setSelectedStartTime(entry.shiftType.startTime || "00:00");
        setSelectedEndTime(entry.shiftType.endTime || "00:00");
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
    setActiveTab("schedule");
  };

  const handleAttendanceCellClick = (employee: Employee, date: Date) => {
    if (date > new Date()) {
      return;
    }

    setSelectedEmployee(employee);
    setSelectedDate(date);

    const entry = findAttendanceEntry(employee.id, date);
    setSelectedAttendanceStatus(entry ? entry.status : "Present");

    if (entry?.ot) {
      const [hours, minutes] = entry.ot.split(":");
      setOtHours(hours);
      setOtMinutes(minutes);
      setShowOtInput(true);
    } else {
      setOtHours("");
      setOtMinutes("");
      setShowOtInput(false);
    }

    setIsAddShiftOpen(true);
    setActiveTab("attendance");
  };

  const handleUpdateAttendance = async () => {
    if (selectedEmployee && selectedDate) {
      try {
        const formattedDate = `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}/${selectedDate.getFullYear()}`;

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

        if (
          selectedAttendanceStatus === "Present" &&
          showOtInput &&
          (otHours || otMinutes)
        ) {
          const hours = otHours || "0";
          const minutes = otMinutes || "0";
          attendanceData.ot = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
        } else {
          attendanceData.ot = null;
        }

        if (needsTimeData && timeRecordData) {
          attendanceData.logIn = timeRecordData.timeIn || null;
          attendanceData.logOut = timeRecordData.timeOut || null;
          attendanceData.totalHours = timeRecordData.totalHours || null;
          attendanceData.shift = timeRecordData.shift || null;

          if (timeRecordData.totalBreakTime) {
            attendanceData.break1 = timeRecordData.totalBreakTime;
          } else if (timeRecordData.break1) {
            attendanceData.break1 = timeRecordData.break1;
          } else if (timeRecordData.breakTime) {
            attendanceData.break1 = timeRecordData.breakTime;
          }

          if (timeRecordData.totalSecondBreakTime) {
            attendanceData.break2 = timeRecordData.totalSecondBreakTime;
          } else if (timeRecordData.break2) {
            attendanceData.break2 = timeRecordData.break2;
          } else if (timeRecordData.secondBreakTime) {
            attendanceData.break2 = timeRecordData.secondBreakTime;
          }

          if (timeRecordData.breaks && Array.isArray(timeRecordData.breaks)) {
            attendanceData.break1 = timeRecordData.breaks[0]?.duration || null;
            attendanceData.break2 = timeRecordData.breaks[1]?.duration || null;
          }

          if (timeRecordData.breakDetails) {
            attendanceData.break1 =
              timeRecordData.breakDetails.firstBreak || null;
            attendanceData.break2 =
              timeRecordData.breakDetails.secondBreak || null;
          }
        } else if (!needsTimeData) {
          attendanceData.logIn = null;
          attendanceData.logOut = null;
          attendanceData.totalHours = null;
          attendanceData.shift = null;
          attendanceData.break1 = null;
          attendanceData.break2 = null;
        }

        await ScheduleAndAttendanceAPI.createAttendanceEntry(attendanceData);

        const updatedEntry: AttendanceEntry = {
          employeeId: selectedEmployee.id,
          date: selectedDate,
          status: selectedAttendanceStatus,
          ...(attendanceData.logIn && { logIn: attendanceData.logIn }),
          ...(attendanceData.logOut && { logOut: attendanceData.logOut }),
          ...(attendanceData.totalHours && {
            totalHours: attendanceData.totalHours,
          }),
          ...(attendanceData.ot && { ot: attendanceData.ot }),
          ...(attendanceData.shift && { shift: attendanceData.shift }),
          ...(attendanceData.break1 && { break1: attendanceData.break1 }),
          ...(attendanceData.break2 && { break2: attendanceData.break2 }),
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
        resetDialogState();
      } catch (err) {
        console.error("Error updating attendance:", err);
        setError("Failed to update attendance");
      }
    }
  };

  // Status color mapping for visual indicators
  const getStatusColorClass = (status: AttendanceStatus) => {
    const colors: Record<AttendanceStatus, string> = {
      Present: "text-green-600 bg-green-50 border-green-200",
      NCNS: "text-red-600 bg-red-50 border-red-200",
      "Call In": "text-yellow-600 bg-yellow-50 border-yellow-200",
      "Rest Day": "text-blue-600 bg-blue-50 border-blue-200",
      Tardy: "text-orange-600 bg-orange-50 border-orange-200",
      RDOT: "text-purple-600 bg-purple-50 border-purple-200",
      Suspended: "text-gray-600 bg-gray-50 border-gray-200",
      Attrition: "text-gray-600 bg-gray-50 border-gray-200",
      LOA: "text-indigo-600 bg-indigo-50 border-indigo-200",
      PTO: "text-teal-600 bg-teal-50 border-teal-200",
      "Half Day": "text-amber-600 bg-amber-50 border-amber-200",
      "Early Log Out": "text-rose-600 bg-rose-50 border-rose-200",
      VTO: "text-cyan-600 bg-cyan-50 border-cyan-200",
      TB: "text-pink-600 bg-pink-50 border-pink-200",
      Pending: "",
    };
    return colors[status] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50/30 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section with Gradient */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-purple-200 rounded-full opacity-20 blur-2xl"></div>
            <div className="relative">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Schedule & Attendance Management
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                Manage employee schedules and track attendance records with ease
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BackButton />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
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

        {/* Main Card */}
        <Card className="border border-gray-200/80 shadow-xl shadow-gray-200/20 backdrop-blur-sm bg-white/95 overflow-hidden flex flex-col">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-white to-gray-50/50 flex-shrink-0">
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
                  <TabsList className="bg-gray-100/50 p-1">
                    <TabsTrigger
                      value="weekly"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Weekly
                    </TabsTrigger>
                    <TabsTrigger
                      value="monthly"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Monthly
                    </TabsTrigger>
                    <TabsTrigger
                      value="dateRange"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
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
                        className="w-[140px] justify-start border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                        {fromDate ? format(fromDate, "MMM d") : "From"}
                      </Button>
                      {showFromCalendar && (
                        <div
                          ref={fromCalendarRef}
                          className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg animate-in fade-in zoom-in-95 duration-200"
                        >
                          <CalendarComponent
                            mode="single"
                            selected={fromDate}
                            onSelect={handleFromDateSelect}
                            initialFocus
                          />
                        </div>
                      )}
                    </div>

                    <span className="text-gray-400">→</span>

                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowFromCalendar(false);
                          setShowToCalendar(!showToCalendar);
                        }}
                        className="w-[140px] justify-start border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                        {toDate ? format(toDate, "MMM d") : "To"}
                      </Button>
                      {showToCalendar && (
                        <div
                          ref={toCalendarRef}
                          className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg animate-in fade-in zoom-in-95 duration-200"
                        >
                          <CalendarComponent
                            mode="single"
                            selected={toDate}
                            onSelect={handleToDateSelect}
                            initialFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-center px-3 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                  <h2 className="text-sm font-semibold text-gray-700">
                    {getHeaderText()}
                  </h2>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousPeriod}
                    className="hover:bg-purple-100 hover:text-purple-700 transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToToday}
                    className="hover:bg-purple-100 hover:text-purple-700 transition-all"
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNextPeriod}
                    className="hover:bg-purple-100 hover:text-purple-700 transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-hidden">
            <Tabs
              defaultValue="schedule"
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <div className="border-b border-gray-200 px-6 pt-4 flex-shrink-0">
                <TabsList className="bg-gray-100/50 p-1">
                  <TabsTrigger
                    value="schedule"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <Clock className="h-4 w-4" />
                    Schedule
                  </TabsTrigger>
                  <TabsTrigger
                    value="attendance"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <Eye className="h-4 w-4" />
                    Attendance
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="schedule"
                className="m-0 flex-1 overflow-hidden"
              >
                <div ref={tableContainerRef} className="h-full overflow-y-auto">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm">
                        <tr>
                          <th className="p-4 border border-gray-200 sticky left-0 bg-gray-50/95 backdrop-blur-sm z-30 min-w-56">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-purple-100 rounded-lg">
                                <Users className="h-4 w-4 text-purple-600" />
                              </div>
                              <span className="font-semibold text-gray-700">
                                Employee
                              </span>
                            </div>
                          </th>
                          {days.map((day) => (
                            <th
                              key={day.toString()}
                              className={`p-4 border border-gray-200 text-center min-w-40 transition-colors ${
                                isToday(day) ? "bg-purple-50/50" : ""
                              }`}
                            >
                              <div
                                className={`font-semibold ${
                                  isToday(day)
                                    ? "text-purple-700"
                                    : isWeekend(day)
                                      ? "text-gray-500"
                                      : "text-gray-700"
                                }`}
                              >
                                {format(day, "EEE")}
                              </div>
                              <div
                                className={`text-sm mt-1 ${
                                  isToday(day)
                                    ? "text-purple-600 font-medium"
                                    : "text-gray-500"
                                }`}
                              >
                                {format(day, "MMM d")}
                              </div>
                              {isToday(day) && (
                                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-purple-500 rounded-full mt-1 mr-1"></div>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredEmployees.map((employee) => (
                          <tr
                            key={employee.id}
                            className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent transition-all duration-200"
                          >
                            <td className="p-4 border border-gray-200 sticky left-0 z-10 bg-white group-hover:bg-purple-50/30 transition-colors">
                              <div className="flex items-center">
                                <Avatar className="h-9 w-9 mr-3 ring-2 ring-purple-100 group-hover:ring-purple-200 transition-all">
                                  <AvatarImage
                                    src={employee.avatarUrl}
                                    alt={employee.name}
                                  />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                                    {employee.name
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                                    {employee.name}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
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
                              const isHovered =
                                hoveredCell?.employeeId === employee.id &&
                                hoveredCell?.date === day.toISOString();
                              return (
                                <td
                                  key={day.toString()}
                                  className={`p-3 border border-gray-200 text-center cursor-pointer transition-all duration-200 ${
                                    isToday(day) ? "bg-purple-50/30" : ""
                                  } ${
                                    isHovered
                                      ? "bg-purple-100/50 shadow-inner"
                                      : "hover:bg-purple-50"
                                  }`}
                                  onClick={() =>
                                    handleScheduleCellClick(employee, day)
                                  }
                                  onMouseEnter={() =>
                                    setHoveredCell({
                                      employeeId: employee.id,
                                      date: day.toISOString(),
                                    })
                                  }
                                  onMouseLeave={() => setHoveredCell(null)}
                                >
                                  {scheduleEntry && scheduleEntry.shiftType ? (
                                    <TooltipProvider delayDuration={200}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex flex-col items-center transform transition-transform hover:scale-105">
                                            <Badge
                                              variant="outline"
                                              className={`w-full flex items-center justify-center px-2 py-1.5 gap-1 font-medium ${getShiftColor(
                                                scheduleEntry.shiftType,
                                              )} border-0 shadow-sm`}
                                            >
                                              {getShiftIcon(
                                                scheduleEntry.shiftType.type,
                                              )}
                                              {
                                                displayShiftInfo(
                                                  scheduleEntry.shiftType,
                                                ).name
                                              }
                                            </Badge>
                                            {displayShiftInfo(
                                              scheduleEntry.shiftType,
                                            ).time && (
                                              <span className="text-xs text-gray-500 mt-1">
                                                {
                                                  displayShiftInfo(
                                                    scheduleEntry.shiftType,
                                                  ).time
                                                }
                                              </span>
                                            )}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs whitespace-pre-line text-sm bg-gray-900 text-white border-0">
                                          <div className="space-y-1 p-1">
                                            <p className="font-semibold flex items-center gap-1">
                                              {getShiftIcon(
                                                scheduleEntry.shiftType.type,
                                              )}
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
                                                <p key={i} className="text-xs">
                                                  {line}
                                                </p>
                                              ))}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      No shift
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="attendance"
                className="m-0 flex-1 overflow-hidden"
              >
                <div ref={tableContainerRef} className="h-full overflow-y-auto">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm">
                        <tr>
                          <th className="p-4 border border-gray-200 sticky left-0 bg-gray-50/95 backdrop-blur-sm z-30 min-w-56">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-purple-100 rounded-lg">
                                <Users className="h-4 w-4 text-purple-600" />
                              </div>
                              <span className="font-semibold text-gray-700">
                                Employee
                              </span>
                            </div>
                          </th>
                          {days.map((day) => (
                            <th
                              key={day.toString()}
                              className={`p-4 border border-gray-200 text-center min-w-40 transition-colors ${
                                isToday(day) ? "bg-purple-50/50" : ""
                              }`}
                            >
                              <div
                                className={`font-semibold ${
                                  isToday(day)
                                    ? "text-purple-700"
                                    : isWeekend(day)
                                      ? "text-gray-500"
                                      : "text-gray-700"
                                }`}
                              >
                                {format(day, "EEE")}
                              </div>
                              <div
                                className={`text-sm mt-1 ${
                                  isToday(day)
                                    ? "text-purple-600 font-medium"
                                    : "text-gray-500"
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
                            className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent transition-all duration-200"
                          >
                            <td className="p-4 border border-gray-200 sticky left-0 z-10 bg-white group-hover:bg-purple-50/30 transition-colors">
                              <div className="flex items-center">
                                <Avatar className="h-9 w-9 mr-3 ring-2 ring-purple-100 group-hover:ring-purple-200 transition-all">
                                  <AvatarImage
                                    src={employee.avatarUrl}
                                    alt={employee.name}
                                  />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                                    {employee.name
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                                    {employee.name}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                                    {employee.department}
                                  </div>
                                </div>
                              </div>
                            </td>
                            {days.map((day) => {
                              const attendanceEntry = findAttendanceEntry(
                                employee.id,
                                day,
                              );
                              const isFuture = day > new Date();
                              return (
                                <td
                                  key={day.toString()}
                                  className={`p-3 border border-gray-200 text-center ${
                                    !isFuture
                                      ? "cursor-pointer transition-all duration-200 hover:bg-purple-50"
                                      : "cursor-not-allowed bg-gray-50/50"
                                  } ${isToday(day) ? "bg-purple-50/30" : ""}`}
                                  onClick={() =>
                                    !isFuture &&
                                    handleAttendanceCellClick(employee, day)
                                  }
                                >
                                  {attendanceEntry ? (
                                    <TooltipProvider delayDuration={200}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="transform transition-transform hover:scale-105">
                                            <Badge
                                              variant="outline"
                                              className={`w-full flex items-center justify-center px-2 py-1.5 gap-1 font-medium ${getStatusColorClass(
                                                attendanceEntry.status,
                                              )} border-0 shadow-sm`}
                                            >
                                              {getAttendanceIcon(
                                                attendanceEntry.status,
                                              )}
                                              {attendanceEntry.status}
                                            </Badge>
                                            {attendanceEntry.ot && (
                                              <span className="text-xs text-green-600 mt-1 block font-medium">
                                                OT: {attendanceEntry.ot}h
                                              </span>
                                            )}
                                            {attendanceEntry.logIn && (
                                              <p className="text-xs text-gray-500 mt-0.5">
                                                In: {attendanceEntry.logIn}
                                              </p>
                                            )}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs whitespace-pre-line text-sm bg-gray-900 text-white border-0">
                                          <div className="space-y-1 p-1">
                                            <p className="font-semibold flex items-center gap-1">
                                              {getAttendanceIcon(
                                                attendanceEntry.status,
                                              )}
                                              {attendanceEntry.status}
                                            </p>
                                            {attendanceEntry.logIn && (
                                              <p className="text-xs">
                                                Login: {attendanceEntry.logIn}
                                              </p>
                                            )}
                                            {attendanceEntry.logOut && (
                                              <p className="text-xs">
                                                Logout: {attendanceEntry.logOut}
                                              </p>
                                            )}
                                            {attendanceEntry.totalHours && (
                                              <p className="text-xs">
                                                Total Hours:{" "}
                                                {attendanceEntry.totalHours}
                                              </p>
                                            )}
                                            {attendanceEntry.break1 && (
                                              <p className="text-xs">
                                                Break 1:{" "}
                                                {attendanceEntry.break1}
                                              </p>
                                            )}
                                            {attendanceEntry.break2 && (
                                              <p className="text-xs">
                                                Break 2:{" "}
                                                {attendanceEntry.break2}
                                              </p>
                                            )}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                                      {isFuture ? (
                                        <>
                                          <Clock className="h-3 w-3" />
                                          Future
                                        </>
                                      ) : (
                                        "Not set"
                                      )}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white py-4 flex-shrink-0">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <div className="p-1 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              Showing {filteredEmployees.length} employee
              {filteredEmployees.length !== 1 ? "s" : ""}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {selectedEmployee && selectedDate ? (
                  <>
                    Update {format(selectedDate, "MMM d, yyyy")} for{" "}
                    <span className="text-purple-600">
                      {selectedEmployee.name}
                    </span>
                  </>
                ) : (
                  "Update Schedule"
                )}
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Modify shift details or attendance status
              </DialogDescription>
            </DialogHeader>

            <Tabs
              defaultValue={activeTab === "schedule" ? "shift" : "attendance"}
              className="mt-4"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-1">
                <TabsTrigger
                  value="shift"
                  className="flex items-center gap-2 data-[state=active]:bg-white"
                >
                  <Clock className="h-4 w-4" />
                  Shift Schedule
                </TabsTrigger>
                <TabsTrigger
                  value="attendance"
                  className="flex items-center gap-2 data-[state=active]:bg-white"
                >
                  <Eye className="h-4 w-4" />
                  Attendance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="shift" className="space-y-6 mt-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="p-1 bg-purple-100 rounded">
                      <Clock className="h-3 w-3 text-purple-600" />
                    </div>
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
                      { value: "Morning", label: "Morning", icon: Sun },
                      { value: "Mid", label: "Mid", icon: Clock3 },
                      { value: "Night", label: "Night", icon: Moon },
                      { value: "restday", label: "Rest Day", icon: Home },
                      {
                        value: "paidTimeOff",
                        label: "Paid Time Off",
                        icon: Gift,
                      },
                      {
                        value: "plannedLeave",
                        label: "Planned Leave",
                        icon: Plane,
                      },
                      { value: "holiday", label: "Holiday", icon: Star },
                      { value: "rdot", label: "RDOT", icon: Heart },
                    ].map((shift) => {
                      const Icon = shift.icon;
                      return (
                        <div
                          key={shift.value}
                          className={`flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 transition-all cursor-pointer ${
                            selectedShiftType === shift.value
                              ? "border-purple-500 bg-purple-50"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedShiftType(shift.value as ShiftTypeValue)
                          }
                        >
                          <RadioGroupItem
                            value={shift.value}
                            id={`shift-${shift.value}`}
                            className="hidden"
                          />
                          <Icon className="h-4 w-4 text-purple-500" />
                          <Label
                            htmlFor={`shift-${shift.value}`}
                            className="cursor-pointer"
                          >
                            {shift.label}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>

                {hasShiftTime(selectedShiftType) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Shift Start
                          </Label>
                          <Input
                            type="time"
                            value={selectedStartTime}
                            onChange={(e) =>
                              setSelectedStartTime(e.target.value)
                            }
                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Shift End
                          </Label>
                          <Input
                            type="time"
                            value={selectedEndTime}
                            onChange={(e) => setSelectedEndTime(e.target.value)}
                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                            <Coffee className="h-3 w-3" />
                            1st Break
                          </Label>
                          <Input
                            type="time"
                            value={selectedBreak1 || ""}
                            onChange={(e) =>
                              setSelectedBreak1(e.target.value || undefined)
                            }
                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            🍱 Lunch
                          </Label>
                          <Input
                            type="time"
                            value={selectedLunch || ""}
                            onChange={(e) =>
                              setSelectedLunch(e.target.value || undefined)
                            }
                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <Coffee className="h-3 w-3" />
                            2nd Break
                          </Label>
                          <Input
                            type="time"
                            value={selectedBreak2 || ""}
                            onChange={(e) =>
                              setSelectedBreak2(e.target.value || undefined)
                            }
                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex items-center space-x-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Repeat for
                  </Label>
                  <Select
                    value={repeatDays.toString()}
                    onValueChange={(value) => setRepeatDays(parseInt(value))}
                  >
                    <SelectTrigger className="w-40 border-gray-200">
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

              <TabsContent value="attendance" className="space-y-6 mt-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="p-1 bg-purple-100 rounded">
                      <Eye className="h-3 w-3 text-purple-600" />
                    </div>
                    Attendance Status
                  </Label>
                  <RadioGroup
                    value={selectedAttendanceStatus}
                    onValueChange={(value: string) => {
                      const newStatus = value as AttendanceStatus;
                      setSelectedAttendanceStatus(newStatus);
                      if (newStatus === "Present") {
                        setShowOtInput(true);
                      } else {
                        setShowOtInput(false);
                        setOtHours("");
                        setOtMinutes("");
                      }
                    }}
                    className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto"
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
                        className={`flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 transition-all cursor-pointer ${
                          selectedAttendanceStatus === status
                            ? "border-purple-500 bg-purple-50"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedAttendanceStatus(
                            status as AttendanceStatus,
                          )
                        }
                      >
                        <RadioGroupItem
                          value={status}
                          id={`status-${status.toLowerCase().replace(" ", "-")}`}
                          className="hidden"
                        />
                        <div
                          className={`w-2 h-2 rounded-full ${
                            status === "Present"
                              ? "bg-green-500"
                              : status === "NCNS"
                                ? "bg-red-500"
                                : status === "Tardy"
                                  ? "bg-orange-500"
                                  : status === "Rest Day"
                                    ? "bg-blue-500"
                                    : "bg-gray-400"
                          }`}
                        />
                        <Label
                          htmlFor={`status-${status.toLowerCase().replace(" ", "-")}`}
                          className="cursor-pointer"
                        >
                          {status}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {selectedAttendanceStatus === "Present" && (
                  <div className="space-y-3 border border-purple-200 rounded-lg p-4 bg-purple-50/30">
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
                        className="border-purple-300 data-[state=checked]:bg-purple-600"
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
                          <Input
                            type="number"
                            min="0"
                            max="24"
                            value={otHours}
                            onChange={(e) => setOtHours(e.target.value)}
                            placeholder="Hours"
                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            OT Minutes
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={otMinutes}
                            onChange={(e) => setOtMinutes(e.target.value)}
                            placeholder="Minutes"
                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Time data will be automatically filled from time records.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="border-t border-gray-200 pt-4 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetDialogState();
                  setIsAddShiftOpen(false);
                }}
                className="border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={
                  activeTab === "schedule"
                    ? handleAddShift
                    : handleUpdateAttendance
                }
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
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
