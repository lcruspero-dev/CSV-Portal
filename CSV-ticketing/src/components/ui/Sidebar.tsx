import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
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
  Shield,
  Key,
  LogOut
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
      name: "Main",
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
      name: "Ticket Management",
      items: [
        {
          title: "Manage Tickets",
          path: "/all-tickets",
          icon: <Ticket className="h-5 w-5" />,
        },
        {
          title: "Add Assignee",
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
      name: "Data & Reports",
      items: [
        {
          title: "Export Memo",
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
      name: "Administration",
      items: [
        {
          title: "Leave Credits",
          path: "/leavecredits",
          icon: <FileText className="h-5 w-5" />,
          protected: true,
        },
        {
          title: "Employees",
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
        title: "Access Granted",
        description: "You now have access to the protected section.",
        variant: "default",
      });
    } else {
      toast({
        title: "Incorrect Password",
        description: "Please enter the correct password to proceed.",
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle>Protected Section</DialogTitle>
                <DialogDescription>
                  This section requires additional authentication.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  verifyPassword();
                }
              }}
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={verifyPassword} className="gap-2">
                <Key className="h-4 w-4" />
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
            className="md:hidden fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm shadow-lg rounded-full border border-gray-200 hover:bg-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 border-r-0">
          <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50/50">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Admin Portal
                  </h2>
                  <p className="text-sm text-gray-500">Management System</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              {navGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-6">
                  <div className="px-3 mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item, index) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          onClick={() => handleNavigation(item)}
                          className={cn(
                            "w-full justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                            isActive
                              ? "bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 text-blue-700 font-semibold shadow-sm"
                              : "hover:bg-gray-100/80 text-gray-700 hover:text-gray-900 border border-transparent"
                          )}
                        >
                          <div
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              isActive
                                ? "bg-blue-500 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                            )}
                          >
                            {item.icon}
                          </div>
                          <span className="flex-1 text-left">{item.title}</span>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium">
                              {item.badge}
                            </span>
                          )}
                          {item.protected && (
                            <Shield className="h-3 w-3 text-blue-500 flex-shrink-0" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                  <p className="text-xs text-gray-500 truncate">Administrator</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <LogOut className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0 bg-white border-r border-gray-200/60 shadow-sm",
          isOpen ? "w-64" : "w-20",
          isMounted ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center border-b border-gray-200/60 transition-all duration-300",
          isOpen ? "justify-between p-4" : "justify-center p-3"
        )}>
          {isOpen && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Portal
                </h2>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-xl transition-all duration-200 hover:bg-gray-100",
              isOpen ? "h-8 w-8" : "h-9 w-9"
            )}
            onClick={handleToggle}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <TooltipProvider delayDuration={300}>
          <nav className="flex flex-col px-3 py-4 flex-1 overflow-y-auto">
            {navGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-6">
                {isOpen && (
                  <div className="px-3 mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.name}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return isOpen ? (
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => handleNavigation(item)}
                        className={cn(
                          "w-full justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                          isActive
                            ? "bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 text-blue-700 font-semibold shadow-sm"
                            : "hover:bg-gray-100/80 text-gray-700 hover:text-gray-900 border border-transparent"
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-colors flex-shrink-0",
                            isActive
                              ? "bg-blue-500 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                          )}
                        >
                          {item.icon}
                        </div>
                        <span className="flex-1 text-left text-sm">{item.title}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                        {item.protected && (
                          <Shield className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        )}
                      </Button>
                    ) : (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={() => handleNavigation(item)}
                            className={cn(
                              "w-full p-3 justify-center rounded-xl transition-all duration-200 group relative",
                              isActive
                                ? "bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 text-blue-700"
                                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                            )}
                          >
                            <div
                              className={cn(
                                "transition-colors",
                                isActive
                                  ? "text-blue-600"
                                  : "text-gray-500 group-hover:text-gray-700"
                              )}
                            >
                              {item.icon}
                            </div>
                            {item.badge && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
                            )}
                            {item.protected && (
                              <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700"
                          sideOffset={5}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <span>{item.title}</span>
                            {item.protected && <Shield className="h-3 w-3 text-blue-400" />}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </TooltipProvider>

        {/* User Profile - Desktop */}
        <div className={cn(
          "border-t border-gray-200/60 transition-all duration-300",
          isOpen ? "p-4" : "p-3"
        )}>
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            isOpen ? "justify-start" : "justify-center"
          )}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
            )}
            {isOpen && (
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <LogOut className="h-4 w-4 text-gray-500" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;