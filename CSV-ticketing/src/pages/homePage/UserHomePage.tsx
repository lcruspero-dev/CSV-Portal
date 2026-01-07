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
import { motion } from "framer-motion";
import {
  Clock,
  FileText,
  Users,
  HeadphonesIcon,
  Ticket,
  Bell,
  Sparkles,
  Home,
  Briefcase,
  Shield,
  HelpCircle,
  MessageSquare,
  UserCircle,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleCase from "@/utils/titleCase";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const notificationBadge = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15,
    },
  },
};

const hoverEffect = {
  hover: {
    y: -4,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  tap: { scale: 0.98 },
};

const UserHome = () => {
  const navigate = useNavigate();
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [nteNotificationCount, setNteNotificationCount] = useState(0);
  const [nteTooltip, setNteTooltip] = useState("");
  const [showExclamation, setShowExclamation] = useState(false);
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const getUnacknowledgedCount = async () => {
      try {
        const response = await TicketAPi.getAllMemos();
        const unacknowledgedMemos = response.data.filter(
          (memo: { acknowledgedby: { userId: any }[] }) =>
            !memo.acknowledgedby?.some(
              (ack: { userId: any }) => ack.userId === user?._id
            )
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

  const features = [
    {
      id: 1,
      title: "Time Tracker",
      description: "Track your work hours and attendance",
      icon: Clock,
      path: "/timetracker",
      color: "bg-gradient-to-br from-purple-600 to-indigo-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      borderColor: "border-purple-200",
      iconBg: "bg-gradient-to-br from-purple-600 to-indigo-600",
      iconColor: "text-purple-600",
      notification: 0,
    },
    {
      id: 2,
      title: "Company Memos",
      description: "Access company official memos and policies",
      icon: FileText,
      path: "/view-polMemo",
      color: "bg-gradient-to-br from-violet-600 to-purple-600",
      bgColor: "bg-gradient-to-br from-violet-50 to-purple-50",
      borderColor: "border-violet-200",
      iconBg: "bg-gradient-to-br from-violet-600 to-purple-600",
      iconColor: "text-violet-600",
      notification: unacknowledgedCount,
    },
    {
      id: 3,
      title: "HR Support",
      description: "Request HR assistance and services",
      icon: Users,
      path: "/request-something",
      color: "bg-gradient-to-br from-indigo-600 to-blue-600",
      bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50",
      borderColor: "border-indigo-200",
      iconBg: "bg-gradient-to-br from-indigo-600 to-blue-600",
      iconColor: "text-indigo-600",
      notification: 0,
    },
    {
      id: 4,
      title: "IT Support",
      description: "Get technical help and assistance",
      icon: HeadphonesIcon,
      path: "/create-ticket",
      color: "bg-gradient-to-br from-blue-600 to-cyan-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      iconBg: "bg-gradient-to-br from-blue-600 to-cyan-600",
      iconColor: "text-blue-600",
      notification: 0,
    },
    {
      id: 5,
      title: "My Tickets",
      description: "View your support tickets and status",
      icon: Ticket,
      path: "/view-ticket",
      color: "bg-gradient-to-br from-cyan-600 to-teal-600",
      bgColor: "bg-gradient-to-br from-cyan-50 to-teal-50",
      borderColor: "border-cyan-200",
      iconBg: "bg-gradient-to-br from-cyan-600 to-teal-600",
      iconColor: "text-cyan-600",
      notification: 0,
    },
    {
      id: 6,
      title: "Employee Notice",
      description: "View disciplinary notices and updates",
      icon: Bell,
      path: "/nte",
      color: "bg-gradient-to-br from-rose-600 to-pink-600",
      bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
      borderColor: "border-rose-200",
      iconBg: "bg-gradient-to-br from-rose-600 to-pink-600",
      iconColor: "text-rose-600",
      notification: nteNotificationCount,
      exclamation: showExclamation,
      tooltip: nteTooltip,
    },
  ];

  const quickLinks = [
    {
      id: 1,
      title: "Profile Settings",
      description: "Update your personal information",
      icon: UserCircle,
      path: "/profile",
      color: "text-purple-600",
    },
    {
      id: 2,
      title: "Help Center",
      description: "Get help and documentation",
      icon: HelpCircle,
      path: "/help",
      color: "text-indigo-600",
    },
    {
      id: 3,
      title: "Feedback",
      description: "Share your suggestions",
      icon: MessageSquare,
      path: "/feedback",
      color: "text-violet-600",
    },
  ];

  return (
    <>
      <SurveyModal />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                    <Home className="h-6 w-6 text-purple-600" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Dashboard
                  </h1>
                </div>
                <p className="text-gray-600">
                  Welcome back, {TitleCase(user?.name) || "Employee"}. Here's everything you need today.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {unacknowledgedCount + nteNotificationCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100">
                    <Bell className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Services</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">6</p>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-100">
                    <Briefcase className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Account Status</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">Active</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-100">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Features Grid */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Quick Access</h2>
              <span className="text-sm text-gray-500">Click to explore</span>
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {features.map((feature) => (
                <motion.div key={feature.id} variants={item}>
                  <TooltipProvider>
                    {feature.tooltip ? (
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <motion.div
                            variants={hoverEffect}
                            whileHover="hover"
                            whileTap="tap"
                            className="relative group cursor-pointer h-full"
                            onClick={() => navigate(feature.path)}
                          >
                            <Card className="relative overflow-hidden h-full border border-gray-200 bg-white hover:border-purple-300 transition-all duration-300 hover:shadow-lg rounded-xl">
                              {feature.notification > 0 && (
                                <motion.div
                                  className="absolute top-3 right-3 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg z-10"
                                  variants={notificationBadge}
                                  initial="initial"
                                  animate="animate"
                                >
                                  {feature.exclamation ? "!" : feature.notification}
                                </motion.div>
                              )}

                              <div className="p-5">
                                <div className="flex items-start gap-4">
                                  <div className={`p-3 rounded-xl ${feature.bgColor}`}>
                                    <div className={`p-2 rounded-lg ${feature.iconBg}`}>
                                      <feature.icon className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                        {feature.title}
                                      </h3>
                                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                      {feature.description}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className={`h-1 ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                            </Card>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent className="p-3 max-w-xs bg-white border border-gray-200 shadow-lg text-sm">
                          <div className="flex items-start gap-2">
                            <Bell className="h-4 w-4 text-rose-500 mt-0.5" />
                            <div className="leading-relaxed whitespace-pre-line">
                              {feature.tooltip}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <motion.div
                        variants={hoverEffect}
                        whileHover="hover"
                        whileTap="tap"
                        className="relative group cursor-pointer h-full"
                        onClick={() => navigate(feature.path)}
                      >
                        <Card className="relative overflow-hidden h-full border border-gray-200 bg-white hover:border-purple-300 transition-all duration-300 hover:shadow-lg rounded-xl">
                          {feature.notification > 0 && (
                            <motion.div
                              className="absolute top-3 right-3 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg z-10"
                              variants={notificationBadge}
                              initial="initial"
                              animate="animate"
                            >
                              {feature.notification}
                            </motion.div>
                          )}

                          <div className="p-5">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl ${feature.bgColor}`}>
                                <div className={`p-2 rounded-lg ${feature.iconBg}`}>
                                  <feature.icon className="h-5 w-5 text-white" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                    {feature.title}
                                  </h3>
                                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className={`h-1 ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        </Card>
                      </motion.div>
                    )}
                  </TooltipProvider>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Quick Links Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickLinks.map((link) => (
                <motion.div
                  key={link.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group cursor-pointer"
                  onClick={() => navigate(link.path)}
                >
                  <Card className="border border-gray-200 bg-white hover:border-purple-200 transition-all duration-300 p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-purple-50`}>
                        <link.icon className={`h-5 w-5 ${link.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {link.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">
                  CSV Now Employee Portal
                </p>
              </div>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UserHome;