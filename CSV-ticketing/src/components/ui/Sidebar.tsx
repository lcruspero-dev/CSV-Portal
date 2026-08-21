//React hooks
import React, { useEffect, useState } from "react";

// React router hooks
import { useLocation, useNavigate } from "react-router-dom";

// Utils
import { cn } from "@/lib/utils";

// Components
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

// Icons
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
  // CreditCard,
  Database,
  Lock,
  FileBarChart,
} from "lucide-react";

// Interfaces
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

//Types for the Nav Group
type NavGroup = {
  name: string;
  items: NavItem[];
  icon?: React.ReactNode;
};

//Types for the Nav Item
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

  // Nav gorup links
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
        // {
        //   title: "Payroll",
        //   path: "/payroll",
        //   icon: <CreditCard className="h-5 w-5" />,
        //   badge: "New",
        // },
        {
          title: "Memo Builder",
          path: "/memo-builder",
          icon: <FileText className="h-5 w-5" />,
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
        description: "Welcome to the leave section.",
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

  // Function to close mobile sheet
  const closeMobileSheet = () => {
    const closeButton = document.querySelector("[data-radix-collection-item]");
    if (closeButton) {
      (closeButton as HTMLElement).click();
    }
  };

  return (
    <>
      {/* Password Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                <Shield className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <DialogTitle className="font-semibold text-gray-900">
                  Protected Section
                </DialogTitle>
                <div className="mt-0.5 text-sm text-gray-500">
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
                  className="w-full rounded-lg pl-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      verifyPassword();
                    }
                  }}
                />
                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                className="rounded-lg border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={verifyPassword}
                className="rounded-lg bg-violet-600 text-white hover:bg-violet-700"
              >
                Verify & Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile & Tablet Sidebar - Visible on screens below 1024px (lg breakpoint) */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="fixed left-4 top-4 z-50 rounded-full border border-white bg-violet-600 shadow-lg hover:bg-violet-700"
            >
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="fixed z-[100] w-80 bg-white p-0">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b border-[#e8e8f0] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
                    <Home className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0f0f1a]">
                      Admin Panel
                    </h2>
                    <p className="text-xs text-[#9090a8]">
                      Management Dashboard
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <nav>
                  {navGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-5">
                      <button
                        onClick={() => toggleDropdown(group.name)}
                        className="flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-[#f8f8fb]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f5f8] text-[#6060a0]">
                            {group.icon}
                          </div>
                          <span className="text-sm font-semibold text-[#1a1a2e]">
                            {group.name}
                          </span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-[#c0c0d0] transition-transform duration-200",
                            openDropdowns[group.name] ? "rotate-180" : "",
                          )}
                        />
                      </button>

                      {openDropdowns[group.name] && (
                        <div className="ml-1.5 mt-1.5 space-y-0.5 border-l border-[#f0f0f6] pl-3">
                          {group.items.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  handleNavigation(item);
                                  closeMobileSheet();
                                }}
                                className={cn(
                                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors",
                                  isActive
                                    ? "bg-violet-50 text-violet-700"
                                    : "text-[#5a5a7a] hover:bg-[#f8f8fb] hover:text-[#1a1a2e]",
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md [&>svg]:h-4 [&>svg]:w-4",
                                    isActive
                                      ? "bg-violet-600 text-white"
                                      : "bg-[#f5f5f8] text-[#8080a0]",
                                  )}
                                >
                                  {item.icon}
                                </div>
                                <span className="flex-1 text-sm font-medium">
                                  {item.title}
                                </span>
                                {item.protected && (
                                  <Shield className="h-3.5 w-3.5 text-violet-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Footer */}
              <div className="border-t border-[#e8e8f0] p-4 text-center">
                <p className="text-xs text-[#b0b0c8]">CSV Now Admin</p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <div
          className={cn(
            "flex h-full flex-col border-r border-[#e8e8f0] bg-white shadow-sm transition-all duration-300 ease-in-out",
            isOpen ? "w-64" : "w-20",
            isMounted ? "opacity-100" : "opacity-0",
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex shrink-0 items-center border-b border-[#e8e8f0] transition-all duration-300",
              isOpen ? "justify-between p-5" : "justify-center p-4",
            )}
          >
            {isOpen && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                  <Home className="h-5 w-5 text-violet-600" />
                </div>
                <h2 className="text-sm font-bold text-[#0f0f1a]">
                  Admin Panel
                </h2>
              </div>
            )}
            <button
              className={cn(
                "flex items-center justify-center rounded-lg border border-[#e8e8f0] text-[#6060a0] transition-colors hover:bg-[#f8f8fb]",
                isOpen ? "h-8 w-8" : "h-9 w-9",
              )}
              onClick={handleToggle}
            >
              {isOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <TooltipProvider delayDuration={300}>
              <nav className="flex flex-col">
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
                                <button
                                  onClick={() => handleNavigation(item)}
                                  className={cn(
                                    "mb-1 flex w-full items-center justify-center rounded-xl p-2 transition-colors",
                                    isActive
                                      ? "bg-violet-50"
                                      : "hover:bg-[#f8f8fb]",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "flex h-8 w-8 items-center justify-center rounded-lg [&>svg]:h-4 [&>svg]:w-4",
                                      isActive
                                        ? "bg-violet-600 text-white"
                                        : "bg-[#f5f5f8] text-[#8080a0]",
                                    )}
                                  >
                                    {item.icon}
                                  </div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <div className="flex items-center gap-2">
                                  <span>{item.title}</span>
                                  {item.protected && (
                                    <Shield className="h-3 w-3 text-violet-500" />
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
                      <button
                        onClick={() => toggleDropdown(group.name)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-[#f8f8fb]",
                          openDropdowns[group.name] ? "bg-[#f8f8fb]" : "",
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f5f8] text-[#6060a0]">
                            {group.icon}
                          </div>
                          <span className="text-sm font-semibold text-[#1a1a2e]">
                            {group.name}
                          </span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-[#c0c0d0] transition-transform duration-200",
                            openDropdowns[group.name] ? "rotate-180" : "",
                          )}
                        />
                      </button>

                      {openDropdowns[group.name] && (
                        <div className="ml-1.5 mt-1.5 space-y-0.5 border-l border-[#f0f0f6] pl-3">
                          {group.items.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                              <button
                                key={index}
                                onClick={() => handleNavigation(item)}
                                className={cn(
                                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors",
                                  isActive
                                    ? "bg-violet-50 text-violet-700"
                                    : "text-[#5a5a7a] hover:bg-[#f8f8fb] hover:text-[#1a1a2e]",
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md [&>svg]:h-4 [&>svg]:w-4",
                                    isActive
                                      ? "bg-violet-600 text-white"
                                      : "bg-[#f5f5f8] text-[#8080a0]",
                                  )}
                                >
                                  {item.icon}
                                </div>
                                <span className="flex-1 text-sm font-medium">
                                  {item.title}
                                </span>
                                {item.protected && (
                                  <Shield className="h-3.5 w-3.5 text-violet-500" />
                                )}
                              </button>
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
        </div>
      </div>
    </>
  );
};

export default Sidebar;
