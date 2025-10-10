import { ExportDatas } from "@/API/endpoint";
import Sidebar from "@/components/ui/Sidebar";
import Chart from "@/components/ui/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Ticket,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  RefreshCw
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
        return 'text-green-600 bg-green-50';
      case 'in progress':
        return 'text-blue-600 bg-blue-50';
      case 'closed':
      case 'approved':
        return 'text-gray-600 bg-gray-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Sidebar */}
      <div className={`${isMobile ? "fixed inset-y-0 left-0 z-50" : "relative flex-shrink-0"} transition-all duration-300`}>
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">


        {/* Main content area */}
        <main className="flex-1 max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Tickets</p>
                    <p className="text-3xl font-bold mt-2">{stats.total}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-blue-100 text-sm">All time</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-400/20 rounded-lg">
                    <Ticket className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Open Tickets</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.open}</p>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      Needs attention
                    </Badge>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 mt-2">
                      Active
                    </Badge>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <RefreshCw className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">High Priority</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.highPriority}</p>
                    <Badge variant="secondary" className="bg-red-50 text-red-700 mt-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Urgent
                    </Badge>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Ticket Analytics
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Real-time
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4">
                    <Chart tickets={tickets} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Closed Tickets</span>
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      {stats.closed}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <Badge variant="secondary">
                      {stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Avg. Response Time</span>
                    <Badge variant="secondary">2.4h</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Priority Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.highPriority > 0 ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-800">High Priority Tickets</span>
                        </div>
                        <p className="text-sm text-red-600">
                          {stats.highPriority} tickets need immediate attention
                        </p>
                      </div>
                      <Button variant="outline" className="w-full" size="sm">
                        View All Alerts
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No urgent alerts</p>
                      <p className="text-xs text-gray-500">All tickets are under control</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Ticket className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {ticket.category}
                          </p>
                          <p className="text-xs text-gray-500">
                            Assigned to: {ticket.assignedTo || 'Unassigned'}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full" size="sm">
                    View All Tickets
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No tickets found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Tickets will appear here once created
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminHome;