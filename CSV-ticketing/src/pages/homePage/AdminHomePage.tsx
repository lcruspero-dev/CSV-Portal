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
  TrendingUp,
  RefreshCw,
  Heart,
  Leaf,
  PieChart,
  Cannabis ,
  Clover ,
  LeafyGreen 
} from "lucide-react";  

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
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
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

  // Thanksgiving-themed loading component
  const ThanksgivingLoader = () => (
    <div className="flex items-center justify-center">
      <div className="relative">
        <PieChart className="h-8 w-8 text-amber-600 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf className="h-4 w-4 text-green-600 animate-bounce" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-brown-50">
      {/* Sidebar */}
      <div className={`${isMobile ? "fixed inset-y-0 left-0 z-50" : "relative flex-shrink-0"} transition-all duration-300`}>
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Thanksgiving decorations */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Leaf className="h-6 w-6 text-green-500/40 animate-float" />
          <Clover  className="h-5 w-5 text-yellow-600/40 animate-float" style={{ animationDelay: '1s' }} />
          <Heart className="h-6 w-6 text-rose-500/40 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Main content area */}
        <main className="flex-1 max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-brown-600 bg-clip-text text-transparent font-serif">
              🦃 Thanksgiving Dashboard 🍂
            </h1>
            <p className="text-amber-700 mt-2">Monitoring blessings and grateful activities</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden border-2 border-amber-400 shadow-2xl bg-gradient-to-br from-amber-50 to-orange-100 text-brown-900">
              <div className="absolute top-2 right-2">
                <Cannabis  className="h-6 w-6 text-amber-600/20" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-700 text-sm font-medium">🦃 Total Blessings</p>
                    <p className="text-3xl font-bold mt-2 text-brown-900">{stats.total}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-amber-700 text-sm">All time gratitude</span>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-500/20 rounded-lg border border-amber-400">
                    <PieChart className="h-6 w-6 text-amber-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-700 text-sm font-medium">🍂 Open LeafyGreen </p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.open}</p>
                    <Badge className="bg-green-100 text-green-700 border-green-300 mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      Ready for gathering
                    </Badge>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg border border-green-400">
                    <LeafyGreen  className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-400 shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-700 text-sm font-medium">👨‍🌾 In Progress</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 mt-2">
                      Active LeafyGreen 
                    </Badge>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-400">
                    <RefreshCw className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-500 shadow-2xl bg-gradient-to-br from-red-50 to-rose-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-700 text-sm font-medium">🎯 Priority Tasks</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.highPriority}</p>
                    <Badge className="bg-red-100 text-red-700 border-red-300 mt-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Needs attention
                    </Badge>
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-lg border border-red-500">
                    <Clover  className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <Card className="lg:col-span-2 border-2 border-amber-400 shadow-2xl bg-gradient-to-br from-amber-50 to-orange-100">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg text-amber-700 font-serif">
                    <BarChart3 className="h-5 w-5 text-amber-600" />
                    🍁 LeafyGreen  Analytics
                  </CardTitle>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-400 text-xs">
                    Real-time blessings
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <ThanksgivingLoader />
                  </div>
                ) : (
                  <div className="bg-white/50 rounded-lg p-4 border border-amber-400/30">
                    <Chart tickets={tickets} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card className="border-2 border-purple-400 shadow-2xl bg-gradient-to-br from-purple-50 to-violet-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-purple-700 font-serif">
                    <Heart className="h-5 w-5 text-purple-600" />
                    🙏 Blessing Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg border border-purple-300">
                    <span className="text-sm font-medium text-purple-700">Completed LeafyGreen </span>
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      {stats.closed}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg border border-purple-300">
                    <span className="text-sm font-medium text-purple-700">Completion Rate</span>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      {stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg border border-purple-300">
                    <span className="text-sm font-medium text-purple-700">Avg. Resolution</span>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-400">
                      2.4h
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-400 shadow-2xl bg-gradient-to-br from-red-50 to-pink-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-red-700 font-serif">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    🎯 Priority Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.highPriority > 0 ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-red-100 border-2 border-red-400 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
                          <span className="font-medium text-red-700">Attention Needed!</span>
                        </div>
                        <p className="text-sm text-red-600">
                          {stats.highPriority} tasks need immediate attention!
                        </p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border border-amber-400" size="sm">
                        🚨 View Priority Tasks
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-700 text-sm">All tasks are on track!</p>
                      <p className="text-green-600 text-xs mt-1">Everything is running smoothly</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity Section */}
          <Card className="border-2 border-yellow-400 shadow-2xl bg-gradient-to-br from-yellow-50 to-amber-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700 font-serif">
                <Leaf className="h-5 w-5 text-yellow-600" />
                🍂 Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <ThanksgivingLoader />
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket._id}
                      className="flex items-center justify-between p-3 bg-amber-100 rounded-lg border border-amber-300 hover:bg-amber-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <LeafyGreen  className="h-4 w-4 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium text-amber-900">
                            {ticket.category}
                          </p>
                          <p className="text-xs text-amber-700">
                            Handled by: {ticket.assignedTo || 'Team'}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent border-amber-400 text-amber-700 hover:bg-amber-200" size="sm">
                    🍁 View All Activities
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Cannabis  className="h-12 w-12 text-amber-400 mx-auto mb-3 animate-float" />
                  <p className="text-amber-700">No activities yet</p>
                  <p className="text-sm text-amber-600 mt-1">
                    Tasks and activities will appear here once they start
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Thanksgiving Footer */}
          <div className="text-center pt-6 border-t border-amber-400/30">
            <p className="text-amber-700 text-sm">
              🦃 Happy Thanksgiving! May your dashboard be blessed and your tasks be filled with gratitude! 🍂
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHome;