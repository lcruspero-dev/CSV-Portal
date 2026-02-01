import { ScheduleAndAttendanceAPI, timer } from "@/API/endpoint";
import LeaveBalanceDisplay from "@/components/kit/LeaveBalance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  parse,
  startOfWeek,
} from "date-fns";
import { Calendar, CalendarCheck, CalendarDays } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ScheduleItem {
  date: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  break1: string;
  break2: string;
  lunch: string;
  _id: string;
}

interface EmployeeSchedule {
  employeeName: string;
  teamLeader: string;
  position: string;
  schedule: ScheduleItem[];
}

interface ServerTimeResponse {
  date: string; // format: "3/25/2025"
  time: string; // format: "10:54:03 AM"
}

export const ViewScheduleButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [today, setToday] = useState(new Date()); // Store today's date separately
  const [scheduleData, setScheduleData] = useState<EmployeeSchedule | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingServerTime, setIsFetchingServerTime] = useState(false);

  useEffect(() => {
    if (isOpen && !scheduleData) {
      fetchServerTimeAndSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchServerTime = async (): Promise<Date> => {
    try {
      const response: ServerTimeResponse = (await timer.getServerTime()).data;
      const serverDate = parse(response.date, "M/d/yyyy", new Date());
      setToday(serverDate); // Set today's date from server time
      return serverDate;
    } catch (error) {
      console.error("Error fetching server time:", error);
      const localDate = new Date();
      setToday(localDate); // Fallback to local date
      return localDate;
    }
  };

  const fetchServerTimeAndSchedule = async () => {
    setIsLoading(true);
    setIsFetchingServerTime(true);
    try {
      const serverDate = await fetchServerTime();
      setCurrentDate(serverDate);

      const employeeId = JSON.parse(localStorage.getItem("user")!)._id;
      const response =
        await ScheduleAndAttendanceAPI.getSchedulePerEmployee(employeeId);
      setScheduleData(response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setIsFetchingServerTime(false);
    }
  };

  const getCurrentWeekDates = () => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getScheduleForDate = (date: Date) => {
    if (!scheduleData) return null;

    const dateString = format(date, "yyyy-MM-dd");
    return scheduleData.schedule.find((item) => item.date === dateString);
  };

  const formatTimeToAMPM = (timeString: string) => {
    if (!timeString) return "-";
    try {
      // Parse the time string (assuming format like "08:00:00" or "13:30:00")
      const [hours, minutes] = timeString.split(":");
      const hourNum = parseInt(hours, 10);
      const minuteNum = parseInt(minutes, 10);

      // Format to AM/PM
      const period = hourNum >= 12 ? "PM" : "AM";
      const displayHour = hourNum % 12 || 12;
      return `${displayHour}:${minuteNum
        .toString()
        .padStart(2, "0")} ${period}`;
    } catch {
      return timeString; // fallback to original if parsing fails
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === "prev" ? -7 : 7));
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + (direction === "prev" ? -1 : 1));
      return newDate;
    });
  };

  const renderBreakTimes = (schedule: ScheduleItem | null) => {
    if (!schedule) return null;

    return (
      <div className="text-xs text-gray-600 mt-1 space-y-0.5">
        {schedule.break1 && (
          <div>1st Break: {formatTimeToAMPM(schedule.break1)}</div>
        )}
        {schedule.lunch && <div>Lunch: {formatTimeToAMPM(schedule.lunch)}</div>}
        {schedule.break2 && (
          <div>2nd Break: {formatTimeToAMPM(schedule.break2)}</div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center text-blue-600 hover:text-blue-800">
        <CalendarCheck className="h-4 w-4 mr-1" />
        <Button
          variant="link"
          className="underline p-0 text-sm text-inherit"
          onClick={() => setIsOpen(true)}
        >
          View Schedule
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                {scheduleData?.employeeName}'s Schedule
                <div className="text-sm font-normal mt-1">
                  Position: {scheduleData?.position} | Group:{" "}
                  {scheduleData?.teamLeader}
                </div>
                <LeaveBalanceDisplay />
              </div>
              <div className="flex space-x-2 text-sm mr-5">
                <Button
                  variant={viewMode === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("weekly")}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Weekly
                </Button>
                <Button
                  variant={viewMode === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("monthly")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Monthly
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {isLoading || isFetchingServerTime ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {viewMode === "weekly" ? (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4 text-sm mx-20">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateWeek("prev")}
                    >
                      Previous Week
                    </Button>
                    <div className="font-medium text-base">
                      Week of {format(startOfWeek(currentDate), "MMM d, yyyy")}{" "}
                      to {format(endOfWeek(currentDate), "MMM d, yyyy")}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateWeek("next")}
                    >
                      Next Week
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Shift type</TableHead>
                        <TableHead>Shift start</TableHead>
                        <TableHead>Shift end</TableHead>
                        <TableHead>Break times</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCurrentWeekDates().map((date) => {
                        const schedule = getScheduleForDate(date);
                        const isToday = isSameDay(date, today); // Compare with today's date
                        return (
                          <TableRow
                            key={date.toString()}
                            className={isToday ? "bg-blue-50" : ""}
                          >
                            <TableCell>{format(date, "MMM d, yyyy")}</TableCell>
                            <TableCell>{format(date, "EEEE")}</TableCell>
                            <TableCell>
                              {schedule?.shiftType === "restday"
                                ? "Rest Day"
                                : schedule?.shiftType === "paidTimeOff"
                                  ? "PTO"
                                  : schedule?.shiftType === "plannedLeave"
                                    ? "Leave"
                                    : schedule?.shiftType === "shift1"
                                      ? "Shift 1"
                                      : schedule?.shiftType === "shift2"
                                        ? "Shift 2"
                                        : schedule?.shiftType === "shift3"
                                          ? "Shift 3"
                                          : schedule?.shiftType ||
                                            "No schedule"}
                            </TableCell>

                            <TableCell>
                              {schedule
                                ? formatTimeToAMPM(schedule.startTime)
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {schedule
                                ? formatTimeToAMPM(schedule.endTime)
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {schedule ? (
                                <>
                                  {schedule.break1 && (
                                    <div>
                                      1st break:{" "}
                                      {formatTimeToAMPM(schedule.break1)}
                                    </div>
                                  )}
                                  {schedule.lunch && (
                                    <div>
                                      Lunch: {formatTimeToAMPM(schedule.lunch)}
                                    </div>
                                  )}
                                  {schedule.break2 && (
                                    <div>
                                      2nd break:{" "}
                                      {formatTimeToAMPM(schedule.break2)}
                                    </div>
                                  )}

                                  {!schedule.break1 &&
                                    !schedule.break2 &&
                                    !schedule.lunch &&
                                    "-"}
                                </>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                    >
                      Previous Month
                    </Button>
                    <div className="font-medium text-lg text-gray-900">
                      {format(currentDate, "MMMM yyyy")}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                    >
                      Next Month
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-sm">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="font-medium text-center py-2 text-gray-800"
                        >
                          {day}
                        </div>
                      ),
                    )}

                    {Array.from({
                      length: new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        1,
                      ).getDay(),
                    }).map((_, index) => (
                      <div key={`empty-${index}`} className="h-32"></div>
                    ))}

                    {Array.from({
                      length: new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1,
                        0,
                      ).getDate(),
                    }).map((_, index) => {
                      const day = index + 1;
                      const date = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day,
                      );
                      const schedule = getScheduleForDate(date);
                      const isToday = isSameDay(date, today);

                      return (
                        <div
                          key={day}
                          className={`border rounded p-1 h-32 overflow-y-auto text-gray-900 bg-white ${
                            isToday
                              ? "bg-blue-50 border-blue-300 font-medium"
                              : ""
                          }`}
                        >
                          <div className="font-medium">{day}</div>
                          {schedule && (
                            <div className="text-xs mt-1 space-y-0.5">
                              <div>
                                {schedule.shiftType === "restday"
                                  ? "Rest Day"
                                  : schedule.shiftType === "paidTimeOff"
                                    ? "PTO"
                                    : schedule.shiftType === "plannedLeave"
                                      ? "Leave"
                                      : schedule.shiftType === "shift1"
                                        ? "Shift 1"
                                        : schedule.shiftType === "shift2"
                                          ? "Shift 2"
                                          : schedule.shiftType === "shift3"
                                            ? "Shift 3"
                                            : schedule.shiftType}
                              </div>
                              <div>
                                {formatTimeToAMPM(schedule.startTime)} -{" "}
                                {formatTimeToAMPM(schedule.endTime)}
                              </div>
                              {renderBreakTimes(schedule)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
