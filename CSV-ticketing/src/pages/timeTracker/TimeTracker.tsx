/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { ScheduleAndAttendanceAPI, timer } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { ViewScheduleButton } from "@/components/kit/ViewScheduleButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useToast } from "@/components/ui/use-toast";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Filter,
  Home,
  Inbox,
  RefreshCw,
  TrendingUp,
  Utensils,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { SecureConfirmButton } from "./SecureconfirmButton";

interface AttendanceEntry {
  id: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  totalHours?: number;
  notes?: string;
  shift?: string;
  breakStart?: string;
  breakEnd?: string;
  totalBreakTime?: number;
  dateBreakStart?: string;
  dateBreakEnd?: string;
  secondBreakStart?: string;
  secondBreakEnd?: string;
  totalSecondBreakTime?: number;
  dateSecondBreakStart?: string;
  dateSecondBreakEnd?: string;
  lunchStart?: string;
  lunchEnd?: string;
  totalLunchTime?: number;
  dateLunchStart?: string;
  dateLunchEnd?: string;
  loginLimit?: number;
  overbreak?: number;
  overlunch?: number;
  overbreak1?: number;
  overbreak2?: number;
  overLunch?: number;
}

interface CurrentTimeResponse {
  date: string;
  time: string;
}

interface AlertState {
  show: boolean;
  type: "break1" | "break2" | "lunch" | null;
  message: string;
}

type CutoffPeriod = "1-15" | "16-31";

const LoadingSpinner = ({ className = "" }: { className?: string }) => (
  <div className="flex items-center justify-center">
    <div
      className={`h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin ${className}`}
    />
  </div>
);

export const AttendanceTracker: React.FC = () => {
  const [isTimeIn, setIsTimeIn] = useState(false);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>(
    [],
  );
  const [filteredEntries, setFilteredEntries] = useState<AttendanceEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<AttendanceEntry>>(
    {},
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentServerTime, setCurrentServerTime] =
    useState<CurrentTimeResponse>({ date: "", time: "" });
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isLoadingSecondBreakStart, setIsLoadingSecondBreakStart] =
    useState(false);
  const [isLoadingSecondBreakEnd, setIsLoadingSecondBreakEnd] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: null,
    message: "",
  });

  const getCurrentCutoff = (): CutoffPeriod => {
    const today = new Date();
    const day = today.getDate();
    return day <= 15 ? "1-15" : "16-31";
  };

  const [selectedCutoff, setSelectedCutoff] =
    useState<CutoffPeriod>(getCurrentCutoff());
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [alertShown, setAlertShown] = useState({
    break1: false,
    break2: false,
    lunch: false,
  });
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingTimeIn, setIsLoadingTimeIn] = useState(false);
  const [isLoadingTimeOut, setIsLoadingTimeOut] = useState(false);
  const [isLoadingBreakStart, setIsLoadingBreakStart] = useState(false);
  const [isLoadingBreakEnd, setIsLoadingBreakEnd] = useState(false);
  const [isLoadingLunchStart, setIsLoadingLunchStart] = useState(false);
  const [isLoadingLunchEnd, setIsLoadingLunchEnd] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { toast } = useToast();

  const showToast = (
    title: string,
    description: string,
    variant: "default" | "destructive" = "default",
  ) => {
    toast({ title, description, variant });
  };

  const setCurrentDateFilters = (serverDate?: string) => {
    const dateToUse = serverDate ? new Date(serverDate) : new Date();
    const day = dateToUse.getDate();
    const month = dateToUse.getMonth();
    const year = dateToUse.getFullYear();
    const cutoff: CutoffPeriod = day <= 15 ? "1-15" : "16-31";
    setSelectedCutoff(cutoff);
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const formatTimeTo12Hour = (timeString: string): string => {
    if (!timeString) return "";
    try {
      const upperTime = timeString.toUpperCase();
      if (upperTime.includes("AM") || upperTime.includes("PM"))
        return timeString;
      const timeParts = timeString.split(":");
      let hourNum = parseInt(timeParts[0], 10);
      const minuteNum = timeParts[1] ? parseInt(timeParts[1], 10) : 0;
      if (isNaN(hourNum) || isNaN(minuteNum)) return timeString;
      const period = hourNum >= 12 ? "PM" : "AM";
      hourNum = hourNum % 12 || 12;
      return `${hourNum}:${minuteNum.toString().padStart(2, "0")} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  const formatTime = (timeString: string): string =>
    formatTimeTo12Hour(timeString);

  const formatHoursToHoursMinutes = (hoursString: string): string => {
    if (!hoursString || hoursString === "0" || hoursString === "0.00")
      return "-";
    const hours = parseFloat(hoursString);
    if (isNaN(hours) || hours === 0) return "-";
    const totalMinutes = Math.round(hours * 60);
    const hoursPart = Math.floor(totalMinutes / 60);
    const minutesPart = totalMinutes % 60;
    if (hoursPart === 0) return `${minutesPart}m`;
    if (minutesPart === 0) return `${hoursPart}h`;
    return `${hoursPart}h ${minutesPart}m`;
  };

  const formatMinutesToHoursMinutes = (minutes: number): string => {
    if (!minutes || minutes === 0) return "-";
    const hoursPart = Math.floor(minutes / 60);
    const minutesPart = minutes % 60;
    if (hoursPart === 0) return `${minutesPart}m`;
    if (minutesPart === 0) return `${hoursPart}h`;
    return `${hoursPart}h ${minutesPart}m`;
  };

  const calculateOverbreak = (
    breakTime: number,
    allowedBreakTime: number,
  ): number => {
    if (!breakTime || breakTime <= allowedBreakTime) return 0;
    return Math.round((breakTime - allowedBreakTime) * 60);
  };

  const alertTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const showAlert = (type: "break1" | "break2" | "lunch") => {
    const messages = {
      break1: "Break 1 will end in 1 minute! Time to return to work.",
      break2: "Break 2 will end in 1 minute! Time to return to work.",
      lunch: "Lunch break will end in 1 minute! Time to return to work.",
    };
    setAlert({ show: true, type, message: messages[type] });
    setAlertShown((prev) => ({ ...prev, [type]: true }));
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => {
      setAlert({ show: false, type: null, message: "" });
    }, 10000);
  };

  const hideAlert = () => {
    setAlert({ show: false, type: null, message: "" });
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (currentEntry.breakEnd)
      setAlertShown((prev) => ({ ...prev, break1: false }));
    if (currentEntry.secondBreakEnd)
      setAlertShown((prev) => ({ ...prev, break2: false }));
    if (currentEntry.lunchEnd)
      setAlertShown((prev) => ({ ...prev, lunch: false }));
  }, [
    currentEntry.breakEnd,
    currentEntry.secondBreakEnd,
    currentEntry.lunchEnd,
  ]);

  const formatCurrentDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const currentFormattedDate = currentServerTime.date
    ? formatCurrentDate(currentServerTime.date)
    : "";

  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const filterEntriesByCutoff = (
    entries: AttendanceEntry[],
    cutoff: CutoffPeriod,
    month: number,
    year: number,
  ): AttendanceEntry[] => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const day = entryDate.getDate();
      if (entryDate.getMonth() !== month || entryDate.getFullYear() !== year)
        return false;
      return cutoff === "1-15" ? day >= 1 && day <= 15 : day >= 16;
    });
  };

  useEffect(() => {
    const filtered = filterEntriesByCutoff(
      attendanceEntries,
      selectedCutoff,
      selectedMonth,
      selectedYear,
    );
    setFilteredEntries(filtered);
  }, [attendanceEntries, selectedCutoff, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!isTimeIn) return;
    const checkForAlerts = () => {
      if (
        currentEntry.breakStart &&
        !currentEntry.breakEnd &&
        elapsedTime >= 840 &&
        elapsedTime < 900 &&
        !alertShown.break1
      ) {
        showAlert("break1");
      } else if (
        currentEntry.secondBreakStart &&
        !currentEntry.secondBreakEnd &&
        elapsedTime >= 840 &&
        elapsedTime < 900 &&
        !alertShown.break2
      ) {
        showAlert("break2");
      } else if (
        currentEntry.lunchStart &&
        !currentEntry.lunchEnd &&
        elapsedTime >= 3540 &&
        elapsedTime < 3600 &&
        !alertShown.lunch
      ) {
        showAlert("lunch");
      }
    };
    checkForAlerts();
  }, [elapsedTime, currentEntry, isTimeIn, alertShown]);

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);

  const getAttendance = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await timer.getAttendanceEntries();
      const entriesWithOverbreak = response.data.map(
        (entry: AttendanceEntry) => ({
          ...entry,
          overbreak1:
            entry.overbreak1 ||
            calculateOverbreak(entry.totalBreakTime || 0, 0.25),
          overbreak2:
            entry.overbreak2 ||
            calculateOverbreak(entry.totalSecondBreakTime || 0, 0.25),
          overlunch:
            entry.overLunch || calculateOverbreak(entry.totalLunchTime || 0, 1),
        }),
      );
      setAttendanceEntries(entriesWithOverbreak);
    } catch (error) {
      console.error("Error getting attendance entries:", error);
      if (typeof error === "object" && error !== null && "message" in error) {
        if (
          (error as { message: string }).message === "Employee time not found"
        )
          return;
      }
      showToast(
        "Error",
        "Failed to load attendance history. Please try refreshing.",
        "destructive",
      );
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getCurrentTimeFromAPI = async (): Promise<CurrentTimeResponse> => {
    try {
      const response = await timer.getServerTime();
      setCurrentServerTime(response.data);
      return response.data;
    } catch (error) {
      const now = new Date();
      return { date: now.toLocaleDateString(), time: now.toLocaleTimeString() };
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoadingInitial(true);
      try {
        const currentTimeData = await getCurrentTimeFromAPI();
        setCurrentDateFilters(currentTimeData.date);
        const employeeId = JSON.parse(localStorage.getItem("user")!)._id;
        const shift = await fetchShiftSchedule(
          currentTimeData.date,
          employeeId,
        );
        if (shift) setCurrentEntry((prev) => ({ ...prev, shift }));
        await Promise.all([getAttendance(), getCurrentTime()]);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoadingInitial(false);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (!isTimeIn || !currentEntry.date) return;
    let intervalId: ReturnType<typeof setInterval>;
    const serverTime = new Date(
      `${currentServerTime.date} ${currentServerTime.time}`,
    ).getTime();
    const localTime = Date.now();
    const timeOffset = serverTime - localTime;
    const isOnBreak = currentEntry.breakStart && !currentEntry.breakEnd;
    const isOnSecondBreak =
      currentEntry.secondBreakStart && !currentEntry.secondBreakEnd;
    const isOnLunch = currentEntry.lunchStart && !currentEntry.lunchEnd;

    intervalId = setInterval(() => {
      const currentTime = Date.now() + timeOffset;
      let diffMs = 0;
      if (isOnBreak) {
        const breakStartTime = new Date(
          `${currentEntry.dateBreakStart || currentEntry.date} ${currentEntry.breakStart}`,
        ).getTime();
        diffMs = currentTime - breakStartTime;
      } else if (isOnSecondBreak) {
        const secondBreakStartTime = new Date(
          `${currentEntry.dateSecondBreakStart || currentEntry.date} ${currentEntry.secondBreakStart}`,
        ).getTime();
        diffMs = currentTime - secondBreakStartTime;
      } else if (isOnLunch) {
        const lunchStartTime = new Date(
          `${currentEntry.dateLunchStart || currentEntry.date} ${currentEntry.lunchStart}`,
        ).getTime();
        diffMs = currentTime - lunchStartTime;
      } else {
        const timeInDate = new Date(
          `${currentEntry.date} ${currentEntry.timeIn}`,
        ).getTime();
        let totalLunchMs = 0;
        if (currentEntry.lunchStart && currentEntry.lunchEnd) {
          const lunchStart = new Date(
            `${currentEntry.dateLunchStart || currentEntry.date} ${currentEntry.lunchStart}`,
          );
          const lunchEnd = new Date(
            `${currentEntry.dateLunchEnd || currentEntry.date} ${currentEntry.lunchEnd}`,
          );
          if (lunchEnd < lunchStart) lunchEnd.setDate(lunchEnd.getDate() + 1);
          totalLunchMs = lunchEnd.getTime() - lunchStart.getTime();
        }
        diffMs = currentTime - timeInDate - totalLunchMs;
      }
      setElapsedTime(Math.max(0, Math.floor(diffMs / 1000)));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isTimeIn, currentEntry, currentServerTime]);

  const formatElapsedTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getCurrentTime = async () => {
    try {
      const response = await timer.getCurrentTimeIn();
      const currentTimeData = response.data[0];
      if (currentTimeData) {
        setIsTimeIn(!currentTimeData.timeOut);
        setCurrentEntry(currentTimeData);
      } else {
        setIsTimeIn(false);
      }
    } catch (error) {
      console.error("Error getting current time:", error);
    }
  };

  const handleTimeIn = async () => {
    setIsLoadingTimeIn(true);
    try {
      const userString = localStorage.getItem("user");
      if (!userString) throw new Error("User data not found in local storage");
      const user = JSON.parse(userString);
      const currentTimeData = await getCurrentTimeFromAPI();
      const entry: AttendanceEntry = {
        id: `entry-${new Date().getTime()}`,
        date: currentTimeData.date,
        timeIn: currentTimeData.time,
        shift: currentEntry.shift || "",
        loginLimit: user.loginLimit,
      };
      const response = await timer.timeIn(entry);
      setCurrentEntry(response.data);
      getAttendance();
      setIsTimeIn(true);
      setElapsedTime(0);
      showToast("Time In Recorded", "You have successfully clocked in.");
    } catch (error: any) {
      let errorMessage = "An error occurred while logging time";
      if (error.response?.status === 409 && error.response?.data?.message)
        errorMessage = error.response.data.message;
      else if (error.message) errorMessage = error.message;
      showToast("Error", errorMessage, "destructive");
    } finally {
      setIsLoadingTimeIn(false);
    }
  };

  const handleTimeOut = async ({ notes }: { notes?: string }) => {
    setIsLoadingTimeOut(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();
      const timeInDate = new Date(
        `${currentEntry.date} ${currentEntry.timeIn}`,
      );
      const timeOutDate = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`,
      );
      let totalLunchMs = 0;
      if (currentEntry.lunchStart && currentEntry.lunchEnd) {
        const lunchStart = new Date(
          `${currentEntry.dateLunchStart} ${currentEntry.lunchStart}`,
        );
        const lunchEnd = new Date(
          `${currentEntry.dateLunchEnd} ${currentEntry.lunchEnd}`,
        );
        if (lunchEnd < lunchStart) lunchEnd.setDate(lunchEnd.getDate() + 1);
        totalLunchMs = lunchEnd.getTime() - lunchStart.getTime();
      }
      const diffMs =
        timeOutDate.getTime() - timeInDate.getTime() - totalLunchMs;
      const totalHours = diffMs / (1000 * 60 * 60);
      const updatedEntry = {
        ...currentEntry,
        timeOut: currentTimeData.time,
        totalHours: Number(totalHours.toFixed(2)),
        notes,
      };
      await timer.timeOut(updatedEntry);
      setCurrentEntry(updatedEntry);
      getAttendance();
      setIsTimeIn(false);
      setDialogOpen(false);
      setElapsedTime(0);
      hideAlert();
      setAlertShown({ break1: false, break2: false, lunch: false });
      showToast("Time Out Recorded", "You have successfully clocked out.");
    } catch (error) {
      showToast(
        "Error",
        "Failed to complete time out. Please try again.",
        "destructive",
      );
    } finally {
      setIsLoadingTimeOut(false);
    }
  };

  const handleBreakStart = async () => {
    setIsLoadingBreakStart(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();
      const updatedEntry = {
        ...currentEntry,
        breakStart: currentTimeData.time,
        dateBreakStart: currentTimeData.date,
      };
      const response = await timer.updateBreakStart(updatedEntry);
      setCurrentEntry(response.data);
      setElapsedTime(0);
      hideAlert();
      setAlertShown((prev) => ({ ...prev, break1: false }));
      showToast("Break Started", "Break 1 has started. 15 minutes allocated.");
    } catch (error) {
      showToast(
        "Error",
        "Failed to start break. Please try again.",
        "destructive",
      );
    } finally {
      setIsLoadingBreakStart(false);
    }
  };

  const handleBreakEnd = async () => {
    setIsLoadingBreakEnd(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();
      const breakStart = new Date(
        `${currentEntry.dateBreakStart} ${currentEntry.breakStart}`,
      );
      const breakEnd = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`,
      );
      if (breakEnd < breakStart) breakEnd.setDate(breakEnd.getDate() + 1);
      const newBreakTimeHours =
        (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
      const updatedEntry = {
        ...currentEntry,
        breakEnd: currentTimeData.time,
        dateBreakEnd: currentTimeData.date,
        totalBreakTime: Number(
          ((currentEntry.totalBreakTime || 0) + newBreakTimeHours).toFixed(2),
        ),
      };
      const response = await timer.updateBreakEnd(updatedEntry);
      setCurrentEntry(response.data);
      hideAlert();
      setAlertShown((prev) => ({ ...prev, break1: false }));
      showToast("Break Ended", "Break 1 has ended. Back to work!");
    } catch (error) {
      showToast(
        "Error",
        "Failed to end break. Please try again.",
        "destructive",
      );
    } finally {
      setIsLoadingBreakEnd(false);
    }
  };

  const handleLunchStart = async () => {
    setIsLoadingLunchStart(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();
      const updatedEntry = {
        ...currentEntry,
        lunchStart: currentTimeData.time,
        dateLunchStart: currentTimeData.date,
      };
      const response = await timer.updateLunchStart(updatedEntry);
      setCurrentEntry(response.data);
      setElapsedTime(0);
      hideAlert();
      setAlertShown((prev) => ({ ...prev, lunch: false }));
      showToast(
        "Lunch Started",
        "Lunch break has started. 60 minutes allocated.",
      );
    } catch (error) {
      showToast(
        "Error",
        "Failed to start lunch. Please try again.",
        "destructive",
      );
    } finally {
      setIsLoadingLunchStart(false);
    }
  };

  const handleLunchEnd = async () => {
    setIsLoadingLunchEnd(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();
      const lunchStart = new Date(
        `${currentEntry.dateLunchStart} ${currentEntry.lunchStart}`,
      );
      const lunchEnd = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`,
      );
      if (lunchEnd < lunchStart) lunchEnd.setDate(lunchEnd.getDate() + 1);
      const newLunchTimeHours =
        (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60 * 60);
      const updatedEntry = {
        ...currentEntry,
        lunchEnd: currentTimeData.time,
        dateLunchEnd: currentTimeData.date,
        totalLunchTime: Number(
          ((currentEntry.totalLunchTime || 0) + newLunchTimeHours).toFixed(2),
        ),
      };
      const response = await timer.updateLunchEnd(updatedEntry);
      setCurrentEntry(response.data);
      hideAlert();
      setAlertShown((prev) => ({ ...prev, lunch: false }));
      showToast("Lunch Ended", "Lunch break has ended. Back to work!");
    } catch (error) {
      showToast(
        "Error",
        "Failed to end lunch. Please try again.",
        "destructive",
      );
    } finally {
      setIsLoadingLunchEnd(false);
    }
  };

  const handleActionChange = (value: string) => setSelectedAction(value);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const fetchShiftSchedule = async (date: string, employeeId: string) => {
    try {
      const response =
        await ScheduleAndAttendanceAPI.getSchedulePerEmployeeByDate(
          employeeId,
          formatDate(date),
        );
      return response.data.shiftType;
    } catch (error) {
      return null;
    }
  };

  const handleConfirmAction = async () => {
    switch (selectedAction) {
      case "startBreak":
        setIsLoadingBreakStart(true);
        await handleBreakStart();
        setSelectedAction(null);
        setIsLoadingBreakStart(false);
        break;
      case "endBreak":
        setIsLoadingBreakEnd(true);
        await handleBreakEnd();
        setSelectedAction(null);
        setIsLoadingBreakEnd(false);
        break;
      case "startSecondBreak":
        setIsLoadingSecondBreakStart(true);
        await handleSecondBreakStart();
        setSelectedAction(null);
        setIsLoadingSecondBreakStart(false);
        break;
      case "endSecondBreak":
        setIsLoadingSecondBreakEnd(true);
        await handleSecondBreakEnd();
        setSelectedAction(null);
        setIsLoadingSecondBreakEnd(false);
        break;
      case "startLunch":
        setIsLoadingLunchStart(true);
        await handleLunchStart();
        setSelectedAction(null);
        setIsLoadingLunchStart(false);
        break;
      case "endLunch":
        setIsLoadingLunchEnd(true);
        await handleLunchEnd();
        setSelectedAction(null);
        setIsLoadingLunchEnd(false);
        break;
      case "timeOut":
        setDialogOpen(true);
        break;
    }
  };

  const handleSecondBreakStart = async () => {
    setIsLoadingSecondBreakStart(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();
      const updatedEntry = {
        ...currentEntry,
        secondBreakStart: currentTimeData.time,
        dateSecondBreakStart: currentTimeData.date,
      };
      const response = await timer.updateSecondBreakStart(updatedEntry);
      setCurrentEntry(response.data);
      setElapsedTime(0);
      hideAlert();
      setAlertShown((prev) => ({ ...prev, break2: false }));
      showToast(
        "Break 2 Started",
        "Break 2 has started. 15 minutes allocated.",
      );
    } catch (error) {
      showToast(
        "Error",
        "Failed to start second break. Please try again.",
        "destructive",
      );
    } finally {
      setIsLoadingSecondBreakStart(false);
    }
  };

  const handleSecondBreakEnd = async () => {
    setIsLoadingSecondBreakEnd(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();
      const secondBreakStart = new Date(
        `${currentEntry.dateSecondBreakStart} ${currentEntry.secondBreakStart}`,
      );
      const secondBreakEnd = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`,
      );
      if (secondBreakEnd < secondBreakStart)
        secondBreakEnd.setDate(secondBreakEnd.getDate() + 1);
      const newSecondBreakTimeHours = Number(
        (secondBreakEnd.getTime() - secondBreakStart.getTime()) /
          (1000 * 60 * 60),
      );
      const totalSecondBreakTimeHours =
        (currentEntry.totalSecondBreakTime ?? 0) + newSecondBreakTimeHours;
      const updatedEntry = {
        ...currentEntry,
        secondBreakEnd: currentTimeData.time,
        dateSecondBreakEnd: currentTimeData.date,
        totalSecondBreakTime: Number(
          (totalSecondBreakTimeHours || 0).toFixed(2),
        ),
      };
      const response = await timer.updateSecondBreakEnd(updatedEntry);
      setCurrentEntry(response.data);
      hideAlert();
      setAlertShown((prev) => ({ ...prev, break2: false }));
      showToast("Break 2 Ended", "Break 2 has ended. Back to work!");
    } catch (error) {
      showToast(
        "Error",
        "Failed to end second break. Please try again.",
        "destructive",
      );
    } finally {
      setIsLoadingSecondBreakEnd(false);
    }
  };

  const getAvailableActions = () => {
    const actions = [];
    if (currentEntry.breakStart && !currentEntry.breakEnd) {
      actions.push({ value: "endBreak", label: "End Break 1" });
    } else if (currentEntry.secondBreakStart && !currentEntry.secondBreakEnd) {
      actions.push({ value: "endSecondBreak", label: "End Break 2" });
    } else if (currentEntry.lunchStart && !currentEntry.lunchEnd) {
      actions.push({ value: "endLunch", label: "End Lunch" });
    } else {
      if (!currentEntry.breakStart)
        actions.push({ value: "startBreak", label: "Start Break 1" });
      if (
        currentEntry.breakStart &&
        currentEntry.breakEnd &&
        !currentEntry.secondBreakStart
      )
        actions.push({ value: "startSecondBreak", label: "Start Break 2" });
      if (!currentEntry.lunchStart)
        actions.push({ value: "startLunch", label: "Start Lunch" });
      if (isTimeIn) actions.push({ value: "timeOut", label: "Time Out" });
    }
    return actions;
  };

  // Determine current timer label & Tailwind color classes
  const getTimerMeta = () => {
    if (currentEntry.breakStart && !currentEntry.breakEnd)
      return {
        label: "Break 1 Timer",
        text: "text-sky-600",
        bg: "bg-sky-50",
        ring: "ring-sky-200",
      };
    if (currentEntry.secondBreakStart && !currentEntry.secondBreakEnd)
      return {
        label: "Break 2 Timer",
        text: "text-indigo-600",
        bg: "bg-indigo-50",
        ring: "ring-indigo-200",
      };
    if (currentEntry.lunchStart && !currentEntry.lunchEnd)
      return {
        label: "Lunch Timer",
        text: "text-amber-600",
        bg: "bg-amber-50",
        ring: "ring-amber-200",
      };
    return {
      label: "Work Timer",
      text: "text-violet-600",
      bg: "bg-violet-50",
      ring: "ring-violet-200",
    };
  };

  const timerMeta = getTimerMeta();

  // Combined "busy" flag shared by the secure confirm button — while any of
  // these are in flight, the button shows its loading state and can't be
  // re-triggered.
  const isConfirmBusy =
    isLoadingBreakStart ||
    isLoadingBreakEnd ||
    isLoadingSecondBreakStart ||
    isLoadingSecondBreakEnd ||
    isLoadingLunchStart ||
    isLoadingLunchEnd ||
    isLoadingTimeOut;

  if (isLoadingInitial) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f8] font-[Outfit,sans-serif]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
          <p className="text-sm font-medium text-gray-500">
            Loading time tracker...
          </p>
        </div>
      </div>
    );
  }

  type SessionCardColor = "violet" | "sky" | "emerald" | "indigo" | "amber";

  const sessionCardColors: Record<
    SessionCardColor,
    { bar: string; chip: string; icon: string; badge: string }
  > = {
    violet: {
      bar: "bg-violet-500",
      chip: "bg-violet-50",
      icon: "text-violet-600",
      badge: "bg-violet-50 text-violet-600",
    },
    sky: {
      bar: "bg-sky-500",
      chip: "bg-sky-50",
      icon: "text-sky-600",
      badge: "bg-sky-50 text-sky-600",
    },
    emerald: {
      bar: "bg-emerald-500",
      chip: "bg-emerald-50",
      icon: "text-emerald-600",
      badge: "bg-emerald-50 text-emerald-600",
    },
    indigo: {
      bar: "bg-indigo-500",
      chip: "bg-indigo-50",
      icon: "text-indigo-600",
      badge: "bg-indigo-50 text-indigo-600",
    },
    amber: {
      bar: "bg-amber-500",
      chip: "bg-amber-50",
      icon: "text-amber-600",
      badge: "bg-amber-50 text-amber-600",
    },
  };

  const sessionCards = [
    currentEntry.timeIn && {
      key: "timeIn",
      icon: Clock,
      color: "violet" as SessionCardColor,
      label: "Time In",
      main: formatTime(currentEntry.timeIn),
      endLabel: null as string | null,
      totalLabel: null as string | null,
      status: null as "ongoing" | "done" | null,
    },
    currentEntry.shift && {
      key: "shift",
      icon: TrendingUp,
      color: "sky" as SessionCardColor,
      label: "Shift",
      main: currentEntry.shift,
      endLabel: null as string | null,
      totalLabel: null as string | null,
      status: null as "ongoing" | "done" | null,
    },
    currentEntry.breakStart && {
      key: "break1",
      icon: Coffee,
      color: "emerald" as SessionCardColor,
      label: "Break 1",
      main: formatTime(currentEntry.breakStart),
      endLabel: currentEntry.breakEnd
        ? formatTime(currentEntry.breakEnd)
        : null,
      totalLabel:
        currentEntry.totalBreakTime !== undefined
          ? formatMinutesToHoursMinutes(
              Math.round(currentEntry.totalBreakTime * 60),
            )
          : null,
      status: currentEntry.breakEnd ? ("done" as const) : ("ongoing" as const),
    },
    currentEntry.secondBreakStart && {
      key: "break2",
      icon: Coffee,
      color: "indigo" as SessionCardColor,
      label: "Break 2",
      main: formatTime(currentEntry.secondBreakStart),
      endLabel: currentEntry.secondBreakEnd
        ? formatTime(currentEntry.secondBreakEnd)
        : null,
      totalLabel:
        currentEntry.totalSecondBreakTime !== undefined
          ? formatMinutesToHoursMinutes(
              Math.round(currentEntry.totalSecondBreakTime * 60),
            )
          : null,
      status: currentEntry.secondBreakEnd
        ? ("done" as const)
        : ("ongoing" as const),
    },
    currentEntry.lunchStart && {
      key: "lunch",
      icon: Utensils,
      color: "amber" as SessionCardColor,
      label: "Lunch",
      main: formatTime(currentEntry.lunchStart),
      endLabel: currentEntry.lunchEnd
        ? formatTime(currentEntry.lunchEnd)
        : null,
      totalLabel:
        currentEntry.totalLunchTime !== undefined
          ? formatMinutesToHoursMinutes(
              Math.round(currentEntry.totalLunchTime * 60),
            )
          : null,
      status: currentEntry.lunchEnd ? ("done" as const) : ("ongoing" as const),
    },
  ].filter(Boolean) as {
    key: string;
    icon: any;
    color: SessionCardColor;
    label: string;
    main: string;
    endLabel: string | null;
    totalLabel: string | null;
    status: "ongoing" | "done" | null;
  }[];

  const tableColumns = [
    "Date",
    "Time In",
    "Time Out",
    "Total Hrs",
    "Break 1",
    "Lunch",
    "Break 2",
    "Overbreak 1",
    "Overbreak 2",
    "Overlunch",
    "Notes",
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');`}</style>

      <div className="min-h-screen bg-[#f5f5f8] font-[Outfit,sans-serif]">
        {/* ALERT */}
        {alert.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm animate-[at-pop_0.25s_ease] rounded-2xl border border-[#e8e8f0] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                <AlertCircle className="h-[22px] w-[22px] text-amber-600" />
              </div>
              <p className="mb-1.5 text-base font-extrabold text-[#1a1a2e]">
                Time Alert
              </p>
              <p className="mb-5 text-sm leading-relaxed text-[#606080]">
                {alert.message}
              </p>
              <div className="flex justify-end">
                <button
                  className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                  onClick={hideAlert}
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-4">
            <BackButton />
          </div>

          <p className="mb-3 text-[0.66rem] font-bold uppercase tracking-widest text-[#9090a8]">
            Today's Session
          </p>

          {/* TIMER CARD */}
          <div className="overflow-hidden rounded-2xl border border-[#e8e8f0] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 sm:px-7">
              <div className="flex items-center gap-2">
                <Calendar className="h-[15px] w-[15px] text-[#9090a8]" />
                <span className="text-sm font-medium text-[#6060a0]">
                  {currentFormattedDate || "Loading..."}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isTimeIn && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600">
                    <span className="h-[5px] w-[5px] animate-pulse rounded-full bg-emerald-500" />
                    Active Session
                  </div>
                )}
                <ViewScheduleButton />
              </div>
            </div>

            {/* CLOCK */}
            <div className="flex flex-col items-center px-4 pb-6 pt-8 sm:px-7">
              <span
                className={`mb-3 rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${timerMeta.bg} ${timerMeta.text}`}
              >
                {timerMeta.label}
              </span>
              <div
                className={`font-mono text-5xl font-bold leading-none tracking-tight transition-colors sm:text-6xl md:text-7xl ${timerMeta.text} ${
                  !isTimeIn ? "opacity-30" : ""
                }`}
              >
                {formatElapsedTime(elapsedTime)}
              </div>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[#f0f0f6] px-4 py-5 sm:px-7">
              {!isTimeIn ? (
                <button
                  className="inline-flex w-full min-w-[140px] items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-[0_2px_12px_rgba(124,58,237,0.25)] transition hover:-translate-y-px hover:bg-violet-700 hover:shadow-[0_4px_18px_rgba(124,58,237,0.3)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                  onClick={handleTimeIn}
                  disabled={isLoadingTimeIn}
                >
                  {isLoadingTimeIn ? (
                    <LoadingSpinner className="border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Home className="h-4 w-4" /> Clock In
                    </>
                  )}
                </button>
              ) : (
                <div className="flex w-full flex-col items-stretch justify-center gap-2.5 sm:w-auto sm:flex-row sm:items-center">
                  <Select
                    value={selectedAction || undefined}
                    onValueChange={handleActionChange}
                  >
                    <SelectTrigger className="w-full rounded-xl border-[#e0e0f0] text-sm sm:w-[200px]">
                      <SelectValue placeholder="Select Action" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableActions().map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAction && (
                    <SecureConfirmButton
                      onConfirm={handleConfirmAction}
                      loading={isConfirmBusy}
                      loadingLabel="Processing..."
                      label="Confirm"
                    />
                  )}
                </div>
              )}
            </div>

            {/* SESSION SUMMARY */}
            {isTimeIn && sessionCards.length > 0 && (
              <div className="px-4 pb-6 sm:px-7">
                <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-[#9090a8]">
                  Session Summary
                </p>
                <div className="grid grid-cols gap-5 sm:grid-cols-2 md:grid-cols-4">
                  {sessionCards.map((card) => {
                    const c = sessionCardColors[card.color];
                    return (
                      <div
                        key={card.key}
                        className="group relative overflow-hidden rounded-xl border border-[#ededf5] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#d8d8ec] hover:shadow-md"
                      >
                        <div
                          className={`absolute inset-x-0 top-0 h-1 ${c.bar}`}
                        />
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.chip}`}
                            >
                              <card.icon className={`h-4 w-4 ${c.icon}`} />
                            </div>
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#9090a8]">
                              {card.label}
                            </span>
                          </div>
                          {card.status && (
                            <span
                              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold ${
                                card.status === "ongoing"
                                  ? c.badge
                                  : "bg-[#f5f5f8] text-[#19ce01]"
                              }`}
                            >
                              {card.status === "ongoing" ? (
                                <>
                                  <span
                                    className={`h-[5px] w-[5px] animate-pulse rounded-full ${c.bar}`}
                                  />
                                  Ongoing
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                                  Done
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-bold leading-tight text-[#1a1a2e]">
                          {card.main}
                        </p>
                        {(card.endLabel || card.totalLabel) && (
                          <div className="mt-2.5 flex items-center gap-3 border-t border-[#f0f0f6] pt-2.5 text-xs">
                            {card.endLabel && (
                              <div>
                                <p className="text-[#b0b0c0]">End</p>
                                <p className="font-semibold text-[#3a3a5a]">
                                  {card.endLabel}
                                </p>
                              </div>
                            )}
                            {card.totalLabel && (
                              <div>
                                <p className="text-[#b0b0c0]">Total</p>
                                <p className="font-semibold text-[#3a3a5a]">
                                  {card.totalLabel}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* TIME OUT DIALOG */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="rounded-2xl font-[Outfit,sans-serif]">
              <DialogHeader>
                <DialogTitle className="text-lg font-extrabold">
                  Complete Your Work Day
                </DialogTitle>
              </DialogHeader>
              <div className="pt-2">
                <Label
                  htmlFor="notes"
                  className="text-sm font-semibold text-[#6060a0]"
                >
                  Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  placeholder="Add any notes about your work day..."
                  className="mt-2 rounded-lg"
                />
                <div className="mt-4 flex flex-col-reverse justify-end gap-2.5 sm:flex-row">
                  <button
                    onClick={() => setDialogOpen(false)}
                    className="rounded-lg border border-[#e0e0f0] bg-[#f8f8fb] px-4 py-2.5 text-sm font-semibold text-[#6060a0] transition hover:bg-[#f0f0f6]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const notesInput = document.getElementById(
                        "notes",
                      ) as HTMLInputElement;
                      handleTimeOut({ notes: notesInput?.value });
                    }}
                    disabled={isLoadingTimeOut}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingTimeOut ? (
                      <LoadingSpinner className="border-white/30 border-t-white" />
                    ) : (
                      "Complete Day"
                    )}
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* HISTORY */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#e8e8f0] bg-white">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0f0f6] px-4 py-5 sm:px-7">
              <div>
                <p className="text-sm font-bold text-[#1a1a2e]">
                  Attendance History
                </p>
                <p className="mt-0.5 text-xs text-[#9090a8]">
                  {months.find((m) => m.value === selectedMonth)?.label}{" "}
                  {selectedYear} · {selectedCutoff} cut-off
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-[13px] w-[13px] shrink-0 text-[#9090a8]" />
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(v) => setSelectedYear(parseInt(v))}
                >
                  <SelectTrigger className="w-[88px] rounded-lg border-[#e0e0f0] text-xs">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(v) => setSelectedMonth(parseInt(v))}
                >
                  <SelectTrigger className="w-[118px] rounded-lg border-[#e0e0f0] text-xs">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value.toString()}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedCutoff}
                  onValueChange={(v: CutoffPeriod) => setSelectedCutoff(v)}
                >
                  <SelectTrigger className="w-[118px] rounded-lg border-[#e0e0f0] text-xs">
                    <SelectValue placeholder="Cut-off" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-15">1st – 15th</SelectItem>
                    <SelectItem value="16-31">16th – 31st</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={getAttendance}
                  disabled={isLoadingHistory}
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </button>
              </div>
            </div>

            {isLoadingHistory ? (
              <div className="flex justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-14 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f5f8]">
                  <Inbox className="h-5 w-5 text-[#c0c0d0]" />
                </div>
                <p className="text-sm font-bold text-[#1a1a2e]">
                  No records found
                </p>
                <p className="mt-1 text-xs text-[#9090a8]">
                  {months.find((m) => m.value === selectedMonth)?.label}{" "}
                  {selectedYear} · {selectedCutoff} cut-off
                </p>
              </div>
            ) : (
              <>
                {/* MOBILE: card list (readable without horizontal scrolling) */}
                <div className="flex flex-col gap-3 p-4 md:hidden">
                  {filteredEntries.map((entry, index) => (
                    <div
                      key={entry.id || `entry-${index}`}
                      className="rounded-xl border border-[#ededf5] bg-[#f8f8fb] p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#1a1a2e]">
                          {entry.date}
                        </span>
                        {entry.timeOut ? (
                          <span className="text-xs font-medium text-[#9090a8]">
                            {formatHoursToHoursMinutes(
                              String(entry.totalHours || ""),
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-600">
                            <span className="h-[5px] w-[5px] rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div>
                          <p className="text-[#9090a8]">Time In</p>
                          <p className="font-semibold text-[#3a3a5a]">
                            {formatTime(entry.timeIn)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#9090a8]">Time Out</p>
                          <p className="font-semibold text-[#3a3a5a]">
                            {entry.timeOut ? formatTime(entry.timeOut) : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#9090a8]">Break 1</p>
                          <p className="font-semibold text-[#3a3a5a]">
                            {formatHoursToHoursMinutes(
                              String(entry.totalBreakTime || ""),
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#9090a8]">Break 2</p>
                          <p className="font-semibold text-[#3a3a5a]">
                            {formatHoursToHoursMinutes(
                              String(entry.totalSecondBreakTime || ""),
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#9090a8]">Lunch</p>
                          <p className="font-semibold text-[#3a3a5a]">
                            {formatHoursToHoursMinutes(
                              String(entry.totalLunchTime || ""),
                            )}
                          </p>
                        </div>
                        {entry.overbreak1 ||
                        entry.overbreak2 ||
                        entry.overlunch ? (
                          <div>
                            <p className="text-[#9090a8]">Overtime</p>
                            <p className="font-semibold text-red-600">
                              {[
                                entry.overbreak1 && entry.overbreak1 > 0
                                  ? `B1 +${entry.overbreak1}m`
                                  : null,
                                entry.overbreak2 && entry.overbreak2 > 0
                                  ? `B2 +${entry.overbreak2}m`
                                  : null,
                                entry.overlunch && entry.overlunch > 0
                                  ? `Lunch +${entry.overlunch}m`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        ) : null}
                      </div>
                      {entry.notes && (
                        <p className="mt-3 border-t border-[#ededf5] pt-2 text-xs text-[#6060a0]">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* DESKTOP / TABLET: table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#f0f0f6] bg-[#fafafa]">
                        {tableColumns.map((h) => (
                          <th
                            key={h}
                            className="whitespace-nowrap px-4 py-3 text-left text-[0.62rem] font-bold uppercase tracking-wider text-[#9090a8]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry, index) => (
                        <tr
                          key={entry.id || `entry-${index}`}
                          className="border-b border-[#f5f5fa] transition-colors last:border-none hover:bg-[#f8f8fb]"
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#1a1a2e]">
                            {entry.date}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[#3a3a5a]">
                            {formatTime(entry.timeIn)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[#3a3a5a]">
                            {entry.timeOut ? (
                              formatTime(entry.timeOut)
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-600">
                                <span className="h-[5px] w-[5px] rounded-full bg-emerald-500" />
                                Active
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[#3a3a5a]">
                            {formatHoursToHoursMinutes(
                              String(entry.totalHours || ""),
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[#3a3a5a]">
                            {formatHoursToHoursMinutes(
                              String(entry.totalBreakTime || ""),
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[#3a3a5a]">
                            {formatHoursToHoursMinutes(
                              String(entry.totalLunchTime || ""),
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[#3a3a5a]">
                            {formatHoursToHoursMinutes(
                              String(entry.totalSecondBreakTime || ""),
                            )}
                          </td>
                          <td
                            className={`whitespace-nowrap px-4 py-3 ${
                              entry.overbreak1 && entry.overbreak1 > 0
                                ? "font-semibold text-red-600"
                                : "text-[#3a3a5a]"
                            }`}
                          >
                            {entry.overbreak1 && entry.overbreak1 > 0
                              ? `${entry.overbreak1}m`
                              : "—"}
                          </td>
                          <td
                            className={`whitespace-nowrap px-4 py-3 ${
                              entry.overbreak2 && entry.overbreak2 > 0
                                ? "font-semibold text-red-600"
                                : "text-[#3a3a5a]"
                            }`}
                          >
                            {entry.overbreak2 && entry.overbreak2 > 0
                              ? `${entry.overbreak2}m`
                              : "—"}
                          </td>
                          <td
                            className={`whitespace-nowrap px-4 py-3 ${
                              entry.overlunch && entry.overlunch > 0
                                ? "font-semibold text-red-600"
                                : "text-[#3a3a5a]"
                            }`}
                          >
                            {entry.overlunch && entry.overlunch > 0
                              ? `${entry.overlunch}m`
                              : "—"}
                          </td>
                          <td
                            className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-3 text-[#3a3a5a]"
                            title={entry.notes || ""}
                          >
                            {entry.notes || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-[#f0f0f6] px-4 py-3 text-xs text-[#9090a8] sm:px-7">
                  Showing {filteredEntries.length} record(s) ·{" "}
                  {months.find((m) => m.value === selectedMonth)?.label}{" "}
                  {selectedYear} · {selectedCutoff} cut-off
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceTracker;
