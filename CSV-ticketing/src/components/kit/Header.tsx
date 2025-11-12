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
import {
  Key,
  LogOut,
  NotebookPenIcon,
  User,
  UserCog,
  Receipt,
  Leaf,
  Bird,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../../assets/bg.jpg";

/* 🍂 Floating autumn leaves with warm fall colors */
const FallingLeaves = () => {
  const leafColors = [
    "text-orange-400/70",
    "text-yellow-400/70",
    "text-red-500/70",
    "text-amber-500/70",
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(35)].map((_, i) => {
        const size = Math.random() * 18 + 12;
        const duration = Math.random() * 15 + 15;
        const delay = Math.random() * 10;
        const left = Math.random() * 100;
        const rotation = Math.random() * 360;
        const color = leafColors[Math.floor(Math.random() * leafColors.length)];

        return (
          <div
            key={i}
            className="absolute thanksgiving-leaf"
            style={{
              top: `${Math.random() * -20}vh`,
              left: `${left}vw`,
              width: `${size}px`,
              height: `${size}px`,
              animation: `falling-leaf ${duration}s linear ${delay}s infinite`,
              transform: `rotate(${rotation}deg)`,
              opacity: 0.9,
            }}
          >
            <Leaf className={`w-full h-full ${color}`} />
          </div>
        );
      })}
      <style>{`
        @keyframes falling-leaf {
          0% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(25vh) rotate(45deg); }
          50% { transform: translateY(50vh) rotate(90deg); }
          75% { transform: translateY(75vh) rotate(135deg); }
          100% { transform: translateY(100vh) rotate(180deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

/* 🦃 Gentle bird/turkey flight animation */
const TurkeyFlyAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => {
        const delay = Math.random() * 8;
        const duration = Math.random() * 15 + 10;
        const top = Math.random() * 80;

        return (
          <div
            key={i}
            className="absolute turkey"
            style={{
              top: `${top}%`,
              left: "-10%",
              animation: `turkey-fly ${duration}s ease-in-out ${delay}s infinite`,
            }}
          >
            <Bird className="w-6 h-6 text-amber-300/40 drop-shadow-[0_0_6px_rgba(255,200,0,0.3)]" />
          </div>
        );
      })}
      <style>{`
        @keyframes turkey-fly {
          0% { transform: translateX(0) translateY(0) rotate(0deg); }
          50% { transform: translateX(50vw) translateY(-10px) rotate(5deg); }
          100% { transform: translateX(110vw) translateY(0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

/* 🍁 Main Thanksgiving Header */
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
      <div className="bg-gradient-to-b from-amber-800 via-amber-700 to-orange-600 relative z-10 border-b border-yellow-500/30">
        <FallingLeaves />
        <TurkeyFlyAnimation />
        <div className="container px-4 py-3 relative z-10 flex justify-between items-center">
          <div className="w-20 h-16 bg-yellow-500/20 rounded-lg animate-pulse"></div>
          <div className="w-32 h-6 bg-orange-400/20 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex w-full items-center justify-center bg-cover bg-center bg-no-repeat border-b border-amber-400/30 shadow-lg"
      style={{
        backgroundImage: `linear-gradient(rgba(50,30,10,0.7), rgba(50,30,10,0.7)), url(${Background})`,
      }}
    >
      <FallingLeaves />
      <TurkeyFlyAnimation />

      <div className="container px-4 py-4 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* 🍂 Logo + Seasonal Flair */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <img
              src={logo}
              alt="Company Logo"
              className="w-16 sm:w-20 lg:w-24 h-auto cursor-pointer hover:scale-105 transition-transform duration-300 filter drop-shadow-[0_0_10px_rgba(255,200,0,0.3)]"
              onClick={() => navigate("/")}
            />
            <div className="hidden sm:flex items-center gap-1">
              <Leaf className="h-5 w-5 text-yellow-400 animate-pulse" />
              <Bird className="h-4 w-4 text-amber-200 animate-bounce" />
              <Leaf
                className="h-5 w-5 text-orange-400 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
          </div>

          {/* 🦃 User Section */}
          <div className="flex items-center justify-end w-full sm:w-auto">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                {/* Text */}
                <div className="flex flex-col items-end text-right">
                  <span className="text-xs sm:text-sm text-yellow-200 font-medium drop-shadow-sm">
                    🍂 Grateful Greetings
                  </span>
                  <span className="text-sm sm:text-base lg:text-lg font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                    {user.name}
                  </span>
                </div>

                {/* Notifications + Avatar */}
                <div className="flex items-center gap-3">
                  {user.isAdmin && <NotificationBell />}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-10 w-10 lg:h-12 lg:w-12 cursor-pointer border-2 border-amber-400 hover:border-orange-300 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/40">
                        <AvatarImage src={avatarUrl || undefined} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-600 to-orange-700 text-white font-bold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-56 sm:w-64 bg-amber-950 border border-amber-600 shadow-xl rounded-lg"
                    >
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-700/20 to-orange-700/10 rounded-t-lg">
                        <Avatar className="h-10 w-10 border border-amber-500">
                          <AvatarImage src={avatarUrl || undefined} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-amber-600 to-orange-700 text-white">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-semibold truncate text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-yellow-200 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <DropdownMenuSeparator className="bg-amber-600/30" />

                      <DropdownMenuItem
                        onClick={() => navigate("/profile/edit")}
                        className="cursor-pointer py-2 text-white hover:bg-amber-600/20"
                      >
                        <User className="mr-3 h-4 w-4 text-yellow-400" />
                        Profile Settings
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => navigate("/payslip")}
                        className="cursor-pointer py-2 text-white hover:bg-amber-600/20"
                      >
                        <Receipt className="mr-3 h-4 w-4 text-yellow-400" />
                        My Payslips
                      </DropdownMenuItem>

                      {(user.isAdmin || ["TM", "TL"].includes(user.role)) && (
                        <DropdownMenuItem
                          onClick={() => navigate("/schedule-and-attendance")}
                          className="cursor-pointer py-2 text-white hover:bg-amber-600/20"
                        >
                          <NotebookPenIcon className="mr-3 h-4 w-4 text-yellow-400" />
                          Shift & Attendance
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={() => navigate("/profile/change-password")}
                        className="cursor-pointer py-2 text-white hover:bg-amber-600/20"
                      >
                        <Key className="mr-3 h-4 w-4 text-yellow-400" />
                        Change Password
                      </DropdownMenuItem>

                      {user.isAdmin && (
                        <DropdownMenuItem
                          onClick={() => {
                            setAdminView(true);
                            navigate("/");
                          }}
                          className="cursor-pointer py-2 text-white hover:bg-amber-600/20"
                        >
                          <UserCog className="mr-3 h-4 w-4 text-yellow-400" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="bg-amber-600/30" />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/20 py-2 font-medium"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <Button
                className="text-xs sm:text-sm px-4 py-2 h-9 sm:h-10 bg-gradient-to-r from-amber-600 to-orange-700 text-white hover:from-amber-700 hover:to-orange-800 border border-amber-500 font-medium shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                asChild
              >
                <a
                  href="https://www.csvnow.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🦃 Visit Harvest Home
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
