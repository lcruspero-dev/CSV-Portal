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
  Filter,
  Clock,
  Home,
  Coffee,
  Utensils,
  AlertCircle,
  Calendar,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";

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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="h-5 w-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
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

  // Determine current timer label & color
  const getTimerMeta = () => {
    if (currentEntry.breakStart && !currentEntry.breakEnd)
      return { label: "Break 1 Timer", color: "#0284c7", bg: "#f0f9ff" };
    if (currentEntry.secondBreakStart && !currentEntry.secondBreakEnd)
      return { label: "Break 2 Timer", color: "#4f46e5", bg: "#eef2ff" };
    if (currentEntry.lunchStart && !currentEntry.lunchEnd)
      return { label: "Lunch Timer", color: "#d97706", bg: "#fffbeb" };
    return { label: "Work Timer", color: "#7c3aed", bg: "#f5f3ff" };
  };

  const timerMeta = getTimerMeta();

  if (isLoadingInitial) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f5f5f8]">
        <div
          style={{ fontFamily: "'Outfit', sans-serif" }}
          className="text-center"
        >
          <div className="w-12 h-12 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-medium">
            Loading time tracker...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

        .at-root { font-family: 'Outfit', sans-serif; background: #f5f5f8; min-height: 100vh; }

        /* HEADER */
        .at-header {
          background: #fff;
          border-bottom: 1px solid #e8e8f0;
          padding: 1.5rem 2rem 1.4rem;
        }
        .at-header-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
        }
        .at-tag {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 100px;
          padding: 0.22rem 0.7rem; margin-bottom: 0.6rem;
        }
        .at-tag-dot { width: 5px; height: 5px; border-radius: 50%; background: #7c3aed; }
        .at-tag-text { font-size: 0.63rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; }
        .at-heading { font-size: 1.75rem; font-weight: 800; color: #0f0f1a; letter-spacing: -0.03em; line-height: 1; }
        .at-subheading { font-size: 0.85rem; color: #8888a0; margin-top: 0.3rem; }

        /* BODY */
        .at-body { max-width: 1200px; margin: 0 auto; padding: 1.75rem 2rem 3rem; }
        @media (max-width: 640px) { .at-header { padding: 1.25rem; } .at-body { padding: 1.25rem; } .at-heading { font-size: 1.4rem; } }

        /* SECTION */
        .at-section-label { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: #9090a8; margin-bottom: 0.9rem; }

        /* TIMER CARD */
        .at-timer-card {
          background: #fff; border: 1px solid #e8e8f0; border-radius: 20px; overflow: hidden;
        }
        .at-timer-top {
          padding: 1.5rem 1.75rem 0;
          display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
        }
        .at-date-row { display: flex; align-items: center; gap: 0.5rem; }
        .at-date-text { font-size: 0.85rem; font-weight: 500; color: #5050708; }

        /* CLOCK DISPLAY */
        .at-clock-wrap {
          display: flex; flex-direction: column; align-items: center;
          padding: 2rem 1.75rem 1.5rem;
        }
        .at-clock-label {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; margin-bottom: 0.75rem;
          padding: 0.25rem 0.75rem; border-radius: 100px;
          background: var(--timer-bg); color: var(--timer-color);
        }
        .at-clock {
          font-family: 'JetBrains Mono', monospace;
          font-size: clamp(2.8rem, 8vw, 5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--timer-color);
          line-height: 1;
          opacity: var(--timer-opacity, 1);
          transition: color 0.4s ease;
        }
        .at-clock-dimmed { opacity: 0.3; }

        /* STATUS PILLS */
        .at-status-row {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; padding-bottom: 0.25rem;
        }
        .at-status-pill {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.25rem 0.65rem; border-radius: 100px;
          font-size: 0.68rem; font-weight: 600;
          background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe;
        }
        .at-status-pill-dot { width: 5px; height: 5px; border-radius: 50%; background: #10b981; animation: at-blink 1.5s ease infinite; }
        @keyframes at-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* CONTROLS */
        .at-controls {
          display: flex; align-items: center; justify-content: center;
          gap: 0.75rem; flex-wrap: wrap;
          border-top: 1px solid #f0f0f6;
          padding: 1.25rem 1.75rem;
        }
        .at-time-in-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: #7c3aed; color: white;
          font-family: 'Outfit', sans-serif;
          font-size: 0.88rem; font-weight: 700;
          padding: 0.65rem 1.5rem; border-radius: 12px;
          border: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(124,58,237,0.25);
          min-width: 140px; justify-content: center;
        }
        .at-time-in-btn:hover { background: #6d28d9; transform: translateY(-1px); box-shadow: 0 4px 18px rgba(124,58,237,0.3); }
        .at-time-in-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .at-confirm-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: #4f46e5; color: white;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem; font-weight: 700;
          padding: 0.6rem 1.25rem; border-radius: 11px;
          border: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .at-confirm-btn:hover { background: #4338ca; transform: translateY(-1px); }
        .at-confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* SESSION CARDS */
        .at-session-section { padding: 0 1.75rem 1.75rem; }
        .at-session-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem; }
        .at-session-card {
          background: #f8f8fb; border: 1px solid #ededf5; border-radius: 14px; padding: 1rem 1.1rem;
          transition: border-color 0.2s;
        }
        .at-session-card:hover { border-color: #d0d0e8; }
        .at-session-card-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.65rem; }
        .at-session-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .at-session-card-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #9090a8; }
        .at-session-main { font-size: 1rem; font-weight: 700; color: #1a1a2e; }
        .at-session-sub { font-size: 0.72rem; color: #9090a8; margin-top: 0.15rem; }

        /* HISTORY CARD */
        .at-history-card {
          background: #fff; border: 1px solid #e8e8f0; border-radius: 20px; overflow: hidden; margin-top: 1.25rem;
        }
        .at-history-header {
          padding: 1.3rem 1.75rem 1rem;
          border-bottom: 1px solid #f0f0f6;
          display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
        }
        .at-history-title { font-size: 0.95rem; font-weight: 700; color: #1a1a2e; }
        .at-history-sub { font-size: 0.73rem; color: #9090a8; margin-top: 0.15rem; }

        .at-filter-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .at-filter-icon { color: #9090a8; }

        .at-refresh-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem; font-weight: 600; color: #4f46e5;
          background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 9px;
          padding: 0.4rem 0.8rem; cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .at-refresh-btn:hover { background: #e0e7ff; border-color: #a5b4fc; }
        .at-refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .at-history-body { padding: 0; }

        /* TABLE */
        .at-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
        .at-table thead tr { border-bottom: 1px solid #f0f0f6; }
        .at-table th {
          padding: 0.75rem 1rem; text-align: left;
          font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #9090a8; white-space: nowrap; background: #fafafa;
        }
        .at-table tbody tr { border-bottom: 1px solid #f5f5fa; transition: background 0.12s; }
        .at-table tbody tr:last-child { border-bottom: none; }
        .at-table tbody tr:hover { background: #f8f8fb; }
        .at-table td { padding: 0.75rem 1rem; color: #3a3a5a; vertical-align: middle; white-space: nowrap; }
        .at-table td:first-child { font-weight: 600; color: #1a1a2e; }

        .at-in-progress {
          display: inline-flex; align-items: center; gap: 0.3rem;
          font-size: 0.65rem; font-weight: 700; color: #059669;
          background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 100px;
          padding: 0.15rem 0.5rem;
        }

        .at-overbreak {
          color: #dc2626; font-weight: 600;
        }

        .at-empty-row td { text-align: center; padding: 3rem 1rem; }
        .at-empty-icon { width: 48px; height: 48px; background: #f5f5f8; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; }
        .at-empty-title { font-size: 0.88rem; font-weight: 700; color: #1a1a2e; }
        .at-empty-sub { font-size: 0.75rem; color: #9090a8; margin-top: 0.2rem; }

        .at-table-footer { padding: 0.75rem 1.75rem; font-size: 0.72rem; color: #9090a8; border-top: 1px solid #f0f0f6; }

        /* ALERT OVERLAY */
        .at-alert-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); backdrop-filter: blur(4px); z-index: 50; display: flex; align-items: center; justify-content: center; }
        .at-alert-box {
          background: #fff; border-radius: 18px; padding: 1.75rem; max-width: 420px; margin: 1rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12); border: 1px solid #e8e8f0;
          animation: at-pop 0.25s ease;
        }
        @keyframes at-pop { from{transform:scale(0.94);opacity:0} to{transform:scale(1);opacity:1} }
        .at-alert-icon { width: 44px; height: 44px; background: #fffbeb; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .at-alert-title { font-size: 1rem; font-weight: 800; color: #1a1a2e; margin-bottom: 0.4rem; }
        .at-alert-msg { font-size: 0.83rem; color: #6060808; line-height: 1.5; margin-bottom: 1.25rem; }
        .at-alert-btn {
          background: #7c3aed; color: white; border: none; border-radius: 10px;
          padding: 0.6rem 1.25rem; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          transition: background 0.2s; float: right;
        }
        .at-alert-btn:hover { background: #6d28d9; }

        .at-overflow-x { overflow-x: auto; }
      `}</style>

      <div className="at-root">
        {/* ALERT */}
        {alert.show && (
          <div className="at-alert-overlay">
            <div className="at-alert-box">
              <div className="at-alert-icon">
                <AlertCircle
                  style={{ width: 22, height: 22, color: "#d97706" }}
                />
              </div>
              <p className="at-alert-title">Time Alert</p>
              <p className="at-alert-msg">{alert.message}</p>
              <button className="at-alert-btn" onClick={hideAlert}>
                Got it!
              </button>
              <div style={{ clear: "both" }} />
            </div>
          </div>
        )}

        <div className="at-body">
          {/* TIMER CARD */}
          <p className="at-section-label">Today's Session</p>
          <BackButton />
          <div className="at-timer-card">
            <div className="at-timer-top">
              <div className="at-date-row">
                <Calendar style={{ width: 15, height: 15, color: "#9090a8" }} />
                <span
                  style={{
                    fontSize: "0.83rem",
                    color: "#6060a0",
                    fontWeight: 500,
                  }}
                >
                  {currentFormattedDate || "Loading..."}
                </span>
              </div>
              <ViewScheduleButton />
              {isTimeIn && (
                <div className="at-status-pill">
                  <div className="at-status-pill-dot" />
                  Active Session
                </div>
              )}
            </div>

            {/* CLOCK */}
            <div className="at-clock-wrap">
              <span
                className="at-clock-label"
                style={
                  {
                    "--timer-bg": timerMeta.bg,
                    "--timer-color": timerMeta.color,
                  } as any
                }
              >
                {timerMeta.label}
              </span>
              <div
                className={`at-clock ${!isTimeIn ? "at-clock-dimmed" : ""}`}
                style={{ "--timer-color": timerMeta.color } as any}
              >
                {formatElapsedTime(elapsedTime)}
              </div>
            </div>

            {/* CONTROLS */}
            <div className="at-controls">
              {!isTimeIn ? (
                <button
                  className="at-time-in-btn"
                  onClick={handleTimeIn}
                  disabled={isLoadingTimeIn}
                >
                  {isLoadingTimeIn ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Home style={{ width: 16, height: 16 }} /> Clock In
                    </>
                  )}
                </button>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <Select
                    value={selectedAction || undefined}
                    onValueChange={handleActionChange}
                  >
                    <SelectTrigger
                      style={{
                        width: "200px",
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "0.83rem",
                        borderRadius: "11px",
                        borderColor: "#e0e0f0",
                      }}
                    >
                      <SelectValue placeholder="Select Action" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableActions().map((action) => (
                        <SelectItem
                          key={action.value}
                          value={action.value}
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAction && (
                    <button
                      className="at-confirm-btn"
                      onClick={handleConfirmAction}
                      disabled={
                        isLoadingBreakStart ||
                        isLoadingBreakEnd ||
                        isLoadingSecondBreakStart ||
                        isLoadingSecondBreakEnd ||
                        isLoadingLunchStart ||
                        isLoadingLunchEnd ||
                        isLoadingTimeOut
                      }
                    >
                      {isLoadingBreakStart ||
                      isLoadingBreakEnd ||
                      isLoadingSecondBreakStart ||
                      isLoadingSecondBreakEnd ||
                      isLoadingLunchStart ||
                      isLoadingLunchEnd ||
                      isLoadingTimeOut ? (
                        <LoadingSpinner />
                      ) : (
                        "Confirm"
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* SESSION SUMMARY */}
            {isTimeIn && (
              <div className="at-session-section">
                <p
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#9090a8",
                    marginBottom: "0.75rem",
                  }}
                >
                  Session Summary
                </p>
                <div className="at-session-grid">
                  {currentEntry.timeIn && (
                    <div className="at-session-card">
                      <div className="at-session-card-header">
                        <div
                          className="at-session-icon"
                          style={{ background: "#f5f3ff" }}
                        >
                          <Clock
                            style={{ width: 14, height: 14, color: "#7c3aed" }}
                          />
                        </div>
                        <span className="at-session-card-label">Time In</span>
                      </div>
                      <p className="at-session-main">
                        {formatTime(currentEntry.timeIn)}
                      </p>
                    </div>
                  )}
                  {currentEntry.shift && (
                    <div className="at-session-card">
                      <div className="at-session-card-header">
                        <div
                          className="at-session-icon"
                          style={{ background: "#f0f9ff" }}
                        >
                          <TrendingUp
                            style={{ width: 14, height: 14, color: "#0284c7" }}
                          />
                        </div>
                        <span className="at-session-card-label">Shift</span>
                      </div>
                      <p className="at-session-main">{currentEntry.shift}</p>
                    </div>
                  )}
                  {currentEntry.breakStart && (
                    <div className="at-session-card">
                      <div className="at-session-card-header">
                        <div
                          className="at-session-icon"
                          style={{ background: "#f0fdf4" }}
                        >
                          <Coffee
                            style={{ width: 14, height: 14, color: "#059669" }}
                          />
                        </div>
                        <span className="at-session-card-label">Break 1</span>
                      </div>
                      <p className="at-session-main">
                        {formatTime(currentEntry.breakStart)}
                      </p>
                      {currentEntry.breakEnd && (
                        <p className="at-session-sub">
                          End: {formatTime(currentEntry.breakEnd)}
                        </p>
                      )}
                      {currentEntry.totalBreakTime !== undefined && (
                        <p className="at-session-sub">
                          Total:{" "}
                          {formatMinutesToHoursMinutes(
                            Math.round(currentEntry.totalBreakTime * 60),
                          )}
                        </p>
                      )}
                    </div>
                  )}
                  {currentEntry.secondBreakStart && (
                    <div className="at-session-card">
                      <div className="at-session-card-header">
                        <div
                          className="at-session-icon"
                          style={{ background: "#eef2ff" }}
                        >
                          <Coffee
                            style={{ width: 14, height: 14, color: "#4f46e5" }}
                          />
                        </div>
                        <span className="at-session-card-label">Break 2</span>
                      </div>
                      <p className="at-session-main">
                        {formatTime(currentEntry.secondBreakStart)}
                      </p>
                      {currentEntry.secondBreakEnd && (
                        <p className="at-session-sub">
                          End: {formatTime(currentEntry.secondBreakEnd)}
                        </p>
                      )}
                      {currentEntry.totalSecondBreakTime !== undefined && (
                        <p className="at-session-sub">
                          Total:{" "}
                          {formatMinutesToHoursMinutes(
                            Math.round(currentEntry.totalSecondBreakTime * 60),
                          )}
                        </p>
                      )}
                    </div>
                  )}
                  {currentEntry.lunchStart && (
                    <div className="at-session-card">
                      <div className="at-session-card-header">
                        <div
                          className="at-session-icon"
                          style={{ background: "#fffbeb" }}
                        >
                          <Utensils
                            style={{ width: 14, height: 14, color: "#d97706" }}
                          />
                        </div>
                        <span className="at-session-card-label">Lunch</span>
                      </div>
                      <p className="at-session-main">
                        {formatTime(currentEntry.lunchStart)}
                      </p>
                      {currentEntry.lunchEnd && (
                        <p className="at-session-sub">
                          End: {formatTime(currentEntry.lunchEnd)}
                        </p>
                      )}
                      {currentEntry.totalLunchTime !== undefined && (
                        <p className="at-session-sub">
                          Total:{" "}
                          {formatMinutesToHoursMinutes(
                            Math.round(currentEntry.totalLunchTime * 60),
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* TIME OUT DIALOG */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent
              style={{
                fontFamily: "'Outfit', sans-serif",
                borderRadius: "18px",
              }}
            >
              <DialogHeader>
                <DialogTitle style={{ fontWeight: 800, fontSize: "1.05rem" }}>
                  Complete Your Work Day
                </DialogTitle>
              </DialogHeader>
              <div style={{ paddingTop: "0.5rem" }}>
                <Label
                  htmlFor="notes"
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "#6060a0",
                  }}
                >
                  Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  placeholder="Add any notes about your work day..."
                  style={{
                    marginTop: "0.4rem",
                    borderRadius: "10px",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.6rem",
                    marginTop: "1rem",
                  }}
                >
                  <button
                    onClick={() => setDialogOpen(false)}
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      padding: "0.55rem 1.1rem",
                      borderRadius: "10px",
                      border: "1px solid #e0e0f0",
                      background: "#f8f8fb",
                      cursor: "pointer",
                      color: "#6060a0",
                    }}
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
                    className="at-time-in-btn"
                    style={{
                      minWidth: "auto",
                      padding: "0.55rem 1.1rem",
                      fontSize: "0.82rem",
                    }}
                  >
                    {isLoadingTimeOut ? <LoadingSpinner /> : "Complete Day"}
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* HISTORY */}
          <div className="at-history-card">
            <div className="at-history-header">
              <div>
                <p className="at-history-title">Attendance History</p>
                <p className="at-history-sub">
                  {months.find((m) => m.value === selectedMonth)?.label}{" "}
                  {selectedYear} · {selectedCutoff} cut-off
                </p>
              </div>
              <div className="at-filter-row">
                <Filter style={{ width: 13, height: 13, color: "#9090a8" }} />
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(v) => setSelectedYear(parseInt(v))}
                >
                  <SelectTrigger
                    style={{
                      width: "90px",
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.78rem",
                      borderRadius: "9px",
                      borderColor: "#e0e0f0",
                    }}
                  >
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem
                        key={year}
                        value={year.toString()}
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(v) => setSelectedMonth(parseInt(v))}
                >
                  <SelectTrigger
                    style={{
                      width: "120px",
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.78rem",
                      borderRadius: "9px",
                      borderColor: "#e0e0f0",
                    }}
                  >
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem
                        key={m.value}
                        value={m.value.toString()}
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedCutoff}
                  onValueChange={(v: CutoffPeriod) => setSelectedCutoff(v)}
                >
                  <SelectTrigger
                    style={{
                      width: "120px",
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.78rem",
                      borderRadius: "9px",
                      borderColor: "#e0e0f0",
                    }}
                  >
                    <SelectValue placeholder="Cut-off" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="1-15"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      1st – 15th
                    </SelectItem>
                    <SelectItem
                      value="16-31"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      16th – 31st
                    </SelectItem>
                  </SelectContent>
                </Select>
                <button
                  className="at-refresh-btn"
                  onClick={getAttendance}
                  disabled={isLoadingHistory}
                >
                  <RefreshCw style={{ width: 12, height: 12 }} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="at-history-body">
              {isLoadingHistory ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "3rem 1rem",
                  }}
                >
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="at-overflow-x">
                  <table className="at-table">
                    <thead>
                      <tr>
                        {[
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
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.length > 0 ? (
                        filteredEntries.map((entry, index) => (
                          <tr key={entry.id || `entry-${index}`}>
                            <td>{entry.date}</td>
                            <td>{formatTime(entry.timeIn)}</td>
                            <td>
                              {entry.timeOut ? (
                                formatTime(entry.timeOut)
                              ) : (
                                <span className="at-in-progress">
                                  <span
                                    style={{
                                      width: 5,
                                      height: 5,
                                      borderRadius: "50%",
                                      background: "#10b981",
                                      display: "inline-block",
                                    }}
                                  />
                                  Active
                                </span>
                              )}
                            </td>
                            <td>
                              {formatHoursToHoursMinutes(
                                String(entry.totalHours || ""),
                              )}
                            </td>
                            <td>
                              {formatHoursToHoursMinutes(
                                String(entry.totalBreakTime || ""),
                              )}
                            </td>
                            <td>
                              {formatHoursToHoursMinutes(
                                String(entry.totalLunchTime || ""),
                              )}
                            </td>
                            <td>
                              {formatHoursToHoursMinutes(
                                String(entry.totalSecondBreakTime || ""),
                              )}
                            </td>
                            <td
                              className={
                                entry.overbreak1 && entry.overbreak1 > 0
                                  ? "at-overbreak"
                                  : ""
                              }
                            >
                              {entry.overbreak1 && entry.overbreak1 > 0
                                ? `${entry.overbreak1}m`
                                : "—"}
                            </td>
                            <td
                              className={
                                entry.overbreak2 && entry.overbreak2 > 0
                                  ? "at-overbreak"
                                  : ""
                              }
                            >
                              {entry.overbreak2 && entry.overbreak2 > 0
                                ? `${entry.overbreak2}m`
                                : "—"}
                            </td>
                            <td
                              className={
                                entry.overlunch && entry.overlunch > 0
                                  ? "at-overbreak"
                                  : ""
                              }
                            >
                              {entry.overlunch && entry.overlunch > 0
                                ? `${entry.overlunch}m`
                                : "—"}
                            </td>
                            <td
                              style={{
                                maxWidth: 160,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={entry.notes || ""}
                            >
                              {entry.notes || "—"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="at-empty-row">
                          <td colSpan={11}>
                            <div className="at-empty-icon">
                              <Clock
                                style={{
                                  width: 20,
                                  height: 20,
                                  color: "#c0c0d0",
                                }}
                              />
                            </div>
                            <p className="at-empty-title">No records found</p>
                            <p className="at-empty-sub">
                              {
                                months.find((m) => m.value === selectedMonth)
                                  ?.label
                              }{" "}
                              {selectedYear} · {selectedCutoff} cut-off
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {filteredEntries.length > 0 && (
                    <div className="at-table-footer">
                      Showing {filteredEntries.length} record(s) ·{" "}
                      {months.find((m) => m.value === selectedMonth)?.label}{" "}
                      {selectedYear} · {selectedCutoff} cut-off
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceTracker;
