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
import { useAuth } from "@/context/useAuth";
import { Key, LogOut, NotebookPenIcon, User, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const Snowflakes = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(60)].map((_, i) => {
        const size = Math.random() * 15 + 10;
        const animationDuration = Math.random() * 15 + 15;
        const delay = Math.random() * 5;
        const left = Math.random() * 100;
        const opacity = Math.random() * 0.8 + 0.5;
        const topOffset = Math.random() * 100 - 100; // from -100vh to 0vh

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
        <div className="container p-5 relative z-10">
          <div className="flex flex-row justify-between">
            <img src={logo} alt="Logo" width={75} height={50} />
            <div className="flex items-center gap-4">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#5a95ff] to-[#bdd5ff] relative z-10">
      <Snowflakes />
      <div className="container p-4 relative z-10">
        <div className="flex flex-row justify-between">
          <div>
            <img
              src={logo}
              alt="Company Logo"
              width={75}
              height={50}
              onClick={() => navigate("/")}
              className="cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <span className="text-1xl drop-shadow-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
                  Welcome, {user.name}
                </span>
                {user.isAdmin && (
                  <div className="pr-4">
                    <NotificationBell />
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 cursor-pointer border-2 border-white hover:border-blue-300 transition-all">
                      <AvatarImage
                        src={avatarUrl || undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={avatarUrl || undefined}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate w-40">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleEditProfile}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    {(user.isAdmin ||
                      user.role === "TM" ||
                      user.role === "TL") && (
                      <DropdownMenuItem
                        onClick={() => navigate("/schedule-and-attendance")}
                        className="cursor-pointer"
                      >
                        <NotebookPenIcon className="mr-2 h-4 w-4" />
                        <span>Shift & Attendance</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleChangePassword}
                      className="cursor-pointer"
                    >
                      <Key className="mr-2 h-4 w-4" />
                      <span>Change Password</span>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem
                        onClick={() => {
                          setAdminView(true);
                          navigate("/");
                        }}
                        className="cursor-pointer"
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-500 hover:text-red-500"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <div>
                  <Link to="/sign-in">
                    <Button className="text-sm">Login</Button>
                  </Link>
                </div>
                <div>
                  <Link to="/sign-up">
                    <Button className="text-sm">Register</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
