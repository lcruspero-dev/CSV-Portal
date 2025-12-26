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
  ArrowRight,
  Gift,
  Star,
  Snowflake,
  TreePine,
  CandyCane,
  Bell,
  Sparkles,
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
      color: "from-red-500 to-rose-600",
      bgColor: "bg-gradient-to-br from-red-50/90 to-rose-100/90 backdrop-blur-sm",
      borderColor: "border-red-300",
      textColor: "text-red-900",
      iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
      decoration: "🎄",
      notification: 0,
      pattern: "snowflakes"
    },
    {
      id: 2,
      title: "Company Memos",
      description: "Access company official memos and policies",
      icon: FileText,
      path: "/view-polMemo",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50/90 to-emerald-100/90 backdrop-blur-sm",
      borderColor: "border-green-300",
      textColor: "text-green-900",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
      decoration: "📜",
      notification: unacknowledgedCount,
      pattern: "holly"
    },
    {
      id: 3,
      title: "HR Support",
      description: "Request HR assistance and services",
      icon: Users,
      path: "/request-something",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-blue-50/90 to-indigo-100/90 backdrop-blur-sm",
      borderColor: "border-blue-300",
      textColor: "text-blue-900",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      decoration: "👥",
      notification: 0,
      pattern: "stars"
    },
    {
      id: 4,
      title: "IT Support",
      description: "Get technical help and assistance",
      icon: HeadphonesIcon,
      path: "/create-ticket",
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-gradient-to-br from-purple-50/90 to-violet-100/90 backdrop-blur-sm",
      borderColor: "border-purple-300",
      textColor: "text-purple-900",
      iconBg: "bg-gradient-to-br from-purple-500 to-violet-600",
      decoration: "💻",
      notification: 0,
      pattern: "candycanes"
    },
    {
      id: 5,
      title: "My Tickets",
      description: "View your support tickets and status",
      icon: Ticket,
      path: "/view-ticket",
      color: "from-yellow-500 to-amber-600",
      bgColor: "bg-gradient-to-br from-yellow-50/90 to-amber-100/90 backdrop-blur-sm",
      borderColor: "border-yellow-300",
      textColor: "text-yellow-900",
      iconBg: "bg-gradient-to-br from-yellow-500 to-amber-600",
      decoration: "🎫",
      notification: 0,
      pattern: "gifts"
    },
    {
      id: 6,
      title: "Employee Notice",
      description: "View disciplinary notices and updates",
      icon: Bell,
      path: "/nte",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-gradient-to-br from-orange-50/90 to-red-100/90 backdrop-blur-sm",
      borderColor: "border-orange-300",
      textColor: "text-orange-900",
      iconBg: "bg-gradient-to-br from-orange-500 to-red-600",
      decoration: "🔔",
      notification: nteNotificationCount,
      exclamation: showExclamation,
      tooltip: nteTooltip,
      pattern: "bells"
    }
  ];

  // Christmas floating elements
  const floatingElement = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Pattern backgrounds
  const patterns = {
    snowflakes: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    holly: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M20 10c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8zm-4 28c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm28-4c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    stars: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    candycanes: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M40 4h-4v8h4V4zm0 8h-4v8h4v-8zm-12 0h-4v8h4v-8zm-12 0h-4v8h4v-8zm24 16h-4v8h4v-8zm-12 0h-4v8h4v-8zm-12 0h-4v8h4v-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    gifts: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M20 12h20v8H20v-8zm0 8v16h20V20H20zm8 8h4v8h-4v-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    bells: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M28 12h4v24h-4V12zm-8 8h20v4H20v-4zm-4 8h28v4H16v-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  };

  return (
    <>
      <SurveyModal />
      
      {/* Main Container */}
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8 relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-green-50">
        {/* Christmas Decorations with Glow */}
        <motion.div
          className="absolute top-8 left-8 opacity-60 hidden sm:block"
          variants={floatingElement}
          animate="animate"
        >
          <div className="relative">
            <Snowflake className="h-10 w-10 text-blue-300 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-40" />
          </div>
        </motion.div>
        
        <motion.div
          className="absolute top-24 right-12 opacity-50 hidden sm:block"
          variants={floatingElement}
          animate="animate"
          style={{ animationDelay: '1s' }}
        >
          <div className="relative">
            <Star className="h-8 w-8 text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm opacity-30" />
          </div>
        </motion.div>
        
        <motion.div
          className="absolute bottom-32 left-20 opacity-40 hidden sm:block"
          variants={floatingElement}
          animate="animate"
          style={{ animationDelay: '2s' }}
        >
          <div className="relative">
            <CandyCane className="h-9 w-9 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
            <div className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-20" />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-16 right-16 opacity-30 hidden sm:block"
          variants={floatingElement}
          animate="animate"
          style={{ animationDelay: '1.5s' }}
        >
          <div className="relative">
            <Gift className="h-12 w-12 text-green-400 drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]" />
            <div className="absolute inset-0 bg-green-500 rounded-full blur-sm opacity-25" />
          </div>
        </motion.div>

        {/* Christmas Light Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#22c55e' : '#3b82f6',
                boxShadow: `0 0 15px ${i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#22c55e' : '#3b82f6'}`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto mt-8 relative z-10">
          {/* Header Section */}
          <motion.section
            className="text-center mb-8 sm:mb-10 lg:mb-12 px-2 sm:px-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <TreePine className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mr-3 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-30" />
              </div>
            </motion.div>
            
            <motion.h1
              className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-5 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-green-600 to-blue-600 leading-tight sm:leading-snug font-serif drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              🎄 Merry Christmas & Happy Holidays! 🎅
            </motion.h1>
            
            <motion.div
              className="text-blue-700 text-sm sm:text-base max-w-2xl mx-auto bg-gradient-to-r from-red-100 via-white to-green-100 rounded-lg py-2 px-4 border border-red-200/30 shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Wishing you a joyful holiday season! Everything you need in one place.
            </motion.div>
          </motion.section>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 xl:gap-8 px-2 sm:px-0"
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
                className="h-full"
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
                          {/* Enhanced Christmas Card */}
                          <Card className={`relative overflow-hidden border-3 ${feature.borderColor} shadow-xl hover:shadow-2xl transition-all duration-300 h-full ${feature.bgColor} group-hover:shadow-red-500/20 rounded-xl sm:rounded-2xl`}>
                            {/* Christmas Pattern Overlay */}
                            <div 
                              className="absolute inset-0 opacity-5"
                              style={{ backgroundImage: patterns[feature.pattern as keyof typeof patterns] }}
                            />
                            
                            {/* Christmas Corner Decorations */}
                            <div className="absolute -top-2 -left-2 text-xl opacity-60">
                              {feature.decoration}
                            </div>
                            <div className="absolute -top-2 -right-2 text-xl opacity-60">
                              {feature.decoration}
                            </div>
                            <div className="absolute -bottom-2 -left-2 text-xl opacity-60">
                              {feature.decoration}
                            </div>
                            <div className="absolute -bottom-2 -right-2 text-xl opacity-60">
                              {feature.decoration}
                            </div>

                            {/* Animated Christmas Lights Border */}
                            <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                              {/* Top Lights */}
                              <div className="absolute top-0 left-0 right-0 h-1 flex justify-between px-2">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-2 h-2 rounded-full animate-pulse"
                                    style={{
                                      backgroundColor: i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#22c55e' : '#3b82f6',
                                      boxShadow: `0 0 8px ${i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#22c55e' : '#3b82f6'}`,
                                      animationDelay: `${i * 0.2}s`,
                                    }}
                                  />
                                ))}
                              </div>
                              {/* Bottom Lights */}
                              <div className="absolute bottom-0 left-0 right-0 h-1 flex justify-between px-2">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-2 h-2 rounded-full animate-pulse"
                                    style={{
                                      backgroundColor: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#ef4444' : '#22c55e',
                                      boxShadow: `0 0 8px ${i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#ef4444' : '#22c55e'}`,
                                      animationDelay: `${i * 0.2 + 0.1}s`,
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {/* Animated Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                            
                            {/* Glow Effect */}
                            <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500`} />

                            {/* Notification Badge with Christmas Theme */}
                            {(feature.notification > 0 || feature.exclamation) && (
                              <motion.div
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-br from-red-500 to-green-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg z-10 border-2 border-white"
                                variants={notificationBadge}
                                initial="initial"
                                animate={["animate", "pulse"]}
                              >
                                {feature.exclamation ? "!" : feature.notification}
                              </motion.div>
                            )}

                            {/* Content */}
                            <div className="relative p-4 sm:p-5 lg:p-6 flex flex-col items-center text-center h-full">
                              {/* Icon Container with Christmas Ribbon */}
                              <div className="relative mb-3 sm:mb-4">
                                <div className={`p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl ${feature.iconBg} shadow-lg transform group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300 border-2 border-white/50 relative z-10`}>
                                  <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white relative z-10" />
                                  {/* Icon Glow */}
                                  <div className="absolute inset-0 bg-white/20 blur-sm rounded-xl sm:rounded-2xl" />
                                </div>
                                {/* Christmas Ribbon */}
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-gradient-to-r from-red-500 to-green-500 rounded-sm border border-white/50"></div>
                              </div>

                              {/* Text Content */}
                              <div className="flex-1 flex flex-col justify-center w-full">
                                <h3 className={`text-lg sm:text-xl font-bold ${feature.textColor} mb-1 sm:mb-2 group-hover:text-red-700 transition-colors leading-tight line-clamp-2 font-serif`}>
                                  <span className="relative">
                                    {feature.title}
                                    <Sparkles className="absolute -right-4 -top-1 h-3 w-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </span>
                                </h3>
                                <div className={`text-gray-600 text-xs sm:text-sm leading-relaxed sm:leading-normal mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3`}>
                                  {feature.description}
                                </div>
                              </div>

                              {/* Action Indicator with Christmas Theme */}
                              <div className="flex items-center justify-center gap-2 text-red-600 group-hover:text-red-700 transition-colors mt-1 sm:mt-2">
                                <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-red-100 to-green-100 px-2 py-1 rounded-full border border-red-200">
                                  🎄 Explore now
                                </span>
                                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transform group-hover:translate-x-2 transition-transform group-hover:text-red-500" />
                              </div>
                            </div>

                            {/* Hover Border Effect */}
                            <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`}>
                              <div className="absolute inset-[2px] sm:inset-[3px] rounded-xl sm:rounded-2xl bg-white" />
                            </div>

                            {/* Falling Snow Inside Card */}
                            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-500">
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className="absolute w-1 h-1 bg-white rounded-full"
                                  style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    animation: `snowfall 5s linear infinite`,
                                    animationDelay: `${i * 1}s`,
                                    opacity: 0.7,
                                  }}
                                />
                              ))}
                            </div>
                          </Card>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className="p-3 sm:p-4 max-w-xs sm:max-w-sm bg-gradient-to-br from-red-50 to-green-50 text-gray-800 border-2 border-red-300 shadow-xl text-xs sm:text-sm">
                        <div className="flex items-start gap-2">
                          <div className="p-1 bg-gradient-to-r from-red-500 to-green-500 rounded border border-red-400">
                            <Bell className="h-3 w-3 text-white" />
                          </div>
                          <div className="leading-relaxed whitespace-pre-line">{feature.tooltip}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <motion.div
                      variants={hoverEffect}
                      className="relative group cursor-pointer h-full"
                      onClick={() => navigate(feature.path)}
                    >
                      {/* Enhanced Christmas Card */}
                      <Card className={`relative overflow-hidden border-3 ${feature.borderColor} shadow-xl hover:shadow-2xl transition-all duration-300 h-full ${feature.bgColor} group-hover:shadow-red-500/20 rounded-xl sm:rounded-2xl`}>
                        {/* Christmas Pattern Overlay */}
                        <div 
                          className="absolute inset-0 opacity-5"
                          style={{ backgroundImage: patterns[feature.pattern as keyof typeof patterns] }}
                        />
                        
                        {/* Christmas Corner Decorations */}
                        <div className="absolute -top-2 -left-2 text-xl opacity-60">
                          {feature.decoration}
                        </div>
                        <div className="absolute -top-2 -right-2 text-xl opacity-60">
                          {feature.decoration}
                        </div>
                        <div className="absolute -bottom-2 -left-2 text-xl opacity-60">
                          {feature.decoration}
                        </div>
                        <div className="absolute -bottom-2 -right-2 text-xl opacity-60">
                          {feature.decoration}
                        </div>

                        {/* Animated Christmas Lights Border */}
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                          {/* Top Lights */}
                          <div className="absolute top-0 left-0 right-0 h-1 flex justify-between px-2">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{
                                  backgroundColor: i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#22c55e' : '#3b82f6',
                                  boxShadow: `0 0 8px ${i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#22c55e' : '#3b82f6'}`,
                                  animationDelay: `${i * 0.2}s`,
                                }}
                              />
                            ))}
                          </div>
                          {/* Bottom Lights */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 flex justify-between px-2">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{
                                  backgroundColor: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#ef4444' : '#22c55e',
                                  boxShadow: `0 0 8px ${i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#ef4444' : '#22c55e'}`,
                                  animationDelay: `${i * 0.2 + 0.1}s`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        
                        {/* Animated Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                        
                        {/* Glow Effect */}
                        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500`} />

                        {/* Notification Badge with Christmas Theme */}
                        {feature.notification > 0 && (
                          <motion.div
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-br from-red-500 to-green-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg z-10 border-2 border-white"
                            variants={notificationBadge}
                            initial="initial"
                            animate={["animate", "pulse"]}
                          >
                            {feature.notification}
                          </motion.div>
                        )}

                        {/* Content */}
                        <div className="relative p-4 sm:p-5 lg:p-6 flex flex-col items-center text-center h-full">
                          {/* Icon Container with Christmas Ribbon */}
                          <div className="relative mb-3 sm:mb-4">
                            <div className={`p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl ${feature.iconBg} shadow-lg transform group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300 border-2 border-white/50 relative z-10`}>
                              <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white relative z-10" />
                              {/* Icon Glow */}
                              <div className="absolute inset-0 bg-white/20 blur-sm rounded-xl sm:rounded-2xl" />
                            </div>
                            {/* Christmas Ribbon */}
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-gradient-to-r from-red-500 to-green-500 rounded-sm border border-white/50"></div>
                          </div>

                          {/* Text Content */}
                          <div className="flex-1 flex flex-col justify-center w-full">
                            <h3 className={`text-lg sm:text-xl font-bold ${feature.textColor} mb-1 sm:mb-2 group-hover:text-red-700 transition-colors leading-tight line-clamp-2 font-serif`}>
                              <span className="relative">
                                {feature.title}
                                <Sparkles className="absolute -right-4 -top-1 h-3 w-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </span>
                            </h3>
                            <div className={`text-gray-600 text-xs sm:text-sm leading-relaxed sm:leading-normal mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3`}>
                              {feature.description}
                            </div>
                          </div>

                          {/* Action Indicator with Christmas Theme */}
                          <div className="flex items-center justify-center gap-2 text-red-600 group-hover:text-red-700 transition-colors mt-1 sm:mt-2">
                            <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-red-100 to-green-100 px-2 py-1 rounded-full border border-red-200">
                              🎄 Explore now
                            </span>
                            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transform group-hover:translate-x-2 transition-transform group-hover:text-red-500" />
                          </div>
                        </div>

                        {/* Hover Border Effect */}
                        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`}>
                          <div className="absolute inset-[2px] sm:inset-[3px] rounded-xl sm:rounded-2xl bg-white" />
                        </div>

                        {/* Falling Snow Inside Card */}
                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-500">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1 h-1 bg-white rounded-full"
                              style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animation: `snowfall 5s linear infinite`,
                                animationDelay: `${i * 1}s`,
                                opacity: 0.7,
                              }}
                            />
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </TooltipProvider>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer - FIXED: Changed from <p> to <div> */}
          <motion.div
            className="text-center mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t border-red-200 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="bg-gradient-to-r from-red-50 via-white to-green-50 rounded-xl border-2 border-red-300 p-4 shadow-sm">
              <div className="text-red-700 text-xs sm:text-sm lg:text-base">
                🎅 Wishing you a wonderful holiday season! Need help? Reach us through the {" "}
                <a 
                  href="mailto:support@company.com" 
                  className="text-red-600 hover:text-red-700 underline font-medium bg-gradient-to-r from-red-100 to-green-100 px-2 py-1 rounded-full"
                >
                  company's support channels
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Falling Snow Effect */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full"
              style={{
                top: `${Math.random() * -20}vh`,
                left: `${Math.random() * 100}vw`,
                animation: `snowfall ${10 + Math.random() * 15}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: 0.5 + Math.random() * 0.5,
                filter: 'blur(1px)',
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes snowfall {
            0% {
              transform: translateY(-10px) translateX(0);
              opacity: 0.7;
            }
            100% {
              transform: translateY(100vh) translateX(20px);
              opacity: 0;
            }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .border-3 {
            border-width: 3px;
          }
        `}</style>
      </div>
    </>
  );
};

export default UserHome;