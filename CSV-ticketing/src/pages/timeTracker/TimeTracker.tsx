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
  TreePine,
  Gift,
  Snowflake,
  Star,
  Bell,
  Home,
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

// Christmas-themed loading spinner
const ChristmasSpinner = () => (
  <div className="flex items-center justify-center">
    <Snowflake className="animate-pulse h-6 w-6 text-blue-500" />
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
  const [selectedCutoff, setSelectedCutoff] = useState<CutoffPeriod>("1-15");
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

  // Christmas-themed toast
  const showChristmasToast = (
    title: string,
    description: string,
    variant: "default" | "destructive" = "default"
  ) => {
    toast({
      title,
      description,
      variant,
      className:
        variant === "default"
          ? "bg-gradient-to-r from-green-600 to-red-600 border border-green-400 text-white"
          : "bg-red-600 border border-red-400 text-white",
    });
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
      break1: "🎄 Break 1 will end in 1 minute! Time to return to work!",
      break2: "❄️ Break 2 will end in 1 minute! Time to return to work!",
      lunch: "🎅 Lunch break will end in 1 minute! Time to return to work!",
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
      showChristmasToast(
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
      showChristmasToast("🎄 Welcome to Work!", "You've joined the work!");
    } catch (error: any) {
      console.error("Error logging time:", error);
      let errorMessage = "A error occurred while logging time";

      if (error.response?.status === 409 && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === "User data not found in local storage") {
        errorMessage = "User data not found in the storage";
      } else if (error.message) {
        errorMessage = error.message;
      }

      showChristmasToast("❄️ Error", errorMessage, "destructive");
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

      showChristmasToast(
        "🎁 Work Complete!",
        "You've finished working! Time to enjoy rest!"
      );
    } catch (error) {
      console.error("Error logging timeout:", error);
      showChristmasToast(
        "❄️ Error",
        "Failed to complete work! Please try again. If the issue persists, contact IT Support..",
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
      showChristmasToast(
        "🎄 Break Started!",
        "Time for a break! 15 minutes of relaxation."
      );
    } catch (error) {
      console.error("Error starting break:", error);
      showChristmasToast(
        "❄️ Error",
        "Failed to start break. Please try again. If the issue persists, contact IT Support.",
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
      showChristmasToast("🎅 Break Ended!", "Back to work!");
    } catch (error) {
      console.error("Error ending break:", error);
      showChristmasToast(
        "❄️ Error",
        "Failed to log end break. Please try again.",
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
      showChristmasToast(
        "🎅 Lunch Started!",
        "Time for lunch! 60 minutes of lunch."
      );
    } catch (error) {
      console.error("Error starting lunch:", error);
      showChristmasToast(
        "❄️ Error",
        "Failed to start lunch. Please try again. If the issue persists, contact IT Support.",
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
      showChristmasToast("🎁 Lunch Ended!", "Back to the work!");
    } catch (error) {
      console.error("Error ending lunch:", error);
      showChristmasToast(
        "❄️ Error",
        "Failed to log end lunch. Please try again.",
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
      showChristmasToast(
        "❄️ Break 2 Started!",
        "Second holiday break! 15 more minutes of festive relaxation."
      );
    } catch (error) {
      console.error("Error starting break 2:", error);
      showChristmasToast(
        "❄️ Error",
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
      showChristmasToast("🎄 Break 2 Ended!", "Back to toy making!");
    } catch (error) {
      console.error("Error ending break 2:", error);
      showChristmasToast(
        "❄️ Error",
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
      actions.push({ value: "endBreak", label: "🎄 End Break 1" });
    } else if (currentEntry.secondBreakStart && !currentEntry.secondBreakEnd) {
      actions.push({ value: "endSecondBreak", label: "❄️ End Break 2" });
    } else if (currentEntry.lunchStart && !currentEntry.lunchEnd) {
      actions.push({ value: "endLunch", label: "🎅 End Lunch" });
    } else {
      if (!currentEntry.breakStart) {
        actions.push({ value: "startBreak", label: "🎄 Start Break 1" });
      }

      if (
        currentEntry.breakStart &&
        currentEntry.breakEnd &&
        !currentEntry.secondBreakStart
      ) {
        actions.push({
          value: "startSecondBreak",
          label: "❄️ Start Break 2",
        });
      }

      if (!currentEntry.lunchStart) {
        actions.push({ value: "startLunch", label: "🎅 Start Lunch" });
      }

      if (isTimeIn) {
        actions.push({ value: "timeOut", label: "🎁 Log Out" });
      }
    }

    return actions;
  };

  if (isLoadingInitial) {
    return (
      <div className="flex justify-center items-start w-full pt-4">
        <div className="bg-gradient-to-br from-green-50 to-red-50 rounded-lg p-8 border border-green-300">
          <ChristmasSpinner />
          <p className="text-green-700 mt-4 text-center">
            Loading time tracker...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8 relative overflow-hidden bg-gradient-to-br from-green-50 via-red-50 to-white">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
        {/* Christmas Alert Dialog */}
        {alert.show && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-70">
            <div className="bg-gradient-to-br from-green-50 to-red-100 rounded-lg shadow-2xl p-6 max-w-md mx-4 animate-in zoom-in-95 border-2 border-green-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <Bell className="h-8 w-8 text-green-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 font-serif">
                  🎄 Alert!
                </h3>
              </div>
              <p className="text-lg text-green-700 mb-6 text-center font-medium">
                {alert.message}
              </p>
              <div className="flex justify-end">
                <Button
                  onClick={hideAlert}
                  className="bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white px-6 py-2 border border-green-400 font-bold"
                  size="lg"
                >
                  Got it! ❄️
                </Button>
              </div>
            </div>
          </div>
        )}

        <Card className="w-full bg-gradient-to-br from-green-50 via-red-50 to-white border-2 border-green-400 shadow-2xl">
          <CardHeader className="relative pb-4 sm:pb-6">
            {/* Christmas decorations */}
            <div className="absolute top-2 left-2 flex gap-1">
              <Snowflake className="h-4 w-4 text-blue-500 animate-pulse" />
              <Star className="h-4 w-4 text-yellow-500" />
            </div>

            <div className="block sm:absolute sm:right-6 sm:top-6 mt-4 sm:mt-0">
              <ViewScheduleButton />
            </div>
            <CardTitle className="flex items-center justify-center text-lg sm:text-xl lg:text-2xl flex-col sm:flex-row gap-2 text-green-800 font-serif">
              <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              Time Tracker
            </CardTitle>
          </CardHeader>

          <div className="text-center">
            <p className="text-xl sm:text-3xl font-bold text-green-700 font-serif drop-shadow-lg">
              {currentFormattedDate || "Loading holiday date..."}
            </p>
          </div>

          <CardContent className="p-4 sm:p-6">
            <div className="absolute left-2 sm:left-4 top-24 sm:top-28 text-xs">
              <BackButton />
            </div>

            <div className="flex flex-col space-y-4 sm:space-y-6">
              <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                {currentEntry.breakStart && !currentEntry.breakEnd ? (
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-green-600 text-center font-mono bg-white bg-opacity-80 p-4 rounded-lg border border-green-500">
                    <p className="text-sm sm:text-base text-green-700 tracking-wide mb-2">
                      🎄 BREAK 1 - 15 Minutes
                    </p>
                    {formatElapsedTime(elapsedTime)}
                  </div>
                ) : currentEntry.secondBreakStart &&
                  !currentEntry.secondBreakEnd ? (
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-blue-600 text-center font-mono bg-white bg-opacity-80 p-4 rounded-lg border border-blue-500">
                    <p className="text-sm sm:text-base text-blue-700 tracking-wide mb-2">
                      ❄️ BREAK 2 - 15 Minutes
                    </p>
                    {formatElapsedTime(elapsedTime)}
                  </div>
                ) : currentEntry.lunchStart && !currentEntry.lunchEnd ? (
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-red-600 text-center font-mono bg-white bg-opacity-80 p-4 rounded-lg border border-red-500">
                    <p className="text-sm sm:text-base text-red-700 tracking-wide mb-2">
                      🎅 LUNCH - 60 Minutes
                    </p>
                    {formatElapsedTime(elapsedTime)}
                  </div>
                ) : (
                  <div
                    className={`mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-center text-green-600 font-mono bg-white bg-opacity-80 p-4 rounded-lg border border-green-500 ${
                      isTimeIn ? "" : "hidden"
                    }`}
                  >
                    <p className="text-sm sm:text-base text-green-700 tracking-wide mb-2">
                      🎁 WORK TIME
                    </p>
                    {formatElapsedTime(elapsedTime)}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full max-w-md mx-auto">
                  {!isTimeIn ? (
                    <Button
                      onClick={handleTimeIn}
                      className="flex items-center w-full sm:w-auto min-w-[120px] bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white border border-green-400 font-bold shadow-lg"
                      disabled={isLoadingTimeIn}
                      size="sm"
                    >
                      {isLoadingTimeIn ? (
                        <ChristmasSpinner />
                      ) : (
                        <Home className="mr-2 h-4 w-4" />
                      )}
                      Time In
                    </Button>
                  ) : (
                    <>
                      <Select
                        value={selectedAction || undefined}
                        onValueChange={handleActionChange}
                      >
                        <SelectTrigger className="w-full sm:w-48 text-sm bg-white border-green-400 text-green-800">
                          <SelectValue placeholder="Select Action" />
                        </SelectTrigger>
                        <SelectContent className="bg-green-50 border-green-400 text-green-800">
                          {getAvailableActions().map((action) => (
                            <SelectItem
                              key={action.value}
                              value={action.value}
                              className="hover:bg-green-200"
                            >
                              {action.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedAction && (
                        <Button
                          onClick={handleConfirmAction}
                          className="flex items-center text-sm w-full sm:w-auto min-w-[100px] bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white border border-green-400"
                          disabled={
                            isLoadingBreakStart ||
                            isLoadingBreakEnd ||
                            isLoadingSecondBreakStart ||
                            isLoadingSecondBreakEnd ||
                            isLoadingLunchStart ||
                            isLoadingLunchEnd ||
                            isLoadingTimeOut
                          }
                          size="sm"
                        >
                          Confirm
                        </Button>
                      )}

                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent className="sm:max-w-md bg-gradient-to-br from-green-50 to-red-100 border-2 border-green-400">
                          <DialogHeader>
                            <DialogTitle className="text-lg text-green-700 font-serif">
                              🎁 Complete Your Day
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="notes"
                                className="sm:text-right text-green-700"
                              >
                                Notes (Optional)
                              </Label>
                              <Input
                                id="notes"
                                className="col-span-1 sm:col-span-3 bg-white border-green-400 text-green-800"
                                placeholder="Add any notes about your work day..."
                              />
                            </div>
                            <div className="flex justify-end">
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
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white border border-green-400"
                              >
                                {isLoadingTimeOut ? <ChristmasSpinner /> : null}
                                Complete Day
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>

                {isTimeIn && (
                  <div className="w-full max-w-2xl mx-auto">
                    <p className="font-semibold text-sm sm:text-base mb-3 text-center text-green-700 font-serif">
                      ❄️ Current Session
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentEntry.timeIn && (
                        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 border border-green-400 shadow-lg">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-medium text-green-700">
                              🎄 Entry Time
                            </span>
                          </div>
                          <p className="text-sm font-semibold mt-1 text-green-900">
                            {formatTime(currentEntry.timeIn)}
                          </p>
                        </div>
                      )}

                      {currentEntry.shift && (
                        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-3 border border-yellow-400 shadow-lg">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-600" />
                            <span className="text-xs font-medium text-yellow-700">
                              ❄️ Shift
                            </span>
                          </div>
                          <p className="text-sm font-semibold mt-1 text-yellow-900">
                            {currentEntry.shift}
                          </p>
                        </div>
                      )}

                      {currentEntry.breakStart && (
                        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 border border-green-400 shadow-lg">
                          <div className="flex items-center gap-2">
                            <TreePine className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-medium text-green-700">
                              🎄 Break 1
                            </span>
                          </div>
                          <div className="space-y-1 mt-1">
                            <p className="text-xs text-green-700">
                              <span className="font-medium">Start:</span>{" "}
                              {formatTime(currentEntry.breakStart)}
                            </p>
                            {currentEntry.breakEnd && (
                              <p className="text-xs text-green-700">
                                <span className="font-medium">End:</span>{" "}
                                {formatTime(currentEntry.breakEnd)}
                              </p>
                            )}
                            {currentEntry.totalBreakTime !== undefined &&
                              currentEntry.totalBreakTime !== null && (
                                <p className="text-xs font-semibold text-green-900">
                                  Total:{" "}
                                  {formatMinutesToHoursMinutes(
                                    Math.round(currentEntry.totalBreakTime * 60)
                                  )}
                                </p>
                              )}
                            {currentEntry.totalBreakTime &&
                              currentEntry.totalBreakTime > 0.25 && (
                                <p className="text-xs font-semibold text-red-600">
                                  ❄️ Overbreak:{" "}
                                  {calculateOverbreak(
                                    currentEntry.totalBreakTime,
                                    0.25
                                  )}{" "}
                                  minutes
                                </p>
                              )}
                          </div>
                        </div>
                      )}

                      {currentEntry.secondBreakStart && (
                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 border border-blue-400 shadow-lg">
                          <div className="flex items-center gap-2">
                            <Snowflake className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-700">
                              ❄️ Break 2
                            </span>
                          </div>
                          <div className="space-y-1 mt-1">
                            <p className="text-xs text-blue-700">
                              <span className="font-medium">Start:</span>{" "}
                              {formatTime(currentEntry.secondBreakStart)}
                            </p>
                            {currentEntry.secondBreakEnd && (
                              <p className="text-xs text-blue-700">
                                <span className="font-medium">End:</span>{" "}
                                {formatTime(currentEntry.secondBreakEnd)}
                              </p>
                            )}
                            {currentEntry.totalSecondBreakTime !== undefined &&
                              currentEntry.totalSecondBreakTime !== null && (
                                <p className="text-xs font-semibold text-blue-900">
                                  Total:{" "}
                                  {formatMinutesToHoursMinutes(
                                    Math.round(
                                      currentEntry.totalSecondBreakTime * 60
                                    )
                                  )}
                                </p>
                              )}
                            {currentEntry.totalSecondBreakTime &&
                              currentEntry.totalSecondBreakTime > 0.25 && (
                                <p className="text-xs font-semibold text-red-600">
                                  ❄️ Overbreak:{" "}
                                  {calculateOverbreak(
                                    currentEntry.totalSecondBreakTime,
                                    0.25
                                  )}{" "}
                                  minutes
                                </p>
                              )}
                          </div>
                        </div>
                      )}

                      {currentEntry.lunchStart && (
                        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 border border-red-400 shadow-lg">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-red-600" />
                            <span className="text-xs font-medium text-red-700">
                              🎅 Lunch
                            </span>
                          </div>
                          <div className="space-y-1 mt-1">
                            <p className="text-xs text-red-700">
                              <span className="font-medium">Start:</span>{" "}
                              {formatTime(currentEntry.lunchStart)}
                            </p>
                            {currentEntry.lunchEnd && (
                              <p className="text-xs text-red-700">
                                <span className="font-medium">End:</span>{" "}
                                {formatTime(currentEntry.lunchEnd)}
                              </p>
                            )}
                            {currentEntry.totalLunchTime !== undefined &&
                              currentEntry.totalLunchTime !== null && (
                                <p className="text-xs font-semibold text-red-900">
                                  Total:{" "}
                                  {formatMinutesToHoursMinutes(
                                    Math.round(currentEntry.totalLunchTime * 60)
                                  )}
                                </p>
                              )}
                            {currentEntry.totalLunchTime &&
                              currentEntry.totalLunchTime > 1 && (
                                <p className="text-xs font-semibold text-red-600">
                                  ❄️ Overlunch:{" "}
                                  {calculateOverbreak(
                                    currentEntry.totalLunchTime,
                                    1
                                  )}{" "}
                                  minutes
                                </p>
                              )}
                          </div>
                        </div>
                      )}

                      {currentEntry.overbreak && currentEntry.overbreak > 0 && (
                        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 border border-red-400 shadow-lg">
                          <div className="flex items-center gap-2">
                            <TreePine className="h-4 w-4 text-red-600" />
                            <span className="text-xs font-medium text-red-700">
                              ❄️ Total Overbreak
                            </span>
                          </div>
                          <div className="space-y-1 mt-1">
                            <p className="text-xs font-semibold text-red-900">
                              {currentEntry.overbreak} minutes
                            </p>
                            <p className="text-xs text-red-700">
                              Combined break time exceeded 30 minutes
                            </p>
                          </div>
                        </div>
                      )}

                      {currentEntry.overlunch && currentEntry.overlunch > 0 && (
                        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 border border-red-400 shadow-lg">
                          <div className="flex items-center gap-2">
                            <TreePine className="h-4 w-4 text-red-600" />
                            <span className="text-xs font-medium text-red-700">
                              ❄️ Overbreak
                            </span>
                          </div>
                          <div className="space-y-1 mt-1">
                            <p className="text-xs font-semibold text-red-900">
                              {currentEntry.overlunch} minutes
                            </p>
                            <p className="text-xs text-red-700">
                              Lunch time exceeded 60 minutes
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Card className="w-full bg-gradient-to-br from-green-50 to-red-100 border-2 border-green-400">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-lg sm:text-xl text-green-700 font-serif">
                      ❄️ Time Records
                    </CardTitle>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) =>
                          setSelectedYear(parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-24 text-sm bg-white border-green-400 text-green-800">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="bg-green-50 border-green-400 text-green-800">
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <TreePine className="h-4 w-4 text-green-600" />
                        <Select
                          value={selectedMonth.toString()}
                          onValueChange={(value) =>
                            setSelectedMonth(parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-32 text-sm bg-white border-green-400 text-green-800">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent className="bg-green-50 border-green-400 text-green-800">
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
                      </div>

                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-green-600" />
                        <Select
                          value={selectedCutoff}
                          onValueChange={(value: CutoffPeriod) =>
                            setSelectedCutoff(value)
                          }
                        >
                          <SelectTrigger className="w-32 text-sm bg-white border-green-400 text-green-800">
                            <SelectValue placeholder="Cut-off" />
                          </SelectTrigger>
                          <SelectContent className="bg-green-50 border-green-400 text-green-800">
                            <SelectItem value="1-15">1-15</SelectItem>
                            <SelectItem value="16-31">16-31</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-8">
                      <ChristmasSpinner />
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table className="">
                          <TableHeader>
                            <TableRow className="bg-green-100 hover:bg-green-200">
                              <TableHead className="min-w-[90px] text-green-700">
                                Date
                              </TableHead>
                              <TableHead className="min-w-[90px] text-green-700">
                                Log In
                              </TableHead>
                              <TableHead className="min-w-[90px] text-green-700">
                                Log Out
                              </TableHead>
                              <TableHead className="min-w-[90px] text-green-700">
                                Total Hours
                              </TableHead>
                              <TableHead className="min-w-[90px] text-green-700">
                                Break 1
                              </TableHead>
                              <TableHead className="min-w-[90px] text-green-700">
                                Lunch
                              </TableHead>
                              <TableHead className="min-w-[90px] text-green-700">
                                Break 2
                              </TableHead>
                              <TableHead className="min-w-[90px] text-green-700">
                                Overbreak 1
                              </TableHead>
                              <TableHead className="min-w-[90px] text-green-700">
                                Overbreak 2
                              </TableHead>
                              <TableHead className="min-w-[90px] text-green-700">
                                Overlunch
                              </TableHead>
                              <TableHead className="min-w-[90px] text-green-700">
                                Notes
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredEntries.length > 0 ? (
                              filteredEntries.map((entry, index) => (
                                <TableRow
                                  key={entry.id || `entry-${index}`}
                                  className="border-green-300 hover:bg-green-50"
                                >
                                  <TableCell className="py-2 text-green-800">
                                    {entry.date}
                                  </TableCell>
                                  <TableCell className="py-2 text-green-700">
                                    {formatTime(entry.timeIn)}
                                  </TableCell>
                                  <TableCell className="py-2 text-red-700">
                                    {entry.timeOut
                                      ? formatTime(entry.timeOut)
                                      : "❄️ In Progress"}
                                  </TableCell>
                                  <TableCell className="py-2 text-green-800">
                                    {formatHoursToHoursMinutes(
                                      String(entry.totalHours || "")
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 text-green-700">
                                    {formatHoursToHoursMinutes(
                                      String(entry.totalBreakTime || "")
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 text-red-700">
                                    {formatHoursToHoursMinutes(
                                      String(entry.totalLunchTime || "")
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 text-blue-700">
                                    {formatHoursToHoursMinutes(
                                      String(entry.totalSecondBreakTime || "")
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 text-red-700">
                                    {entry.overbreak1 && entry.overbreak1 > 0
                                      ? `${entry.overbreak1} minutes`
                                      : "-"}
                                  </TableCell>
                                  <TableCell className="py-2 text-red-700">
                                    {entry.overbreak2 && entry.overbreak2 > 0
                                      ? `${entry.overbreak2} minutes`
                                      : "-"}
                                  </TableCell>
                                  <TableCell className="py-2 text-red-700">
                                    {entry.overlunch && entry.overlunch > 0
                                      ? `${entry.overlunch} minutes`
                                      : "-"}
                                  </TableCell>
                                  <TableCell className="py-2 text-green-700">
                                    <div
                                      className="truncate max-w-[80px] sm:max-w-[100px] lg:max-w-[150px] text-ellipsis overflow-hidden"
                                      title={entry.notes || ""}
                                    >
                                      {entry.notes || "🎄"}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={12}
                                  className="text-center py-4 text-green-600"
                                >
                                  ❄️ No records found for{" "}
                                  {
                                    months.find(
                                      (m) => m.value === selectedMonth
                                    )?.label
                                  }{" "}
                                  {selectedYear} ({selectedCutoff} cut-off)
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="mt-4 text-sm text-green-600">
                        🎄 Showing {filteredEntries.length} record(s) for{" "}
                        {months.find((m) => m.value === selectedMonth)?.label}{" "}
                        {selectedYear} ({selectedCutoff} cut-off)
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AttendanceTracker;
