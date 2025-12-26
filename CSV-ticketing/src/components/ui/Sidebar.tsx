import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  FileSpreadsheet,
  FileText,
  Menu,
  Tag,
  Ticket,
  UserPlus,
  Users,
  BadgeDollarSign,
  LayoutDashboard,
  Settings,
  BarChart3,
  Key,
  Gift,
  Shield,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

type NavGroup = {
  name: string;
  items: NavItem[];
};

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  protected?: boolean;
  badge?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [protectedPath, setProtectedPath] = useState("");
  const { toast } = useToast();

  const navGroups: NavGroup[] = [
    {
      name: "Actions",
      items: [
        {
          title: "Dashboard",
          path: "/",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: "Time Tracker",
          path: "/timetracker",
          icon: <Clock className="h-5 w-5" />,
        },
        {
          title: "Payroll",
          path: "/payroll",
          icon: <BadgeDollarSign className="h-5 w-5" />,
          badge: "New",
        },
      ],
    },
    {
      name: "Tickets",
      items: [
        {
          title: "Manage Tickets",
          path: "/all-tickets",
          icon: <Ticket className="h-5 w-5" />,
        },
        {
          title: "Add Helper",
          path: "/addassign",
          icon: <UserPlus className="h-5 w-5" />,
        },
        {
          title: "Add Category",
          path: "/addcategory",
          icon: <Tag className="h-5 w-5" />,
        },
      ],
    },
    {
      name: "Time",
      items: [
        {
          title: "Time Records",
          path: "/timerecord",
          icon: <Edit className="h-5 w-5" />,
        },
        {
          title: "Export Tracker",
          path: "/exporttimetracker",
          icon: <CalendarCheck className="h-5 w-5" />,
        },
      ],
    },
    {
      name: "Data",
      items: [
        {
          title: "Export Memos",
          path: "/exportmemo",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: "Export Survey",
          path: "/exportsurveydata",
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          title: "Export Tickets",
          path: "/exportdata",
          icon: <FileSpreadsheet className="h-5 w-5" />,
        },
      ],
    },
    {
      name: "Team",
      items: [
        {
          title: "Leave Credits",
          path: "/leavecredits",
          icon: <FileText className="h-5 w-5" />,
          protected: true,
        },
        {
          title: "Team Members",
          path: "/manageemployees",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Reset Password",
          path: "/resetuserpassword",
          icon: <Key className="h-5 w-5" />,
        },
        {
          title: "Manage Survey",
          path: "/createsurvey",
          icon: <Settings className="h-5 w-5" />,
        },
      ],
    },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleSidebar();
  };

  const verifyPassword = () => {
    const correctPassword = import.meta.env.VITE_LEAVE_PASSWORD || "!CSV2024";
    if (password === correctPassword) {
      navigate(protectedPath);
      setIsPasswordDialogOpen(false);
      setPassword("");
      toast({
        title: "Access Granted!",
        description: "Welcome!",
        variant: "default",
        className:
          "bg-gradient-to-r from-red-600 to-green-600 text-white border-red-400",
      });
    } else {
      toast({
        title: "Incorrect Password!",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProtectedNavigation = (path: string) => {
    setProtectedPath(path);
    setIsPasswordDialogOpen(true);
  };

  const handleNavigation = (item: NavItem) => {
    if (item.protected) {
      handleProtectedNavigation(item.path);
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Password Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-red-50 via-white to-green-50 border-2 border-red-400 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-green-500 rounded-lg border border-red-400 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-red-700 font-bold">
                  Protected Section
                </DialogTitle>
                <div className="text-green-700 text-sm mt-1">
                  This section requires a secret password.
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/80 border-red-400 text-red-900 placeholder:text-red-500 pl-10 focus:ring-red-500 focus:border-red-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    verifyPassword();
                  }
                }}
              />
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                className="border-red-400 text-red-700 hover:bg-red-50"
              >
                Cancel
              </Button>
              <Button
                onClick={verifyPassword}
                className="gap-2 bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white border border-red-400 shadow-lg"
              >
                <Gift className="h-4 w-4" />
                Enter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-red-600 to-green-600 backdrop-blur-sm shadow-2xl rounded-full border-2 border-white/30 hover:from-red-700 hover:to-green-700 transition-all duration-300"
          >
            <Menu className="h-5 w-5 text-white" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-80 p-0 border-r-0 bg-gradient-to-b from-red-50 via-white to-green-50"
        >
          <div className="flex flex-col h-full bg-gradient-to-b from-red-50 via-white to-green-50">
            {/* Navigation with Scroll */}
            <div className="flex-1 overflow-y-auto">
              <nav className="py-4 px-3">
                {navGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6">
                    <div className="px-3 mb-3">
                      <div className="text-xs font-semibold text-red-600 uppercase tracking-wider font-serif flex items-center gap-2">
                        {group.name}
                        <div className="flex-1 h-px bg-gradient-to-r from-red-200 to-green-200" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {group.items.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Button
                            key={index}
                            variant="ghost"
                            onClick={() => handleNavigation(item)}
                            className={cn(
                              "w-full justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative border-2 overflow-hidden",
                              isActive
                                ? "bg-gradient-to-r from-red-200 to-green-200 border-red-400 text-red-800 font-semibold shadow-lg"
                                : "border-transparent hover:border-red-300 text-gray-700 hover:text-red-800 bg-white/80 hover:bg-red-50/50"
                            )}
                          >
                            <div
                              className={cn(
                                "p-2 rounded-lg transition-all duration-300 border relative z-10",
                                isActive
                                  ? "bg-gradient-to-r from-red-500 to-green-500 text-white border-red-400 shadow-lg scale-110"
                                  : "bg-gradient-to-r from-red-200 to-green-100 text-red-600 border-red-200 group-hover:from-red-500 group-hover:to-green-500 group-hover:border-red-400 group-hover:text-white group-hover:scale-110"
                              )}
                            >
                              {item.icon}
                            </div>
                            <span className="flex-1 text-left relative z-10">
                              {item.title}
                            </span>

                            {item.protected && (
                              <Shield className="h-3 w-3 text-red-600 flex-shrink-0 relative z-10" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0 bg-gradient-to-b from-red-50 via-white to-green-50 border-r border-red-300 shadow-2xl",
          isOpen ? "w-64" : "w-20",
          isMounted ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-red-300 transition-all duration-300 flex-shrink-0 relative",
            isOpen ? "justify-between p-4" : "justify-center p-3"
          )}
        >
          {isOpen && (
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-red-600 via-green-600 to-blue-600 bg-clip-text text-transparent font-serif">
                  Welcome {}
                </h2>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-xl transition-all duration-200 hover:bg-red-100 border border-red-300 shadow-sm relative",
              isOpen ? "h-8 w-8" : "h-9 w-9"
            )}
            onClick={handleToggle}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4 text-red-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-red-600" />
            )}
          </Button>
        </div>

        {/* Navigation with Scroll */}
        <div className="flex-1 overflow-y-auto py-4">
          <TooltipProvider delayDuration={300}>
            <nav className="flex flex-col px-3">
              {navGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-6">
                  {isOpen && (
                    <div className="px-3 mb-3">
                      <div className="text-xs font-semibold text-red-600 uppercase tracking-wider font-serif flex items-center gap-2">
                        {group.name}
                        <div className="flex-1 h-px bg-gradient-to-r from-red-200 to-green-200" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    {group.items.map((item, index) => {
                      const isActive = location.pathname === item.path;
                      return isOpen ? (
                        <Button
                          key={index}
                          variant="ghost"
                          onClick={() => handleNavigation(item)}
                          className={cn(
                            "w-full justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative border-2 overflow-hidden",
                            isActive
                              ? "bg-gradient-to-r from-red-200 to-green-200 border-red-400 text-red-800 font-semibold shadow-lg"
                              : "border-transparent hover:border-red-300 text-gray-700 hover:text-red-800 bg-white/80 hover:bg-red-50/50"
                          )}
                        >
                          <div className="p-2 rounded-lg transition-all duration-300 border relative z-10 flex-shrink-0">
                            {item.icon}
                          </div>
                          <span className="flex-1 text-left text-sm relative z-10">
                            {item.title}
                          </span>
                          {item.protected && (
                            <Shield className="h-3 w-3 text-red-600 flex-shrink-0 relative z-10" />
                          )}
                        </Button>
                      ) : (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              onClick={() => handleNavigation(item)}
                              className={cn(
                                "w-full p-3 justify-center rounded-xl transition-all duration-200 group relative border-2 overflow-hidden",
                                isActive
                                  ? "bg-gradient-to-r from-red-200 to-green-200 border-red-400 text-red-800 shadow-lg"
                                  : "border-transparent hover:border-red-300 text-gray-700 hover:text-red-800 bg-white/80 hover:bg-red-50/50"
                              )}
                            >
                              <div
                                className={cn(
                                  "transition-colors relative z-10",
                                  isActive
                                    ? "text-white"
                                    : "text-red-600 group-hover:text-white"
                                )}
                              >
                                {item.icon}
                              </div>
                            </Button>
                          </TooltipTrigger>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </TooltipProvider>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-spin {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
