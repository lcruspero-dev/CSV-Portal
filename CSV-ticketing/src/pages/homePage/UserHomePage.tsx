/* eslint-disable @typescript-eslint/no-explicit-any */
import { NteAPI, TicketAPi } from "@/API/endpoint";
import SurveyModal from "@/components/kit/Survey";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  FileText,
  Users,
  HeadphonesIcon,
  Ticket,
  Bell,
  Briefcase,
  Shield,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  TableOfContents,
  Menu,
  X,
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  ChevronLeft,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Building2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TitleCase from "@/utils/titleCase";

// Animation variants
const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: -280,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
};

const overlayVariants = {
  open: { opacity: 1, visibility: "visible" as const },
  closed: { opacity: 0, visibility: "hidden" as const },
};

const UserHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [nteNotificationCount, setNteNotificationCount] = useState(0);
  const [nteTooltip, setNteTooltip] = useState("");
  const [showExclamation, setShowExclamation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const getUnacknowledgedCount = async () => {
      try {
        const response = await TicketAPi.getAllMemos();
        const unacknowledgedMemos = response.data.filter(
          (memo: { acknowledgedby: { userId: any }[] }) =>
            !memo.acknowledgedby?.some(
              (ack: { userId: any }) => ack.userId === user?._id,
            ),
        );
        setUnacknowledgedCount(unacknowledgedMemos.length);
      } catch (error) {
        console.error("Error fetching memos:", error);
      }
    };

    const getNteNotificationCount = async () => {
      try {
        if (!user) return;
        const response = await NteAPI.getNtesByUser();
        const nteData = response.data;

        if (!nteData || nteData.length === 0) {
          setNteNotificationCount(0);
          setShowExclamation(false);
          setNteTooltip("");
          return;
        }

        let count = 0;
        let tooltip = "";
        let exclamation = false;

        const currentNte = nteData[0];

        if (currentNte.status === "PER") {
          if (!currentNte.nte?.employeeSignatureDate) {
            count = 1;
            tooltip +=
              "Please confirm receipt of this notice by signing the NTE.\n";
          }
          if (!currentNte.employeeFeedback?.responseDetail?.trim()) {
            count = 1;
            tooltip +=
              "Kindly submit your explanation within five (5) days from the date on which you received this notice";
          }
        }

        if (
          currentNte.status === "PNODA" &&
          !currentNte.noticeOfDecision?.employeeSignatureDate
        ) {
          exclamation = true;
          tooltip +=
            "The decision has been finalized. Please take a moment to carefully read the NOD and acknowledge your receipt and understanding of its contents.";
        }

        setNteNotificationCount(count);
        setShowExclamation(exclamation);
        setNteTooltip(tooltip);
      } catch (error) {
        console.error("Error fetching NTE notifications:", error);
      }
    };

    if (user) {
      getUnacknowledgedCount();
      getNteNotificationCount();
    }
  }, [user]);

  const menuItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      color: "text-purple-600",
    },
    {
      id: "timetracker",
      title: "Time Tracker",
      icon: Clock,
      path: "/timetracker",
      color: "text-indigo-600",
      notification: 0,
    },
    {
      id: "memos",
      title: "Company Memos",
      icon: FileText,
      path: "/view-polMemo",
      color: "text-violet-600",
      notification: unacknowledgedCount,
    },
    {
      id: "hr",
      title: "HR Support",
      icon: Users,
      path: "/request-something",
      color: "text-blue-600",
      notification: 0,
    },
    {
      id: "it",
      title: "IT Support",
      icon: HeadphonesIcon,
      path: "/create-ticket",
      color: "text-cyan-600",
      notification: 0,
    },
    {
      id: "tickets",
      title: "My Tickets",
      icon: Ticket,
      path: "/view-ticket",
      color: "text-teal-600",
      notification: 0,
    },
    {
      id: "nte",
      title: "Employee Notice",
      icon: Bell,
      path: "/nte",
      color: "text-rose-600",
      notification: nteNotificationCount,
      exclamation: showExclamation,
      tooltip: nteTooltip,
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: "Help Center",
      icon: HelpCircle,
      path: "/help",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      id: 2,
      title: "User Manual",
      icon: TableOfContents,
      path: "/manual",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: 3,
      title: "Feedback",
      icon: MessageSquare,
      path: "/feedback",
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
  ];

  const statsCards = [
    {
      title: "Pending Actions",
      value: unacknowledgedCount + nteNotificationCount,
      icon: Bell,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "+12%",
    },
    {
      title: "Active Services",
      value: "6",
      icon: Briefcase,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      trend: "All active",
    },
    {
      title: "Account Status",
      value: "Active",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "Verified",
    },
    {
      title: "Recent Activity",
      value: "Last 7 days",
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      trend: "View details",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: "Time logged for today",
      time: "2 hours ago",
      icon: Clock,
      status: "completed",
    },
    {
      id: 2,
      title: "New memo released",
      time: "Yesterday",
      icon: FileText,
      status: "pending",
    },
    {
      id: 3,
      title: "IT ticket resolved",
      time: "2 days ago",
      icon: HeadphonesIcon,
      status: "completed",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50/30">
      <SurveyModal />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={isSidebarOpen ? "open" : "closed"}
        className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 z-50 flex flex-col shadow-xl"
      >
        {/* Sidebar Header with CSV Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* CSV Logo Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur-lg opacity-50"></div>
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  CSV Now
                </h1>
                <p className="text-xs text-gray-500">Employee Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-purple-200">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                {user?.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {TitleCase(user?.name) || "Employee"}
              </p>
              <p className="text-sm text-gray-500">
                {user?.position || "Employee"}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => navigate("/profile")}
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              Main Menu
            </p>
          </div>
          {menuItems.map((item) => (
            <TooltipProvider key={item.id} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center justify-between px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                      isActivePath(item.path)
                        ? "bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-r-4 border-purple-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`h-5 w-5 ${isActivePath(item.path) ? "text-purple-600" : "text-gray-500"}`}
                      />
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                  </motion.button>
                </TooltipTrigger>
                {item.tooltip && (
                  <TooltipContent
                    side="right"
                    className="max-w-xs bg-gray-900 text-white"
                  >
                    <div className="flex items-start gap-2">
                      <Bell className="h-4 w-4 text-rose-400 mt-0.5" />
                      <div className="leading-relaxed whitespace-pre-line text-sm">
                        {item.tooltip}
                      </div>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}

          <Separator className="my-4 mx-4 w-auto" />

          <div className="px-4 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              Quick Actions
            </p>
          </div>
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigation(action.path)}
              className="w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              <div className={`p-1.5 rounded-lg ${action.bgColor}`}>
                <action.icon className={`h-4 w-4 ${action.color}`} />
              </div>
              <span className="text-sm">{action.title}</span>
            </motion.button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        animate={isSidebarOpen && !isMobile ? "expanded" : "collapsed"}
        className={`min-h-screen transition-all duration-300 ${
          !isMobile && isSidebarOpen ? "lg:ml-72" : "ml-0"
        }`}
      >
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex"
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome back,{" "}
                  {TitleCase(user?.name?.split(" ")[0]) || "Employee"}!
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Here's what's happening with your work today.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="hidden sm:flex"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                          <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {stat.trend}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">
                      CSV Now Employee Portal
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    Your journey to excellence starts here
                  </h2>
                  <p className="text-purple-100 mb-4 max-w-2xl">
                    Access all your HR resources, track your time, and stay
                    updated with company announcements all in one place.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      className="bg-white text-purple-600 hover:bg-purple-50"
                      onClick={() => navigate("/timetracker")}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Clock In
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => navigate("/view-polMemo")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Memos
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Recent Activity Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Quick Access Cards */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Quick Access
                  </h2>
                  <Button variant="ghost" size="sm" className="text-purple-600">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {menuItems.slice(0, 4).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-purple-300 group"
                        onClick={() => handleNavigation(item.path)}
                      >
                        <div className="p-5">
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.id === "timetracker" &&
                              "Track your work hours and attendance"}
                            {item.id === "memos" &&
                              "Access company official memos and policies"}
                            {item.id === "hr" &&
                              "Request HR assistance and services"}
                            {item.id === "it" &&
                              "Get technical help and assistance"}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Recent Activity
                  </h2>
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <Card className="border border-gray-200">
                  <div className="p-5">
                    {recentActivities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className={
                          index !== recentActivities.length - 1
                            ? "mb-4 pb-4 border-b border-gray-100"
                            : ""
                        }
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              activity.status === "completed"
                                ? "bg-green-50"
                                : "bg-amber-50"
                            }`}
                          >
                            <activity.icon
                              className={`h-4 w-4 ${
                                activity.status === "completed"
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.title}
                              </p>
                              {activity.status === "completed" ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <AlertCircle className="h-3 w-3 text-amber-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-8 border-t border-gray-200"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                    <Building2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    CSV Now Employee Portal
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default UserHome;
