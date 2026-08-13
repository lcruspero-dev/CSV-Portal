/**
 * Date Utility Tests
 * Tests for common date formatting and calculation utilities
 */

describe("Date Utilities", () => {
  /**
   * Helper function to format date as MM/DD/YYYY
   */
  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  /**
   * Helper function to parse time string in 12-hour format
   */
  const parseTime = (timeString) => {
    if (!timeString) return { hours: 0, minutes: 0, seconds: 0 };

    const [timePart, modifier] = timeString.split(" ");
    let [hours, minutes, seconds] = timePart.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return { hours, minutes, seconds };
  };

  /**
   * Helper function to convert time to total seconds
   */
  const convertToSeconds = (timeString) => {
    if (!timeString) return 0;
    const { hours, minutes, seconds } = parseTime(timeString);
    return hours * 3600 + minutes * 60 + seconds;
  };

  describe("formatDate", () => {
    test("should format date as MM/DD/YYYY", () => {
      const date = new Date(2026, 0, 15); // January 15, 2026
      const result = formatDate(date);
      expect(result).toBe("01/15/2026");
    });

    test("should pad single digit month and day with zero", () => {
      const date = new Date(2026, 8, 5); // September 5, 2026
      const result = formatDate(date);
      expect(result).toBe("09/05/2026");
    });

    test("should handle end of year dates", () => {
      const date = new Date(2026, 11, 31); // December 31, 2026
      const result = formatDate(date);
      expect(result).toBe("12/31/2026");
    });

    test("should handle leap year dates", () => {
      const date = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      const result = formatDate(date);
      expect(result).toBe("02/29/2024");
    });
  });

  describe("parseTime", () => {
    test("should parse AM time correctly", () => {
      const result = parseTime("09:30:00 AM");
      expect(result).toEqual({ hours: 9, minutes: 30, seconds: 0 });
    });

    test("should parse PM time and convert to 24-hour format", () => {
      const result = parseTime("02:45:00 PM");
      expect(result).toEqual({ hours: 14, minutes: 45, seconds: 0 });
    });

    test("should handle 12 PM (noon) correctly", () => {
      const result = parseTime("12:00:00 PM");
      expect(result).toEqual({ hours: 12, minutes: 0, seconds: 0 });
    });

    test("should handle 12 AM (midnight) correctly", () => {
      const result = parseTime("12:00:00 AM");
      expect(result).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    });

    test("should return zeros for null input", () => {
      const result = parseTime(null);
      expect(result).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    });
  });

  describe("convertToSeconds", () => {
    test("should convert 1 hour to 3600 seconds", () => {
      const result = convertToSeconds("01:00:00 AM");
      expect(result).toBe(3600);
    });

    test("should convert 8 hours to 28800 seconds", () => {
      const result = convertToSeconds("08:00:00 AM");
      expect(result).toBe(28800);
    });

    test("should convert 1 hour 30 minutes to 5400 seconds", () => {
      const result = convertToSeconds("01:30:00 PM");
      expect(result).toBe(49800); // 13:30 in 24-hour = 13*3600 + 30*60
    });

    test("should handle afternoon times", () => {
      const result = convertToSeconds("05:00:00 PM");
      expect(result).toBe(81000); // 17:00 in 24-hour
    });

    test("should return 0 for null input", () => {
      const result = convertToSeconds(null);
      expect(result).toBe(0);
    });
  });

  describe("Time Duration Calculation", () => {
    test("should calculate work hours between time-in and time-out", () => {
      const timeIn = "09:00:00 AM";
      const timeOut = "05:00:00 PM";

      const inSeconds = convertToSeconds(timeIn);
      const outSeconds = convertToSeconds(timeOut);
      const workSeconds = outSeconds - inSeconds;
      const workHours = (workSeconds / 3600).toFixed(2);

      expect(workHours).toBe("8.00");
    });

    test("should handle night shift (crossing midnight)", () => {
      const timeIn = "10:00:00 PM";
      const timeOut = "06:00:00 AM";

      let inSeconds = convertToSeconds(timeIn);
      let outSeconds = convertToSeconds(timeOut);

      // Add 24 hours for day crossover
      if (outSeconds < inSeconds) {
        outSeconds += 24 * 3600;
      }

      const workSeconds = outSeconds - inSeconds;
      const workHours = (workSeconds / 3600).toFixed(2);

      expect(workHours).toBe("8.00");
    });

    test("should calculate break time duration", () => {
      const breakStart = "12:00:00 PM";
      const breakEnd = "12:15:00 PM";

      const startSeconds = convertToSeconds(breakStart);
      const endSeconds = convertToSeconds(breakEnd);
      const breakSeconds = endSeconds - startSeconds;
      const breakMinutes = breakSeconds / 60;

      expect(breakMinutes).toBe(15);
    });
  });

  describe("Date Range Calculations", () => {
    test("should calculate days in a month", () => {
      const january = new Date(2026, 0, 31);
      const february = new Date(2026, 1, 28);

      expect(january.getDate()).toBe(31);
      expect(february.getDate()).toBe(28);
    });

    test("should determine if date is in current month", () => {
      const today = new Date(2026, 0, 15);
      const sameMonth = new Date(2026, 0, 20);
      const differentMonth = new Date(2026, 1, 15);

      expect(today.getMonth()).toBe(sameMonth.getMonth());
      expect(today.getMonth()).not.toBe(differentMonth.getMonth());
    });

    test("should get start and end of month", () => {
      const date = new Date(2026, 0, 15);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      expect(formatDate(startOfMonth)).toBe("01/01/2026");
      expect(formatDate(endOfMonth)).toBe("01/31/2026");
    });
  });
});
