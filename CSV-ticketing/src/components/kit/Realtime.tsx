import { useState, useEffect } from "react";

const RealTimeClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeZone = "Asia/Kuala_Lumpur"; // or "Asia/Singapore"

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="flex flex-col items-end bg-[#5602FF] px-3 py-2 rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-xs text-white font-mono font-bold">
          {formatTime(currentTime)}
        </span>
      </div>
      <span className="text-[10px] text-white/80 mt-0.5">
        {formatDate(currentTime)} 
      </span>
      <span className="text-[8px] text-white/50 mt-0.5">
        (UTC+08:00)
      </span>
    </div>
  );
};

export default RealTimeClock;