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
  TooltipContent,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Edit,
  FileSpreadsheet,
  FileText,
  Menu,
  Tag,
  Ticket,
  UserPlus,
  Users,
  LayoutDashboard,
  Settings,
  Key,
  Shield,
  Home,
  CreditCard,
  Database,
  Lock,
  Bell,
  FileBarChart,
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
  icon?: React.ReactNode;
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

  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    Actions: true,
    Tickets: true,
    "Time Management": true,
    "Data Export": true,
    "Team Management": true,
  });

  const navGroups: NavGroup[] = [
    {
      name: "Actions",
      icon: <LayoutDashboard className="h-5 w-5" />,
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
          icon: <CreditCard className="h-5 w-5" />,
          badge: "New",
        },
      ],
    },
    {
      name: "Tickets",
      icon: <Ticket className="h-5 w-5" />,
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
      name: "Time Management",
      icon: <Clock className="h-5 w-5" />,
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
      name: "Data Export",
      icon: <Database className="h-5 w-5" />,
      items: [
        {
          title: "Export Memos",
          path: "/exportmemo",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: "Export Survey",
          path: "/exportsurveydata",
          icon: <FileBarChart className="h-5 w-5" />,
        },
        {
          title: "Export Tickets",
          path: "/exportdata",
          icon: <FileSpreadsheet className="h-5 w-5" />,
        },
      ],
    },
    {
      name: "Team Management",
      icon: <Users className="h-5 w-5" />,
      items: [
        {
          title: "Leave Credits",
          path: "/leavecredits",
          icon: <CalendarCheck className="h-5 w-5" />,
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
          icon: <Lock className="h-5 w-5" />,
        },
        {
          title: "Manage Survey",
          path: "/createsurvey",
          icon: <Settings className="h-5 w-5" />,
        },
        {
          title: "Notifications",
          path: "/notifications",
          icon: <Bell className="h-5 w-5" />,
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

  const toggleDropdown = (groupName: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const verifyPassword = () => {
    const correctPassword = import.meta.env.VITE_LEAVE_PASSWORD || "!CSV2024";
    if (password === correctPassword) {
      navigate(protectedPath);
      setIsPasswordDialogOpen(false);
      setPassword("");
      toast({
        title: "Access Granted",
        description: "Welcome to the protected section.",
        variant: "default",
      });
    } else {
      toast({
        title: "Incorrect Password",
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-gray-900 font-semibold">
                  Protected Section
                </DialogTitle>
                <div className="text-gray-600 text-sm mt-1">
                  This section requires additional authentication.
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Enter Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      verifyPassword();
                    }
                  }}
                />
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={verifyPassword}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                Verify & Continue
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
            className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg rounded-full border border-white"
          >
            <Menu className="h-5 w-5 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 bg-white">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                  <Home className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Admin Panel
                  </h2>
                  <p className="text-sm text-gray-600">Management Dashboard</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="px-4">
                {navGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6">
                    <Button
                      variant="ghost"
                      onClick={() => toggleDropdown(group.name)}
                      className="w-full justify-between px-2 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                          {group.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {group.name}
                        </span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-gray-400 transition-transform duration-200",
                          openDropdowns[group.name] ? "rotate-180" : ""
                        )}
                      />
                    </Button>

                    {openDropdowns[group.name] && (
                      <div className="ml-2 mt-2 space-y-1">
                        {group.items.map((item, index) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Button
                              key={index}
                              variant="ghost"
                              onClick={() => handleNavigation(item)}
                              className={cn(
                                "w-full justify-start gap-3 px-2 py-2.5 rounded-lg transition-colors",
                                isActive
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              )}
                            >
                              <div
                                className={cn(
                                  "p-1.5 rounded-md",
                                  isActive
                                    ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-600"
                                )}
                              >
                                {item.icon}
                              </div>
                              <span className="text-sm flex-1 text-left">
                                {item.title}
                              </span>
                              {item.protected && (
                                <Shield className="h-3.5 w-3.5 text-purple-500" />
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">CSV Now Admin v2.0</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0 bg-white border-r border-gray-200 shadow-sm",
          isOpen ? "w-64" : "w-20",
          isMounted ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center border-b border-gray-200 transition-all duration-300 flex-shrink-0",
            isOpen ? "justify-between p-6" : "justify-center p-4"
          )}
        >
          {isOpen && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                <Home className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-600">Management Console</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-lg transition-all duration-200 hover:bg-gray-100 border border-gray-300",
              isOpen ? "h-8 w-8" : "h-9 w-9"
            )}
            onClick={handleToggle}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <TooltipProvider delayDuration={300}>
            <nav className="flex flex-col px-3">
              {navGroups.map((group, groupIndex) => {
                // In collapsed state
                if (!isOpen) {
                  return (
                    <div key={groupIndex} className="mb-1">
                      {group.items.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                onClick={() => handleNavigation(item)}
                                className={cn(
                                  "w-full p-2 justify-center rounded-lg mb-1 transition-colors",
                                  isActive
                                    ? "bg-purple-50 text-purple-700"
                                    : "text-gray-600 hover:text-purple-700 hover:bg-gray-50"
                                )}
                              >
                                <div
                                  className={cn(
                                    "p-1.5 rounded-md",
                                    isActive
                                      ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
                                      : "bg-gray-100 text-gray-600"
                                  )}
                                >
                                  {item.icon}
                                </div>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <div className="flex items-center gap-2">
                                <span>{item.title}</span>
                                {item.protected && (
                                  <Shield className="h-3 w-3 text-purple-500" />
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  );
                }

                // In expanded state
                return (
                  <div key={groupIndex} className="mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => toggleDropdown(group.name)}
                      className={cn(
                        "w-full justify-between px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors",
                        openDropdowns[group.name] ? "bg-gray-50" : ""
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                          {group.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {group.name}
                        </span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-gray-400 transition-transform duration-200",
                          openDropdowns[group.name] ? "rotate-180" : ""
                        )}
                      />
                    </Button>

                    {openDropdowns[group.name] && (
                      <div className="ml-2 mt-2 space-y-1">
                        {group.items.map((item, index) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Button
                              key={index}
                              variant="ghost"
                              onClick={() => handleNavigation(item)}
                              className={cn(
                                "w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                isActive
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              )}
                            >
                              <div
                                className={cn(
                                  "p-1.5 rounded-md",
                                  isActive
                                    ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-600"
                                )}
                              >
                                {item.icon}
                              </div>
                              <span className="text-sm flex-1 text-left">
                                {item.title}
                              </span>
                              {item.protected && (
                                <Shield className="h-3.5 w-3.5 text-purple-500" />
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </TooltipProvider>
        </div>

        {/* Footer */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">CSV Now Admin Panel</p>
              <p className="text-xs text-gray-400">
                {new Date().getFullYear()}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
