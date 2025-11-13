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
  Heart,
  Leaf,
  PieChart,
  Cannabis 
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
      path: "/timetracker",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-100",
      borderColor: "border-amber-300",
      textColor: "text-amber-900",
      notification: 0
    },
    {
      id: 2,
      title: "Company Memos and Policies",
      description: "Access company official memos and policies.",
      icon: FileText,
      path: "/all-memo",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-100",
      borderColor: "border-green-300",
      textColor: "text-green-900",
      notification: unacknowledgedCount
    },
    {
      id: 3,
      title: "HR Support",
      description: "Request HR assistance and services",
      icon: Users,
      path: "/request-something",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-100",
      borderColor: "border-purple-300",
      textColor: "text-purple-900",
      notification: 0
    },
    {
      id: 4,
      title: "IT Support",
      description: "Get technical help and assistance",
      icon: HeadphonesIcon,
      path: "/create-ticket",
      color: "from-red-500 to-rose-600",
      bgColor: "bg-gradient-to-br from-red-50 to-rose-100",
      borderColor: "border-red-300",
      textColor: "text-red-900",
      notification: 0
    },
    {
      id: 5,
      title: "My Tickets",
      description: "View your support tickets and status",
      icon: Ticket,
      path: "/view-ticket",
      color: "from-yellow-500 to-amber-600",
      bgColor: "bg-gradient-to-br from-yellow-50 to-amber-100",
      borderColor: "border-yellow-300",
      textColor: "text-yellow-900",
      notification: 0
    },
    {
      id: 6,
      title: "Employee Notice",
      description: "View disciplinary notices and updates",
      icon: PieChart,
      path: "/nte",
      color: "from-brown-500 to-amber-900",
      bgColor: "bg-gradient-to-br from-brown-50 to-amber-100",
      borderColor: "border-brown-300",
      textColor: "text-brown-900",
      notification: nteNotificationCount,
      exclamation: showExclamation,
      tooltip: nteTooltip
    }
  ];

  // Floating elements animation
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

  return (
    <>
      <SurveyModal />
      
      {/* Main Container */}
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8 relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-brown-50">
        {/* Thanksgiving Decorations */}
        <motion.div
          className="absolute top-10 left-10 opacity-20"
          variants={floatingElement}
          animate="animate"
        >
          <Leaf className="h-8 w-8 text-amber-600" />
        </motion.div>
        
        <motion.div
          className="absolute top-20 right-16 opacity-30"
          variants={floatingElement}
          animate="animate"
          style={{ animationDelay: '1s' }}
        >
          <Heart className="h-6 w-6 text-rose-500" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 left-20 opacity-25"
          variants={floatingElement}
          animate="animate"
          style={{ animationDelay: '2s' }}
        >
          <PieChart className="h-10 w-10 text-amber-700" />
        </motion.div>

        <motion.div
          className="absolute bottom-10 right-10 opacity-20"
          variants={floatingElement}
          animate="animate"
          style={{ animationDelay: '1.5s' }}
        >
          <Cannabis  className="h-12 w-12 text-brown-600" />
        </motion.div>

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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Cannabis  className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600 mr-3" />
            </motion.div>
            
            <motion.h1
              className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-5 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-600 to-brown-600 leading-tight sm:leading-snug font-serif"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Thankful for Your Hard Work!
            </motion.h1>
            
            <motion.p
              className="text-amber-700 text-sm sm:text-base max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Grateful for dedicated team members like you. Everything you need in one place.
            </motion.p>
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
                          <Card className={`relative overflow-hidden border-2 ${feature.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 h-full ${feature.bgColor} group-hover:shadow-amber-500/20 rounded-xl sm:rounded-2xl backdrop-blur-sm`}>
                            {/* Animated Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                            
                            {/* Glow Effect */}
                            <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />

                            {/* Notification Badge */}
                            {(feature.notification > 0 || feature.exclamation) && (
                              <motion.div
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-rose-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg z-10 border border-rose-400"
                                variants={notificationBadge}
                                initial="initial"
                                animate={["animate", "pulse"]}
                              >
                                {feature.exclamation ? "!" : feature.notification}
                              </motion.div>
                            )}

                            {/* Content */}
                            <div className="relative p-4 sm:p-5 lg:p-6 flex flex-col items-center text-center h-full">
                              {/* Icon Container */}
                              <div className={`mb-3 sm:mb-4 p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg transform group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300 border ${feature.borderColor}`}>
                                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-white" />
                              </div>

                              {/* Text Content */}
                              <div className="flex-1 flex flex-col justify-center w-full">
                                <h3 className={`text-lg sm:text-xl font-bold ${feature.textColor} mb-1 sm:mb-2 group-hover:text-amber-700 transition-colors leading-tight line-clamp-2 font-serif`}>
                                  {feature.title}
                                </h3>
                                <p className={`text-gray-600 text-xs sm:text-sm leading-relaxed sm:leading-normal mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3`}>
                                  {feature.description}
                                </p>
                              </div>

                              {/* Action Indicator */}
                              <div className="flex items-center justify-center text-amber-600 group-hover:text-amber-700 transition-colors mt-1 sm:mt-2">
                                <span className="text-xs sm:text-sm font-medium mr-1 sm:mr-2">Explore with gratitude</span>
                                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>

                            {/* Hover Border Effect */}
                            <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}>
                              <div className="absolute inset-[2px] sm:inset-[3px] rounded-xl sm:rounded-2xl bg-amber-50" />
                            </div>
                          </Card>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className="p-3 sm:p-4 max-w-xs sm:max-w-sm bg-amber-50 text-brown-800 border border-amber-300 shadow-xl text-xs sm:text-sm">
                        <p className="leading-relaxed whitespace-pre-line">{feature.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <motion.div
                      variants={hoverEffect}
                      className="relative group cursor-pointer h-full"
                      onClick={() => navigate(feature.path)}
                    >
                      <Card className={`relative overflow-hidden border-2 ${feature.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 h-full ${feature.bgColor} group-hover:shadow-amber-500/20 rounded-xl sm:rounded-2xl backdrop-blur-sm`}>
                        {/* Animated Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                        
                        {/* Glow Effect */}
                        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />

                        {/* Notification Badge */}
                        {feature.notification > 0 && (
                          <motion.div
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-rose-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg z-10 border border-rose-400"
                            variants={notificationBadge}
                            initial="initial"
                            animate={["animate", "pulse"]}
                          >
                            {feature.notification}
                          </motion.div>
                        )}

                        {/* Content */}
                        <div className="relative p-4 sm:p-5 lg:p-6 flex flex-col items-center text-center h-full">
                          {/* Icon Container */}
                          <div className={`mb-3 sm:mb-4 p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg transform group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300 border ${feature.borderColor}`}>
                            <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-white" />
                          </div>

                          {/* Text Content */}
                          <div className="flex-1 flex flex-col justify-center w-full">
                            <h3 className={`text-lg sm:text-xl font-bold ${feature.textColor} mb-1 sm:mb-2 group-hover:text-amber-700 transition-colors leading-tight line-clamp-2 font-serif`}>
                              {feature.title}
                            </h3>
                            <p className={`text-gray-600 text-xs sm:text-sm leading-relaxed sm:leading-normal mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3`}>
                              {feature.description}
                            </p>
                          </div>

                          {/* Action Indicator */}
                          <div className="flex items-center justify-center text-amber-600 group-hover:text-amber-700 transition-colors mt-1 sm:mt-2">
                            <span className="text-xs sm:text-sm font-medium mr-1 sm:mr-2">Explore with gratitude</span>
                            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>

                        {/* Hover Border Effect */}
                        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}>
                          <div className="absolute inset-[2px] sm:inset-[3px] rounded-xl sm:rounded-2xl bg-amber-50" />
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
            className="text-center mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t border-amber-300 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <p className="text-amber-700 text-xs sm:text-sm lg:text-base">
              Wishing you a blessed Thanksgiving season. Need help? Reach us through the {" "}
              <a 
                href="mailto:support@company.com" 
                className="text-amber-600 hover:text-amber-700 underline font-medium"
              >
                company's support channels.
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UserHome;