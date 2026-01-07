/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { ScheduleAndAttendanceAPI, timer } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { ViewScheduleButton } from "@/components/kit/ViewScheduleButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Loading spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="h-6 w-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
  </div>
);

export const AttendanceTracker: React.FC = () => {
  const [isTimeIn, setIsTimeIn] = useState(false);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>(
    []
  );
  const [filteredEntries, setFilteredEntries] = useState<AttendanceEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<AttendanceEntry>>(
    {}
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentServerTime, setCurrentServerTime] =
    useState<CurrentTimeResponse>({
      date: "",
      time: "",
    });
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isLoadingSecondBreakStart, setIsLoadingSecondBreakStart] =
    useState(false);
  const [isLoadingSecondBreakEnd, setIsLoadingSecondBreakEnd] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: null,
    message: "",
  });

  // Updated state initialization for automatic date/cutoff selection
  const getCurrentCutoff = (): CutoffPeriod => {
    const today = new Date();
    const day = today.getDate();
    return day <= 15 ? "1-15" : "16-31";
  };

  const [selectedCutoff, setSelectedCutoff] = useState<CutoffPeriod>(
    getCurrentCutoff()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Alert tracking to prevent duplicate alerts
  const [alertShown, setAlertShown] = useState({
    break1: false,
    break2: false,
    lunch: false,
  });

  // Loading states
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingTimeIn, setIsLoadingTimeIn] = useState(false);
  const [isLoadingTimeOut, setIsLoadingTimeOut] = useState(false);
  const [isLoadingBreakStart, setIsLoadingBreakStart] = useState(false);
  const [isLoadingBreakEnd, setIsLoadingBreakEnd] = useState(false);
  const [isLoadingLunchStart, setIsLoadingLunchStart] = useState(false);
  const [isLoadingLunchEnd, setIsLoadingLunchEnd] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { toast } = useToast();

  // Toast function
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

  // Function to set current date filters based on server time
  const setCurrentDateFilters = (serverDate?: string) => {
    const dateToUse = serverDate ? new Date(serverDate) : new Date();
    const day = dateToUse.getDate();
    const month = dateToUse.getMonth();
    const year = dateToUse.getFullYear();

    // Set cutoff based on current day
    const cutoff: CutoffPeriod = day <= 15 ? "1-15" : "16-31";
    setSelectedCutoff(cutoff);
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Time formatting functions
  const formatTimeTo12Hour = (timeString: string): string => {
    if (!timeString) return "";

    try {
      const upperTime = timeString.toUpperCase();
      if (upperTime.includes("AM") || upperTime.includes("PM")) {
        return timeString;
      }

      const timeParts = timeString.split(":");
      let hourNum = parseInt(timeParts[0], 10);
      const minuteNum = timeParts[1] ? parseInt(timeParts[1], 10) : 0;

      if (isNaN(hourNum) || isNaN(minuteNum)) return timeString;

      const period = hourNum >= 12 ? "PM" : "AM";
      hourNum = hourNum % 12 || 12;

      return `${hourNum}:${minuteNum.toString().padStart(2, "0")} ${period}`;
    } catch (error) {
      console.error("Error formatting time:", error, "Input:", timeString);
      return timeString;
    }
  };

  const formatTime = (timeString: string): string => {
    return formatTimeTo12Hour(timeString);
  };

  // Format hours to "X hours, Y minutes" format
  const formatHoursToHoursMinutes = (hoursString: string): string => {
    if (!hoursString || hoursString === "0" || hoursString === "0.00") {
      return "-";
    }

    const hours = parseFloat(hoursString);
    if (isNaN(hours) || hours === 0) {
      return "-";
    }

    const totalMinutes = Math.round(hours * 60);
    const hoursPart = Math.floor(totalMinutes / 60);
    const minutesPart = totalMinutes % 60;

    if (hoursPart === 0) {
      return `${minutesPart} minutes`;
    } else if (minutesPart === 0) {
      return `${hoursPart} hours`;
    } else {
      return `${hoursPart} hours, ${minutesPart} minutes`;
    }
  };

  // Format minutes to "X hours, Y minutes" format
  const formatMinutesToHoursMinutes = (minutes: number): string => {
    if (!minutes || minutes === 0) {
      return "-";
    }

    const hoursPart = Math.floor(minutes / 60);
    const minutesPart = minutes % 60;

    if (hoursPart === 0) {
      return `${minutesPart} minutes`;
    } else if (minutesPart === 0) {
      return `${hoursPart} hours`;
    } else {
      return `${hoursPart} hours, ${minutesPart} minutes`;
    }
  };

  // Calculate overbreak time
  const calculateOverbreak = (
    breakTime: number,
    allowedBreakTime: number
  ): number => {
    if (!breakTime || breakTime <= allowedBreakTime) return 0;
    return Math.round((breakTime - allowedBreakTime) * 60);
  };

  // Alert timeout reference
  const alertTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showAlert = (type: "break1" | "break2" | "lunch") => {
    const messages = {
      break1: "Break 1 will end in 1 minute! Time to return to work.",
      break2: "Break 2 will end in 1 minute! Time to return to work.",
      lunch: "Lunch break will end in 1 minute! Time to return to work.",
    };

    setAlert({
      show: true,
      type,
      message: messages[type],
    });

    setAlertShown((prev) => ({
      ...prev,
      [type]: true,
    }));

    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
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

  // Reset alert tracking when breaks/lunch end
  useEffect(() => {
    if (currentEntry.breakEnd) {
      setAlertShown((prev) => ({ ...prev, break1: false }));
    }
    if (currentEntry.secondBreakEnd) {
      setAlertShown((prev) => ({ ...prev, break2: false }));
    }
    if (currentEntry.lunchEnd) {
      setAlertShown((prev) => ({ ...prev, lunch: false }));
    }
  }, [
    currentEntry.breakEnd,
    currentEntry.secondBreakEnd,
    currentEntry.lunchEnd,
  ]);

  // Format current date for display
  const formatCurrentDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Get current formatted date from server time
  const currentFormattedDate = currentServerTime.date
    ? formatCurrentDate(currentServerTime.date)
    : "";

  // Generate months for dropdown
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

  // Generate years for dropdown (current year and previous 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  // Filter entries based on selected cutoff period, month, and year
  const filterEntriesByCutoff = (
    entries: AttendanceEntry[],
    cutoff: CutoffPeriod,
    month: number,
    year: number
  ): AttendanceEntry[] => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const entryMonth = entryDate.getMonth();
      const entryYear = entryDate.getFullYear();
      const day = entryDate.getDate();

      if (entryMonth !== month || entryYear !== year) {
        return false;
      }

      if (cutoff === "1-15") {
        return day >= 1 && day <= 15;
      } else {
        return day >= 16;
      }
    });
  };

  // Apply filter when cutoff selection, month, year, or attendance entries change
  useEffect(() => {
    const filtered = filterEntriesByCutoff(
      attendanceEntries,
      selectedCutoff,
      selectedMonth,
      selectedYear
    );
    setFilteredEntries(filtered);
  }, [attendanceEntries, selectedCutoff, selectedMonth, selectedYear]);

  // Check for break/lunch time alerts (1 minute before end)
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
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
        })
      );
      setAttendanceEntries(entriesWithOverbreak);
    } catch (error) {
      console.error("Error getting attendance entries:", error);
      if (typeof error === "object" && error !== null && "message" in error) {
        if (
          (error as { message: string }).message === "Employee time not found"
        ) {
          return;
        }
      }
      showToast(
        "Error",
        "Failed to load attendance history. Please try refreshing.",
        "destructive"
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
      console.error("Error getting current time from API:", error);
      const now = new Date();
      return {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
      };
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoadingInitial(true);
      try {
        const currentTimeData = await getCurrentTimeFromAPI();

        // Set current date filters based on server time
        setCurrentDateFilters(currentTimeData.date);

        const employeeId = JSON.parse(localStorage.getItem("user")!)._id;
        const shift = await fetchShiftSchedule(
          currentTimeData.date,
          employeeId
        );

        if (shift) {
          setCurrentEntry((prev) => ({ ...prev, shift }));
        }

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
    if (!isTimeIn || !currentEntry.date) {
      return;
    }

    let intervalId: NodeJS.Timeout;

    const serverTime = new Date(
      `${currentServerTime.date} ${currentServerTime.time}`
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
          `${currentEntry.dateBreakStart || currentEntry.date} ${
            currentEntry.breakStart
          }`
        ).getTime();
        diffMs = currentTime - breakStartTime;
      } else if (isOnSecondBreak) {
        const secondBreakStartTime = new Date(
          `${currentEntry.dateSecondBreakStart || currentEntry.date} ${
            currentEntry.secondBreakStart
          }`
        ).getTime();
        diffMs = currentTime - secondBreakStartTime;
      } else if (isOnLunch) {
        const lunchStartTime = new Date(
          `${currentEntry.dateLunchStart || currentEntry.date} ${
            currentEntry.lunchStart
          }`
        ).getTime();
        diffMs = currentTime - lunchStartTime;
      } else {
        const timeInDate = new Date(
          `${currentEntry.date} ${currentEntry.timeIn}`
        ).getTime();

        let totalLunchMs = 0;
        if (currentEntry.lunchStart && currentEntry.lunchEnd) {
          const lunchStart = new Date(
            `${currentEntry.dateLunchStart || currentEntry.date} ${
              currentEntry.lunchStart
            }`
          );
          const lunchEnd = new Date(
            `${currentEntry.dateLunchEnd || currentEntry.date} ${
              currentEntry.lunchEnd
            }`
          );

          if (lunchEnd < lunchStart) {
            lunchEnd.setDate(lunchEnd.getDate() + 1);
          }

          totalLunchMs = lunchEnd.getTime() - lunchStart.getTime();
        }

        diffMs = currentTime - timeInDate - totalLunchMs;
      }

      setElapsedTime(Math.max(0, Math.floor(diffMs / 1000)));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isTimeIn, currentEntry, currentServerTime]);

  const formatElapsedTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getCurrentTime = async () => {
    try {
      const response = await timer.getCurrentTimeIn();
      const currentTimeData = response.data[0];

      if (currentTimeData) {
        if (currentTimeData.timeOut) {
          setIsTimeIn(false);
        } else {
          setIsTimeIn(true);
        }
        setCurrentEntry(currentTimeData);
      } else {
        console.warn("No current time data found.");
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
      if (!userString) {
        throw new Error("User data not found in local storage");
      }

      const user = JSON.parse(userString);
      const loginLimit = user.loginLimit;

      const currentTimeData = await getCurrentTimeFromAPI();

      const entry: AttendanceEntry = {
        id: `entry-${new Date().getTime()}`,
        date: currentTimeData.date,
        timeIn: currentTimeData.time,
        shift: currentEntry.shift || "",
        loginLimit: loginLimit,
      };

      const response = await timer.timeIn(entry);
      setCurrentEntry(response.data);
      getAttendance();
      setIsTimeIn(true);
      setElapsedTime(0);
      showToast("Time In Recorded", "You have successfully clocked in.");
    } catch (error: any) {
      console.error("Error logging time:", error);
      let errorMessage = "An error occurred while logging time";

      if (error.response?.status === 409 && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === "User data not found in local storage") {
        errorMessage = "User data not found in the storage";
      } else if (error.message) {
        errorMessage = error.message;
      }

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
        `${currentEntry.date} ${currentEntry.timeIn}`
      );
      const timeOutDate = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`
      );

      let totalLunchMs = 0;
      if (currentEntry.lunchStart && currentEntry.lunchEnd) {
        const lunchStart = new Date(
          `${currentEntry.dateLunchStart} ${currentEntry.lunchStart}`
        );
        const lunchEnd = new Date(
          `${currentEntry.dateLunchEnd} ${currentEntry.lunchEnd}`
        );

        if (lunchEnd < lunchStart) {
          lunchEnd.setDate(lunchEnd.getDate() + 1);
        }

        totalLunchMs = lunchEnd.getTime() - lunchStart.getTime();
      }

      const diffMs =
        timeOutDate.getTime() - timeInDate.getTime() - totalLunchMs;
      const totalHours = diffMs / (1000 * 60 * 60);

      const updatedEntry = {
        ...currentEntry,
        timeOut: currentTimeData.time,
        totalHours: Number(totalHours.toFixed(2)),
        notes: notes,
      };

      await timer.timeOut(updatedEntry);
      setCurrentEntry(updatedEntry);
      getAttendance();
      setIsTimeIn(false);
      setDialogOpen(false);
      setElapsedTime(0);
      hideAlert();
      setAlertShown({
        break1: false,
        break2: false,
        lunch: false,
      });

      showToast("Time Out Recorded", "You have successfully clocked out.");
    } catch (error) {
      console.error("Error logging timeout:", error);
      showToast(
        "Error",
        "Failed to complete time out. Please try again. If the issue persists, contact IT Support.",
        "destructive"
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
      console.error("Error starting break:", error);
      showToast(
        "Error",
        "Failed to start break. Please try again.",
        "destructive"
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
        `${currentEntry.dateBreakStart} ${currentEntry.breakStart}`
      );
      const breakEnd = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`
      );

      if (breakEnd < breakStart) {
        breakEnd.setDate(breakEnd.getDate() + 1);
      }

      const breakDurationMs = breakEnd.getTime() - breakStart.getTime();
      const newBreakTimeHours = breakDurationMs / (1000 * 60 * 60);
      const totalBreakTimeHours =
        (currentEntry.totalBreakTime || 0) + newBreakTimeHours;

      const updatedEntry = {
        ...currentEntry,
        breakEnd: currentTimeData.time,
        dateBreakEnd: currentTimeData.date,
        totalBreakTime: Number(totalBreakTimeHours.toFixed(2)),
      };

      const response = await timer.updateBreakEnd(updatedEntry);
      setCurrentEntry(response.data);
      hideAlert();
      setAlertShown((prev) => ({ ...prev, break1: false }));
      showToast("Break Ended", "Break 1 has ended. Back to work!");
    } catch (error) {
      console.error("Error ending break:", error);
      showToast(
        "Error",
        "Failed to end break. Please try again.",
        "destructive"
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
        "Lunch break has started. 60 minutes allocated."
      );
    } catch (error) {
      console.error("Error starting lunch:", error);
      showToast(
        "Error",
        "Failed to start lunch. Please try again.",
        "destructive"
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
        `${currentEntry.dateLunchStart} ${currentEntry.lunchStart}`
      );
      const lunchEnd = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`
      );

      if (lunchEnd < lunchStart) {
        lunchEnd.setDate(lunchEnd.getDate() + 1);
      }

      const lunchDurationMs = lunchEnd.getTime() - lunchStart.getTime();
      const newLunchTimeHours = lunchDurationMs / (1000 * 60 * 60);
      const totalLunchTimeHours =
        (currentEntry.totalLunchTime || 0) + newLunchTimeHours;

      const updatedEntry = {
        ...currentEntry,
        lunchEnd: currentTimeData.time,
        dateLunchEnd: currentTimeData.date,
        totalLunchTime: Number(totalLunchTimeHours.toFixed(2)),
      };

      const response = await timer.updateLunchEnd(updatedEntry);
      setCurrentEntry(response.data);
      hideAlert();
      setAlertShown((prev) => ({ ...prev, lunch: false }));
      showToast("Lunch Ended", "Lunch break has ended. Back to work!");
    } catch (error) {
      console.error("Error ending lunch:", error);
      showToast(
        "Error",
        "Failed to end lunch. Please try again.",
        "destructive"
      );
    } finally {
      setIsLoadingLunchEnd(false);
    }
  };

  const handleActionChange = (value: string) => {
    setSelectedAction(value);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchShiftSchedule = async (date: string, employeeId: string) => {
    try {
      const formattedDate = formatDate(date);
      const response =
        await ScheduleAndAttendanceAPI.getSchedulePerEmployeeByDate(
          employeeId,
          formattedDate
        );
      return response.data.shiftType;
    } catch (error) {
      console.error("Error fetching shift schedule:", error);
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
      default:
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
        "Break 2 has started. 15 minutes allocated."
      );
    } catch (error) {
      console.error("Error starting break 2:", error);
      showToast(
        "Error",
        "Failed to start second break. Please try again.",
        "destructive"
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
        `${currentEntry.dateSecondBreakStart} ${currentEntry.secondBreakStart}`
      );
      const secondBreakEnd = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`
      );

      if (secondBreakEnd < secondBreakStart) {
        secondBreakEnd.setDate(secondBreakEnd.getDate() + 1);
      }

      const secondBreakDurationMs =
        secondBreakEnd.getTime() - secondBreakStart.getTime();
      const newSecondBreakTimeHours = Number(
        secondBreakDurationMs / (1000 * 60 * 60)
      );
      const totalSecondBreakTimeHours =
        (currentEntry.totalSecondBreakTime ?? 0) + newSecondBreakTimeHours;

      const updatedEntry = {
        ...currentEntry,
        secondBreakEnd: currentTimeData.time,
        dateSecondBreakEnd: currentTimeData.date,
        totalSecondBreakTime: Number(
          (totalSecondBreakTimeHours || 0).toFixed(2)
        ),
      };

      const response = await timer.updateSecondBreakEnd(updatedEntry);
      setCurrentEntry(response.data);
      hideAlert();
      setAlertShown((prev) => ({ ...prev, break2: false }));
      showToast("Break 2 Ended", "Break 2 has ended. Back to work!");
    } catch (error) {
      console.error("Error ending break 2:", error);
      showToast(
        "Error",
        "Failed to end second break. Please try again.",
        "destructive"
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
      if (!currentEntry.breakStart) {
        actions.push({ value: "startBreak", label: "Start Break 1" });
      }

      if (
        currentEntry.breakStart &&
        currentEntry.breakEnd &&
        !currentEntry.secondBreakStart
      ) {
        actions.push({
          value: "startSecondBreak",
          label: "Start Break 2",
        });
      }

      if (!currentEntry.lunchStart) {
        actions.push({ value: "startLunch", label: "Start Lunch" });
      }

      if (isTimeIn) {
        actions.push({ value: "timeOut", label: "Time Out" });
      }
    }

    return actions;
  };

  if (isLoadingInitial) {
    return (
      <div className="flex justify-center items-start w-full pt-4">
        <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
          <LoadingSpinner />
          <p className="text-gray-700 mt-4 text-center">
            Loading time tracker...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Alert Dialog */}
        {alert.show && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 animate-in zoom-in-95 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Time Alert
                </h3>
              </div>
              <p className="text-gray-700 mb-6">{alert.message}</p>
              <div className="flex justify-end">
                <Button
                  onClick={hideAlert}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  Got it!
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Time Tracker
            </h1>
            <p className="text-gray-600 mt-1">
              Track your work hours, breaks, and attendance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ViewScheduleButton />
            <BackButton />
          </div>
        </div>

        {/* Current Date Display */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <p className="text-lg font-medium text-gray-900">
                  {currentFormattedDate || "Loading date..."}
                </p>
              </div>
              <p className="text-gray-600">
                Server time: {currentServerTime.time}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timer and Controls Section */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-6">
              {/* Timer Display */}
              <div className={`text-center ${!isTimeIn ? "opacity-50" : ""}`}>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {currentEntry.breakStart && !currentEntry.breakEnd
                    ? "Break 1 Timer"
                    : currentEntry.secondBreakStart &&
                      !currentEntry.secondBreakEnd
                    ? "Break 2 Timer"
                    : currentEntry.lunchStart && !currentEntry.lunchEnd
                    ? "Lunch Timer"
                    : "Work Timer"}
                </p>
                <div
                  className={`
                  text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter font-mono
                  ${
                    currentEntry.breakStart && !currentEntry.breakEnd
                      ? "text-blue-600"
                      : ""
                  }
                  ${
                    currentEntry.secondBreakStart &&
                    !currentEntry.secondBreakEnd
                      ? "text-indigo-600"
                      : ""
                  }
                  ${
                    currentEntry.lunchStart && !currentEntry.lunchEnd
                      ? "text-purple-600"
                      : ""
                  }
                  ${
                    !currentEntry.breakStart &&
                    !currentEntry.lunchStart &&
                    !currentEntry.secondBreakStart
                      ? "text-gray-900"
                      : ""
                  }
                `}
                >
                  {formatElapsedTime(elapsedTime)}
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full max-w-lg mx-auto">
                {!isTimeIn ? (
                  <Button
                    onClick={handleTimeIn}
                    className="w-full sm:w-auto min-w-[140px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    disabled={isLoadingTimeIn}
                    size="lg"
                  >
                    {isLoadingTimeIn ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Home className="mr-2 h-5 w-5" />
                        Time In
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full">

                    <Select
                      value={selectedAction || undefined}
                      onValueChange={handleActionChange}
                    >
                      <SelectTrigger className="w-full sm:w-56">
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
                      <Button
                        onClick={handleConfirmAction}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
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
                        Confirm
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Time Out Dialog */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Complete Your Work Day</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        placeholder="Add any notes about your work day..."
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          const notesInput = document.getElementById(
                            "notes"
                          ) as HTMLInputElement;
                          handleTimeOut({
                            notes: notesInput?.value,
                          });
                        }}
                        disabled={isLoadingTimeOut}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      >
                        {isLoadingTimeOut ? <LoadingSpinner /> : "Complete Day"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Current Session Summary */}
              {isTimeIn && (
                <div className="w-full max-w-4xl mx-auto mt-6">
                  <p className="font-semibold text-gray-700 mb-4 text-center">
                    Current Session
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentEntry.timeIn && (
                      <Card className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Time In
                            </span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatTime(currentEntry.timeIn)}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {currentEntry.shift && (
                      <Card className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Shift
                            </span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {currentEntry.shift}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {currentEntry.breakStart && (
                      <Card className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Coffee className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Break 1
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              Start: {formatTime(currentEntry.breakStart)}
                            </p>
                            {currentEntry.breakEnd && (
                              <p className="text-sm text-gray-600">
                                End: {formatTime(currentEntry.breakEnd)}
                              </p>
                            )}
                            {currentEntry.totalBreakTime !== undefined && (
                              <p className="text-sm font-medium text-gray-900">
                                Total:{" "}
                                {formatMinutesToHoursMinutes(
                                  Math.round(currentEntry.totalBreakTime * 60)
                                )}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentEntry.secondBreakStart && (
                      <Card className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Coffee className="h-4 w-4 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Break 2
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              Start: {formatTime(currentEntry.secondBreakStart)}
                            </p>
                            {currentEntry.secondBreakEnd && (
                              <p className="text-sm text-gray-600">
                                End: {formatTime(currentEntry.secondBreakEnd)}
                              </p>
                            )}
                            {currentEntry.totalSecondBreakTime !==
                              undefined && (
                              <p className="text-sm font-medium text-gray-900">
                                Total:{" "}
                                {formatMinutesToHoursMinutes(
                                  Math.round(
                                    currentEntry.totalSecondBreakTime * 60
                                  )
                                )}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentEntry.lunchStart && (
                      <Card className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Utensils className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Lunch
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              Start: {formatTime(currentEntry.lunchStart)}
                            </p>
                            {currentEntry.lunchEnd && (
                              <p className="text-sm text-gray-600">
                                End: {formatTime(currentEntry.lunchEnd)}
                              </p>
                            )}
                            {currentEntry.totalLunchTime !== undefined && (
                              <p className="text-sm font-medium text-gray-900">
                                Total:{" "}
                                {formatMinutesToHoursMinutes(
                                  Math.round(currentEntry.totalLunchTime * 60)
                                )}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance History Section */}
        <Card className="border border-gray-200">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Attendance History
              </CardTitle>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-28">
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
                </div>

                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value.toString()}
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedCutoff}
                  onValueChange={(value: CutoffPeriod) =>
                    setSelectedCutoff(value)
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Cut-off Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-15">1st - 15th</SelectItem>
                    <SelectItem value="16-31">16th - 31st</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={getAttendance}
                  disabled={isLoadingHistory}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoadingHistory ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Date</TableHead>
                      <TableHead className="min-w-[100px]">Time In</TableHead>
                      <TableHead className="min-w-[100px]">Time Out</TableHead>
                      <TableHead className="min-w-[100px]">
                        Total Hours
                      </TableHead>
                      <TableHead className="min-w-[100px]">Break 1</TableHead>
                      <TableHead className="min-w-[100px]">Lunch</TableHead>
                      <TableHead className="min-w-[100px]">Break 2</TableHead>
                      <TableHead className="min-w-[100px]">
                        Overbreak 1
                      </TableHead>
                      <TableHead className="min-w-[100px]">
                        Overbreak 2
                      </TableHead>
                      <TableHead className="min-w-[100px]">Overlunch</TableHead>
                      <TableHead className="min-w-[150px]">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.length > 0 ? (
                      filteredEntries.map((entry, index) => (
                        <TableRow key={entry.id || `entry-${index}`}>
                          <TableCell className="font-medium">
                            {entry.date}
                          </TableCell>
                          <TableCell>{formatTime(entry.timeIn)}</TableCell>
                          <TableCell>
                            {entry.timeOut
                              ? formatTime(entry.timeOut)
                              : "In Progress"}
                          </TableCell>
                          <TableCell>
                            {formatHoursToHoursMinutes(
                              String(entry.totalHours || "")
                            )}
                          </TableCell>
                          <TableCell>
                            {formatHoursToHoursMinutes(
                              String(entry.totalBreakTime || "")
                            )}
                          </TableCell>
                          <TableCell>
                            {formatHoursToHoursMinutes(
                              String(entry.totalLunchTime || "")
                            )}
                          </TableCell>
                          <TableCell>
                            {formatHoursToHoursMinutes(
                              String(entry.totalSecondBreakTime || "")
                            )}
                          </TableCell>
                          <TableCell>
                            {entry.overbreak1 && entry.overbreak1 > 0
                              ? `${entry.overbreak1} minutes`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {entry.overbreak2 && entry.overbreak2 > 0
                              ? `${entry.overbreak2} minutes`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {entry.overlunch && entry.overlunch > 0
                              ? `${entry.overlunch} minutes`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div
                              className="truncate max-w-[200px]"
                              title={entry.notes || ""}
                            >
                              {entry.notes || "-"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Clock className="h-12 w-12 text-gray-400" />
                            <p className="text-gray-600 font-medium">
                              No records found
                            </p>
                            <p className="text-sm text-gray-500">
                              {
                                months.find((m) => m.value === selectedMonth)
                                  ?.label
                              }{" "}
                              {selectedYear} ({selectedCutoff} cut-off)
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {filteredEntries.length > 0 && (
                  <div className="mt-4 text-sm text-gray-600">
                    Showing {filteredEntries.length} record(s) for{" "}
                    {months.find((m) => m.value === selectedMonth)?.label}{" "}
                    {selectedYear} ({selectedCutoff} cut-off)
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceTracker;
