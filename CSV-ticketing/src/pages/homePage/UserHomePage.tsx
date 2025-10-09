/* eslint-disable @typescript-eslint/no-explicit-any */
import { NteAPI, TicketAPi } from "@/API/endpoint";
import memo from "@/assets/AllTickets.webp";
import request from "@/assets/Checklist.webp";
import gethelp from "@/assets/g10.webp";
import ticket from "@/assets/Group.webp";
import test from "@/assets/login.webp";
import timetracker from "@/assets/timetracker.webp";
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
  AlertTriangle,
  Bell,
  ArrowRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
};

const notificationBadge = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0, 
    transition: { 
      type: "spring", 
      stiffness: 500,
      damping: 15
    } 
  },
  pulse: {
    scale: [1, 1.2, 1],
    transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
  },
};

const hoverEffect = {
  hover: { 
    scale: 1.05, 
    y: -8,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  tap: { scale: 0.95 }
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
        const response = await TicketAPi.getAllMemo();
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
        let count = 0;
        let tooltip = "";
        let exclamation = false;

        if (nteData[0].status === "PER") {
          if (!nteData[0].nte?.employeeSignatureDate) {
            count = 1;
            tooltip +=
              "Please confirm receipt of this notice by signing the NTE.\n";
          }
          if (!nteData[0].employeeFeedback?.responseDetail?.trim()) {
            count = 1;
            tooltip +=
              "Kindly submit your explanation within five (5) days from the date on which you received this notice";
          }
        }

        if (
          nteData[0].status === "PNODA" &&
          !nteData[0].noticeOfDecision?.employeeSignatureDate
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
      image: timetracker,
      path: "/timetracker",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      notification: 0
    },
    {
      id: 2,
      title: "Memo",
      description: "View company announcements and updates",
      icon: FileText,
      image: memo,
      path: "/all-memo",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      notification: unacknowledgedCount
    },
    {
      id: 3,
      title: "HR Support",
      description: "Request HR assistance and services",
      icon: Users,
      image: request,
      path: "/request-something",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      notification: 0
    },
    {
      id: 4,
      title: "IT Support",
      description: "Get technical help and assistance",
      icon: HeadphonesIcon,
      image: gethelp,
      path: "/create-ticket",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      notification: 0
    },
    {
      id: 5,
      title: "My Tickets",
      description: "View your support tickets and status",
      icon: Ticket,
      image: ticket,
      path: "/view-ticket",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50",
      notification: 0
    },
    {
      id: 6,
      title: "Employee Notice",
      description: "View disciplinary notices and updates",
      icon: AlertTriangle,
      image: test,
      path: "/nte",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      notification: nteNotificationCount,
      exclamation: showExclamation,
      tooltip: nteTooltip
    }
  ];

  return (
    <>
      <SurveyModal />
      
      {/* Main Container */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.section
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl shadow-lg mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            >
              <Bell className="h-10 w-10 text-white" />
            </motion.div>
            
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Welcome Back!
            </motion.h1>
            
            <motion.p
              className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Everything you need is just a click away! Select an option to proceed
            </motion.p>
          </motion.section>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                variants={item}
                whileHover="hover"
                whileTap="tap"
              >
                <TooltipProvider>
                  {feature.tooltip ? (
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <motion.div
                          variants={hoverEffect}
                          className="relative group cursor-pointer h-full"
                          onClick={() => navigate(feature.path)}
                        >
                          <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full ${feature.bgColor} group-hover:shadow-xl`}>
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                            
                            {/* Notification Badge */}
                            {(feature.notification > 0 || feature.exclamation) && (
                              <motion.div
                                className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg z-10"
                                variants={notificationBadge}
                                initial="initial"
                                animate={["animate", "pulse"]}
                              >
                                {feature.exclamation ? "!" : feature.notification}
                              </motion.div>
                            )}

                            {/* Content */}
                            <div className="relative p-6 flex flex-col items-center text-center h-full">
                              {/* Icon Container */}
                              <div className={`mb-4 p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="h-8 w-8 text-white" />
                              </div>

                              {/* Image */}
                              <div className="mb-4 transform group-hover:scale-105 transition-transform duration-300">
                                <img 
                                  src={feature.image} 
                                  alt={feature.title} 
                                  className="w-20 h-20 object-contain filter drop-shadow-lg"
                                />
                              </div>

                              {/* Text Content */}
                              <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                                  {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                  {feature.description}
                                </p>
                              </div>

                              {/* Action Indicator */}
                              <div className="flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors mt-2">
                                <span className="text-sm font-medium mr-2">Open</span>
                                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>

                            {/* Hover Border Effect */}
                            <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}>
                              <div className="absolute inset-[2px] rounded-lg bg-white" />
                            </div>
                          </Card>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className="p-4 max-w-xs bg-gray-900 text-white border-0 shadow-xl">
                        <p className="text-sm leading-relaxed">{feature.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <motion.div
                      variants={hoverEffect}
                      className="relative group cursor-pointer h-full"
                      onClick={() => navigate(feature.path)}
                    >
                      <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full ${feature.bgColor} group-hover:shadow-xl`}>
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                        
                        {/* Notification Badge */}
                        {feature.notification > 0 && (
                          <motion.div
                            className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg z-10"
                            variants={notificationBadge}
                            initial="initial"
                            animate={["animate", "pulse"]}
                          >
                            {feature.notification}
                          </motion.div>
                        )}

                        {/* Content */}
                        <div className="relative p-6 flex flex-col items-center text-center h-full">
                          {/* Icon Container */}
                          <div className={`mb-4 p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                            <feature.icon className="h-8 w-8 text-white" />
                          </div>

                          {/* Image */}
                          <div className="mb-4 transform group-hover:scale-105 transition-transform duration-300">
                            <img 
                              src={feature.image} 
                              alt={feature.title} 
                              className="w-20 h-20 object-contain filter drop-shadow-lg"
                            />
                          </div>

                          {/* Text Content */}
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                              {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                              {feature.description}
                            </p>
                          </div>

                          {/* Action Indicator */}
                          <div className="flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors mt-2">
                            <span className="text-sm font-medium mr-2">Open</span>
                            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>

                        {/* Hover Border Effect */}
                        <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}>
                          <div className="absolute inset-[2px] rounded-lg bg-white" />
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </TooltipProvider>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center mt-12 pt-8 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <p className="text-gray-500 text-sm">
              Need help? Contact support at{" "}
              <a href="mailto:support@company.com" className="text-blue-600 hover:text-blue-700 font-medium">
                support@company.com
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UserHome;