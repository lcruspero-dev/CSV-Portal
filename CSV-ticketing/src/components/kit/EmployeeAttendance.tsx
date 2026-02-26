// components/Attendance.tsx
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle,
  CircleSlash2,
  ClipboardList,
  Clock,
  Clock4,
  HandHeart,
  LogOut,
  Phone,
  Sun,
  TreePalm,
  UserX,
  XCircle,
} from "lucide-react"; // Added CircleSlash2
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AttendanceEntry, AttendanceStatus, Employee } from "@/types/schedule";

// Helper to get attendance status color
const getAttendanceStatusColor = (status: AttendanceStatus): string => {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-800";
    case "NCNS":
      return "bg-red-100 text-red-800";
    case "Call In":
      return "bg-purple-100 text-purple-800";
    case "Rest Day":
      return "bg-orange-100 text-orange-800";
    case "Tardy":
      return "bg-yellow-100 text-yellow-800";
    case "RDOT":
      return "bg-violet-100 text-violet-800";
    case "Suspended":
      return "bg-gray-100 text-gray-800";
    case "Attrition":
      return "bg-pink-100 text-pink-800";
    case "LOA":
      return "bg-indigo-100 text-indigo-800";
    case "PTO":
      return "bg-teal-100 text-teal-800";
    case "Half Day":
      return "bg-amber-100 text-amber-800";
    case "Early Log Out":
      return "bg-rose-100 text-rose-800";
    case "VTO":
      return "bg-lime-100 text-lime-800";
    case "TB":
      return "bg-cyan-100 text-cyan-800";
    case "Pending":
      return "bg-white text-gray-500";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

// Helper to get attendance status icon
const AttendanceStatusIcon = ({ status }: { status: AttendanceStatus }) => {
  switch (status) {
    case "Present":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "NCNS":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "Call In":
      return <Phone className="h-4 w-4 text-purple-600" />;
    case "Rest Day":
      return <Calendar className="h-4 w-4 text-orange-600" />;
    case "Tardy":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "RDOT":
      return <Sun className="h-4 w-4 text-violet-600" />;
    case "Suspended":
      return <Ban className="h-4 w-4 text-gray-600" />;
    case "Attrition":
      return <UserX className="h-4 w-4 text-pink-600" />;
    case "LOA":
      return <ClipboardList className="h-4 w-4 text-indigo-600" />;
    case "PTO":
      return <TreePalm className="h-4 w-4 text-teal-600" />;
    case "Half Day":
      return <Clock4 className="h-4 w-4 text-amber-600" />;
    case "Early Log Out":
      return <LogOut className="h-4 w-4 text-rose-600" />;
    case "VTO":
      return <HandHeart className="h-4 w-4 text-lime-600" />;
    case "TB":
      return <AlertTriangle className="h-4 w-4 text-cyan-600" />;
    case "Pending":
      return <CircleSlash2 className="h-4 w-4 text-gray-400" />; // Added for Pending
    default:
      return null;
  }
};

type AttendanceProps = {
  viewMode: "weekly" | "monthly" | "dateRange";
  currentDate: Date;
  filteredEmployees: Employee[];
  attendance: AttendanceEntry[];
  handleAttendanceCellClick: (employee: Employee, date: Date) => void;
  fromDate?: Date;
  toDate?: Date;
};

export const Attendance: React.FC<AttendanceProps> = ({
  viewMode,
  currentDate,
  filteredEmployees,
  attendance,
  handleAttendanceCellClick,
  fromDate,
  toDate,
}) => {
  const getDaysInView = () => {
    if (viewMode === "weekly") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    } else if (viewMode === "monthly") {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    } else if (viewMode === "dateRange" && fromDate && toDate) {
      return eachDayOfInterval({ start: fromDate, end: toDate });
    }
    // Fallback to current week if dates are invalid
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    return eachDayOfInterval({ start, end });
  };

  const days = getDaysInView();
  const today = new Date();

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
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [time, period] = timeString.split(" ");
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes} ${period}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="p-2 border sticky left-0 bg-white z-10 min-w-40">
              Employee
            </th>
            {days.map((day) => (
              <th
                key={day.toString()}
                className="p-2 border text-center min-w-32"
              >
                <div
                  className={`font-medium ${
                    isToday(day) ? "text-blue-600" : ""
                  }`}
                >
                  {format(day, "EEE")}
                </div>
                <div
                  className={`text-sm ${
                    isToday(day) ? "text-blue-600 font-bold" : ""
                  }`}
                >
                  {format(day, "MMM d")}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredEmployees.map((employee) => (
            <tr key={employee.id} className="group hover:bg-blue-50">
              <td className="p-2 border sticky left-0 bg-white z-10 group-hover:bg-blue-50">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2 rounded-full overflow-hidden border-2 border-blue-200">
                    <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                    <AvatarFallback>
                      {employee.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm">{employee.name}</p>
                    <p className="text-xs text-gray-500">
                      {employee.department}
                    </p>
                  </div>
                </div>
              </td>
              {days.map((day) => {
                const attendanceEntry = findAttendanceEntry(employee.id, day);
                const isPastOrCurrentDay =
                  isBefore(day, today) || isSameDay(day, today);

                return (
                  <td
                    key={day.toString()}
                    className={`p-2 border text-center cursor-pointer ${
                      isToday(day)
                        ? "bg-blue-50 hover:!bg-blue-100"
                        : "hover:bg-blue-100"
                    }`}
                    onClick={() => handleAttendanceCellClick(employee, day)}
                  >
                    {attendanceEntry ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col items-center">
                              <Badge
                                variant="outline"
                                className={`mb-1 ${getAttendanceStatusColor(
                                  attendanceEntry.status,
                                )}`}
                              >
                                <span className="flex items-center">
                                  <AttendanceStatusIcon
                                    status={attendanceEntry.status}
                                  />
                                  <span className="ml-1">
                                    {attendanceEntry.status
                                      .charAt(0)
                                      .toUpperCase() +
                                      attendanceEntry.status.slice(1)}
                                  </span>
                                </span>
                              </Badge>
                              {(attendanceEntry.logIn ||
                                attendanceEntry.logOut) && (
                                <div className="text-xs text-gray-500">
                                  {attendanceEntry.logIn && (
                                    <span>
                                      {formatTime(attendanceEntry.logIn)}
                                    </span>
                                  )}
                                  {attendanceEntry.logOut && (
                                    <span
                                      className={
                                        attendanceEntry.logIn ? "ml-2" : ""
                                      }
                                    >
                                      - {formatTime(attendanceEntry.logOut)}
                                    </span>
                                  )}
                                </div>
                              )}
                              {attendanceEntry.ot && (
                                <div className="text-xs text-blue-500">
                                  OT: {attendanceEntry.ot}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {attendanceEntry.status !== "Pending" && (
                              <>
                                <p>Status: {attendanceEntry.status}</p>
                                {attendanceEntry.shift && (
                                  <p>Shift: {attendanceEntry.shift}</p>
                                )}
                                {attendanceEntry.logIn && (
                                  <p>In: {attendanceEntry.logIn}</p>
                                )}
                                {attendanceEntry.logOut && (
                                  <p>Out: {attendanceEntry.logOut}</p>
                                )}
                                {attendanceEntry.ot && (
                                  <p>OT: {attendanceEntry.ot}</p>
                                )}
                              </>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : isPastOrCurrentDay ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col items-center">
                              <Badge
                                variant="outline"
                                className={getAttendanceStatusColor("Pending")}
                              >
                                <span className="flex items-center">
                                  <AttendanceStatusIcon status="Pending" />
                                  <span className="ml-1">Pending</span>
                                </span>
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>No attendance record submitted yet</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
