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
  ArrowUpRight,
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
      accent: "#7c3aed",
      softBg: "#f5f3ff",
      label: "Attendance",
      notification: 0,
    },
    {
      id: 2,
      title: "Company Memos",
      description: "Access company memos and policies",
      icon: FileText,
      path: "/view-polMemo",
      accent: "#4f46e5",
      softBg: "#eef2ff",
      label: "Documents",
      notification: unacknowledgedCount,
    },
    {
      id: 3,
      title: "HR Support",
      description: "Request HR assistance",
      icon: Users,
      path: "/request-something",
      accent: "#0284c7",
      softBg: "#f0f9ff",
      label: "Human Resources",
      notification: 0,
    },
    {
      id: 4,
      title: "IT Support",
      description: "Get technical help",
      icon: HeadphonesIcon,
      path: "/create-ticket",
      accent: "#059669",
      softBg: "#f0fdf4",
      label: "Technical",
      notification: 0,
    },
    {
      id: 5,
      title: "My Tickets",
      description: "View support tickets",
      icon: Ticket,
      path: "/view-ticket",
      accent: "#d97706",
      softBg: "#fffbeb",
      label: "Requests",
      notification: 0,
    },
    {
      id: 6,
      title: "Employee Notice",
      description: "Disciplinary notices",
      icon: Bell,
      path: "/nte",
      accent: "#dc2626",
      softBg: "#fef2f2",
      label: "Notices",
      notification: nteNotificationCount,
      exclamation: showExclamation,
      tooltip: nteTooltip,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
  };

  return (
    <>
      <SurveyModal />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .uh-root {
          font-family: 'Outfit', sans-serif;
          background: #f5f5f8;
          min-height: 100vh;
          color: #1a1a2e;
        }

        .uh-header {
          background: #ffffff;
          border-bottom: 1px solid #e8e8f0;
          padding: 2rem 2.5rem 1.8rem;
        }

        .uh-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
        }

        .uh-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #f3f0ff;
          border: 1px solid #ddd6fe;
          border-radius: 100px;
          padding: 0.25rem 0.75rem;
          margin-bottom: 0.75rem;
        }

        .uh-tag-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #7c3aed;
        }

        .uh-tag-text {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7c3aed;
        }

        .uh-heading {
          font-size: 2rem;
          font-weight: 800;
          color: #0f0f1a;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .uh-subheading {
          font-size: 0.88rem;
          color: #8888a0;
          margin-top: 0.4rem;
          font-weight: 400;
        }

        .uh-home-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f3f0ff;
          border: 1px solid #ddd6fe;
          border-radius: 10px;
          padding: 0.5rem 0.9rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #7c3aed;
        }

        .uh-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 2.5rem 3rem;
        }

        @media (max-width: 640px) {
          .uh-header { padding: 1.5rem; }
          .uh-body { padding: 1.5rem; }
          .uh-heading { font-size: 1.6rem; }
          .uh-stats-grid { grid-template-columns: 1fr !important; }
          .uh-features-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) and (max-width: 960px) {
          .uh-features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .uh-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* STATS */
        .uh-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .uh-stat-card {
          background: #ffffff;
          border: 1px solid #e8e8f0;
          border-radius: 16px;
          padding: 1.4rem 1.6rem;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s, border-color 0.2s;
        }

        .uh-stat-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border-color: #d0d0e8;
        }

        .uh-stat-label {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9090a8;
          margin-bottom: 0.5rem;
        }

        .uh-stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #0f0f1a;
          line-height: 1;
        }

        .uh-stat-icon-pill {
          margin-top: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.65rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .uh-stat-watermark {
          position: absolute;
          bottom: -8px;
          right: -4px;
          opacity: 0.05;
          pointer-events: none;
        }

        /* SECTION */
        .uh-section-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .uh-section-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9090a8;
        }

        .uh-section-sub {
          font-size: 0.75rem;
          color: #c0c0d0;
        }

        /* FEATURE CARDS */
        .uh-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .uh-feature-card {
          background: #ffffff;
          border: 1px solid #e8e8f0;
          border-radius: 18px;
          padding: 1.5rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.22s, border-color 0.22s, transform 0.18s;
          display: flex;
          flex-direction: column;
        }

        .uh-feature-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          border-color: var(--accent-light);
          transform: translateY(-2px);
        }

        .uh-feature-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .uh-feature-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--soft-bg);
          transition: transform 0.2s;
          position: relative;
        }

        .uh-feature-card:hover .uh-feature-icon-wrap {
          transform: scale(1.1);
        }

        .uh-icon-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #dc2626;
          color: white;
          font-size: 0.58rem;
          font-weight: 800;
          min-width: 18px;
          height: 18px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #ffffff;
          line-height: 1;
          animation: uh-badge-pop 0.3s ease;
        }

        @keyframes uh-badge-pop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .uh-feature-arrow {
          color: #d8d8e8;
          transition: color 0.2s, transform 0.2s;
        }

        .uh-feature-card:hover .uh-feature-arrow {
          color: var(--accent);
          transform: translate(2px, -2px);
        }

        .uh-feature-cat {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.3rem;
          opacity: 0.8;
        }

        .uh-feature-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 0.3rem;
          transition: color 0.2s;
        }

        .uh-feature-card:hover .uh-feature-title {
          color: var(--accent);
        }

        .uh-feature-desc {
          font-size: 0.78rem;
          color: #9090a8;
          line-height: 1.5;
        }

        .uh-feature-footer {
          margin-top: 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .uh-progress-bar {
          flex: 1;
          height: 3px;
          background: #f0f0f6;
          border-radius: 10px;
          overflow: hidden;
        }

        .uh-progress-fill {
          height: 100%;
          width: 0%;
          background: var(--accent);
          border-radius: 10px;
          transition: width 0.35s ease;
          opacity: 0.45;
        }

        .uh-feature-card:hover .uh-progress-fill {
          width: 100%;
        }

        .uh-badge {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.2rem 0.55rem;
          border-radius: 100px;
          white-space: nowrap;
        }

        .uh-badge-warn {
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fde68a;
        }
      `}</style>

      <div className="uh-root">
        {/* HEADER */}
        <motion.div
          className="uh-header"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="uh-header-inner">
            <div>
              <div className="uh-tag">
                <div className="uh-tag-dot" />
                <span className="uh-tag-text">Employee Portal</span>
              </div>
              <h1 className="uh-heading">Dashboard</h1>
              <p className="uh-subheading">
                Welcome back, {TitleCase(user?.name) || "Employee"}
              </p>
            </div>
            <div className="uh-home-btn">
              <Home style={{ width: 14, height: 14 }} />
              Home
            </div>
          </div>
        </motion.div>

        <div className="uh-body">
          {/* STATS */}
          <motion.div
            className="uh-stats-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="uh-stat-card" variants={itemVariants}>
              <p className="uh-stat-label">Pending Actions</p>
              <p className="uh-stat-value">{unacknowledgedCount + nteNotificationCount}</p>
              <div
                className="uh-stat-icon-pill"
                style={{ background: "#f3f0ff", color: "#7c3aed" }}
              >
                <Bell style={{ width: 12, height: 12 }} />
                Notifications
              </div>
              <div className="uh-stat-watermark">
                <Bell style={{ width: 80, height: 80, color: "#7c3aed" }} />
              </div>
            </motion.div>

            <motion.div className="uh-stat-card" variants={itemVariants}>
              <p className="uh-stat-label">Services</p>
              <p className="uh-stat-value">6</p>
              <div
                className="uh-stat-icon-pill"
                style={{ background: "#eef2ff", color: "#4f46e5" }}
              >
                <Briefcase style={{ width: 12, height: 12 }} />
                Modules
              </div>
              <div className="uh-stat-watermark">
                <Briefcase style={{ width: 80, height: 80, color: "#4f46e5" }} />
              </div>
            </motion.div>

            <motion.div className="uh-stat-card" variants={itemVariants}>
              <p className="uh-stat-label">Account Status</p>
              <p className="uh-stat-value" style={{ color: "#059669", fontSize: "1.6rem", paddingTop: "0.1rem" }}>
                Active
              </p>
              <div
                className="uh-stat-icon-pill"
                style={{ background: "#f0fdf4", color: "#059669" }}
              >
                <Shield style={{ width: 12, height: 12 }} />
                Verified
              </div>
              <div className="uh-stat-watermark">
                <Shield style={{ width: 80, height: 80, color: "#059669" }} />
              </div>
            </motion.div>
          </motion.div>

          {/* SECTION LABEL */}
          <div className="uh-section-row">
            <span className="uh-section-label">Services</span>
            <span className="uh-section-sub">6 modules available</span>
          </div>

          {/* FEATURES */}
          <motion.div
            className="uh-features-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                className="uh-feature-card"
                style={{
                  "--accent": feature.accent,
                  "--soft-bg": feature.softBg,
                  "--accent-light": feature.softBg,
                } as any}
                onClick={() => navigate(feature.path)}
                variants={itemVariants}
                title={feature.tooltip || ""}
              >
                <div className="uh-feature-card-top">
                  <div className="uh-feature-icon-wrap">
                    <feature.icon
                      style={{ width: 20, height: 20, color: feature.accent }}
                    />
                    {feature.notification > 0 && (
                      <span className="uh-icon-badge">{feature.notification}</span>
                    )}
                    {feature.exclamation && !feature.notification && (
                      <span className="uh-icon-badge" style={{ background: "#d97706" }}>!</span>
                    )}
                  </div>
                  <ArrowUpRight
                    className="uh-feature-arrow"
                    style={{ width: 16, height: 16 }}
                  />
                </div>

                <p className="uh-feature-cat">{feature.label}</p>
                <h3 className="uh-feature-title">{feature.title}</h3>
                <p className="uh-feature-desc">{feature.description}</p>

                <div className="uh-feature-footer">
                  <div className="uh-progress-bar">
                    <div className="uh-progress-fill" />
                  </div>
                  {feature.notification > 0 && (
                    <span className="uh-badge">{feature.notification} new</span>
                  )}
                  {feature.exclamation && !feature.notification && (
                    <span className="uh-badge uh-badge-warn">Action needed</span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UserHome;