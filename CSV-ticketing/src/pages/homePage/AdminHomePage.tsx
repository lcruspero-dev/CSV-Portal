import { ExportDatas } from "@/API/endpoint";
import Sidebar from "@/components/ui/Sidebar";
import Chart from "@/components/ui/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Ticket,
  Clock,
  AlertTriangle,
  RefreshCw,
  Gift,
  Star,
  Snowflake,
  TreePine,
  CandyCane,
  Bell,
  Package,
  Menu
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
    highPriority: 0
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);  // Mobile: < 640px
      setIsTablet(width >= 640 && width < 1024);  // Tablet: 640px - 1024px
      
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
    const open = tickets.filter(ticket => 
      ticket.status === 'open' || ticket.status === 'new'
    ).length;
    const inProgress = tickets.filter(ticket => 
      ticket.status === 'In Progress'
    ).length;
    const closed = tickets.filter(ticket => 
      ticket.status === 'closed' || ticket.status === 'Approved' || ticket.status === 'Rejected'
    ).length;
    const highPriority = tickets.filter(ticket => 
      ticket.priority === '1-Critical' || ticket.priority === '2-High'
    ).length;

    setStats({
      total,
      open,
      inProgress,
      closed,
      highPriority
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'new':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'closed':
      case 'approved':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Christmas-themed loading component
  const ChristmasLoader = () => (
    <div className="flex items-center justify-center">
      <div className="relative">
        <TreePine className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 animate-pulse drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 animate-spin" style={{ animationDuration: '2s' }} />
        </div>
      </div>
    </div>
  );

  // Animation variants for responsive animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
      {/* Mobile Menu Button */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-r from-red-600 to-green-600 rounded-full flex items-center justify-center border-2 border-white/30 shadow-2xl hover:from-red-700 hover:to-green-700 transition-all duration-300"
        >
          <Menu className="h-5 w-5 text-white" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        </button>
      )}

      {/* Sidebar */}
      <div className={`${isMobile ? "fixed inset-y-0 left-0 z-50" : "relative flex-shrink-0"} transition-all duration-300`}>
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
        {/* Christmas Lights Background - Reduced for mobile */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(isMobile ? 15 : 25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: i % 4 === 0 ? '#ef4444' : i % 4 === 1 ? '#22c55e' : i % 4 === 2 ? '#3b82f6' : '#f59e0b',
                boxShadow: `0 0 ${isMobile ? '10px' : '20px'} ${i % 4 === 0 ? '#ef4444' : i % 4 === 1 ? '#22c55e' : i % 4 === 2 ? '#3b82f6' : '#f59e0b'}`,
                animationDelay: `${i * 0.2}s`,
                opacity: isMobile ? 0.1 : 0.2,
              }}
            />
          ))}
        </div>

        {/* Main content area */}
        <main className="flex-1 mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Header - Responsive */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8 px-1">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-blue-600 bg-clip-text text-transparent font-serif drop-shadow-lg px-2"
            >
              {isMobile ? '🎄 Dashboard' : '🎄 Christmas Dashboard'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-blue-700 mt-1 sm:mt-2 text-xs sm:text-sm bg-gradient-to-r from-red-100 via-white to-green-100 rounded-lg py-1 sm:py-2 px-2 sm:px-4 border border-red-200/30 inline-block shadow-sm max-w-[90%] sm:max-w-none"
            >
              {isMobile ? 'Holiday activities & tasks' : 'Monitoring holiday activities and festive tasks'}
            </motion.p>
          </div>

          {/* Stats Grid - Responsive */}
          <motion.div 
            className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {[
              {
                title: "🎁 Total Tasks",
                value: stats.total,
                description: "All festive activities",
                icon: <Package className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />,
                color: "border-red-400",
                bgColor: "from-red-50/90 to-rose-100/90",
                textColor: "text-red-900",
                accentColor: "text-red-700",
                badge: null
              },
              {
                title: "❄️ Open Tasks",
                value: stats.open,
                description: "Ready for wrapping",
                icon: <Snowflake className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />,
                color: "border-green-400",
                bgColor: "from-green-50/90 to-emerald-100/90",
                textColor: "text-green-900",
                accentColor: "text-green-700",
                badge: <Clock className="h-3 w-3 mr-1" />
              },
              {
                title: "🎄 In Progress",
                value: stats.inProgress,
                description: "Being wrapped",
                icon: <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />,
                color: "border-blue-400",
                bgColor: "from-blue-50/90 to-cyan-100/90",
                textColor: "text-blue-900",
                accentColor: "text-blue-700",
                badge: null
              },
              {
                title: "🎯 Priority Tasks",
                value: stats.highPriority,
                description: "Needs Santa's attention",
                icon: <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />,
                color: "border-amber-400",
                bgColor: "from-amber-50/90 to-yellow-100/90",
                textColor: "text-amber-900",
                accentColor: "text-amber-700",
                badge: <AlertTriangle className="h-3 w-3 mr-1" />
              }
            ].map((stat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className={`relative overflow-hidden border-2 ${stat.color} shadow-lg sm:shadow-2xl bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm h-full`}>
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-medium ${stat.accentColor} truncate`}>
                          {stat.title}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 ${stat.textColor}">
                          {stat.value}
                        </p>
                        <div className="flex items-center gap-1 mt-1 sm:mt-2 flex-wrap">
                          {stat.badge}
                          <span className={`text-xs ${stat.accentColor} truncate`}>
                            {stat.description}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 sm:p-3 bg-gradient-to-r from-red-500/20 to-green-500/20 rounded-lg border border-current ml-2 flex-shrink-0">
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts and Analytics Section - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Chart */}
            <Card className="lg:col-span-2 border-2 border-red-400 shadow-xl sm:shadow-2xl bg-gradient-to-br from-red-50/90 to-rose-100/90 backdrop-blur-sm">
              <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-red-700 font-serif">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    {isMobile ? '📊 Analytics' : '🎄 Festive Analytics'}
                  </CardTitle>
                  <Badge className="bg-red-100 text-red-700 border-red-400 text-xs w-fit">
                    {isMobile ? 'Live Data' : 'Real-time holiday data'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                {loading ? (
                  <div className="flex items-center justify-center h-48 sm:h-64">
                    <ChristmasLoader />
                  </div>
                ) : (
                  <div className="bg-white/60 rounded-lg p-2 sm:p-4 border border-red-400/30 shadow-inner">
                    <div className={isMobile ? "scale-90 origin-left" : ""}>
                      <Chart tickets={tickets} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              <Card className="border-2 border-green-400 shadow-xl sm:shadow-2xl bg-gradient-to-br from-green-50/90 to-emerald-100/90 backdrop-blur-sm">
                <CardHeader className="px-3 sm:px-6 py-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-green-700 font-serif">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    {isMobile ? '📈 Status' : '🎅 Task Status'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-4 px-3 sm:px-6">
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-green-100 rounded-lg border border-green-300">
                    <span className="text-xs sm:text-sm font-medium text-green-700">Completed</span>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                      {stats.closed}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-green-100 rounded-lg border border-green-300">
                    <span className="text-xs sm:text-sm font-medium text-green-700">Completion Rate</span>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                      {stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-green-100 rounded-lg border border-green-300">
                    <span className="text-xs sm:text-sm font-medium text-green-700">Avg. Time</span>
                    <Badge className="bg-red-100 text-red-700 border-red-400 text-xs">
                      {isMobile ? '2.4h' : '🎄 2.4h'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-400 shadow-xl sm:shadow-2xl bg-gradient-to-br from-amber-50/90 to-yellow-100/90 backdrop-blur-sm">
                <CardHeader className="px-3 sm:px-6 py-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-amber-700 font-serif">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                    {isMobile ? '⚠️ Priority' : '🎯 Priority Tasks'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  {stats.highPriority > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="p-2 sm:p-3 bg-amber-100 border-2 border-amber-400 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 animate-pulse" />
                          <span className="font-medium text-amber-700 text-sm">
                            {isMobile ? 'Alert!' : 'Santa Alert!'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-600">
                          {stats.highPriority} {isMobile ? 'urgent tasks' : 'tasks need immediate attention!'}
                        </p>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-600 hover:to-amber-700 text-white border border-red-400 text-xs sm:text-sm"
                        size={isMobile ? "sm" : "default"}
                      >
                        {isMobile ? '🚨 View' : '🚨 View Priority Tasks'}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-3 sm:py-4">
                      <TreePine className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 mx-auto mb-2" />
                      <p className="text-green-700 text-sm">All tasks are on track!</p>
                      <p className="text-green-600 text-xs mt-1">
                        {isMobile ? 'Smooth operations' : 'Smooth holiday operations'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity Section - Responsive */}
          <Card className="border-2 border-blue-400 shadow-xl sm:shadow-2xl bg-gradient-to-br from-blue-50/90 to-cyan-100/90 backdrop-blur-sm">
            <CardHeader className="px-3 sm:px-6 py-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-blue-700 font-serif">
                <CandyCane className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                {isMobile ? '📋 Recent' : '❄️ Recent Activities'}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {loading ? (
                <div className="flex items-center justify-center py-4 sm:py-8">
                  <ChristmasLoader />
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {tickets.slice(0, isMobile ? 3 : 5).map((ticket) => (
                    <div
                      key={ticket._id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-blue-100 rounded-lg border border-blue-300 hover:bg-blue-200 transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">
                            {ticket.category}
                          </p>
                          <p className="text-xs text-blue-700 truncate">
                            {isMobile ? 'Elves Team' : `Handled by: ${ticket.assignedTo || 'Elves Team'}`}
                          </p>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(ticket.status)} ml-2 flex-shrink-0`}>
                        {isMobile ? ticket.status.substring(0, 1) : ticket.status}
                      </Badge>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent border-blue-400 text-blue-700 hover:bg-blue-200 text-xs sm:text-sm"
                    size={isMobile ? "sm" : "default"}
                  >
                    {isMobile ? '❄️ All' : '❄️ View All Activities'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 sm:py-8">
                  <TreePine className="h-8 w-8 sm:h-12 sm:w-12 text-green-400 mx-auto mb-2 sm:mb-3 animate-float" />
                  <p className="text-blue-700 text-sm">No activities yet</p>
                  <p className="text-xs sm:text-sm text-blue-600 mt-1 px-2">
                    {isMobile ? 'Santa\'s workshop starting soon' : 'Tasks will appear here once Santa\'s workshop starts'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Christmas Footer - Responsive */}
          <div className="text-center pt-4 sm:pt-6 border-t border-red-200/50">
            <p className="text-red-700 text-xs sm:text-sm bg-gradient-to-r from-red-50 via-white to-green-50 rounded-lg py-2 px-3 sm:px-4 border border-red-200/30 shadow-sm mx-auto max-w-2xl">
              {isMobile ? (
                '🎅 Merry Christmas! 🎄'
              ) : isTablet ? (
                '🎅 Merry Christmas & Happy Holidays! 🎄'
              ) : (
                '🎅 Merry Christmas & Happy Holidays! May your dashboard be filled with joy and your tasks wrapped with success! 🎄'
              )}
            </p>
          </div>
        </main>
      </div>

      {/* Falling Snow Effect - Responsive density */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(isMobile ? 40 : isTablet ? 60 : 80)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              top: `${Math.random() * -20}vh`,
              left: `${Math.random() * 100}vw`,
              width: isMobile ? '1px' : '2px',
              height: isMobile ? '1px' : '2px',
              animation: `snowfall ${10 + Math.random() * 15}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.5 + Math.random() * 0.5,
              filter: 'blur(0.5px)',
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
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        /* Custom breakpoints */
        @media (max-width: 480px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        /* Hide scrollbar but keep functionality */
        .overflow-x-hidden {
          overflow-x: hidden;
        }
        
        /* Better mobile touch targets */
        @media (max-width: 640px) {
          button, [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminHome;