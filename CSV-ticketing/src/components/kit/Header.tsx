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
import { Key, LogOut, NotebookPenIcon, User, UserCog, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Snowflakes = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(60)].map((_, i) => {
        const size = Math.random() * 15 + 10;
        const animationDuration = Math.random() * 15 + 15;
        const delay = Math.random() * 5;
        const left = Math.random() * 100;
        const opacity = Math.random() * 0.8 + 0.5;
        const topOffset = Math.random() * 100 - 100;

        return (
          <div
            key={i}
            className="absolute snowflake"
            style={{
              top: `${topOffset}vh`,
              left: `${left}vw`,
              width: `${size}px`,
              height: `${size}px`,
              animation: `fall ${animationDuration}s linear ${delay}s infinite`,
              opacity: opacity,
              filter: "brightness(1.5)",
            }}
          >
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <path
                d="M32 2 L32 62 M2 32 L62 32 M11 11 L53 53 M11 53 L53 11"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="32" cy="32" r="4" fill="white" />
            </svg>
          </div>
        );
      })}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(50vh) rotate(360deg);
            opacity: 0;
          }
        }
        .snowflake {
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
      <div className="bg-gradient-to-b from-[#5a95ff] to-[#bdd5ff] relative z-10">
        <Snowflakes />
        <div className="container px-4 py-3 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <img
              src={logo}
              alt="Logo"
              className="w-16 sm:w-20 h-auto"
            />
            <div className="flex items-center gap-3">
              <div className="w-24 sm:w-32 h-4 sm:h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#5a95ff] to-[#bdd5ff] relative z-10">
      <Snowflakes />
      <div className="container px-4 py-3 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt="Company Logo"
              className="w-16 sm:w-20 lg:w-24 h-auto cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate("/")}
            />
          </div>

          {/* User Section */}
          <div className="flex items-center justify-end w-full sm:w-auto">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                {/* Welcome and Name Section */}
                <div className="flex flex-col items-end text-right">
                  <span className="text-xs sm:text-sm text-white font-medium drop-shadow-sm">
                    Welcome
                  </span>
                  <span className="text-sm sm:text-base lg:text-lg font-bold text-white drop-shadow-md">
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
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 cursor-pointer border-2 border-white hover:border-blue-200 transition-all duration-200 hover:scale-105">
                        <AvatarImage
                          src={avatarUrl || undefined}
                          alt={user.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-blue-600 text-white text-xs sm:text-sm">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 sm:w-64">
                      <div className="flex items-center gap-3 p-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={avatarUrl || undefined}
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-blue-600 text-white">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-semibold truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleEditProfile}
                        className="cursor-pointer py-2"
                      >
                        <User className="mr-3 h-4 w-4" />
                        <span>Profile Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/payslip")}
                        className="cursor-pointer py-2"
                      >
                        <Receipt className="mr-3 h-4 w-4" />
                        <span>My Payslips</span>
                      </DropdownMenuItem>
                      {(user.isAdmin || user.role === "TM" || user.role === "TL") && (
                        <DropdownMenuItem
                          onClick={() => navigate("/schedule-and-attendance")}
                          className="cursor-pointer py-2"
                        >
                          <NotebookPenIcon className="mr-3 h-4 w-4" />
                          <span>Shift & Attendance</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={handleChangePassword}
                        className="cursor-pointer py-2"
                      >
                        <Key className="mr-3 h-4 w-4" />
                        <span>Change Password</span>
                      </DropdownMenuItem>
                      {user.isAdmin && (
                        <DropdownMenuItem
                          onClick={() => {
                            setAdminView(true);
                            navigate("/");
                          }}
                          className="cursor-pointer py-2"
                        >
                          <UserCog className="mr-3 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-600 hover:text-red-700 py-2"
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
                className="text-xs sm:text-sm px-4 py-2 h-9 sm:h-10 bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 font-medium"
                asChild
              >
                <a href="https://www.csvnow.com/" target="_blank" rel="noopener noreferrer">
                  Visit Landing
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