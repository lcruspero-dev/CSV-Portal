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
  Ticket as TicketIcon
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
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
        return "bg-yellow-500";
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <TicketIcon className="h-7 w-7 text-blue-600" />
                My Tickets
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                View and manage all your submitted tickets
              </p>
            </div>
          </div>
          
          <div className="bg-white px-4 py-3 rounded-lg border shadow-sm">
            <div className="text-sm text-gray-600">Total Tickets</div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredTickets.length}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ticket number, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(statusFilter !== "all") && (
                  <Badge variant="secondary" className="ml-1">
                    1
                  </Badge>
                )}
              </Button>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Approved">Approved</option>
                    <option value="closed">Closed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Cards View */}
        <div className="block lg:hidden space-y-4 mb-6">
          {getCurrentPageTickets().length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <TicketIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "You haven't submitted any tickets yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            getCurrentPageTickets().map((ticket) => (
              <Card key={ticket._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <TicketIcon className="h-4 w-4 text-blue-600" />
                      <span className="font-mono font-semibold text-gray-900">
                        {ticket.ticketNumber}
                      </span>
                    </div>
                    <Badge className={`border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{formattedDate(ticket.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{ticket.category}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{ticket.assignedTo || "Unassigned"}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`} />
                      <span className="text-xs text-gray-500">{ticket.priority}</span>
                    </div>
                    <Button
                      onClick={() => navigate(`/ticket/${ticket._id}`)}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <Card className="hidden lg:block shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-700 w-32">
                  Ticket #
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-36">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-40">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Description
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-28">
                  Priority
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-32">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-40">
                  Assigned To
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-20">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentPageTickets().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <TicketIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your search or filters" 
                        : "You haven't submitted any tickets yet"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPageTickets().map((ticket, index) => (
                  <TableRow 
                    key={ticket._id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <TableCell className="font-mono font-semibold text-blue-600">
                      {ticket.ticketNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formattedDate(ticket.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {ticket.category}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="truncate" title={ticket.description}>
                          {ticket.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`} />
                        <span className="text-xs text-gray-600">{ticket.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{ticket.assignedTo || "Unassigned"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => navigate(`/ticket/${ticket._id}`)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
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
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of{" "}
              {filteredTickets.length} tickets
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
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
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 p-0"
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
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllTicket;