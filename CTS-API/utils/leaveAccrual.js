import {
  addMonths,
  lastDayOfMonth,
  isBefore,
  differenceInMonths,
} from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

export const PH_TIMEZONE = "Asia/Manila";

export const getTodayPHT = () => {
  const now = new Date();
  return utcToZonedTime(now, PH_TIMEZONE);
};

const convertToPHTime = (date) => {
  return utcToZonedTime(date, PH_TIMEZONE);
};

// Helper to get the next accrual date based on start date
const getNextAccrualDate = (currentDate, startDate) => {
  const startDatePHT = convertToPHTime(startDate);
  const targetDay = startDatePHT.getDate();

  let nextMonth = addMonths(currentDate, 1);

  // Get the last day of the next month
  const lastDayOfNextMonth = lastDayOfMonth(nextMonth);
  const maxDayInNextMonth = lastDayOfNextMonth.getDate();

  // If target day exists in next month, use it; otherwise use last day
  const dayToUse = Math.min(targetDay, maxDayInNextMonth);

  nextMonth.setDate(dayToUse);
  return nextMonth;
};

// Helper to get the same day next month based on start date
const getSameDayNextMonth = (date, startDate) => {
  return getNextAccrualDate(date, startDate);
};

export const calculateAccrual = (employee) => {
  const todayPHT = getTodayPHT();
  todayPHT.setHours(0, 0, 0, 0);

  const nextAccrualPHT = convertToPHTime(employee.nextAccrualDate);
  nextAccrualPHT.setHours(0, 0, 0, 0);

  if (isBefore(todayPHT, nextAccrualPHT)) {
    return null;
  }

  const lastAccrualPHT = convertToPHTime(employee.lastAccrualDate);
  lastAccrualPHT.setHours(0, 0, 0, 0);

  const monthsPassed = differenceInMonths(todayPHT, lastAccrualPHT);

  if (monthsPassed < 1) {
    return null;
  }

  const accruedDays = employee.accrualRate * monthsPassed;
  const newBalance = employee.currentBalance + accruedDays;
  const newStart = employee.startingLeaveCredit + accruedDays

  let newLastAccrualPHT = lastAccrualPHT;
  for (let i = 0; i < monthsPassed; i++) {
    newLastAccrualPHT = getSameDayNextMonth(
      newLastAccrualPHT,
      employee.startDate
    );
  }
  const newNextAccrualPHT = getSameDayNextMonth(
    newLastAccrualPHT,
    employee.startDate
  );

  return {
    currentBalance: newBalance,
    startingLeaveCredit: newStart,
    lastAccrualDate: zonedTimeToUtc(newLastAccrualPHT, PH_TIMEZONE),
    nextAccrualDate: zonedTimeToUtc(newNextAccrualPHT, PH_TIMEZONE),
    accruedDays,
    months: monthsPassed,
    historyEntry: {
      date: new Date(),
      action: "monthly accrual",
      description: `Accrued ${accruedDays} days for ${monthsPassed} month(s)`,
    },
  };
};
