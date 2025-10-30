import { UserProfileAPI } from "@/API/endpoint";
import logo from "@/assets/logo.webp";
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
import { Key, LogOut, NotebookPenIcon, User, UserCog, Receipt, Ghost, ShipWheel  } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HalloweenParticles = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(40)].map((_, i) => {
        const size = Math.random() * 20 + 15;
        const animationDuration = Math.random() * 20 + 20;
        const delay = Math.random() * 10;
        const left = Math.random() * 100;
        const opacity = Math.random() * 0.7 + 0.3;
        const topOffset = Math.random() * 100 - 100;
        const type = Math.random() > 0.5 ? 'ghost' : 'pumpkin';

        return (
          <div
            key={i}
            className="absolute halloween-particle"
            style={{
              top: `${topOffset}vh`,
              left: `${left}vw`,
              width: `${size}px`,
              height: `${size}px`,
              animation: `halloween-fall ${animationDuration}s linear ${delay}s infinite`,
              opacity: opacity,
            }}
          >
            {type === 'ghost' ? (
              <Ghost className="w-full h-full text-white/40" />
            ) : (
              <ShipWheel  className="w-full h-full text-orange-400/40" />
            )}
          </div>
        );
      })}
      <style>{`
        @keyframes halloween-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(25vh) rotate(90deg) scale(1.1);
          }
          50% {
            transform: translateY(50vh) rotate(180deg) scale(1);
          }
          75% {
            transform: translateY(75vh) rotate(270deg) scale(0.9);
          }
          100% {
            transform: translateY(100vh) rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }
        .halloween-particle {
          will-change: transform;
          filter: drop-shadow(0 0 2px rgba(255, 165, 0, 0.5));
        }
      `}</style>
    </div>
  );
};

const BatsAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => {
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 15;
        const left = Math.random() * 100;
        
        return (
          <div
            key={i}
            className="absolute bat"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${left}%`,
              animation: `bat-fly ${duration}s linear ${delay}s infinite`,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gray-800/30">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        );
      })}
      <style>{`
        @keyframes bat-fly {
          0% {
            transform: translateX(-100px) translateY(0) rotate(0deg);
          }
          25% {
            transform: translateX(25vw) translateY(-20px) rotate(10deg);
          }
          50% {
            transform: translateX(50vw) translateY(10px) rotate(0deg);
          }
          75% {
            transform: translateX(75vw) translateY(-15px) rotate(-10deg);
          }
          100% {
            transform: translateX(100vw) translateY(0) rotate(0deg);
          }
        }
        .bat {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

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
            `${import.meta.env.VITE_UPLOADFILES_URL}/avatars/${response.data.avatar}`
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

  const handleEditProfile = () => navigate("/profile/edit");
  const handleChangePassword = () => navigate("/profile/change-password");

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
      <div className="bg-gradient-to-b from-[#1a0b2e] via-[#2d1b69] to-[#4a2a94] relative z-10 border-b border-orange-500/30">
        <HalloweenParticles />
        <BatsAnimation />
        <div className="container px-4 py-3 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="w-16 sm:w-20 h-16 bg-orange-500/20 rounded-lg animate-pulse"></div>
            <div className="flex items-center gap-3">
              <div className="w-24 sm:w-32 h-4 sm:h-6 bg-purple-400/20 rounded animate-pulse"></div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-400/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#1a0b2e] via-[#2d1b69] to-[#4a2a94] relative z-10 border-b border-orange-500/30 shadow-lg">
      <HalloweenParticles />
      <BatsAnimation />
      <div className="container px-4 py-3 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <img
              src={logo}
              alt="Company Logo"
              className="w-16 sm:w-20 lg:w-24 h-auto cursor-pointer hover:scale-105 transition-transform duration-300 filter drop-shadow-[0_0_8px_rgba(255,165,0,0.3)]"
              onClick={() => navigate("/")}
            />
            {/* Halloween Decoration */}
            <div className="hidden sm:flex items-center gap-1">
              <ShipWheel  className="h-5 w-5 text-orange-400 animate-pulse" />
              <Ghost className="h-4 w-4 text-white animate-bounce" />
              <ShipWheel  className="h-5 w-5 text-orange-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center justify-end w-full sm:w-auto">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                {/* Welcome and Name Section */}
                <div className="flex flex-col items-end text-right">
                  <span className="text-xs sm:text-sm text-orange-200 font-medium drop-shadow-sm">
                    Spooky Greetings
                  </span>
                  <span className="text-sm sm:text-base lg:text-lg font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    {user.name}
                  </span>
                </div>

                {/* Notification and Avatar */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {user.isAdmin && (
                    <div className="flex items-center">
                      <NotificationBell />
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 cursor-pointer border-2 border-orange-400 hover:border-yellow-400 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-orange-500/50">
                        <AvatarImage
                          src={avatarUrl || undefined}
                          alt={user.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-purple-600 text-white text-xs sm:text-sm font-bold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 sm:w-64 bg-gray-900 border border-orange-400 shadow-xl"
                    >
                      {/* Header with avatar */}
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500/10 to-purple-600/10 rounded-t-lg">
                        <Avatar className="h-10 w-10 border border-orange-400">
                          <AvatarImage
                            src={avatarUrl || undefined}
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-purple-600 text-white">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-semibold truncate text-white">{user.name}</p>
                          <p className="text-xs text-orange-200 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      
                      <DropdownMenuSeparator className="bg-orange-400/30" />
                      
                      <DropdownMenuItem
                        onClick={handleEditProfile}
                        className="cursor-pointer py-2 text-white hover:bg-orange-500/20 focus:bg-orange-500/20"
                      >
                        <User className="mr-3 h-4 w-4 text-orange-400" />
                        <span>Profile Settings</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => navigate("/payslip")}
                        className="cursor-pointer py-2 text-white hover:bg-orange-500/20 focus:bg-orange-500/20"
                      >
                        <Receipt className="mr-3 h-4 w-4 text-orange-400" />
                        <span>My Payslips</span>
                      </DropdownMenuItem>
                      
                      {(user.isAdmin || user.role === "TM" || user.role === "TL") && (
                        <DropdownMenuItem
                          onClick={() => navigate("/schedule-and-attendance")}
                          className="cursor-pointer py-2 text-white hover:bg-orange-500/20 focus:bg-orange-500/20"
                        >
                          <NotebookPenIcon className="mr-3 h-4 w-4 text-orange-400" />
                          <span>Shift & Attendance</span>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem
                        onClick={handleChangePassword}
                        className="cursor-pointer py-2 text-white hover:bg-orange-500/20 focus:bg-orange-500/20"
                      >
                        <Key className="mr-3 h-4 w-4 text-orange-400" />
                        <span>Change Password</span>
                      </DropdownMenuItem>
                      
                      {user.isAdmin && (
                        <DropdownMenuItem
                          onClick={() => {
                            setAdminView(true);
                            navigate("/");
                          }}
                          className="cursor-pointer py-2 text-white hover:bg-orange-500/20 focus:bg-orange-500/20"
                        >
                          <UserCog className="mr-3 h-4 w-4 text-orange-400" />
                          <span>Admin Dashboard</span>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator className="bg-orange-400/30" />
                      
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/20 focus:bg-red-500/20 py-2 font-medium"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <Button
                className="text-xs sm:text-sm px-4 py-2 h-9 sm:h-10 bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:from-orange-600 hover:to-purple-700 border border-orange-400 font-medium shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                asChild
              >
                <a href="https://www.csvnow.com/" target="_blank" rel="noopener noreferrer">
                  🎃 Visit Haunted Landing
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;