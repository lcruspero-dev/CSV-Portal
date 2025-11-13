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
  Heart,
  Clover,
  PieChart,
  Leaf,
  Cannabis ,
  LeafyGreen
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
  bioBreakStart?: string;
  bioBreakEnd?: string;
  totalBioBreakTime?: number;
  dateBioBreakStart?: string;
  dateBioBreakEnd?: string;
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
  type: "break1" | "break2" | "lunch" | "bioBreak" | null;
  message: string;
}

type CutoffPeriod = "1-15" | "16-31"; 

// Thanksgiving-themed loading spinner
const ThanksgivingSpinner = () => (
  <div className="flex items-center justify-center">
    <Clover className="animate-pulse h-6 w-6 text-amber-600" />
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
    bioBreak: false
  });

  // Loading states
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingTimeIn, setIsLoadingTimeIn] = useState(false);
  const [isLoadingTimeOut, setIsLoadingTimeOut] = useState(false);
  const [isLoadingBreakStart, setIsLoadingBreakStart] = useState(false);
  const [isLoadingBreakEnd, setIsLoadingBreakEnd] = useState(false);
  const [isLoadingLunchStart, setIsLoadingLunchStart] = useState(false);
  const [isLoadingLunchEnd, setIsLoadingLunchEnd] = useState(false);
  const [isLoadingBioBreakStart, setIsLoadingBioBreakStart] = useState(false);
  const [isLoadingBioBreakEnd, setIsLoadingBioBreakEnd] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

  // Time formatting functions
  const formatTimeTo12Hour = (timeString: string): string => {
    if (!timeString) return '';
    
    try {
      // Handle both "HH:mm:ss" and "HH:mm" formats
      const [hours, minutes] = timeString.split(':');
      const hourNum = parseInt(hours, 10);
      const minuteNum = parseInt(minutes, 10);
      
      if (isNaN(hourNum) || isNaN(minuteNum)) return timeString;
      
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const twelveHour = hourNum % 12 || 12;
      
      return `${twelveHour}:${minuteNum.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const formatTime = (timeString: string): string => {
    return formatTimeTo12Hour(timeString);
  };

  // Format hours to "X hours, Y minutes" format
  const formatHoursToHoursMinutes = (hoursString: string): string => {
    // Handle null/undefined/empty values
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
  const calculateOverbreak = (breakTime: number, allowedBreakTime: number): number => {
    if (!breakTime || breakTime <= allowedBreakTime) return 0;
    return Math.round((breakTime - allowedBreakTime) * 60); // Return in minutes
  };

  // Alert timeout reference
  const alertTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showAlert = (type: "break1" | "break2" | "lunch" | "bioBreak") => {
    const messages = {
      break1: "🦃 Break 1 will end in 1 minute! Time to return with gratitude!",
      break2: "🍂 Break 2 will end in 1 minute! The Clover awaits your return!",
      lunch: "🥧 Lunch break will end in 1 minute! Finish your feast!",
      bioBreak: "🚽 Bio Break will end in 1 minute! Don't linger too long!"
    };

    setAlert({
      show: true,
      type,
      message: messages[type],
    });

    // Mark this alert as shown
    setAlertShown(prev => ({
      ...prev,
      [type]: true
    }));

    // Auto-hide alert after 10 seconds
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
      setAlertShown(prev => ({ ...prev, break1: false }));
    }
    if (currentEntry.secondBreakEnd) {
      setAlertShown(prev => ({ ...prev, break2: false }));
    }
    if (currentEntry.lunchEnd) {
      setAlertShown(prev => ({ ...prev, lunch: false }));
    }
    if (currentEntry.bioBreakEnd) {
      setAlertShown(prev => ({ ...prev, bioBreak: false }));
    }
  }, [currentEntry.breakEnd, currentEntry.secondBreakEnd, currentEntry.lunchEnd, currentEntry.bioBreakEnd]);

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

      // First filter by month and year
      if (entryMonth !== month || entryYear !== year) {
        return false;
      }

      // Then filter by cutoff period
      if (cutoff === "1-15") {
        return day >= 1 && day <= 15;
      } else {
        // '16-31'
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
      // Break 1: 15 minutes = 900 seconds, alert at 840 seconds (14 minutes - 1 minute before)
      if (
        currentEntry.breakStart &&
        !currentEntry.breakEnd &&
        elapsedTime >= 840 &&
        elapsedTime < 900 &&
        !alertShown.break1
      ) {
        showAlert("break1");
      }
      // Break 2: 15 minutes = 900 seconds, alert at 840 seconds (14 minutes - 1 minute before)
      else if (
        currentEntry.secondBreakStart &&
        !currentEntry.secondBreakEnd &&
        elapsedTime >= 840 &&
        elapsedTime < 900 &&
        !alertShown.break2
      ) {
        showAlert("break2");
      }
      // Lunch: 60 minutes = 3600 seconds, alert at 3540 seconds (59 minutes - 1 minute before)
      else if (
        currentEntry.lunchStart &&
        !currentEntry.lunchEnd &&
        elapsedTime >= 3540 &&
        elapsedTime < 3600 &&
        !alertShown.lunch
      ) {
        showAlert("lunch");
      }
      // Bio Break: 5 minutes = 300 seconds, alert at 240 seconds (4 minutes - 1 minute before)
      else if (
        currentEntry.bioBreakStart &&
        !currentEntry.bioBreakEnd &&
        elapsedTime >= 240 &&
        elapsedTime < 300 &&
        !alertShown.bioBreak
      ) {
        showAlert("bioBreak");
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
      // Calculate overbreak for each entry - use backend values if available, otherwise calculate
      const entriesWithOverbreak = response.data.map((entry: AttendanceEntry) => ({
        ...entry,
        overbreak1: entry.overbreak1 || calculateOverbreak(entry.totalBreakTime || 0, 0.25), // 15 minutes for break 1
        overbreak2: entry.overbreak2 || calculateOverbreak(entry.totalSecondBreakTime || 0, 0.25), // 15 minutes for break 2
        overlunch: entry.overLunch || calculateOverbreak(entry.totalLunchTime || 0, 1) // 60 minutes lunch time allowed
      }));
      setAttendanceEntries(entriesWithOverbreak);
    } catch (error) {
      console.error("Error getting attendance entries:", error);
      // Check if the error message is "Employee time not found" and prevent showing the toast
      if (typeof error === "object" && error !== null && "message" in error) {
        if (
          (error as { message: string }).message === "Employee time not found"
        ) {
          return; // Don't show the toast for this specific error
        }
      }
      showThanksgivingToast(
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

        // Set the shift automatically
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const isOnBioBreak = currentEntry.bioBreakStart && !currentEntry.bioBreakEnd;

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
      } else if (isOnBioBreak) {
        const bioBreakStartTime = new Date(
          `${currentEntry.dateBioBreakStart || currentEntry.date} ${
            currentEntry.bioBreakStart
          }`
        ).getTime();
        diffMs = currentTime - bioBreakStartTime;
      } else {
        const timeInDate = new Date(
          `${currentEntry.date} ${currentEntry.timeIn}`
        ).getTime();

        // Only deduct lunch time from total hours
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

        // Total elapsed time = current time - time in - lunch time
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
      const currentTimeData = response.data[0]; // Check if this exists

      if (currentTimeData) {
        if (currentTimeData.timeOut) {
          setIsTimeIn(false);
        } else {
          setIsTimeIn(true);
        }
        setCurrentEntry(currentTimeData);
      } else {
        console.warn("No current time data found.");
        setIsTimeIn(false); // Default to not timed in if no data exists
      }
    } catch (error) {
      console.error("Error getting current time:", error);
    }
  };

  const handleTimeIn = async () => {
    setIsLoadingTimeIn(true);
    try {
      // Get user data from local storage
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
      showThanksgivingToast(
        "🦃 Welcome with Gratitude!",
        "You've joined the Clover workplace!"
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error logging time:", error);
      let errorMessage = "A seasonal error occurred while logging time";

      // Handle API error responses (409 Conflict)
      if (error.response?.status === 409 && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Handle local storage error
      else if (error.message === "User data not found in local storage") {
        errorMessage = "User data not found in the Clover storage";
      }
      // Handle network errors or other API errors
      else if (error.message) {
        errorMessage = error.message;
      }

      showThanksgivingToast(
        "🍂 Error",
        errorMessage,
        "destructive"
      );
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

      // Calculate lunch duration in milliseconds
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

      // Total hours = (time out - time in) - lunch time
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
      hideAlert(); // Hide any active alerts when timing out
      // Reset all alert tracking
      setAlertShown({ break1: false, break2: false, lunch: false, bioBreak: false });

      showThanksgivingToast(
        "🍁 Clover Complete!",
        "You've completed your work with gratitude!"
      );
    } catch (error) {
      console.error("Error logging timeout:", error);
      showThanksgivingToast(
        "🍂 Error",
        "Failed to complete Clover! Please try again. If the issue persists, contact the Clover support.",
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
      hideAlert(); // Hide any previous alerts
      setAlertShown(prev => ({ ...prev, break1: false })); // Reset break1 alert tracking
      showThanksgivingToast(
        "🦃 Break Started!",
        "Time for a grateful break! 15 minutes of Clover relaxation."
      );
    } catch (error) {
      console.error("Error starting break:", error);
      showThanksgivingToast(
        "🍂 Error",
        "Failed to start break. Please try again. If the issue persists, contact the Clover support.",
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

      // Create date objects for break start and end
      const breakStart = new Date(
        `${currentEntry.dateBreakStart} ${currentEntry.breakStart}`
      );
      const breakEnd = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`
      );

      // Adjust break end date if it's the next day
      if (breakEnd < breakStart) {
        breakEnd.setDate(breakEnd.getDate() + 1);
      }

      // Calculate the new break duration in milliseconds
      const breakDurationMs = breakEnd.getTime() - breakStart.getTime();

      // Convert break duration to hours and add to any existing break time
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
      hideAlert(); // Hide alert when break ends
      setAlertShown(prev => ({ ...prev, break1: false })); // Reset break1 alert tracking
      showThanksgivingToast(
        "🍂 Break Ended!",
        "Back to Clover work!"
      );
    } catch (error) {
      console.error("Error ending break:", error);
      showThanksgivingToast(
        "🍂 Error",
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
      hideAlert(); // Hide any previous alerts
      setAlertShown(prev => ({ ...prev, lunch: false })); // Reset lunch alert tracking
      showThanksgivingToast(
        "🥧 Lunch Started!",
        "Time for a Clover feast! 60 minutes of grateful dining."
      );
    } catch (error) {
      console.error("Error starting lunch:", error);
      showThanksgivingToast(
        "🍂 Error",
        "Failed to start lunch. Please try again. If the issue persists, contact the Clover support.",
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

      // Create date objects for lunch start and end
      const lunchStart = new Date(
        `${currentEntry.dateLunchStart} ${currentEntry.lunchStart}`
      );
      const lunchEnd = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`
      );

      // Adjust lunch end date if it's the next day
      if (lunchEnd < lunchStart) {
        lunchEnd.setDate(lunchEnd.getDate() + 1);
      }

      // Calculate the new lunch duration in milliseconds
      const lunchDurationMs = lunchEnd.getTime() - lunchStart.getTime();

      // Convert lunch duration to hours and add to any existing lunch time
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
      hideAlert(); // Hide alert when lunch ends
      setAlertShown(prev => ({ ...prev, lunch: false })); // Reset lunch alert tracking
      showThanksgivingToast(
        "🍁 Lunch Ended!",
        "Back to the Clover workplace!"
      );
    } catch (error) {
      console.error("Error ending lunch:", error);
      showThanksgivingToast(
        "🍂 Error",
        "Failed to log end lunch. Please try again.",
        "destructive"
      );
    } finally {
      setIsLoadingLunchEnd(false);
    }
  };

  const handleBioBreakStart = async () => {
    setIsLoadingBioBreakStart(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();

      const updatedEntry = {
        ...currentEntry,
        bioBreakStart: currentTimeData.time,
        dateBioBreakStart: currentTimeData.date,
      };

      // Use the existing break start endpoint but mark it as bio break
      const response = await timer.updateBreakStart({
        ...updatedEntry,
        isBioBreak: true // Add a flag to distinguish bio breaks
      });
      
      setCurrentEntry({
        ...response.data,
        bioBreakStart: currentTimeData.time,
        dateBioBreakStart: currentTimeData.date,
      });
      
      setElapsedTime(0);
      hideAlert();
      setAlertShown(prev => ({ ...prev, bioBreak: false }));
      showThanksgivingToast(
        "🚽 Bio Break Started!",
        "Quick bio break! 5 minutes maximum."
      );
    } catch (error) {
      console.error("Error starting bio break:", error);
      showThanksgivingToast(
        "🍂 Error",
        "Failed to start bio break. Please try again.",
        "destructive"
      );
    } finally {
      setIsLoadingBioBreakStart(false);
    }
  };

  const handleBioBreakEnd = async () => {
    setIsLoadingBioBreakEnd(true);
    try {
      const currentTimeData = await getCurrentTimeFromAPI();

      // Create date objects for bio break start and end
      const bioBreakStart = new Date(
        `${currentEntry.dateBioBreakStart} ${currentEntry.bioBreakStart}`
      );
      const bioBreakEnd = new Date(
        `${currentTimeData.date} ${currentTimeData.time}`
      );

      // Adjust bio break end date if it's the next day
      if (bioBreakEnd < bioBreakStart) {
        bioBreakEnd.setDate(bioBreakEnd.getDate() + 1);
      }

      // Calculate the bio break duration in milliseconds
      const bioBreakDurationMs = bioBreakEnd.getTime() - bioBreakStart.getTime();
      const bioBreakTimeHours = bioBreakDurationMs / (1000 * 60 * 60);
      const bioBreakTimeMinutes = Math.round(bioBreakTimeHours * 60);

      // Determine which break to deduct from
      let updatedEntry = { ...currentEntry };
      let deductionMessage = "";
      
      // Check if break 1 is available (not started or started but not ended)
      if (!currentEntry.breakStart || (currentEntry.breakStart && !currentEntry.breakEnd)) {
        // Deduct from break 1
        const currentBreakTime = currentEntry.totalBreakTime || 0;
        const newBreakTime = Math.max(0, currentBreakTime - bioBreakTimeHours);
        
        updatedEntry = {
          ...currentEntry,
          bioBreakEnd: currentTimeData.time,
          dateBioBreakEnd: currentTimeData.date,
          totalBioBreakTime: Number(bioBreakTimeHours.toFixed(2)),
          totalBreakTime: Number(newBreakTime.toFixed(2)),
        };
        
        deductionMessage = `Bio break time (${bioBreakTimeMinutes} minutes) deducted from Break 1. Remaining Break 1 time: ${formatMinutesToHoursMinutes(Math.round(newBreakTime * 60))}`;
      }
      // If break 1 is used, check break 2
      else if (!currentEntry.secondBreakStart || (currentEntry.secondBreakStart && !currentEntry.secondBreakEnd)) {
        // Deduct from break 2
        const currentSecondBreakTime = currentEntry.totalSecondBreakTime || 0;
        const newSecondBreakTime = Math.max(0, currentSecondBreakTime - bioBreakTimeHours);
        
        updatedEntry = {
          ...currentEntry,
          bioBreakEnd: currentTimeData.time,
          dateBioBreakEnd: currentTimeData.date,
          totalBioBreakTime: Number(bioBreakTimeHours.toFixed(2)),
          totalSecondBreakTime: Number(newSecondBreakTime.toFixed(2)),
        };
        
        deductionMessage = `Bio break time (${bioBreakTimeMinutes} minutes) deducted from Break 2. Remaining Break 2 time: ${formatMinutesToHoursMinutes(Math.round(newSecondBreakTime * 60))}`;
      }
      // If both breaks are used, just record the bio break without deduction
      else {
        updatedEntry = {
          ...currentEntry,
          bioBreakEnd: currentTimeData.time,
          dateBioBreakEnd: currentTimeData.date,
          totalBioBreakTime: Number(bioBreakTimeHours.toFixed(2)),
        };
        
        deductionMessage = `Bio break recorded (${bioBreakTimeMinutes} minutes). Both regular breaks already used.`;
      }

      // Use the existing break end endpoint but mark it as bio break
      const response = await timer.updateBreakEnd({
        ...updatedEntry,
        isBioBreak: true, // Add a flag to distinguish bio breaks
        bioBreakDuration: bioBreakTimeMinutes       
      });
      
      setCurrentEntry({
        ...response.data,
        bioBreakEnd: currentTimeData.time,
        dateBioBreakEnd: currentTimeData.date,
        totalBioBreakTime: updatedEntry.totalBioBreakTime,
        totalBreakTime: updatedEntry.totalBreakTime,
        totalSecondBreakTime: updatedEntry.totalSecondBreakTime,
      });
      
      hideAlert();
      setAlertShown(prev => ({ ...prev, bioBreak: false }));
      showThanksgivingToast(
        "🚽 Bio Break Ended!",
        deductionMessage
      );
    } catch (error) {
      console.error("Error ending bio break:", error);
      showThanksgivingToast(
        "🍂 Error",
        "Failed to log end bio break. Please try again.",
        "destructive"
      );
    } finally {
      setIsLoadingBioBreakEnd(false);
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
      const formattedDate = formatDate(date); // Format the date if needed
      const response =
        await ScheduleAndAttendanceAPI.getSchedulePerEmployeeByDate(
          employeeId,
          formattedDate
        );
      return response.data.shiftType; // Assuming the API returns `shiftType`
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
        setSelectedAction("endBreak");
        setIsLoadingBreakStart(false);
        break;
      case "endBreak":
        setIsLoadingBreakEnd(true);
        await handleBreakEnd();
        setSelectedAction(null); // Reset the selected action
        setIsLoadingBreakEnd(false);
        break;
      case "startSecondBreak":
        setIsLoadingSecondBreakStart(true);
        await handleSecondBreakStart();
        setSelectedAction("endSecondBreak");
        setIsLoadingSecondBreakStart(false);
        break;
      case "endSecondBreak":
        setIsLoadingSecondBreakEnd(true);
        await handleSecondBreakEnd();
        setSelectedAction(null); // Reset the selected action
        setIsLoadingSecondBreakEnd(false);
        break;
      case "startLunch":
        setIsLoadingLunchStart(true);
        await handleLunchStart();
        setSelectedAction("endLunch");
        setIsLoadingLunchStart(false);
        break;
      case "endLunch":
        setIsLoadingLunchEnd(true);
        await handleLunchEnd();
        setSelectedAction(null); // Reset the selected action
        setIsLoadingLunchEnd(false);
        break;
      case "startBioBreak":
        setIsLoadingBioBreakStart(true);
        await handleBioBreakStart();
        setSelectedAction("endBioBreak");
        setIsLoadingBioBreakStart(false);
        break;
      case "endBioBreak":
        setIsLoadingBioBreakEnd(true);
        await handleBioBreakEnd();
        setSelectedAction(null); // Reset the selected action
        setIsLoadingBioBreakEnd(false);
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
      setElapsedTime(0); // Reset elapsed time when starting second break
      hideAlert(); // Hide any previous alerts
      setAlertShown(prev => ({ ...prev, break2: false })); // Reset break2 alert tracking
      showThanksgivingToast(
        "🍂 Break 2 Started!",
        "Second Clover break! 15 more minutes of grateful relaxation."
      );
    } catch (error) {
      console.error("Error starting break 2:", error);
      showThanksgivingToast(
        "🍂 Error",
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
      setSelectedAction(null); // Reset the selected action after second break ends
      hideAlert(); // Hide alert when second break ends
      setAlertShown(prev => ({ ...prev, break2: false })); // Reset break2 alert tracking
      showThanksgivingToast(
        "🍁 Break 2 Ended!",
        "Back to Clover work once more!"
      );
    } catch (error) {
      console.error("Error ending break 2:", error);
      showThanksgivingToast(
        "🍂 Error",
        "Failed to end secondbreak. Please try again.",
        "destructive"
      );
    } finally {
      setIsLoadingSecondBreakEnd(false);
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    // Check if the user is currently on a break and breakEnd is not set
    if (currentEntry.breakStart && !currentEntry.breakEnd) {
      actions.push({ value: "endBreak", label: "🦃 End Break 1" });
    }
    // Check if the user is currently on a second break and secondBreakEnd is not set
    else if (currentEntry.secondBreakStart && !currentEntry.secondBreakEnd) {
      actions.push({ value: "endSecondBreak", label: "🍂 End Break 2" });
    }
    // Check if the user is currently on lunch and lunchEnd is not set
    else if (currentEntry.lunchStart && !currentEntry.lunchEnd) {
      actions.push({ value: "endLunch", label: "🥧 End Lunch" });
    }
    // Check if the user is currently on bio break and bioBreakEnd is not set
    else if (currentEntry.bioBreakStart && !currentEntry.bioBreakEnd) {
      actions.push({ value: "endBioBreak", label: "🚽 End Bio Break" });
    }
    // If not on any break or lunch, show available actions
    else {
      // Only show "Start Break" if break hasn't started or hasn't ended
      if (!currentEntry.breakStart || !currentEntry.breakEnd) {
        actions.push({ value: "startBreak", label: "🦃 Break 1" });
      }

      // Only show "Start Second Break" if first break has ended and second break hasn't started or hasn't ended
      if (
        currentEntry.breakEnd &&
        (!currentEntry.secondBreakStart || !currentEntry.secondBreakEnd)
      ) {
        actions.push({
          value: "startSecondBreak",
          label: "🍂 Break 2",
        });
      }

      // Only show "Start Lunch" if lunch hasn't started or hasn't ended
      if (!currentEntry.lunchStart || !currentEntry.lunchEnd) {
        actions.push({ value: "startLunch", label: "🥧 Lunch" });
      }

      // Always show "Start Bio Break" if the user is timed in
      if (isTimeIn) {
        actions.push({ value: "startBioBreak", label: "🚽 Bio Break" });
      }

      // Always show "Time Out" if the user is timed in
      if (isTimeIn) {
        actions.push({ value: "timeOut", label: "🍁 Log Out" });
      }
    }

    return actions;
  };

  if (isLoadingInitial) {
    return (
      <div className="flex justify-center items-start w-full pt-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg p-8 border border-amber-300">
          <ThanksgivingSpinner />
          <p className="text-amber-700 mt-4 text-center">Loading Clover time tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Thanksgiving Alert Dialog */}
      {alert.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-amber-50 bg-opacity-70">
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg shadow-2xl p-6 max-w-md mx-4 animate-in zoom-in-95 border-2 border-amber-400">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <Leaf className="h-8 w-8 text-amber-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-amber-800 font-serif">
                🦃 Clover Alert!
              </h3>
            </div>
            <p className="text-lg text-amber-700 mb-6 text-center font-medium">
              {alert.message}
            </p>
            <div className="flex justify-end">
              <Button
                onClick={hideAlert}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-2 border border-amber-400 font-bold"
                size="lg"
              >
                Got it! 🍂
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="w-full bg-gradient-to-br from-amber-50 via-orange-50 to-orange-100 border-2 border-amber-400 shadow-2xl">
        <CardHeader className="relative pb-4 sm:pb-6">
          {/* Thanksgiving decorations */}
          <div className="absolute top-2 left-2 flex gap-1">
            <Clover className="h-4 w-4 text-amber-600 animate-pulse" />
            <PieChart className="h-4 w-4 text-amber-500" />
          </div>
          
          {/* Mobile: Button below title, Desktop: Button top right */}
          <div className="block sm:absolute sm:right-6 sm:top-6 mt-4 sm:mt-0">
            <ViewScheduleButton />
          </div>
          <CardTitle className="flex items-center justify-center text-lg sm:text-xl lg:text-2xl flex-col sm:flex-row gap-2 text-amber-800 font-serif">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
            🦃 Clover Time Tracker 🍂
          </CardTitle>
        </CardHeader>

        {/* Current Date Display */}
        <div className="text-center">
          <p className="text-xl sm:text-3xl font-bold text-amber-700 font-serif drop-shadow-lg">
            {currentFormattedDate || "Loading Clover date..."}
          </p>
        </div>

        <CardContent className="p-4 sm:p-6">
          {/* Back Button - Responsive positioning */}
          <div className="absolute left-2 sm:left-4 top-24 sm:top-28 text-xs">
            <BackButton />
          </div>

          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* Timer Display Section */}
            <div className="flex flex-col items-center space-y-4 sm:space-y-6">
              {currentEntry.breakStart && !currentEntry.breakEnd ? (
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-amber-600 text-center font-mono bg-white bg-opacity-80 p-4 rounded-lg border border-amber-500">
                  <p className="text-sm sm:text-base text-amber-700 tracking-wide mb-2">
                    🦃 BREAK 1 - 15 Minutes of Gratitude
                  </p>
                  {formatElapsedTime(elapsedTime)}
                </div>
              ) : currentEntry.secondBreakStart &&
                !currentEntry.secondBreakEnd ? (
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-amber-600 text-center font-mono bg-white bg-opacity-80 p-4 rounded-lg border border-amber-500">
                  <p className="text-sm sm:text-base text-amber-700 tracking-wide mb-2">
                    🍂 BREAK 2 - 15 Grateful Minutes
                  </p>
                  {formatElapsedTime(elapsedTime)}
                </div>
              ) : currentEntry.lunchStart && !currentEntry.lunchEnd ? (
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-amber-600 text-center font-mono bg-white bg-opacity-80 p-4 rounded-lg border border-amber-500">
                  <p className="text-sm sm:text-base text-amber-700 tracking-wide mb-2">
                    🥧 LUNCH - 60 Minutes of Feasting
                  </p>
                  {formatElapsedTime(elapsedTime)}
                </div>
              ) : currentEntry.bioBreakStart && !currentEntry.bioBreakEnd ? (
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-blue-600 text-center font-mono bg-white bg-opacity-80 p-4 rounded-lg border border-blue-500">
                  <p className="text-sm sm:text-base text-blue-700 tracking-wide mb-2">
                    🚽 BIO BREAK - 5 Minutes Maximum
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
                    🍁 Clover WORK TIME
                  </p>
                  {formatElapsedTime(elapsedTime)}
                </div>
              )}

              {/* Action Buttons Section */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full max-w-md mx-auto">
                {!isTimeIn ? (
                  <Button
                    onClick={handleTimeIn}
                    className="flex items-center w-full sm:w-auto min-w-[120px] bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border border-amber-400 font-bold shadow-lg"
                    disabled={isLoadingTimeIn}
                    size="sm"
                  >
                    {isLoadingTimeIn ? (
                      <ThanksgivingSpinner />
                    ) : (
                      <Heart className="mr-2 h-4 w-4" />
                    )}
                    Join Clover Workplace
                  </Button>
                ) : (
                  <>
                    <Select
                      value={selectedAction || undefined}
                      onValueChange={handleActionChange}
                    >
                      <SelectTrigger className="w-full sm:w-48 text-sm bg-white border-amber-400 text-amber-800">
                        <SelectValue placeholder="Select Grateful Action" />
                      </SelectTrigger>
                      <SelectContent className="bg-amber-50 border-amber-400 text-amber-800">
                        {getAvailableActions().map((action) => (
                          <SelectItem key={action.value} value={action.value} className="hover:bg-amber-200">
                            {action.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedAction && (
                      <Button
                        onClick={handleConfirmAction}
                        className="flex items-center text-sm w-full sm:w-auto min-w-[100px] bg-gradient-to-r from-green-600 to-amber-600 hover:from-green-700 hover:to-amber-700 text-white border border-green-400"
                        disabled={
                          isLoadingBreakStart ||
                          isLoadingBreakEnd ||
                          isLoadingSecondBreakStart ||
                          isLoadingSecondBreakEnd ||
                          isLoadingLunchStart ||
                          isLoadingLunchEnd ||
                          isLoadingBioBreakStart ||
                          isLoadingBioBreakEnd ||
                          isLoadingTimeOut
                        }
                        size="sm"
                      >
                        Share Gratitude
                      </Button>
                    )}

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-400">
                        <DialogHeader>
                          <DialogTitle className="text-lg text-amber-700 font-serif">
                            🍁 Complete Your Clover Day
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="sm:text-right text-amber-700">
                              Grateful Notes (Optional)
                            </Label>
                            <Input
                              id="notes"
                              className="col-span-1 sm:col-span-3 bg-white border-amber-400 text-amber-800"
                              placeholder="Add any grateful notes about your work day..."
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
                              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border border-amber-400"
                            >
                              {isLoadingTimeOut ? <ThanksgivingSpinner /> : null}
                              🍁 Complete Clover
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>

              {/* Current Session Info */}
              {isTimeIn && (
                <div className="w-full max-w-2xl mx-auto">
                  <p className="font-semibold text-sm sm:text-base mb-3 text-center text-amber-700 font-serif">
                    🍂 Current Clover Session
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Time In Card */}
                    {currentEntry.timeIn && (
                      <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 border border-green-400 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700">
                            🦃 Entry Time
                          </span>
                        </div>
                        <p className="text-sm font-semibold mt-1 text-green-900">
                          {formatTime(currentEntry.timeIn)}
                        </p>
                      </div>
                    )}

                    {/* Shift Card */}
                    {currentEntry.shift && (
                      <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg p-3 border border-amber-400 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Clover className="h-4 w-4 text-amber-600" />
                          <span className="text-xs font-medium text-amber-700">
                            🍂 Clover Shift
                          </span>
                        </div>
                        <p className="text-sm font-semibold mt-1 text-amber-900">
                          {currentEntry.shift}
                        </p>
                      </div>
                    )}

                    {/* Break Times */}
                    {currentEntry.breakStart && (
                      <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-3 border border-orange-400 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-orange-600" />
                          <span className="text-xs font-medium text-orange-700">
                            🦃 Break 1
                          </span>
                        </div>
                        <div className="space-y-1 mt-1">
                          <p className="text-xs text-orange-700">
                            <span className="font-medium">Start:</span>{" "}
                            {formatTime(currentEntry.breakStart)}
                          </p>
                          {currentEntry.breakEnd && (
                            <p className="text-xs text-orange-700">
                              <span className="font-medium">End:</span>{" "}
                              {formatTime(currentEntry.breakEnd)}
                            </p>
                          )}
                          {currentEntry.totalBreakTime !== undefined &&
                            currentEntry.totalBreakTime !== null && (
                              <p className="text-xs font-semibold text-orange-900">
                                Total: {formatMinutesToHoursMinutes(Math.round(currentEntry.totalBreakTime * 60))}
                              </p>
                            )}
                          {/* Overbreak for Break 1 - Show if this specific break exceeded 15 minutes */}
                          {currentEntry.totalBreakTime && currentEntry.totalBreakTime > 0.25 && (
                            <p className="text-xs font-semibold text-red-600">
                              🍂 Overbreak: {calculateOverbreak(currentEntry.totalBreakTime, 0.25)} minutes
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Second Break Times */}
                    {currentEntry.secondBreakStart && (
                      <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg p-3 border border-amber-400 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Cannabis  className="h-4 w-4 text-amber-600" />
                          <span className="text-xs font-medium text-amber-700">
                            🍂 Break 2
                          </span>
                        </div>
                        <div className="space-y-1 mt-1">
                          <p className="text-xs text-amber-700">
                            <span className="font-medium">Start:</span>{" "}
                            {formatTime(currentEntry.secondBreakStart)}
                          </p>
                          {currentEntry.secondBreakEnd && (
                            <p className="text-xs text-amber-700">
                              <span className="font-medium">End:</span>{" "}
                              {formatTime(currentEntry.secondBreakEnd)}
                            </p>
                          )}
                          {currentEntry.totalSecondBreakTime !== undefined &&
                            currentEntry.totalSecondBreakTime !== null && (
                              <p className="text-xs font-semibold text-amber-900">
                                Total: {formatMinutesToHoursMinutes(Math.round(currentEntry.totalSecondBreakTime * 60))}
                              </p>
                            )}
                          {/* Overbreak for Break 2 - Show if this specific break exceeded 15 minutes */}
                          {currentEntry.totalSecondBreakTime && currentEntry.totalSecondBreakTime > 0.25 && (
                            <p className="text-xs font-semibold text-red-600">
                              🍂 Overbreak: {calculateOverbreak(currentEntry.totalSecondBreakTime, 0.25)} minutes
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Lunch Times */}
                    {currentEntry.lunchStart && (
                      <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 border border-red-400 shadow-lg">
                        <div className="flex items-center gap-2">
                          <PieChart className="h-4 w-4 text-red-600" />
                          <span className="text-xs font-medium text-red-700">
                            🥧 Clover Feast
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
                                Total: {formatMinutesToHoursMinutes(Math.round(currentEntry.totalLunchTime * 60))}
                              </p>
                            )}
                          {/* Overbreak for Lunch - Show if lunch exceeded 60 minutes */}
                          {currentEntry.totalLunchTime && currentEntry.totalLunchTime > 1 && (
                            <p className="text-xs font-semibold text-red-600">
                              🍂 Overlunch: {calculateOverbreak(currentEntry.totalLunchTime, 1)} minutes
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bio Break Times */}
                    {currentEntry.bioBreakStart && (
                      <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 border border-blue-400 shadow-lg">
                        <div className="flex items-center gap-2">
                          <LeafyGreen className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">
                            🚽 Bio Break
                          </span>
                        </div>
                        <div className="space-y-1 mt-1">
                          <p className="text-xs text-blue-700">
                            <span className="font-medium">Start:</span>{" "}
                            {formatTime(currentEntry.bioBreakStart)}
                          </p>
                          {currentEntry.bioBreakEnd && (
                            <p className="text-xs text-blue-700">
                              <span className="font-medium">End:</span>{" "}
                              {formatTime(currentEntry.bioBreakEnd)}
                            </p>
                          )}
                          {currentEntry.totalBioBreakTime !== undefined &&
                            currentEntry.totalBioBreakTime !== null && (
                              <p className="text-xs font-semibold text-blue-900">
                                Total: {formatMinutesToHoursMinutes(Math.round(currentEntry.totalBioBreakTime * 60))}
                              </p>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Total Overbreak Card - This shows the combined overbreak from both breaks */}
                    {currentEntry.overbreak && currentEntry.overbreak > 0 && (
                      <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 border border-red-400 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-red-600" />
                          <span className="text-xs font-medium text-red-700">
                            🍂 Total Overbreak
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

                    {/* Overlunch Card - This shows lunch-specific overbreak */}
                    {currentEntry.overlunch && currentEntry.overlunch > 0 && (
                      <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 border border-red-400 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-red-600" />
                          <span className="text-xs font-medium text-red-700">
                            🍂 Lunch Overbreak
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

            {/* History Table Section */}
            <Card className="w-full bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-400">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-lg sm:text-xl text-amber-700 font-serif">
                    🍂 Clover Time Records
                  </CardTitle>

                  {/* Month, Year, and Cut-off Filters */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Year Selector */}
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) =>
                        setSelectedYear(parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-24 text-sm bg-white border-amber-400 text-amber-800">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent className="bg-amber-50 border-amber-400 text-amber-800">
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Month Selector */}
                    <div className="flex items-center gap-2">
                      <Clover className="h-4 w-4 text-amber-600" />
                      <Select
                        value={selectedMonth.toString()}
                        onValueChange={(value) =>
                          setSelectedMonth(parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-32 text-sm bg-white border-amber-400 text-amber-800">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="bg-amber-50 border-amber-400 text-amber-800">
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

                    {/* Cut-off Filter */}
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-amber-600" />
                      <Select
                        value={selectedCutoff}
                        onValueChange={(value: CutoffPeriod) =>
                          setSelectedCutoff(value)
                        }
                      >
                        <SelectTrigger className="w-32 text-sm bg-white border-amber-400 text-amber-800">
                          <SelectValue placeholder="Cut-off" />
                        </SelectTrigger>
                        <SelectContent className="bg-amber-50 border-amber-400 text-amber-800">
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
                    <ThanksgivingSpinner />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table className="">
                        <TableHeader>
                          <TableRow className="bg-amber-100 hover:bg-amber-200">
                            <TableHead className="min-w-[90px] text-amber-700">Date</TableHead>
                            <TableHead className="min-w-[90px] text-amber-700">
                              Log In
                            </TableHead>
                            <TableHead className="min-w-[90px] text-amber-700">
                              Log Out
                            </TableHead>
                            <TableHead className="min-w-[90px] text-amber-700">
                              Total Hours
                            </TableHead>
                            <TableHead className="min-w-[90px] text-amber-700">
                              Break 1
                            </TableHead>
                            <TableHead className="min-w-[90px] text-amber-700">
                              Lunch
                            </TableHead>
                            <TableHead className="min-w-[90px] text-amber-700">
                              Break 2
                            </TableHead>
                            <TableHead className="min-w-[90px] text-amber-700">
                              Bio Break
                            </TableHead>
                            <TableHead className="min-w-[90px] text-amber-700">
                              Overbreak 1
                            </TableHead>
                            <TableHead className="min-w-[90px] text-amber-700">
                              Overbreak 2
                            </TableHead>
                            <TableHead className="min-w-[90px] text-amber-700">
                              Overlunch
                            </TableHead>
                            <TableHead className="min-w-[90px] text-amber-700">
                              Notes
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEntries.length > 0 ? (
                            filteredEntries.map((entry, index) => (
                              <TableRow key={entry.id || `entry-${index}`} className="border-amber-300 hover:bg-amber-50">
                                <TableCell className="py-2 text-amber-800">{entry.date}</TableCell>
                                <TableCell className="py-2 text-green-700">
                                  {formatTime(entry.timeIn)}
                                </TableCell>
                                <TableCell className="py-2 text-red-700">
                                  {entry.timeOut ? formatTime(entry.timeOut) : "🍂 In Progress"}
                                </TableCell>
                                <TableCell className="py-2 text-amber-800">
                                  {formatHoursToHoursMinutes(
                                    String(entry.totalHours || "")
                                  )}
                                </TableCell>
                                <TableCell className="py-2 text-orange-700">
                                  {formatHoursToHoursMinutes(
                                    String(entry.totalBreakTime || "")
                                  )}
                                </TableCell>
                                <TableCell className="py-2 text-red-700">
                                  {formatHoursToHoursMinutes(
                                    String(entry.totalLunchTime || "")
                                  )}
                                </TableCell>
                                <TableCell className="py-2 text-amber-700">
                                  {formatHoursToHoursMinutes(
                                    String(entry.totalSecondBreakTime || "")
                                  )}
                                </TableCell>
                                <TableCell className="py-2 text-blue-700">
                                  {formatHoursToHoursMinutes(
                                    String(entry.totalBioBreakTime || "")
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
                                <TableCell className="py-2 text-amber-700">
                                  <div
                                    className="truncate max-w-[80px] sm:max-w-[100px] lg:max-w-[150px] text-ellipsis overflow-hidden"
                                    title={entry.notes || ""}
                                  >
                                    {entry.notes || "🦃"}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={13} // Updated from 12 to 13
                                className="text-center py-4 text-amber-600"
                              >
                                🍂 No Clover records found for{" "}
                                {
                                  months.find((m) => m.value === selectedMonth)
                                    ?.label
                                }{" "}
                                {selectedYear} ({selectedCutoff} cut-off)
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Records Count */}
                    <div className="mt-4 text-sm text-amber-600">
                      🦃 Showing {filteredEntries.length} grateful record(s) for{" "}
                      {months.find((m) => m.value === selectedMonth)?.label}{ " "}
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
  );
};

export default AttendanceTracker;