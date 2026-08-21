import { ExportDatas } from "@/API/endpoint";
import Sidebar from "@/components/ui/Sidebar";
import Chart from "@/components/ui/charts";
import { useEffect, useRef, useState } from "react";
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

  // Tracks which breakpoint category we were last in, so resizing the
  // window *within* desktop (say, dragging it a little wider) doesn't
  // stomp on a manual sidebar toggle. The sidebar is only forced
  // open/closed when the person crosses into or out of desktop.
  const prevCategoryRef = useRef<"mobile" | "tablet" | "desktop" | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 640;
      const tablet = width >= 640 && width < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);

      const category: "mobile" | "tablet" | "desktop" = mobile
        ? "mobile"
        : tablet
          ? "tablet"
          : "desktop";
      if (prevCategoryRef.current !== category) {
        setSidebarOpen(category === "desktop");
        prevCategoryRef.current = category;
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
      (ticket) => ticket.status === "open" || ticket.status === "new",
    ).length;
    const inProgress = tickets.filter(
      (ticket) => ticket.status === "In Progress",
    ).length;
    const closed = tickets.filter(
      (ticket) =>
        ticket.status === "closed" ||
        ticket.status === "Approved" ||
        ticket.status === "Rejected",
    ).length;
    const highPriority = tickets.filter(
      (ticket) =>
        ticket.priority === "1-Critical" || ticket.priority === "2-High",
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
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
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

  const resolutionRate =
    tickets.length > 0 ? Math.round((stats.closed / tickets.length) * 100) : 0;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}</style>

      <div className="min-h-screen bg-[#f5f5f8] font-[Outfit,sans-serif]">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {(isMobile || isTablet) && sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        <div
          className={cn(
            "ml-0 transition-all duration-300 ease-in-out",
            sidebarOpen ? "lg:ml-64" : "lg:ml-20",
          )}
        >
          {/* HEADER */}
          <motion.div
            className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e8e8f0] bg-white px-4 py-5 sm:px-6 md:px-8 md:py-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1">
                <span className="h-[5px] w-[5px] rounded-full bg-indigo-600" />
                <span className="text-[0.63rem] font-bold uppercase tracking-widest text-indigo-600">
                  Admin Portal
                </span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#0f0f1a] sm:text-2xl md:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-[#8888a0]">
                Welcome back, {TitleCase(user?.name)}. Here's your overview for
                today.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live Data
            </div>
          </motion.div>

          <main className="space-y-5 px-4 py-6 sm:px-6 md:px-8 md:py-8">
            {/* STATS */}
            <div>
              <div className="mb-3.5 flex items-center justify-between">
                <span className="text-[0.66rem] font-bold uppercase tracking-widest text-[#9090a8]">
                  Overview
                </span>
                <span className="text-xs text-[#c0c0d0]">
                  Live ticket stats
                </span>
              </div>
              <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {statCards.map((stat, index) => (
                  <motion.div
                    key={index}
                    style={
                      {
                        "--accent": stat.accent,
                        "--soft-bg": stat.softBg,
                      } as React.CSSProperties
                    }
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl border border-[#e8e8f0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/30 hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] sm:p-6"
                  >
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-[var(--accent)] opacity-60" />
                    <p className="text-[0.66rem] font-bold uppercase tracking-widest text-[#9090a8]">
                      {stat.title}
                    </p>
                    <p className="mt-1.5 text-3xl font-extrabold leading-none text-[#0f0f1a]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-[#b0b0c8]">
                      {stat.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--soft-bg)]">
                        <stat.icon className="h-4 w-4 text-[var(--accent)]" />
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-600">
                        {stat.trend}
                      </span>
                    </div>
                    <stat.icon className="pointer-events-none absolute -bottom-2.5 -right-1.5 h-20 w-20 text-[var(--accent)] opacity-[0.04]" />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* CHARTS + SIDE PANEL */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Chart */}
              <motion.div
                className="overflow-hidden rounded-2xl border border-[#e8e8f0] bg-white lg:col-span-2"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.38 }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0f0f6] px-5 pb-4 pt-5 sm:px-6">
                  <div>
                    <p className="text-sm font-bold text-[#1a1a2e]">
                      Ticket Analytics
                    </p>
                    <p className="mt-0.5 text-xs text-[#9090a8]">
                      Overview of ticket status and trends
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-emerald-600">
                    <Activity className="h-[11px] w-[11px]" />
                    Live
                  </div>
                </div>
                <div className="px-5 pb-6 pt-5 sm:px-6">
                  {loading ? (
                    <div className="flex h-56 items-center justify-center">
                      <Loader />
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#f8f8fb] p-4">
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
                <div className="overflow-hidden rounded-2xl border border-[#e8e8f0] bg-white">
                  <div className="border-b border-[#f0f0f6] px-5 py-4">
                    <p className="text-sm font-bold text-[#1a1a2e]">
                      Performance Metrics
                    </p>
                  </div>
                  <div className="space-y-3 px-5 py-4">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-sm text-[#4a4a6a]">
                        <span>Resolution Rate</span>
                        <span className="font-bold text-emerald-600">
                          {resolutionRate}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f6]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-[width] duration-500"
                          style={{ width: `${resolutionRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#f5f5fa] py-2 text-sm">
                      <span className="text-[#7070a0]">Avg. Response Time</span>
                      <span className="font-bold text-sky-600">2.4 hrs</span>
                    </div>
                    <div className="flex items-start justify-between border-b border-[#f5f5fa] py-2 text-sm">
                      <span className="flex items-center gap-1.5 text-[#7070a0]">
                        <TrendingUp className="h-[11px] w-[11px] text-emerald-600" />
                        Improvement
                      </span>
                      <span className="font-bold text-emerald-600">
                        +15% this month
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 text-sm">
                      <span className="text-[#7070a0]">Team Active</span>
                      <span className="font-bold text-violet-600">12 / 15</span>
                    </div>
                  </div>
                </div>

                {/* Priority Alerts */}
                <div className="overflow-hidden rounded-2xl border border-[#e8e8f0] bg-white">
                  <div className="border-b border-[#f0f0f6] px-5 py-4">
                    <p className="text-sm font-bold text-[#1a1a2e]">
                      Priority Alerts
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    {stats.highPriority > 0 ? (
                      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                        <p className="mb-1 flex items-center gap-2 text-sm font-bold text-orange-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Attention Required
                        </p>
                        <p className="text-xs text-orange-600">
                          {stats.highPriority} high priority tickets need
                          immediate attention.
                        </p>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <CheckCircle className="mx-auto h-9 w-9 text-emerald-500" />
                        <p className="mt-3 text-sm font-bold text-[#1a1a2e]">
                          All systems operational
                        </p>
                        <p className="mt-0.5 text-xs text-[#9090a8]">
                          No critical issues detected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RECENT ACTIVITY */}
            <motion.div
              className="overflow-hidden rounded-2xl border border-[#e8e8f0] bg-white"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.38 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f6] px-5 py-4 sm:px-6">
                <div>
                  <p className="text-sm font-bold text-[#1a1a2e]">
                    Recent Activity
                  </p>
                  <p className="mt-0.5 text-xs text-[#9090a8]">
                    Latest tickets and updates
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100"
                  onClick={() => navigate("/all-tickets")}
                >
                  <Ticket className="h-[13px] w-[13px]" />
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
                    <div
                      key={ticket._id}
                      className="flex items-center gap-3 border-b border-[#f5f5fa] px-5 py-3.5 transition-colors last:border-none hover:bg-[#f8f8fb] sm:px-6"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                        <Ticket className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[#1a1a2e]">
                            {ticket.category}
                          </span>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold",
                              getStatusColor(ticket.status),
                            )}
                          >
                            {ticket.status}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-[0.7rem] text-[#9090a8]">
                          <span className="flex items-center gap-1">
                            <Users className="h-2.5 w-2.5" />
                            {ticket.assignedTo || "Unassigned"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e8e8f0] text-[#9090a8] transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => navigate(`/ticket/${ticket._id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#f5f5f8]">
                    <Ticket className="h-[22px] w-[22px] text-[#c0c0d0]" />
                  </div>
                  <p className="text-sm font-bold text-[#1a1a2e]">
                    No tickets found
                  </p>
                  <p className="mt-0.5 text-xs text-[#9090a8]">
                    Tickets will appear here once created
                  </p>
                </div>
              )}
            </motion.div>

            {/* BOTTOM INFO CARDS */}
            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.38 }}
            >
              {/* Team Performance */}
              <div className="rounded-2xl border border-[#e8e8f0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
                  <Users className="h-[18px] w-[18px] text-violet-600" />
                </div>
                <p className="text-sm font-bold text-[#1a1a2e]">
                  Team Performance
                </p>
                <p className="mb-3 text-xs text-[#9090a8]">
                  This week's metrics
                </p>
                <div className="flex items-center justify-between border-b border-[#f5f5fa] py-2 text-sm">
                  <span className="text-[#8080a0]">Tickets Closed</span>
                  <span className="font-bold text-[#1a1a2e]">42</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#f5f5fa] py-2 text-sm">
                  <span className="text-[#8080a0]">Avg. Time</span>
                  <span className="font-bold text-[#1a1a2e]">4.2 hrs</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#8080a0]">Satisfaction</span>
                  <span className="font-bold text-emerald-600">94%</span>
                </div>
              </div>

              {/* Response Time */}
              <div className="rounded-2xl border border-[#e8e8f0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
                  <Clock className="h-[18px] w-[18px] text-sky-600" />
                </div>
                <p className="text-sm font-bold text-[#1a1a2e]">
                  Response Time
                </p>
                <p className="mb-3 text-xs text-[#9090a8]">
                  Average across teams
                </p>
                <div className="flex items-center justify-between border-b border-[#f5f5fa] py-2 text-sm">
                  <span className="text-[#8080a0]">IT Support</span>
                  <span className="font-bold text-[#1a1a2e]">1.8 hrs</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#f5f5fa] py-2 text-sm">
                  <span className="text-[#8080a0]">HR Support</span>
                  <span className="font-bold text-[#1a1a2e]">3.1 hrs</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#8080a0]">General</span>
                  <span className="font-bold text-[#1a1a2e]">5.2 hrs</span>
                </div>
              </div>

              {/* System Status */}
              <div className="rounded-2xl border border-[#e8e8f0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                  <CheckCircle className="h-[18px] w-[18px] text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-[#1a1a2e]">
                  System Status
                </p>
                <p className="mb-3 text-xs text-[#9090a8]">
                  All services operational
                </p>
                {["API Service", "Database", "Storage"].map((service) => (
                  <div
                    key={service}
                    className="flex items-center justify-between border-b border-[#f5f5fa] py-2 text-sm last:border-none"
                  >
                    <span className="flex items-center text-[#8080a0]">
                      <span className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full bg-emerald-500" />
                      {service}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.62rem] font-bold text-emerald-600">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminHome;
