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
import LoadingComponent from "@/components/ui/loading";
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
  Clock,
  Loader2,
  LogIn,
  Coffee,
  Utensils,
  Calendar,
  AlertTriangle,
  Filter,
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
    lunch: false
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

  const LoadingSpinner = () => (
    <Loader2 className="animate-spin h-4 w-4 ml-2" />
  );

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

  const showAlert = (type: "break1" | "break2" | "lunch") => {
    const messages = {
      break1: "Break 1 will end in 1 minute!",
      break2: "Break 2 will end in 1 minute!",
      lunch: "Lunch break will end in 1 minute!",
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
  }, [currentEntry.breakEnd, currentEntry.secondBreakEnd, currentEntry.lunchEnd]);

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
      // Calculate overbreak for each entry
      const entriesWithOverbreak = response.data.map((entry: AttendanceEntry) => ({
        ...entry,
        overbreak: calculateOverbreak((entry.totalBreakTime || 0) + (entry.totalSecondBreakTime || 0), 0.5) // 30 minutes total break time allowed
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
      toast({
        title: "Error",
        description:
          "Failed to load attendance history. Please try refreshing.",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Time-in logged successfully!",
        variant: "default",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error logging time:", error);
      let errorMessage = "An error occurred while logging time";

      // Handle API error responses (409 Conflict)
      if (error.response?.status === 409 && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Handle local storage error
      else if (error.message === "User data not found in local storage") {
        errorMessage = "User data not found";
      }
      // Handle network errors or other API errors
      else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
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
      setAlertShown({ break1: false, break2: false, lunch: false });

      toast({
        title: "Success",
        description: "Time-out logged successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error logging timeout:", error);
      toast({
        title: "Error",
        description:
          "Failed to log time-out. Please try again. If the issue persists, contact IT support.",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Break started successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error starting break:", error);
      toast({
        title: "Error",
        description:
          "Failed to start break. Please try again. If the issue persists, contact IT support.",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "End break logged successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error ending break:", error);
      toast({
        title: "Error",
        description: "Failed to log end break. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Lunch started successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error starting lunch:", error);
      toast({
        title: "Error",
        description:
          "Failed to start lunch. Please try again. If the issue persists, contact IT support.",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "End lunch logged successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error ending lunch:", error);
      toast({
        title: "Error",
        description: "Failed to log end lunch. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Break 2 started successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error starting break 2:", error);
      toast({
        title: "Error",
        description: "Failed to start second break. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Break 2 ended successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error ending break 2:", error);
      toast({
        title: "Error",
        description: "Failed to end secondbreak. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSecondBreakEnd(false);
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    // Check if the user is currently on a break and breakEnd is not set
    if (currentEntry.breakStart && !currentEntry.breakEnd) {
      actions.push({ value: "endBreak", label: "End Break 1" });
    }
    // Check if the user is currently on a second break and secondBreakEnd is not set
    else if (currentEntry.secondBreakStart && !currentEntry.secondBreakEnd) {
      actions.push({ value: "endSecondBreak", label: "End Break 2" });
    }
    // Check if the user is currently on lunch and lunchEnd is not set
    else if (currentEntry.lunchStart && !currentEntry.lunchEnd) {
      actions.push({ value: "endLunch", label: "End Lunch" });
    }
    // If not on any break or lunch, show available actions
    else {
      // Only show "Start Break" if break hasn't started or hasn't ended
      if (!currentEntry.breakStart || !currentEntry.breakEnd) {
        actions.push({ value: "startBreak", label: "Break 1" });
      }

      // Only show "Start Second Break" if first break has ended and second break hasn't started or hasn't ended
      if (
        currentEntry.breakEnd &&
        (!currentEntry.secondBreakStart || !currentEntry.secondBreakEnd)
      ) {
        actions.push({
          value: "startSecondBreak",
          label: "Break 2",
        });
      }

      // Only show "Start Lunch" if lunch hasn't started or hasn't ended
      if (!currentEntry.lunchStart || !currentEntry.lunchEnd) {
        actions.push({ value: "startLunch", label: "Lunch" });
      }

      // Always show "Time Out" if the user is timed in
      if (isTimeIn) {
        actions.push({ value: "timeOut", label: "Log Out" });
      }
    }

    return actions;
  };

  if (isLoadingInitial) {
    return (
      <div className="flex justify-center items-start w-full pt-4">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Alert Dialog - Bigger Width */}
      {alert.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Time Alert
              </h3>
            </div>
            <p className="text-lg text-gray-700 mb-6 text-center">{alert.message}</p>
            <div className="flex justify-end">
              <Button
                onClick={hideAlert}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2"
                size="lg"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="w-full">
        <CardHeader className="relative pb-4 sm:pb-6">
          {/* Mobile: Button below title, Desktop: Button top right */}
          <div className="block sm:absolute sm:right-6 sm:top-6 mt-4 sm:mt-0">
            <ViewScheduleButton />
          </div>
          <CardTitle className="flex items-center justify-center text-lg sm:text-xl lg:text-2xl flex-col sm:flex-row gap-2">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
            Time Tracker
          </CardTitle>
        </CardHeader>

        {/* Current Date Display */}
        <div className="text-center">
          <p className="text-xl sm:text-3xl font-bold text-blue-600">
            {currentFormattedDate || "Loading date..."}
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
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-red-600 text-center">
                  <p className="text-sm sm:text-base text-black tracking-wide mb-2">
                    BREAK 1 - 15 Minutes
                  </p>
                  {formatElapsedTime(elapsedTime)}
                </div>
              ) : currentEntry.secondBreakStart &&
                !currentEntry.secondBreakEnd ? (
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-red-600 text-center">
                  <p className="text-sm sm:text-base text-black tracking-wide mb-2">
                    BREAK 2 - 15 Minutes
                  </p>
                  {formatElapsedTime(elapsedTime)}
                </div>
              ) : currentEntry.lunchStart && !currentEntry.lunchEnd ? (
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-red-600 text-center">
                  <p className="text-sm sm:text-base text-black tracking-wide mb-2">
                    LUNCH - 60 Minutes
                  </p>
                  {formatElapsedTime(elapsedTime)}
                </div>
              ) : (
                <div
                  className={`mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-center text-green-700 ${
                    isTimeIn ? "" : "hidden"
                  }`}
                >
                  <p className="text-sm sm:text-base text-black tracking-wide mb-2">
                    RUNNING TIME
                  </p>
                  {formatElapsedTime(elapsedTime)}
                </div>
              )}

              {/* Action Buttons Section */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full max-w-md mx-auto">
                {!isTimeIn ? (
                  <Button
                    onClick={handleTimeIn}
                    className="flex items-center w-full sm:w-auto min-w-[120px]"
                    disabled={isLoadingTimeIn}
                    size="sm"
                  >
                    {isLoadingTimeIn ? (
                      <LoadingSpinner />
                    ) : (
                      <LogIn className="mr-2 h-4 w-4" />
                    )}
                    Log In
                  </Button>
                ) : (
                  <>
                    <Select
                      value={selectedAction || undefined}
                      onValueChange={handleActionChange}
                    >
                      <SelectTrigger className="w-full sm:w-40 text-sm">
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
                        className="flex items-center text-sm w-full sm:w-auto min-w-[100px]"
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
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-lg">Log Out</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="sm:text-right">
                              Notes (Optional)
                            </Label>
                            <Input
                              id="notes"
                              className="col-span-1 sm:col-span-3"
                              placeholder="Add any notes about your work day"
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
                            >
                              {isLoadingTimeOut ? <LoadingSpinner /> : null}
                              Confirm Log Out
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
                  <p className="font-semibold text-sm sm:text-base mb-3 text-center">
                    Current Session
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Time In Card */}
                    {currentEntry.timeIn && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center gap-2">
                          <LogIn className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-green-800">
                            Login
                          </span>
                        </div>
                        <p className="text-sm font-semibold mt-1">
                          {formatTime(currentEntry.timeIn)}
                        </p>
                      </div>
                    )}

                    {/* Shift Card */}
                    {currentEntry.shift && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-medium text-purple-800">
                            Shift
                          </span>
                        </div>
                        <p className="text-sm font-semibold mt-1">
                          {currentEntry.shift}
                        </p>
                      </div>
                    )}

                    {/* Break Times */}
                    {currentEntry.breakStart && (
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-center gap-2">
                          <Coffee className="h-4 w-4 text-orange-600" />
                          <span className="text-xs font-medium text-orange-800">
                            Break 1
                          </span>
                        </div>
                        <div className="space-y-1 mt-1">
                          <p className="text-xs">
                            <span className="font-medium">Start:</span>{" "}
                            {formatTime(currentEntry.breakStart)}
                          </p>
                          {currentEntry.breakEnd && (
                            <p className="text-xs">
                              <span className="font-medium">End:</span>{" "}
                              {formatTime(currentEntry.breakEnd)}
                            </p>
                          )}
                          {currentEntry.totalBreakTime !== undefined &&
                            currentEntry.totalBreakTime !== null && (
                              <p className="text-xs font-semibold">
                                Total: {formatMinutesToHoursMinutes(Math.round(currentEntry.totalBreakTime * 60))}
                              </p>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Second Break Times */}
                    {currentEntry.secondBreakStart && (
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center gap-2">
                          <Coffee className="h-4 w-4 text-amber-600" />
                          <span className="text-xs font-medium text-amber-800">
                            Break 2
                          </span>
                        </div>
                        <div className="space-y-1 mt-1">
                          <p className="text-xs">
                            <span className="font-medium">Start:</span>{" "}
                            {formatTime(currentEntry.secondBreakStart)}
                          </p>
                          {currentEntry.secondBreakEnd && (
                            <p className="text-xs">
                              <span className="font-medium">End:</span>{" "}
                              {formatTime(currentEntry.secondBreakEnd)}
                            </p>
                          )}
                          {currentEntry.totalSecondBreakTime !== undefined &&
                            currentEntry.totalSecondBreakTime !== null && (
                              <p className="text-xs font-semibold">
                                Total: {formatMinutesToHoursMinutes(Math.round(currentEntry.totalSecondBreakTime * 60))}
                              </p>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Lunch Times */}
                    {currentEntry.lunchStart && (
                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                        <div className="flex items-center gap-2">
                          <Utensils className="h-4 w-4 text-red-600" />
                          <span className="text-xs font-medium text-red-800">
                            Lunch
                          </span>
                        </div>
                        <div className="space-y-1 mt-1">
                          <p className="text-xs">
                            <span className="font-medium">Start:</span>{" "}
                            {formatTime(currentEntry.lunchStart)}
                          </p>
                          {currentEntry.lunchEnd && (
                            <p className="text-xs">
                              <span className="font-medium">End:</span>{" "}
                              {formatTime(currentEntry.lunchEnd)}
                            </p>
                          )}
                          {currentEntry.totalLunchTime !== undefined &&
                            currentEntry.totalLunchTime !== null && (
                              <p className="text-xs font-semibold">
                                Total: {formatMinutesToHoursMinutes(Math.round(currentEntry.totalLunchTime * 60))}
                              </p>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* History Table Section */}
            <Card className="w-full">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-lg sm:text-xl">
                    Daily Time Record
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
                      <SelectTrigger className="w-24 text-sm">
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

                    {/* Month Selector */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <Select
                        value={selectedMonth.toString()}
                        onValueChange={(value) =>
                          setSelectedMonth(parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-32 text-sm">
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
                    </div>

                    {/* Cut-off Filter */}
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <Select
                        value={selectedCutoff}
                        onValueChange={(value: CutoffPeriod) =>
                          setSelectedCutoff(value)
                        }
                      >
                        <SelectTrigger className="w-32 text-sm">
                          <SelectValue placeholder="Cut-off" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[90px]">Date</TableHead>
                            <TableHead className="min-w-[90px]">
                              Log In
                            </TableHead>
                            <TableHead className="min-w-[90px]">
                              Log Out
                            </TableHead>
                            <TableHead className="min-w-[90px]">
                              Total Hours
                            </TableHead>
                            <TableHead className="min-w-[90px]">
                              Break 1
                            </TableHead>
                            <TableHead className="min-w-[90px]">
                              Lunch
                            </TableHead>
                            <TableHead className="min-w-[90px]">
                              Break 2
                            </TableHead>
                            <TableHead className="min-w-[90px]">
                              Overbreak
                            </TableHead>
                            <TableHead className="min-w-[90px]">
                              Notes
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEntries.length > 0 ? (
                            filteredEntries.map((entry, index) => (
                              <TableRow key={entry.id || `entry-${index}`}>
                                <TableCell className="py-2">
                                  {entry.date}
                                </TableCell>
                                <TableCell className="py-2">
                                  {formatTime(entry.timeIn)}
                                </TableCell>
                                <TableCell className="py-2">
                                  {entry.timeOut ? formatTime(entry.timeOut) : "In Progress"}
                                </TableCell>
                                <TableCell className="py-2">
                                  {formatHoursToHoursMinutes(
                                    String(entry.totalHours || "")
                                  )}
                                </TableCell>
                                <TableCell className="py-2">
                                  {formatHoursToHoursMinutes(
                                    String(entry.totalBreakTime || "")
                                  )}
                                </TableCell>
                                <TableCell className="py-2">
                                  {formatHoursToHoursMinutes(
                                    String(entry.totalLunchTime || "")
                                  )}
                                </TableCell>
                                <TableCell className="py-2">
                                  {formatHoursToHoursMinutes(
                                    String(entry.totalSecondBreakTime || "")
                                  )}
                                </TableCell>
                                <TableCell className="py-2">
                                  {entry.overbreak && entry.overbreak > 0 
                                    ? `${entry.overbreak} minutes` 
                                    : "-"}
                                </TableCell>
                                <TableCell className="py-2">
                                  <div
                                    className="truncate max-w-[80px] sm:max-w-[100px] lg:max-w-[150px] text-ellipsis overflow-hidden"
                                    title={entry.notes || ""}
                                  >
                                    {entry.notes || "-"}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={9}
                                className="text-center py-4"
                              >
                                No attendance records found for{" "}
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
                    <div className="mt-4 text-sm text-gray-600">
                      Showing {filteredEntries.length} record(s) for{" "}
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
  );
};

export default AttendanceTracker;