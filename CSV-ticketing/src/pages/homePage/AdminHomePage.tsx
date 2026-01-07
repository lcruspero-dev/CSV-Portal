import { ExportDatas } from "@/API/endpoint";
import Sidebar from "@/components/ui/Sidebar";
import Chart from "@/components/ui/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Ticket,
  Clock,
  AlertTriangle,
  RefreshCw,
  Bell,
  Package,
  Menu,
  Users,
  CheckCircle,
  TrendingUp,
  Activity,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

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
  const [tickets, setTickets] = useState<Ticket[]>([]);
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

      if (width < 640) {
        setSidebarOpen(false);
      } else if (width < 1024) {
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

    setStats({
      total,
      open,
      inProgress,
      closed,
      highPriority,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "new":
        return "text-green-600 bg-green-50 border-green-200";
      case "in progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "closed":
      case "approved":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Loading component
  const Loader = () => (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile ? "fixed inset-y-0 left-0 z-50" : "relative flex-shrink-0"
        } transition-all duration-300`}
      >
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Mobile overlay */}
      {(isMobile || isTablet) && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Main content area */}
        <main className="flex-1 mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back! Here's your overview for today.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {[
              {
                title: "Total Tickets",
                value: stats.total,
                description: "All tickets in system",
                icon: <Package className="h-5 w-5 sm:h-6 sm:w-6" />,
                color: "border-purple-200",
                bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
                iconBg: "bg-gradient-to-br from-purple-600 to-indigo-600",
                trend: "+12%",
              },
              {
                title: "Open Tickets",
                value: stats.open,
                description: "Requiring attention",
                icon: <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />,
                color: "border-blue-200",
                bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
                iconBg: "bg-gradient-to-br from-blue-600 to-cyan-600",
                trend: "+5%",
              },
              {
                title: "In Progress",
                value: stats.inProgress,
                description: "Being worked on",
                icon: <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6" />,
                color: "border-amber-200",
                bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
                iconBg: "bg-gradient-to-br from-amber-600 to-yellow-600",
                trend: "+8%",
              },
              {
                title: "High Priority",
                value: stats.highPriority,
                description: "Critical issues",
                icon: <Bell className="h-5 w-5 sm:h-6 sm:w-6" />,
                color: "border-rose-200",
                bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
                iconBg: "bg-gradient-to-br from-rose-600 to-pink-600",
                trend: "+3%",
              },
            ].map((stat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="relative overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-300 h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-medium text-gray-500">
                            {stat.title}
                          </span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {stat.value}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {stat.description}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            {stat.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <Card className="lg:col-span-2 border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Ticket Analytics
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Overview of ticket status and trends
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      <Activity className="h-3 w-3 mr-1" />
                      Live Data
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-purple-600"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Chart tickets={tickets} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card className="border border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Resolution Rate
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {tickets.length > 0
                          ? Math.round((stats.closed / tickets.length) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            tickets.length > 0
                              ? (stats.closed / tickets.length) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Avg. Response Time
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        2.4 hrs
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>Improvement of 15% this month</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Team Members Active
                      </span>
                      <span className="text-sm font-semibold text-purple-600">
                        12/15
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Priority Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.highPriority > 0 ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="h-5 w-5 text-rose-600" />
                          <span className="font-semibold text-rose-700">
                            Attention Required
                          </span>
                        </div>
                        <p className="text-sm text-rose-600">
                          {stats.highPriority} high priority tickets need
                          immediate attention
                        </p>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
                        size="sm"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        View Priority Tickets
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium">
                        All systems operational
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        No critical issues detected
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity Section */}
          <Card className="border border-gray-200">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Latest tickets and updates
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  View All Tickets
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader />
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.slice(0, isMobile ? 3 : 5).map((ticket) => (
                    <div
                      key={ticket._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-white rounded-lg border border-gray-300">
                          <Ticket className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {ticket.category}
                            </p>
                            <Badge
                              className={`text-xs ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {ticket.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {ticket.assignedTo || "Unassigned"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-purple-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-100 rounded-full inline-block mb-3">
                    <Ticket className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium">No tickets found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Tickets will appear here once created
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Team Performance
                    </p>
                    <p className="text-xs text-gray-600">
                      This week's metrics
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tickets Closed</span>
                    <span className="font-medium text-gray-900">42</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Time</span>
                    <span className="font-medium text-gray-900">4.2 hrs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Satisfaction</span>
                    <span className="font-medium text-green-600">94%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Response Time
                    </p>
                    <p className="text-xs text-gray-600">
                      Average across teams
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">IT Support</span>
                    <span className="font-medium text-gray-900">1.8 hrs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">HR Support</span>
                    <span className="font-medium text-gray-900">3.1 hrs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">General</span>
                    <span className="font-medium text-gray-900">5.2 hrs</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      System Status
                    </p>
                    <p className="text-xs text-gray-600">
                      All services operational
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600">API Service</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600">Database</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600">Storage</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHome;