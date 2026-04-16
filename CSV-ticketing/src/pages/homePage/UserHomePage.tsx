/* eslint-disable @typescript-eslint/no-explicit-any */
import { NteAPI, TicketAPi } from "@/API/endpoint";
import SurveyModal from "@/components/kit/Survey";
import { motion } from "framer-motion";
import {
  Clock,
  FileText,
  Users,
  HeadphonesIcon,
  Ticket,
  Bell,
  Home,
  Briefcase,
  Shield,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleCase from "@/utils/titleCase";

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
              (ack: { userId: any }) => ack.userId === user?._id,
            ),
        );
        setUnacknowledgedCount(unacknowledgedMemos.length);
      } catch (error) {
        console.error(error);
      }
    };

    const getNteNotificationCount = async () => {
      try {
        if (!user) return;

        const response = await NteAPI.getNtesByUser();
        const nteData = response.data;

        if (!nteData?.length) {
          setNteNotificationCount(0);
          setShowExclamation(false);
          setNteTooltip("");
          return;
        }

        const currentNte = nteData[0];

        let count = 0;
        let tooltip = "";
        let exclamation = false;

        if (currentNte.status === "PER") {
          if (!currentNte.nte?.employeeSignatureDate) {
            count = 1;
            tooltip += "Please sign the NTE.\n";
          }
          if (!currentNte.employeeFeedback?.responseDetail?.trim()) {
            count = 1;
            tooltip += "Submit explanation within 5 days.";
          }
        }

        if (
          currentNte.status === "PNODA" &&
          !currentNte.noticeOfDecision?.employeeSignatureDate
        ) {
          exclamation = true;
          tooltip += "Please acknowledge the Notice of Decision.";
        }

        setNteNotificationCount(count);
        setShowExclamation(exclamation);
        setNteTooltip(tooltip);
      } catch (error) {
        console.error(error);
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
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-600",
      notification: 0,
    },
    {
      id: 2,
      title: "Company Memos",
      description: "Access company memos and policies",
      icon: FileText,
      path: "/view-polMemo",
      color: "bg-gradient-to-br from-violet-600 to-purple-600",
      bgColor: "bg-violet-50",
      iconBg: "bg-violet-600",
      notification: unacknowledgedCount,
    },
    {
      id: 3,
      title: "HR Support",
      description: "Request HR assistance",
      icon: Users,
      path: "/request-something",
      color: "bg-gradient-to-br from-indigo-600 to-blue-600",
      bgColor: "bg-indigo-50",
      iconBg: "bg-indigo-600",
      notification: 0,
    },
    {
      id: 4,
      title: "IT Support",
      description: "Get technical help",
      icon: HeadphonesIcon,
      path: "/create-ticket",
      color: "bg-gradient-to-br from-blue-600 to-cyan-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-600",
      notification: 0,
    },
    {
      id: 5,
      title: "My Tickets",
      description: "View support tickets",
      icon: Ticket,
      path: "/view-ticket",
      color: "bg-gradient-to-br from-cyan-600 to-teal-600",
      bgColor: "bg-cyan-50",
      iconBg: "bg-cyan-600",
      notification: 0,
    },
    {
      id: 6,
      title: "Employee Notice",
      description: "Disciplinary notices",
      icon: Bell,
      path: "/nte",
      color: "bg-gradient-to-br from-rose-600 to-pink-600",
      bgColor: "bg-rose-50",
      iconBg: "bg-rose-600",
      notification: nteNotificationCount,
      exclamation: showExclamation,
      tooltip: nteTooltip,
    },
  ];

  return (
    <>
      <SurveyModal />

      <div className="bg-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <motion.div className="mb-8">
            <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white border rounded-xl">
                      <Home className="h-5 w-5 text-purple-600" />
                    </div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                  </div>
                  <p className="text-gray-600">
                    Welcome back, {TitleCase(user?.name) || "Employee"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="p-5 border rounded-xl shadow-sm bg-white">
              <p className="text-sm text-gray-500">Pending Actions</p>
              <p className="text-2xl font-semibold">
                {unacknowledgedCount + nteNotificationCount}
              </p>
              <Bell className="h-5 w-5 text-purple-600 mt-2" />
            </div>

            <div className="p-5 border rounded-xl shadow-sm bg-white">
              <p className="text-sm text-gray-500">Services</p>
              <p className="text-2xl font-semibold">6</p>
              <Briefcase className="h-5 w-5 text-indigo-600 mt-2" />
            </div>

            <div className="p-5 border rounded-xl shadow-sm bg-white">
              <p className="text-sm text-gray-500">Account</p>
              <p className="text-2xl font-semibold text-green-600">Active</p>
              <Shield className="h-5 w-5 text-green-600 mt-2" />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Services</h2>
            <p className="text-sm text-gray-500">Quick access modules</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.id}
                onClick={() => navigate(feature.path)}
                className="
        group cursor-pointer
        border border-gray-200
        rounded-2xl
        bg-white
        hover:shadow-md
        hover:border-purple-300
        transition-all duration-200
        p-5
      "
              >
                {/* ICON + TITLE */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-purple-50 transition">
                      <feature.icon className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
                </div>

                {/* NOTIFICATION BADGE */}
                {feature.notification > 0 && (
                  <div className="mt-4 inline-flex items-center gap-2">
                    <span className="text-xs font-medium text-white bg-red-500 px-2 py-1 rounded-full">
                      {feature.notification} new
                    </span>
                  </div>
                )}

                {/* BOTTOM HOVER STRIP */}
                <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-0 group-hover:w-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserHome;
