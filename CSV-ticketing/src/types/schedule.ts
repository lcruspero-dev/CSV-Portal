export type ShiftTypeValue =
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

export type Employee = {
  id: string;
  name: string;
  department: string;
  teamLeader: string;
  avatarUrl?: string;
  schedule: { date: string; shiftType: ShiftType }[];
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

export type ViewMode = "weekly" | "monthly" | "dateRange";