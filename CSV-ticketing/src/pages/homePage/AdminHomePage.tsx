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
  Ghost,
  Skull,
  ShipWheel,
  Eclipse ,
  Moon,
  Candy
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
        return 'text-green-400 bg-green-900/30 border-green-600';
      case 'in progress':
        return 'text-blue-400 bg-blue-900/30 border-blue-600';
      case 'closed':
      case 'approved':
        return 'text-gray-400 bg-gray-900/30 border-gray-600';
      case 'rejected':
        return 'text-red-400 bg-red-900/30 border-red-600';
      default:
        return 'text-gray-400 bg-gray-900/30 border-gray-600';
    }
  };

  // Halloween-themed loading component
  const HalloweenLoader = () => (
    <div className="flex items-center justify-center">
      <div className="relative">
        <ShipWheel className="h-8 w-8 text-orange-400 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Eclipse  className="h-3 w-3 text-gray-800 animate-bounce" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-orange-900">
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
        {/* Halloween decorations */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Ghost className="h-6 w-6 text-white/40 animate-float" />
          <Eclipse  className="h-5 w-5 text-gray-400/40 animate-float" style={{ animationDelay: '1s' }} />
          <ShipWheel className="h-6 w-6 text-orange-400/40 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Main content area */}
        <main className="flex-1 max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-purple-400 bg-clip-text text-transparent font-serif">
              🎃 Haunted Dashboard 🦇
            </h1>
            <p className="text-orange-200 mt-2">Monitoring spooky tickets and ghostly activities</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden border-2 border-orange-400 shadow-2xl bg-gradient-to-br from-purple-900 to-orange-900 text-white">
              <div className="absolute top-2 right-2">
                <Ghost className="h-6 w-6 text-white/20" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm font-medium">👻 Total Hauntings</p>
                    <p className="text-3xl font-bold mt-2">{stats.total}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-orange-200 text-sm">All time scares</span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-400">
                    <Skull className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500 shadow-2xl bg-gradient-to-br from-gray-800 to-green-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm font-medium">🕸️ Open Hauntings</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">{stats.open}</p>
                    <Badge className="bg-green-900/50 text-green-300 border-green-500 mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      Needs exorcism
                    </Badge>
                  </div>
                  <div className="p-3 bg-green-900/30 rounded-lg border border-green-500">
                    <Moon className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-400 shadow-2xl bg-gradient-to-br from-gray-800 to-blue-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm font-medium">🧟 In Progress</p>
                    <p className="text-3xl font-bold text-blue-400 mt-2">{stats.inProgress}</p>
                    <Badge className="bg-blue-900/50 text-blue-300 border-blue-400 mt-2">
                      Active haunting
                    </Badge>
                  </div>
                  <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-400">
                    <RefreshCw className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-500 shadow-2xl bg-gradient-to-br from-gray-800 to-red-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-200 text-sm font-medium">💀 Critical Scares</p>
                    <p className="text-3xl font-bold text-red-400 mt-2">{stats.highPriority}</p>
                    <Badge className="bg-red-900/50 text-red-300 border-red-500 mt-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Urgent exorcism needed
                    </Badge>
                  </div>
                  <div className="p-3 bg-red-900/30 rounded-lg border border-red-500">
                    <Eclipse  className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <Card className="lg:col-span-2 border-2 border-orange-400 shadow-2xl bg-gradient-to-br from-gray-800 to-purple-900">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg text-orange-300 font-serif">
                    <BarChart3 className="h-5 w-5 text-orange-400" />
                    🎃 Haunting Analytics
                  </CardTitle>
                  <Badge className="bg-orange-900/50 text-orange-300 border-orange-400 text-xs">
                    Real-time scares
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <HalloweenLoader />
                  </div>
                ) : (
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-orange-400/30">
                    <Chart tickets={tickets} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card className="border-2 border-purple-400 shadow-2xl bg-gradient-to-br from-gray-800 to-purple-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-purple-300 font-serif">
                    <Ghost className="h-5 w-5 text-purple-400" />
                    👻 Haunt Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-900/30 rounded-lg border border-purple-400/50">
                    <span className="text-sm font-medium text-purple-200">Exorcised Haunts</span>
                    <Badge className="bg-green-900/50 text-green-300 border-green-500">
                      {stats.closed}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-900/30 rounded-lg border border-purple-400/50">
                    <span className="text-sm font-medium text-purple-200">Exorcism Rate</span>
                    <Badge className="bg-blue-900/50 text-blue-300 border-blue-400">
                      {stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-900/30 rounded-lg border border-purple-400/50">
                    <span className="text-sm font-medium text-purple-200">Avg. Scare Time</span>
                    <Badge className="bg-orange-900/50 text-orange-300 border-orange-400">
                      2.4h
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-400 shadow-2xl bg-gradient-to-br from-gray-800 to-red-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-red-300 font-serif">
                    <Skull className="h-5 w-5 text-red-400" />
                    💀 Priority Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.highPriority > 0 ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-red-900/40 border-2 border-red-500 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
                          <span className="font-medium text-red-200">Critical Hauntings!</span>
                        </div>
                        <p className="text-sm text-red-300">
                          {stats.highPriority} hauntings need immediate exorcism!
                        </p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border border-orange-400" size="sm">
                        🚨 View All Emergencies
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Candy className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-300 text-sm">No spooky emergencies!</p>
                      <p className="text-green-200 text-xs mt-1">All hauntings are under control</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity Section */}
          <Card className="border-2 border-yellow-400 shadow-2xl bg-gradient-to-br from-gray-800 to-yellow-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-300 font-serif">
                <Eclipse  className="h-5 w-5 text-yellow-400" />
                🦇 Recent Hauntings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <HalloweenLoader />
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket._id}
                      className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg border border-yellow-400/30 hover:bg-yellow-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ShipWheel className="h-4 w-4 text-orange-400" />
                        <div>
                          <p className="text-sm font-medium text-yellow-200">
                            {ticket.category}
                          </p>
                          <p className="text-xs text-yellow-300">
                            Haunted by: {ticket.assignedTo || 'Ghost'}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent border-orange-400 text-orange-300 hover:bg-orange-900/30" size="sm">
                    🕸️ View All Hauntings
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ghost className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-float" />
                  <p className="text-gray-300">No hauntings detected</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Ghostly activities will appear here once they start haunting
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Halloween Footer */}
          <div className="text-center pt-6 border-t border-orange-400/30">
            <p className="text-orange-200 text-sm">
              🎃 Happy Halloween! May your dashboard be spooky and your tickets be treat-filled! 🦇
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHome;