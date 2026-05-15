import { ExportDatas } from "@/API/endpoint";
import Sidebar from "@/components/ui/Sidebar";
import Chart from "@/components/ui/charts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  Clock,
  AlertTriangle,
  RefreshCw,
  Bell,
  Package,
  Users,
  CheckCircle,
  TrendingUp,
  Activity,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import TitleCase from "@/utils/titleCase";
import { cn } from "@/lib/utils";

interface Ticket {
  _id: string;
  status: string;
  category: string;
  priority: string;
  createdAt: string;
  assignedTo: string;
  department: string;
}

const AdminHome = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
    highPriority: 0,
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      if (width < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await ExportDatas.getAllTicket();
        setTickets(response.data);
        calculateStats(response.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const calculateStats = (tickets: Ticket[]) => {
    const total = tickets.length;
    const open = tickets.filter(
      (ticket) => ticket.status === "open" || ticket.status === "new"
    ).length;
    const inProgress = tickets.filter(
      (ticket) => ticket.status === "In Progress"
    ).length;
    const closed = tickets.filter(
      (ticket) =>
        ticket.status === "closed" ||
        ticket.status === "Approved" ||
        ticket.status === "Rejected"
    ).length;
    const highPriority = tickets.filter(
      (ticket) =>
        ticket.priority === "1-Critical" || ticket.priority === "2-High"
    ).length;
    setStats({ total, open, inProgress, closed, highPriority });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "new":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "in progress":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "closed":
      case "approved":
        return "text-slate-600 bg-slate-50 border-slate-200";
      case "rejected":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const Loader = () => (
    <div className="flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
  };

  const statCards = [
    {
      title: "Total Tickets",
      value: stats.total,
      description: "All tickets in system",
      icon: Package,
      accent: "#4f46e5",
      softBg: "#eef2ff",
      trend: "+12%",
    },
    {
      title: "Open Tickets",
      value: stats.open,
      description: "Requiring attention",
      icon: AlertTriangle,
      accent: "#d97706",
      softBg: "#fffbeb",
      trend: "+5%",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      description: "Being worked on",
      icon: RefreshCw,
      accent: "#0284c7",
      softBg: "#f0f9ff",
      trend: "+8%",
    },
    {
      title: "High Priority",
      value: stats.highPriority,
      description: "Critical issues",
      icon: Bell,
      accent: "#dc2626",
      softBg: "#fef2f2",
      trend: "+3%",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .ah-wrap * {
          font-family: 'Outfit', sans-serif;
        }

        /* HEADER */
        .ah-header {
          background: #ffffff;
          border-bottom: 1px solid #e8e8f0;
          padding: 1.6rem 2rem;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
        }

        .ah-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #eef2ff;
          border: 1px solid #c7d2fe;
          border-radius: 100px;
          padding: 0.22rem 0.7rem;
          margin-bottom: 0.6rem;
        }

        .ah-tag-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #4f46e5;
        }

        .ah-tag-text {
          font-size: 0.63rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #4f46e5;
        }

        .ah-heading {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f0f1a;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .ah-subheading {
          font-size: 0.85rem;
          color: #8888a0;
          margin-top: 0.35rem;
          font-weight: 400;
        }

        .ah-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 100px;
          padding: 0.3rem 0.75rem;
          font-size: 0.68rem;
          font-weight: 700;
          color: #059669;
          letter-spacing: 0.06em;
        }

        .ah-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: ah-pulse 1.8s ease-in-out infinite;
        }

        @keyframes ah-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        /* MAIN */
        .ah-main {
          background: #f5f5f8;
          min-height: 100vh;
        }

        .ah-body {
          padding: 1.75rem 2rem 3rem;
        }

        @media (max-width: 640px) {
          .ah-header { padding: 1.25rem; }
          .ah-body { padding: 1.25rem; }
          .ah-heading { font-size: 1.4rem; }
        }

        /* SECTION LABEL */
        .ah-section-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.9rem;
        }

        .ah-section-label {
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #9090a8;
        }

        .ah-section-sub {
          font-size: 0.72rem;
          color: #c0c0d0;
        }

        /* STAT CARDS */
        .ah-stat-card {
          background: #ffffff;
          border: 1px solid #e8e8f0;
          border-radius: 16px;
          padding: 1.3rem 1.5rem;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.18s;
        }

        .ah-stat-card:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.07);
          border-color: var(--accent-light);
          transform: translateY(-2px);
        }

        .ah-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--accent);
          opacity: 0.6;
          border-radius: 16px 16px 0 0;
        }

        .ah-stat-label {
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9090a8;
          margin-bottom: 0.5rem;
        }

        .ah-stat-value {
          font-size: 2.1rem;
          font-weight: 800;
          color: #0f0f1a;
          line-height: 1;
        }

        .ah-stat-desc {
          font-size: 0.75rem;
          color: #b0b0c8;
          margin-top: 0.25rem;
        }

        .ah-stat-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1rem;
        }

        .ah-stat-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--soft-bg);
        }

        .ah-trend {
          font-size: 0.68rem;
          font-weight: 700;
          color: #059669;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 100px;
          padding: 0.15rem 0.5rem;
        }

        .ah-stat-watermark {
          position: absolute;
          bottom: -10px;
          right: -6px;
          opacity: 0.04;
          pointer-events: none;
        }

        /* CHART CARD */
        .ah-chart-card {
          background: #ffffff;
          border: 1px solid #e8e8f0;
          border-radius: 18px;
          overflow: hidden;
        }

        .ah-chart-header {
          padding: 1.3rem 1.5rem 1rem;
          border-bottom: 1px solid #f0f0f6;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ah-chart-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        .ah-chart-sub {
          font-size: 0.75rem;
          color: #9090a8;
          margin-top: 0.2rem;
        }

        .ah-chart-body {
          padding: 1.25rem 1.5rem 1.5rem;
        }

        .ah-chart-inner {
          background: #f8f8fb;
          border-radius: 12px;
          padding: 1rem;
        }

        /* SIDE PANEL */
        .ah-side-card {
          background: #ffffff;
          border: 1px solid #e8e8f0;
          border-radius: 18px;
          overflow: hidden;
        }

        .ah-side-header {
          padding: 1.2rem 1.4rem 0.9rem;
          border-bottom: 1px solid #f0f0f6;
        }

        .ah-side-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        .ah-side-body {
          padding: 1.2rem 1.4rem;
        }

        /* PROGRESS */
        .ah-progress-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.78rem;
          font-weight: 500;
          color: #4a4a6a;
          margin-bottom: 0.4rem;
        }

        .ah-progress-val {
          font-weight: 700;
          color: #059669;
        }

        .ah-progress-track {
          height: 6px;
          background: #f0f0f6;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .ah-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          border-radius: 10px;
          transition: width 0.6s ease;
        }

        .ah-metric-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.55rem 0;
          border-bottom: 1px solid #f5f5fa;
          font-size: 0.78rem;
        }

        .ah-metric-row:last-child { border-bottom: none; }

        .ah-metric-label { color: #7070a0; }
        .ah-metric-val { font-weight: 700; color: #1a1a2e; }

        /* ALERT BOX */
        .ah-alert-box {
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 12px;
          padding: 1rem 1.1rem;
        }

        .ah-alert-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #c2410c;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }

        .ah-alert-desc {
          font-size: 0.76rem;
          color: #ea580c;
        }

        .ah-all-clear {
          text-align: center;
          padding: 1.5rem 1rem;
        }

        .ah-all-clear-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-top: 0.75rem;
        }

        .ah-all-clear-sub {
          font-size: 0.75rem;
          color: #9090a8;
          margin-top: 0.2rem;
        }

        /* RECENT TABLE */
        .ah-table-card {
          background: #ffffff;
          border: 1px solid #e8e8f0;
          border-radius: 18px;
          overflow: hidden;
        }

        .ah-table-header {
          padding: 1.3rem 1.5rem 1rem;
          border-bottom: 1px solid #f0f0f6;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .ah-table-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        .ah-table-sub {
          font-size: 0.73rem;
          color: #9090a8;
          margin-top: 0.15rem;
        }

        .ah-view-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #4f46e5;
          background: #eef2ff;
          border: 1px solid #c7d2fe;
          border-radius: 9px;
          padding: 0.4rem 0.85rem;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }

        .ah-view-all-btn:hover {
          background: #e0e7ff;
          border-color: #a5b4fc;
        }

        .ah-ticket-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1.5rem;
          border-bottom: 1px solid #f5f5fa;
          transition: background 0.15s;
          gap: 0.75rem;
        }

        .ah-ticket-row:last-child { border-bottom: none; }

        .ah-ticket-row:hover { background: #f8f8fb; }

        .ah-ticket-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #eef2ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ah-ticket-cat {
          font-size: 0.82rem;
          font-weight: 600;
          color: #1a1a2e;
        }

        .ah-ticket-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.2rem;
          font-size: 0.7rem;
          color: #9090a8;
        }

        .ah-ticket-meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .ah-eye-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid #e8e8f0;
          color: #9090a8;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }

        .ah-eye-btn:hover {
          background: #eef2ff;
          color: #4f46e5;
          border-color: #c7d2fe;
        }

        .ah-empty {
          text-align: center;
          padding: 2.5rem 1rem;
        }

        .ah-empty-icon {
          width: 52px;
          height: 52px;
          background: #f5f5f8;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.75rem;
        }

        .ah-empty-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        .ah-empty-sub {
          font-size: 0.75rem;
          color: #9090a8;
          margin-top: 0.2rem;
        }

        /* BOTTOM CARDS */
        .ah-info-card {
          background: #ffffff;
          border: 1px solid #e8e8f0;
          border-radius: 16px;
          padding: 1.3rem 1.4rem;
          transition: box-shadow 0.2s, transform 0.18s;
        }

        .ah-info-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }

        .ah-info-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .ah-info-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 0.15rem;
        }

        .ah-info-sub {
          font-size: 0.7rem;
          color: #9090a8;
          margin-bottom: 1rem;
        }

        .ah-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.45rem 0;
          border-bottom: 1px solid #f5f5fa;
          font-size: 0.76rem;
        }

        .ah-info-row:last-child { border-bottom: none; }
        .ah-info-row-label { color: #8080a0; }
        .ah-info-row-val { font-weight: 700; color: #1a1a2e; }

        .ah-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          display: inline-block;
          margin-right: 0.4rem;
        }

        .ah-status-badge {
          font-size: 0.62rem;
          font-weight: 700;
          background: #f0fdf4;
          color: #059669;
          border: 1px solid #bbf7d0;
          border-radius: 100px;
          padding: 0.15rem 0.5rem;
        }
      `}</style>

      <div className="ah-wrap min-h-screen bg-[#f5f5f8]">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {(isMobile || isTablet) && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        <div
          className={cn(
            "transition-all duration-300 ease-in-out ml-0",
            sidebarOpen ? "lg:ml-64" : "lg:ml-20"
          )}
        >
          {/* HEADER */}
          <motion.div
            className="ah-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <div className="ah-tag">
                <div className="ah-tag-dot" />
                <span className="ah-tag-text">Admin Portal</span>
              </div>
              <h1 className="ah-heading">Dashboard</h1>
              <p className="ah-subheading">
                Welcome back, {TitleCase(user?.name)}. Here's your overview for today.
              </p>
            </div>
            <div className="ah-live-badge">
              <div className="ah-live-dot" />
              Live Data
            </div>
          </motion.div>

          <main className="ah-body space-y-5">
            {/* STATS */}
            <div>
              <div className="ah-section-row">
                <span className="ah-section-label">Overview</span>
                <span className="ah-section-sub">Live ticket stats</span>
              </div>
              <motion.div
                className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {statCards.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="ah-stat-card"
                    style={{
                      "--accent": stat.accent,
                      "--soft-bg": stat.softBg,
                      "--accent-light": stat.softBg,
                    } as React.CSSProperties}
                    variants={itemVariants}
                  >
                    <p className="ah-stat-label">{stat.title}</p>
                    <p className="ah-stat-value">{stat.value}</p>
                    <p className="ah-stat-desc">{stat.description}</p>
                    <div className="ah-stat-footer">
                      <div className="ah-stat-icon-wrap">
                        <stat.icon style={{ width: 16, height: 16, color: stat.accent }} />
                      </div>
                      <span className="ah-trend">{stat.trend}</span>
                    </div>
                    <div className="ah-stat-watermark">
                      <stat.icon style={{ width: 80, height: 80, color: stat.accent }} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* CHARTS + SIDE PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Chart */}
              <motion.div
                className="ah-chart-card lg:col-span-2"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.38 }}
              >
                <div className="ah-chart-header">
                  <div>
                    <p className="ah-chart-title">Ticket Analytics</p>
                    <p className="ah-chart-sub">Overview of ticket status and trends</p>
                  </div>
                  <div className="ah-live-badge">
                    <Activity style={{ width: 11, height: 11 }} />
                    Live
                  </div>
                </div>
                <div className="ah-chart-body">
                  {loading ? (
                    <div className="flex items-center justify-center h-56">
                      <Loader />
                    </div>
                  ) : (
                    <div className="ah-chart-inner">
                      <Chart tickets={tickets} />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Side panel */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.38 }}
              >
                {/* Performance */}
                <div className="ah-side-card">
                  <div className="ah-side-header">
                    <p className="ah-side-title">Performance Metrics</p>
                  </div>
                  <div className="ah-side-body space-y-3">
                    <div>
                      <div className="ah-progress-row">
                        <span>Resolution Rate</span>
                        <span className="ah-progress-val">
                          {tickets.length > 0
                            ? Math.round((stats.closed / tickets.length) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="ah-progress-track">
                        <div
                          className="ah-progress-fill"
                          style={{
                            width: `${tickets.length > 0 ? (stats.closed / tickets.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="ah-metric-row">
                      <span className="ah-metric-label">Avg. Response Time</span>
                      <span className="ah-metric-val" style={{ color: "#0284c7" }}>2.4 hrs</span>
                    </div>
                    <div className="ah-metric-row" style={{ alignItems: "flex-start" }}>
                      <span className="ah-metric-label" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <TrendingUp style={{ width: 11, height: 11, color: "#059669" }} />
                        Improvement
                      </span>
                      <span className="ah-metric-val" style={{ color: "#059669" }}>+15% this month</span>
                    </div>
                    <div className="ah-metric-row">
                      <span className="ah-metric-label">Team Active</span>
                      <span className="ah-metric-val" style={{ color: "#7c3aed" }}>12 / 15</span>
                    </div>
                  </div>
                </div>

                {/* Priority Alerts */}
                <div className="ah-side-card">
                  <div className="ah-side-header">
                    <p className="ah-side-title">Priority Alerts</p>
                  </div>
                  <div className="ah-side-body">
                    {stats.highPriority > 0 ? (
                      <div className="ah-alert-box">
                        <p className="ah-alert-title">
                          <AlertTriangle style={{ width: 14, height: 14 }} />
                          Attention Required
                        </p>
                        <p className="ah-alert-desc">
                          {stats.highPriority} high priority tickets need immediate attention.
                        </p>
                      </div>
                    ) : (
                      <div className="ah-all-clear">
                        <CheckCircle style={{ width: 36, height: 36, color: "#10b981", margin: "0 auto" }} />
                        <p className="ah-all-clear-title">All systems operational</p>
                        <p className="ah-all-clear-sub">No critical issues detected</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RECENT ACTIVITY */}
            <motion.div
              className="ah-table-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.38 }}
            >
              <div className="ah-table-header">
                <div>
                  <p className="ah-table-title">Recent Activity</p>
                  <p className="ah-table-sub">Latest tickets and updates</p>
                </div>
                <button
                  className="ah-view-all-btn"
                  onClick={() => navigate("/all-tickets")}
                >
                  <Ticket style={{ width: 13, height: 13 }} />
                  View All Tickets
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader />
                </div>
              ) : tickets.length > 0 ? (
                <div>
                  {tickets.slice(0, isMobile ? 3 : 5).map((ticket) => (
                    <div key={ticket._id} className="ah-ticket-row">
                      <div className="ah-ticket-icon">
                        <Ticket style={{ width: 16, height: 16, color: "#4f46e5" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span className="ah-ticket-cat">{ticket.category}</span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(ticket.status)}`}
                            style={{ fontSize: "0.62rem" }}
                          >
                            {ticket.status}
                          </span>
                        </div>
                        <div className="ah-ticket-meta">
                          <span className="ah-ticket-meta-item">
                            <Users style={{ width: 10, height: 10 }} />
                            {ticket.assignedTo || "Unassigned"}
                          </span>
                          <span className="ah-ticket-meta-item">
                            <Clock style={{ width: 10, height: 10 }} />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        className="ah-eye-btn"
                        onClick={() => navigate(`/ticket/${ticket._id}`)}
                      >
                        <Eye style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ah-empty">
                  <div className="ah-empty-icon">
                    <Ticket style={{ width: 22, height: 22, color: "#c0c0d0" }} />
                  </div>
                  <p className="ah-empty-title">No tickets found</p>
                  <p className="ah-empty-sub">Tickets will appear here once created</p>
                </div>
              )}
            </motion.div>

            {/* BOTTOM INFO CARDS */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.38 }}
            >
              {/* Team Performance */}
              <div className="ah-info-card">
                <div className="ah-info-icon" style={{ background: "#f3f0ff" }}>
                  <Users style={{ width: 18, height: 18, color: "#7c3aed" }} />
                </div>
                <p className="ah-info-title">Team Performance</p>
                <p className="ah-info-sub">This week's metrics</p>
                <div className="ah-info-row">
                  <span className="ah-info-row-label">Tickets Closed</span>
                  <span className="ah-info-row-val">42</span>
                </div>
                <div className="ah-info-row">
                  <span className="ah-info-row-label">Avg. Time</span>
                  <span className="ah-info-row-val">4.2 hrs</span>
                </div>
                <div className="ah-info-row">
                  <span className="ah-info-row-label">Satisfaction</span>
                  <span className="ah-info-row-val" style={{ color: "#059669" }}>94%</span>
                </div>
              </div>

              {/* Response Time */}
              <div className="ah-info-card">
                <div className="ah-info-icon" style={{ background: "#f0f9ff" }}>
                  <Clock style={{ width: 18, height: 18, color: "#0284c7" }} />
                </div>
                <p className="ah-info-title">Response Time</p>
                <p className="ah-info-sub">Average across teams</p>
                <div className="ah-info-row">
                  <span className="ah-info-row-label">IT Support</span>
                  <span className="ah-info-row-val">1.8 hrs</span>
                </div>
                <div className="ah-info-row">
                  <span className="ah-info-row-label">HR Support</span>
                  <span className="ah-info-row-val">3.1 hrs</span>
                </div>
                <div className="ah-info-row">
                  <span className="ah-info-row-label">General</span>
                  <span className="ah-info-row-val">5.2 hrs</span>
                </div>
              </div>

              {/* System Status */}
              <div className="ah-info-card">
                <div className="ah-info-icon" style={{ background: "#f0fdf4" }}>
                  <CheckCircle style={{ width: 18, height: 18, color: "#059669" }} />
                </div>
                <p className="ah-info-title">System Status</p>
                <p className="ah-info-sub">All services operational</p>
                <div className="ah-info-row">
                  <span className="ah-info-row-label">
                    <span className="ah-status-dot" />
                    API Service
                  </span>
                  <span className="ah-status-badge">Active</span>
                </div>
                <div className="ah-info-row">
                  <span className="ah-info-row-label">
                    <span className="ah-status-dot" />
                    Database
                  </span>
                  <span className="ah-status-badge">Active</span>
                </div>
                <div className="ah-info-row">
                  <span className="ah-info-row-label">
                    <span className="ah-status-dot" />
                    Storage
                  </span>
                  <span className="ah-status-badge">Active</span>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminHome;