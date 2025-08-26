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
  FileOutput,
  FileSpreadsheet,
  FileText,
  Home,
  Menu,
  Tag,
  Ticket,
  UserPlus,
  Users,
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
          icon: <Home className="h-5 w-5" />,
        },
        {
          title: "Time Tracker",
          path: "/timetracker",
          icon: <Clock className="h-5 w-5" />,
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
          title: "Add Ticket Assignee",
          path: "/addassign",
          icon: <UserPlus className="h-5 w-5" />,
        },
        {
          title: "Add Ticket Category",
          path: "/addcategory",
          icon: <Tag className="h-5 w-5" />,
        },
      ],
    },
    {
      name: "Time Management",
      items: [
        {
          title: "Manage Time Record",
          path: "/timerecord",
          icon: <Edit className="h-5 w-5" />,
        },
        {
          title: "Export Time Tracker",
          path: "/exporttimetracker",
          icon: <CalendarCheck className="h-5 w-5" />,
        },
      ],
    },
    {
      name: "Data & Reports",
      items: [
        {
          title: "Export Memo Data",
          path: "/exportmemo",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: "Export Survey Data",
          path: "/exportsurveydata",
          icon: <FileOutput className="h-5 w-5" />,
        },
        {
          title: "Export Tickets Data",
          path: "/exportdata",
          icon: <FileSpreadsheet className="h-5 w-5" />,
        },
      ],
    },
    {
      name: "Administration",
      items: [
        {
          title: "Manage Leave Credits",
          path: "/leavecredits",
          icon: <FileText className="h-5 w-5" />,
          protected: true,
        },
        {
          title: "Manage Employees",
          path: "/manageemployees",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Reset Password",
          path: "/resetuserpassword",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Manage Survey",
          path: "/createsurvey",
          icon: <FileText className="h-5 w-5" />,
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
            <DialogDescription>
              Please enter the password to access this section.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="mt-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                verifyPassword();
              }
            }}
          />
          <div className="flex justify-end mt-4">
            <Button onClick={verifyPassword}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-10 bg-white/80 backdrop-blur-sm shadow-sm rounded-full"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                Dashboard
              </h2>
            </div>
            <nav className="flex-1 overflow-y-auto py-1">
              {navGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-2">
                  <div className="px-4 py-1">
                    <p className="text-sm font-medium text-slate-500">
                      {group.name}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item, index) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          onClick={() => handleNavigation(item)}
                          className={cn(
                            "w-full justify-start gap-3 px-4 py-1.5 rounded-lg mx-2",
                            isActive
                              ? "bg-slate-100 text-blue-600 font-medium"
                              : "hover:bg-slate-50 text-slate-700"
                          )}
                        >
                          <div
                            className={cn(
                              "p-1 rounded-md",
                              isActive ? "text-blue-600" : "text-slate-500"
                            )}
                          >
                            {item.icon}
                          </div>
                          <span>{item.title}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col transition-all duration-300 ease-in-out h-[89vh] sticky top-0 bg-white border-r shadow-sm",
          isOpen ? "w-64" : "w-20",
          isMounted ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-100"
            onClick={handleToggle}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <TooltipProvider>
          <nav className="flex flex-col px-2 flex-1 overflow-y-auto">
            {navGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-2">
                {isOpen && (
                  <div className="px-3 mb-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {group.name}
                    </p>
                  </div>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return isOpen ? (
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => handleNavigation(item)}
                        className={cn(
                          "w-full justify-start gap-3 px-3 py-1.5 rounded-lg",
                          isActive
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "hover:bg-slate-50 text-slate-700"
                        )}
                      >
                        <div
                          className={cn(
                            "p-1 rounded-md",
                            isActive ? "text-blue-600" : "text-slate-500"
                          )}
                        >
                          {item.icon}
                        </div>
                        <span className="text-sm">{item.title}</span>
                      </Button>
                    ) : (
                      <Tooltip key={index} delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={() => handleNavigation(item)}
                            className={cn(
                              "w-full p-2 justify-center rounded-lg",
                              isActive
                                ? "bg-blue-50 text-blue-600"
                                : "hover:bg-slate-50 text-slate-600"
                            )}
                          >
                            {item.icon}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-slate-800 text-white"
                        >
                          {item.title}
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
    </>
  );
};

export default Sidebar;
