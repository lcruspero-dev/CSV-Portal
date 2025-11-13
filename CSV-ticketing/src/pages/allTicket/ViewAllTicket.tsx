import { TicketAPi } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingComponent from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  FileText,
  Ticket as TicketIcon,
  Heart,
  Clover,
  PieChart
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 

export interface Ticket {
  _id: string;
  assignedTo: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  status: string;
  user: {
    _id: string;
  };
  name: string;
  priority: string;
  file: string | null;
  ticketNumber: string;
  leaveDays: number;
  closingNote: string | null;
  department: string;
  __v: number;
}

const ViewAllTicket: React.FC = () => {
  const [allTicket, setAllTicket] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const getAllTicket = async () => {
    try {
      const response = await TicketAPi.getAllTicket();
      setAllTicket(response.data);
      setFilteredTickets(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTicket();
  }, []);

  // Filter tickets based on search and filters
  useEffect(() => {
    let filtered = allTicket;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    setFilteredTickets(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [allTicket, searchTerm, statusFilter]);

  // Get current tickets
  const getCurrentPageTickets = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTickets.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
      case "open":
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "in progress":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "1-critical":
        return "bg-red-500";
      case "2-high":
        return "bg-orange-500";
      case "3-moderate":
        return "bg-amber-500";
      case "4-low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-900 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl">
                  <TicketIcon className="h-6 w-6 text-white" />
                </div>
                Thanksgiving Support Requests
              </h1>
              <p className="text-amber-700 text-sm mt-1">
                We're grateful to assist you with your needs this season
              </p>
            </div>
          </div>
          
          <div className="bg-white px-4 py-3 rounded-lg border border-amber-200 shadow-sm">
            <div className="text-sm text-amber-600">Total Blessings Shared</div>
            <div className="text-2xl font-bold text-amber-900">
              {filteredTickets.length}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 shadow-sm border border-amber-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                <input
                  type="text"
                  placeholder="Search with gratitude by ticket number, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50 placeholder-amber-400"
                />
              </div>
              
              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(statusFilter !== "all") && (
                  <Badge variant="secondary" className="ml-1 bg-amber-500">
                    1
                  </Badge>
                )}
              </Button>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                >
                  Clear Blessings
                </Button>
              )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-amber-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    <Heart className="h-4 w-4 inline mr-1" />
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-amber-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50"
                  >
                    <option value="all">All Blessings</option>
                    <option value="open">Open with Gratitude</option>
                    <option value="In Progress">In Progress 🍂</option>
                    <option value="Approved">Approved with Thanks</option>
                    <option value="closed">Closed with Blessings</option>
                    <option value="Rejected">Needs More Gratitude</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-amber-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Open Requests</p>
                  <p className="text-xl font-bold text-amber-900">
                    {allTicket.filter(t => t.status.toLowerCase() === 'open').length}
                  </p>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Heart className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Blessings Completed</p>
                  <p className="text-xl font-bold text-green-900">
                    {allTicket.filter(t => t.status.toLowerCase() === 'closed').length}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clover className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-orange-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">In Progress</p>
                  <p className="text-xl font-bold text-orange-900">
                    {allTicket.filter(t => t.status.toLowerCase() === 'in progress').length}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <PieChart className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Gratitude</p>
                  <p className="text-xl font-bold text-blue-900">
                    {allTicket.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TicketIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Cards View */}
        <div className="block lg:hidden space-y-4 mb-6">
          {getCurrentPageTickets().length === 0 ? (
            <Card className="border border-amber-200">
              <CardContent className="text-center py-12">
                <div className="text-4xl mb-4">🦃</div>
                <TicketIcon className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-amber-900 mb-2">No blessings found</h3>
                <p className="text-amber-600">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your Clover filters" 
                    : "You haven't shared any requests yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            getCurrentPageTickets().map((ticket) => (
              <Card key={ticket._id} className="hover:shadow-md transition-shadow border border-amber-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-amber-100 rounded">
                        <TicketIcon className="h-3 w-3 text-amber-600" />
                      </div>
                      <span className="font-mono font-semibold text-amber-900">
                        {ticket.ticketNumber}
                      </span>
                    </div>
                    <Badge className={`border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-700">{formattedDate(ticket.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-900 font-medium">{ticket.category}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-700">{ticket.assignedTo || "Awaiting Helper"}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-amber-800 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`} />
                      <span className="text-xs text-amber-600">{ticket.priority}</span>
                    </div>
                    <Button
                      onClick={() => navigate(`/ticket/${ticket._id}`)}
                      size="sm"
                      className="flex items-center gap-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    >
                      <Eye className="h-3 w-3" />
                      View Blessing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <Card className="hidden lg:block shadow-sm border border-amber-200">
          <Table>
            <TableHeader className="bg-gradient-to-r from-amber-600 to-orange-600">
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="font-semibold text-white w-32">
                  <div className="flex items-center gap-2">
                    <TicketIcon className="h-4 w-4" />
                    Blessing #
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-white w-36">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Clover Date
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-white w-40">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Category
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Request Details
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-white w-28">
                  Priority
                </TableHead>
                <TableHead className="font-semibold text-white w-32">
                  <div className="flex items-center gap-2">
                    <Clover className="h-4 w-4" />
                    Status
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-white w-40">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Helper
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-white w-20">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentPageTickets().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="text-4xl mb-4">🍂</div>
                    <TicketIcon className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-amber-900 mb-2">No blessings found</h3>
                    <p className="text-amber-600">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your Clover filters" 
                        : "You haven't shared any requests yet"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPageTickets().map((ticket, index) => (
                  <TableRow 
                    key={ticket._id} 
                    className={`hover:bg-amber-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-amber-25"
                    }`}
                  >
                    <TableCell className="font-mono font-semibold text-amber-700">
                      {ticket.ticketNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-amber-500" />
                        {formattedDate(ticket.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-amber-900">
                      {ticket.category}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="truncate text-amber-800" title={ticket.description}>
                          {ticket.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`} />
                        <span className="text-xs text-amber-600">{ticket.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-amber-500" />
                        <span className="text-amber-700">{ticket.assignedTo || "Awaiting Helper"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => navigate(`/ticket/${ticket._id}`)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        {filteredTickets.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-sm text-amber-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of{" "}
              {filteredTickets.length} blessing{filteredTickets.length !== 1 ? 's' : ''}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 p-0 ${
                        pageNum === currentPage 
                          ? 'bg-amber-600 hover:bg-amber-700' 
                          : 'border-amber-300 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-amber-500">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 p-0 border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Thanksgiving Footer */}
        <div className="mt-8 text-center">
          <div className="text-amber-600 text-sm flex items-center justify-center gap-2">
            <span>🦃</span>
            <span>Thankful for the opportunity to serve you this season</span>
            <span>🍂</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllTicket;