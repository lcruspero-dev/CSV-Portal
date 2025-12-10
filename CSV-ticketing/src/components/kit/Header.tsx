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
import Background from "../../assets/holidayBG.png";

/* 🎄 Christmas Ambient Glow */
const ChristmasGlow = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Red Christmas Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      {/* Soft Glitter Sparkles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${3 + Math.random() * 6}px`,
            height: `${3 + Math.random() * 6}px`,
            backgroundColor: ['#ff0000', '#00ff00', '#ffffff'][Math.floor(Math.random() * 3)],
            boxShadow: '0 0 10px currentColor',
            animation: 'sparkle 3s ease-in-out infinite',
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.3,
          }}
        />
      ))}
      
      {/* Glowing Ornaments */}
      <div className="absolute top-10 left-1/3 w-4 h-4 bg-red-500 rounded-full blur-sm animate-pulse" style={{ boxShadow: '0 0 20px #ff0000' }} />
      <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-green-500 rounded-full blur-sm animate-pulse" style={{ boxShadow: '0 0 20px #00ff00', animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-white rounded-full blur-sm animate-pulse" style={{ boxShadow: '0 0 15px #ffffff', animationDelay: '2s' }} />
    </div>
  );
};

/* 🎄 Christmas Light Strings */
const ChristmasLights = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top Light String */}
      <div className="absolute top-0 left-0 right-0 flex justify-center space-x-8 py-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full animate-pulse"
            style={{
              backgroundColor: i % 3 === 0 ? '#ff0000' : i % 3 === 1 ? '#00ff00' : '#ffffff',
              boxShadow: `0 0 15px ${i % 3 === 0 ? '#ff0000' : i % 3 === 1 ? '#00ff00' : '#ffffff'}`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Side Light Strings */}
      <div className="absolute left-4 top-1/4 bottom-1/4 flex flex-col justify-between space-y-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full animate-pulse"
            style={{
              backgroundColor: i % 3 === 0 ? '#ff0000' : i % 3 === 1 ? '#00ff00' : '#ffffff',
              boxShadow: `0 0 15px ${i % 3 === 0 ? '#ff0000' : i % 3 === 1 ? '#00ff00' : '#ffffff'}`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ❄️ Falling Snow */
const FallingSnow = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${Math.random() * -20}vh`,
            left: `${Math.random() * 100}vw`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            filter: 'blur(0.5px)',
            animation: `snowfall ${10 + Math.random() * 15}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
};

/* 🎄 Real-time Clock */
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
    <div className="flex flex-col items-end bg-gradient-to-br from-red-900/40 to-green-900/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs text-white font-mono font-bold">
          {formatTime(currentTime)}
        </span>
      </div>
      <span className="text-[10px] text-gray-200 mt-1">
        {formatDate(currentTime)}
      </span>
    </div>
  );
};

/* 🎄 Main Christmas Header */
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
          style={{
            backgroundImage: `url(${Background})`,
            backgroundBlendMode: 'multiply',
          }}
        />
        <ChristmasGlow />
        <FallingSnow />
        <div className="container px-4 py-3 relative z-10 flex justify-between items-center">
          <div className="w-20 h-16 bg-gradient-to-r from-red-500/20 to-green-500/20 rounded-lg animate-pulse backdrop-blur-sm"></div>
          <div className="w-32 h-6 bg-gradient-to-r from-white/20 to-white/30 rounded animate-pulse backdrop-blur-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full border-b border-white/10 shadow-xl">
      {/* Background with Christmas overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-red-900/60 via-green-800/40 to-blue-900/50"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundBlendMode: 'multiply',
        }}
      />
      
      {/* Enhanced shadow effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Christmas effects */}
      <ChristmasGlow />
      <ChristmasLights />
      <FallingSnow />

      {/* Subtle Christmas pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container px-4 py-4 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* 🎄 Logo with Christmas glow */}
          <div className="flex-shrink-0 flex items-center gap-3 group">
            {/* Logo glow effect */}
            <div className="absolute w-24 h-24 bg-gradient-to-r from-red-500/10 to-green-500/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            
            <img
              src={logo}
              alt="Company Logo"
              className="relative w-16 sm:w-20 lg:w-24 h-auto cursor-pointer hover:scale-105 transition-all duration-500 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(255,0,0,0.5)]"
              onClick={() => navigate("/")}
            />
            
            {/* Christmas decoration dots */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>

          {/* 🎄 User Section */}
          <div className="flex items-center justify-end w-full sm:w-auto">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                {/* Real-time Clock */}
                <div className="hidden sm:block">
                  <RealTimeClock />
                </div>

                {/* User info with Christmas glow */}
                <div className="flex flex-col items-end text-right relative group">
                  {/* Glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-500/0 via-green-500/5 to-red-500/0 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  
                  <span className="text-xs sm:text-sm text-white/80 font-medium relative z-10">
                    🎄 Merry Christmas
                  </span>
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
                        {/* Christmas glow around avatar */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-green-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-all duration-500" />
                        
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
                      <div className="relative bg-gradient-to-r from-red-900/30 to-green-900/30 p-3 rounded-t-lg">
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
                        <div className="absolute left-0 w-1 h-0 group-hover:h-5 bg-gradient-to-b from-red-400 to-red-500 rounded-r transition-all duration-300" />
                        <LogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Clock for non-authenticated users */}
                <RealTimeClock />
                
                {/* Visit button with Christmas glow */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-green-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-all duration-300" />
                  <Button
                    className="relative text-xs sm:text-sm px-4 py-2 h-9 sm:h-10 bg-gradient-to-r from-red-600 to-green-600 text-white hover:from-red-700 hover:to-green-700 border border-white/20 font-medium shadow-lg hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-300"
                    asChild
                  >
                    <a
                      href="https://www.csvnow.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🎄 Visit Christmas Home
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Christmas animations */}
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-10px) translateX(0);
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh) translateX(20px);
            opacity: 0;
          }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes ray {
          0%, 100% {
            opacity: 0.1;
            transform: translateY(-100px);
          }
          50% {
            opacity: 0.3;
            transform: translateY(100px);
          }
        }
      `}</style>
    </div>
  );
};

export default Header;