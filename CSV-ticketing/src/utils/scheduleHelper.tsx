import type {
  ShiftType,
  ShiftTypeValue,
  AttendanceStatus
} from '@/types/schedule';

export const getShiftColor = (shiftType: ShiftType): string => {
  if (!shiftType || !shiftType.type)
    return "bg-gray-100 text-gray-800 border-gray-200";

  switch (shiftType.type) {
    case "Morning":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Mid":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "Night":
      return "bg-violet-100 text-violet-800 border-violet-200";
    case "restday":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "paidTimeOff":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "plannedLeave":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "holiday":
      return "bg-red-100 text-red-800 border-red-200";
    case "rdot":
      return "bg-teal-100 text-teal-800 border-teal-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const hasShiftTime = (shiftType: ShiftTypeValue): boolean => {
  return ["Morning", "Mid", "Night", "rdot"].includes(shiftType);
};

export const formatTimeToAMPM = (time: string): string => {
  if (!time) return "";

  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
};

export const displayShiftInfo = (
  shiftType: ShiftType,
): { name: string; time: string; details?: string } => {
  if (!shiftType || !shiftType.type) return { name: "", time: "" };

  let displayName = "";
  let displayTime = "";
  let details = "";

  switch (shiftType.type) {
    case "Morning":
      displayName = "Morning Shift";
      break;
    case "Mid":
      displayName = "Mid Shift";
      break;
    case "Night":
      displayName = "Night Shift";
      break;
    case "restday":
      displayName = "Rest Day";
      break;
    case "paidTimeOff":
      displayName = "Paid Time Off";
      break;
    case "plannedLeave":
      displayName = "Planned Leave";
      break;
    case "holiday":
      displayName = "Holiday";
      break;
    case "rdot":
      displayName = "RDOT";
      break;
    default:
      displayName = shiftType.type;
  }

  if (
    hasShiftTime(shiftType.type) &&
    shiftType.startTime &&
    shiftType.endTime
  ) {
    displayTime = `${formatTimeToAMPM(
      shiftType.startTime,
    )} - ${formatTimeToAMPM(shiftType.endTime)}`;

    const detailsParts: string[] = [];

    if (shiftType.startTime)
      detailsParts.push(`Login: ${formatTimeToAMPM(shiftType.startTime)}`);
    if (shiftType.endTime)
      detailsParts.push(`Logout: ${formatTimeToAMPM(shiftType.endTime)}`);
    if (shiftType.break1)
      detailsParts.push(`Break 1: ${formatTimeToAMPM(shiftType.break1)}`);
    if (shiftType.break2)
      detailsParts.push(`Break 2: ${formatTimeToAMPM(shiftType.break2)}`);
    if (shiftType.lunch)
      detailsParts.push(`Lunch: ${formatTimeToAMPM(shiftType.lunch)}`);

    details = detailsParts.join("\n");
  }

  return {
    name: displayName,
    time: displayTime,
    details,
  };
};

export const getAttendanceColor = (
  status: AttendanceStatus,
): string => {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-800 border-green-200";
    case "NCNS":
      return "bg-red-100 text-red-800 border-red-200";
    case "Tardy":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Rest Day":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "RDOT":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "PTO":
      return "bg-gray-100 text-black border-gray-50";
    case "VTO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "LOA":
      return "bg-gray-100 text-black border-gray-50";
    case "Suspended":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};