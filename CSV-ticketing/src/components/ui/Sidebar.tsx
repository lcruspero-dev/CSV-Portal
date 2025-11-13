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
  Key,
  LogOut,
  Clover,
  Leaf,
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
      name: "Harvest Main",
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
      name: "Gratitude Management",
      items: [
        {
          title: "Manage Blessings",
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
      name: "Seasonal Time",
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
      name: "Harvest Data",
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
          title: "Export Blessings",
          path: "/exportdata",
          icon: <FileSpreadsheet className="h-5 w-5" />,
        },
      ],
    },
    {
      name: "Family Circle",
      items: [
        {
          title: "Leave Credits",
          path: "/leavecredits",
          icon: <FileText className="h-5 w-5" />,
          protected: true,
        },
        {
          title: "Family Members",
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
        title: "Access Granted! 🦃",
        description: "Welcome to the family circle with gratitude!",
        variant: "default",
        className: "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-400"
      });
    } else {
      toast({
        title: "Incorrect Blessing!",
        description: "The harvest password does not match.",
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
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-400">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-400">
                <Clover className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <DialogTitle className="text-amber-800">Protected Family Circle</DialogTitle>
                <DialogDescription className="text-amber-700">
                  This section requires harvest authentication.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your harvest password"
              className="w-full bg-white border-amber-400 text-amber-900 placeholder:text-amber-500"
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
                className="border-amber-400 text-amber-700 hover:bg-amber-100"
              >
                Cancel
              </Button>
              <Button 
                onClick={verifyPassword} 
                className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border border-amber-400"
              >
                <Key className="h-4 w-4" />
                Share Gratitude & Enter
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
            className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-amber-600 to-orange-600 backdrop-blur-sm shadow-2xl rounded-full border-2 border-amber-400 hover:bg-amber-500"
          >
            <Menu className="h-5 w-5 text-amber-100" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 border-r-0 bg-gradient-to-b from-amber-50 to-orange-100">
          <div className="flex flex-col h-full bg-gradient-to-b from-amber-50 to-orange-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-amber-300 bg-amber-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl border border-amber-400">
                  <Clover className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-serif">
                    🦃 Thanksgiving Portal
                  </h2>
                  <p className="text-sm text-amber-700">Family Management System</p>
                </div>
              </div>
            </div>

            {/* Navigation with Scroll */}
            <div className="flex-1 overflow-y-auto">
              <nav className="py-4 px-3">
                {navGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6">
                    <div className="px-3 mb-3">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider font-serif">
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
                              "w-full justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 group border-2",
                              isActive
                                ? "bg-gradient-to-r from-amber-200 to-orange-200 border-amber-400 text-amber-800 font-semibold shadow-lg"
                                : "border-transparent hover:border-amber-300 text-amber-700 hover:text-amber-800 bg-white/50 hover:bg-amber-100"
                            )}
                          >
                            <div
                              className={cn(
                                "p-2 rounded-lg transition-colors border",
                                isActive
                                  ? "bg-amber-500 text-white border-amber-400 shadow-sm"
                                  : "bg-amber-100 text-amber-600 border-amber-200 group-hover:bg-amber-500 group-hover:border-amber-400 group-hover:text-white"
                              )}
                            >
                              {item.icon}
                            </div>
                            <span className="flex-1 text-left">{item.title}</span>
                            {item.badge && (
                              <span className="px-2 py-1 text-xs bg-gradient-to-r from-green-500 to-amber-500 text-white rounded-full font-medium border border-green-400">
                                {item.badge}
                              </span>
                            )}
                            {item.protected && (
                              <Leaf className="h-3 w-3 text-amber-600 flex-shrink-0" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-amber-300 bg-amber-50">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/80 border border-amber-300">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center border border-amber-400">
                  <span className="text-white text-sm font-semibold">🍂</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-700 truncate">Family Admin</p>
                  <p className="text-xs text-amber-600 truncate">Harvest Coordinator</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-200">
                  <LogOut className="h-4 w-4 text-amber-600" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0 bg-gradient-to-b from-amber-50 to-orange-100 border-r border-amber-300 shadow-2xl",
          isOpen ? "w-64" : "w-20",
          isMounted ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center border-b border-amber-300 transition-all duration-300 flex-shrink-0",
          isOpen ? "justify-between p-4" : "justify-center p-3"
        )}>
          {isOpen && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl border border-amber-400">
                <Clover className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-serif">
                  Thanksgiving
                </h2>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-xl transition-all duration-200 hover:bg-amber-200 border border-amber-300",
              isOpen ? "h-8 w-8" : "h-9 w-9"
            )}
            onClick={handleToggle}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4 text-amber-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-amber-600" />
            )}
          </Button>
        </div>

        {/* Navigation with Scroll */}
        <div className="flex-1 overflow-y-auto">
          <TooltipProvider delayDuration={300}>
            <nav className="flex flex-col px-3 py-4">
              {navGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-6">
                  {isOpen && (
                    <div className="px-3 mb-3">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider font-serif">
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
                            "w-full justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative border-2",
                            isActive
                              ? "bg-gradient-to-r from-amber-200 to-orange-200 border-amber-400 text-amber-800 font-semibold shadow-lg"
                              : "border-transparent hover:border-amber-300 text-amber-700 hover:text-amber-800 bg-white/50 hover:bg-amber-100"
                          )}
                        >
                          <div
                            className={cn(
                              "p-2 rounded-lg transition-colors border flex-shrink-0",
                              isActive
                                ? "bg-amber-500 text-white border-amber-400 shadow-sm"
                                : "bg-amber-100 text-amber-600 border-amber-200 group-hover:bg-amber-500 group-hover:border-amber-400 group-hover:text-white"
                            )}
                          >
                            {item.icon}
                          </div>
                          <span className="flex-1 text-left text-sm">{item.title}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-xs bg-gradient-to-r from-green-500 to-amber-500 text-white rounded-full font-medium border border-green-400">
                              {item.badge}
                            </span>
                          )}
                          {item.protected && (
                            <Leaf className="h-3 w-3 text-amber-600 flex-shrink-0" />
                          )}
                        </Button>
                      ) : (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              onClick={() => handleNavigation(item)}
                              className={cn(
                                "w-full p-3 justify-center rounded-xl transition-all duration-200 group relative border-2",
                                isActive
                                  ? "bg-gradient-to-r from-amber-200 to-orange-200 border-amber-400 text-amber-800"
                                  : "border-transparent hover:border-amber-300 text-amber-700 hover:text-amber-800 bg-white/50 hover:bg-amber-100"
                              )}
                            >
                              <div
                                className={cn(
                                  "transition-colors",
                                  isActive
                                    ? "text-amber-600"
                                    : "text-amber-500 group-hover:text-amber-600"
                                )}
                              >
                                {item.icon}
                              </div>
                              {item.badge && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
                              )}
                              {item.protected && (
                                <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-gradient-to-r from-amber-50 to-orange-100 text-amber-800 px-3 py-2 rounded-lg border-2 border-amber-400 font-serif"
                            sideOffset={5}
                          >
                            <div className="flex items-center gap-2">
                              {item.icon}
                              <span>{item.title}</span>
                              {item.protected && <Leaf className="h-3 w-3 text-amber-600" />}
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
        </div>

        {/* User Profile - Desktop */}
        <div className={cn(
          "border-t border-amber-300 transition-all duration-300 flex-shrink-0",
          isOpen ? "p-4" : "p-3"
        )}>
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            isOpen ? "justify-start" : "justify-center"
          )}>
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 border border-amber-400">
              <span className="text-white text-sm font-semibold">🍂</span>
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-700 truncate">Family Admin</p>
                <p className="text-xs text-amber-600 truncate">Harvest Coordinator</p>
              </div>
            )}
            {isOpen && (
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-200">
                <LogOut className="h-4 w-4 text-amber-600" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;