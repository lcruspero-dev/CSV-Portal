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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  show: { opacity: 1, y: 0 },
};

const notificationBadge = {
  initial: { scale: 0 },
  animate: { scale: 1, transition: { type: "spring", stiffness: 500 } },
  pulse: {
    scale: [1, 1.1, 1],
    transition: { repeat: Infinity, duration: 1.5 },
  },
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

  return (
    <>
      <SurveyModal />
      <motion.section
        className="heading container text-center pt-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="italic text-3xl p-1 drop-shadow-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
          Everything you need is just a click away!
        </h1>
        <p className="text-2xl font-bold italic">Select an option to proceed</p>
      </motion.section>

      <motion.div
        className="container grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-3 text-center p-3 drop-shadow-lg w-full md:w-10/12 lg:w-8/12 xl:w-6/12 mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={item}
          whileHover={{ scale: 1.0 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff] h-full"
            onClick={() => navigate("/timetracker")}
          >
            <img src={timetracker} alt="Time tracker" className="mx-auto" />
            <h3 className="text-base font-semibold text-gray-800 ">
              Time Tracker
            </h3>
            <p className="text-sm text-gray-500 mb-3">Track your work hours</p>
          </Card>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ scale: 1.0 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className="relative hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff] h-full"
            onClick={() => navigate("/all-memo")}
          >
            {unacknowledgedCount > 0 && (
              <motion.div
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                variants={notificationBadge}
                initial="initial"
                animate={["animate", "pulse"]}
              >
                {unacknowledgedCount}
              </motion.div>
            )}
            <img src={memo} alt="memo" className="mx-auto" />
            <h3 className="text-base font-semibold text-gray-800">Memo</h3>
            <p className="text-sm text-gray-500 mb-3">
              View company announcements
            </p>
          </Card>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ scale: 1.0 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff] h-full"
            onClick={() => navigate("/request-something")}
          >
            <img src={request} alt="test" className="mx-auto" />
            <h3 className="text-base font-semibold text-gray-800">
              HR Support
            </h3>
            <p className="text-sm text-gray-500 mb-3">Request HR assistance</p>
          </Card>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ scale: 1.0 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff] h-full"
            onClick={() => navigate("/create-ticket")}
          >
            <img src={gethelp} alt="test" className="mx-auto" />
            <h3 className="text-base font-semibold text-gray-800">
              IT Support
            </h3>
            <p className="text-sm text-gray-500 mb-3">Get technical help</p>
          </Card>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ scale: 1.0 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className="hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff] h-full"
            onClick={() => navigate("/view-ticket")}
          >
            <img src={ticket} alt="tickets" className="mx-auto" />
            <h3 className="text-base font-semibold text-gray-800">
              My Tickets
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              View your support tickets
            </p>
          </Card>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ scale: 1.0 }}
          whileTap={{ scale: 0.98 }}
        >
          <TooltipProvider>
            {nteTooltip ? (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Card
                    className="relative hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff] p-1 h-full"
                    onClick={() => navigate("/nte")}
                  >
                    <div className="relative">
                      {(nteNotificationCount > 0 || showExclamation) && (
                        <motion.div
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                          variants={notificationBadge}
                          initial="initial"
                          animate={["animate", "pulse"]}
                        >
                          {showExclamation ? "!" : nteNotificationCount}
                        </motion.div>
                      )}
                      <img src={test} alt="NTE" className="w-full" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 mt-3">
                      Employee Notice
                    </h3>
                    <p className="text-sm text-gray-500">
                      View disciplinary notice
                    </p>
                  </Card>
                </TooltipTrigger>
                <TooltipContent className="p-2 max-w-xs text-gray-600">
                  <p className="text-xs">{nteTooltip}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Card
                className="relative hover:scale-105 ease-in-out duration-200 cursor-pointer hover:border-1 hover:border-[#5a95ff] p-1 h-full"
                onClick={() => navigate("/nte")}
              >
                <div className="relative">
                  <img src={test} alt="NTE" className="w-full" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mt-3">
                  Employee Notice
                </h3>
                <p className="text-sm text-gray-500">
                  View disciplinary notice
                </p>
              </Card>
            )}
          </TooltipProvider>
        </motion.div>
      </motion.div>
    </>
  );
};

export default UserHome;
