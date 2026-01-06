/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserProfileAPI } from "@/API/endpoint";
import logo from "@/assets/csvlogo.png";
import NotificationBell from "@/components/kit/NotificationBell";
import { useViewMode } from "@/components/kit/ViewModeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAuth } from "@/context/useAuth";
import {
  Key,
  LogOut,
  NotebookPenIcon,
  User,
  UserCog,
  Receipt
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


/* Real-time Clock */
const RealTimeClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
   <div className="flex flex-col items-end bg-[#5602FF] px-3 py-2 rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-xs text-white font-mono font-bold">
          {formatTime(currentTime)}
        </span>
      </div>
      <span className="text-[10px] text-white/80 mt-1">
        {formatDate(currentTime)}
      </span>
    </div>
  );
};

/* Main Christmas Header */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, isLoading, user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { setAdminView } = useViewMode();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user) return;
      try {
        const response = await UserProfileAPI.getProfile();
        if (response.data?.avatar) {
          setAvatarUrl(
            `${import.meta.env.VITE_UPLOADFILES_URL}/avatars/${
              response.data.avatar
            }`
          );
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };
    fetchProfile();
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    setAvatarUrl(null);
    logout();
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="relative z-10 border-b border-white/20">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-red-900/70 via-green-800/50 to-blue-900/60"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full border-b border-white/10 shadow-xl">

      <div className="container px-4 py-4 relative z-10">

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex-shrink-0 flex items-center gap-3 group">
            
            <img
              src={logo}
              alt="Company Logo"
              className="relative w-16 sm:w-20 lg:w-24 h-auto cursor-pointer hover:scale-105 transition-all duration-500 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(255,0,0,0.5)]"
              onClick={() => navigate("/")}
            />
            

          </div>

          {/* User Section */}
          <div className="flex items-center justify-end w-full sm:w-auto">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                {/* Real-time Clock */}
                <div className="hidden sm:block">
                  <RealTimeClock />s
                </div>

                {/* User info with Christmas glow */}
                <div className="flex flex-col items-end text-right relative group">
                

                  <span className="text-sm sm:text-base lg:text-lg font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] relative z-10">
                    {user.name}
                  </span>

                </div>

                {/* Mobile Clock */}
                <div className="sm:hidden">
                  <RealTimeClock />
                </div>

                {/* Notifications + Avatar */}
                <div className="flex items-center gap-3">
                  {user.isAdmin && <NotificationBell />}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="relative group cursor-pointer">
                        
                        <Avatar className="relative h-10 w-10 lg:h-12 lg:w-12 cursor-pointer border-2 border-white/30 group-hover:border-white/50 transition-all duration-300 hover:scale-105 shadow-lg group-hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                          <AvatarImage
                            src={avatarUrl || undefined}
                            alt={user.name}
                            className="group-hover:scale-110 transition-transform duration-300"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-red-600 to-green-600 text-white font-bold group-hover:from-red-700 group-hover:to-green-700 transition-all duration-300">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>

                      </div>

                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-56 sm:w-64 bg-gradient-to-b from-gray-900 to-gray-950 border border-white/20 shadow-2xl rounded-xl overflow-hidden"
                    >
                      {/* Menu header with Christmas gradient */}
                      <div className="relative  p-3 rounded-t-lg">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-green-500/5 blur-sm" />
                        <div className="flex items-center gap-3 relative z-10">
                          <Avatar className="h-10 w-10 border border-white/30 shadow-lg">
                            <AvatarImage
                              src={avatarUrl || undefined}
                              alt={user.name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-red-600 to-green-600 text-white">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <p className="text-sm font-semibold truncate text-white">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-300 truncate">
                              {user.email}
                            </p>
                            {/* Clock in dropdown */}
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-[10px] text-gray-400 font-mono">
                                {new Date().toLocaleTimeString("en-US", {
                                  hour12: true,
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-white/20 to-transparent h-[1px]" />

                      {[
                        { icon: User, label: "Profile Settings", path: "/profile/edit" },
                        { icon: Receipt, label: "My Payslips", path: "/payslip" },
                        (user.isAdmin || ["TM", "TL"].includes(user.role)) && 
                          { icon: NotebookPenIcon, label: "Shift & Attendance", path: "/schedule-and-attendance" },
                        { icon: Key, label: "Change Password", path: "/profile/change-password" },
                        user.isAdmin && 
                          { icon: UserCog, label: "Admin Dashboard", path: "/" },
                        (user.isAdmin || ["TM", "TL"].includes(user.role)) && 
                          { icon: NotebookPenIcon, label: "Export Time", path: "/exporttimetracker" },
                      ]
                        .filter(Boolean)
                        .map((item: any, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => {
                              if (item.label === "Admin Dashboard") {
                                setAdminView(true);
                              }
                              navigate(item.path);
                            }}
                            className="cursor-pointer py-2 text-white hover:bg-gradient-to-r hover:from-red-500/10 hover:to-green-500/10 transition-all duration-200 group relative"
                          >
                            <div className="absolute left-0 w-1 h-0 group-hover:h-5 bg-gradient-to-b from-red-500 to-green-500 rounded-r transition-all duration-300" />
                            <item.icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                            {item.label}
                          </DropdownMenuItem>
                        ))}

                      <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-white/20 to-transparent h-[1px]" />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2 font-medium group relative transition-all duration-200"
                      >
                        <LogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                  <Button
                  >
                    <a
                      href="https://www.csvnow.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Landing Page
                    </a>
                  </Button>

              </div>
            )}
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Header;