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
  Receipt,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RealTimeClock from "./Realtime";

/* Main Header */
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
      <div className="w-full h-20 border-b border-gray-200">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="animate-pulse flex-1">
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Company Logo"
              className="w-20 h-auto cursor-pointer hover:opacity-80 transition-opacity duration-300"
              onClick={() => navigate("/")}
            />
            <div className="hidden sm:block h-10 w-px bg-gray-300"></div>

            {/* Desktop Clock */}
            <div className="hidden md:block">
              <RealTimeClock />
            </div>

          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                {user.isAdmin && (
                  <div className="hidden sm:block">
                    <NotificationBell />
                  </div>
                )}

                {/* User Dropdown */}
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="outline-none">
                        <Avatar className="h-12 w-12 border-2 border-gray-300 cursor-pointer hover:border-blue-500 transition-all duration-300 hover:scale-105">
                          <AvatarImage
                            src={avatarUrl || undefined}
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-64 bg-white border border-gray-200 shadow-xl rounded-lg"
                    >
                      {/* Profile Header */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border border-gray-300">
                            <AvatarImage
                              src={avatarUrl || undefined}
                              alt={user.name}
                            />
                            <AvatarFallback className="bg-blue-500 text-white">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-400 font-mono">
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

                      <DropdownMenuSeparator className="bg-gray-100" />

                      <div className="p-1">
                        {[
                          {
                            icon: User,
                            label: "Profile Settings",
                            path: "/profile/edit",
                          },
                          {
                            icon: Receipt,
                            label: "My Payslips",
                            path: "/payslip",
                          },
                          (user.isAdmin ||
                            ["TM", "TL"].includes(user.role)) && {
                            icon: NotebookPenIcon,
                            label: "Shift & Attendance",
                            path: "/schedule-and-attendance",
                          },
                          {
                            icon: Key,
                            label: "Change Password",
                            path: "/profile/change-password",
                          },
                          user.isAdmin && {
                            icon: UserCog,
                            label: "Admin Dashboard",
                            path: "/",
                          },
                          (user.isAdmin ||
                            ["TM", "TL"].includes(user.role)) && {
                            icon: NotebookPenIcon,
                            label: "Export Time",
                            path: "/exporttimetracker",
                          },
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
                              className="cursor-pointer px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-md transition-colors duration-150 flex items-center gap-3"
                            >
                              <item.icon className="h-4 w-4" />
                              <span className="text-sm">{item.label}</span>
                            </DropdownMenuItem>
                          ))}
                      </div>

                      <DropdownMenuSeparator className="bg-gray-100" />

                      <div className="p-1">
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="cursor-pointer px-3 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-150 flex items-center gap-3"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm font-medium">Logout</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* User Info for Desktop */}
                  <div className="hidden md:flex flex-col items-start text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-[150px]">
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Mobile Clock */}
                <div className="md:hidden">
                  <RealTimeClock />
                </div>

                {/* Mobile Notifications */}
                {user.isAdmin && (
                  <div className="sm:hidden">
                    <NotificationBell />
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="link"
                  className="border-gray-300 bg-[#5602FF] h-10"
                >
                  <a
                    href="https://www.csvnow.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white "
                  >
                    Landing Page
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
