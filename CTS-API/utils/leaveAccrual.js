// utils/leaveAccrual.js
const {
  addMonths,
  lastDayOfMonth,
  isBefore,
  differenceInMonths,
} = require("date-fns");
const { zonedTimeToUtc, utcToZonedTime } = require("date-fns-tz");

const PH_TIMEZONE = "Asia/Manila";

const getTodayPHT = () => {
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

// Helper to get the same day next month based on start date (adjusts for short months)
const getSameDayNextMonth = (date, startDate) => {
  return getNextAccrualDate(date, startDate);
};

const calculateAccrual = (employee) => {
  const todayPHT = getTodayPHT();
  todayPHT.setHours(0, 0, 0, 0); // Start of day in PHT

  // Convert stored dates to PHT for comparison
  const nextAccrualPHT = convertToPHTime(employee.nextAccrualDate);
  nextAccrualPHT.setHours(0, 0, 0, 0);

  // Check if it's time to accrue leave (in PHT)
  if (isBefore(todayPHT, nextAccrualPHT)) {
    return null; // Not time yet
  }

  const lastAccrualPHT = convertToPHTime(employee.lastAccrualDate);
  lastAccrualPHT.setHours(0, 0, 0, 0);

  // Calculate how many full months have passed
  const monthsPassed = differenceInMonths(todayPHT, lastAccrualPHT);

  if (monthsPassed < 1) {
    return null;
  }

  // Calculate new values in PHT
  const accruedDays = employee.accrualRate * monthsPassed;
  const newBalance = employee.currentBalance + accruedDays;
  const newStart = employee.startingLeaveCredit + accruedDays;

  // Calculate new accrual dates based on start date
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

  // Convert back to UTC for storage
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

module.exports = {
  calculateAccrual,
  getTodayPHT,
  convertToPHTime,
  getSameDayNextMonth,
  getNextAccrualDate,
};
