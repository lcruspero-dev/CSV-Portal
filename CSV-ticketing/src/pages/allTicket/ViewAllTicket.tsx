import { TicketAPi } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Gift,
  Snowflake,
  TreePine,
  Bell,
  Home,
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
      filtered = filtered.filter(
        (ticket) =>
          ticket.ticketNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-red-50">
        <div className="text-center">
          <div className="animate-bounce">
            <TreePine className="h-12 w-12 text-green-600 mx-auto mb-4" />
          </div>
          <p className="text-green-600 font-medium">Loading List...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 py-6 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-green-900 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-green-600 to-red-600 rounded-xl">
                  <TicketIcon className="h-6 w-6 text-white" />
                </div>
                View Tickets
              </h1>
              <p className="text-green-700 text-sm mt-1 flex items-center">
                Tracking all tickets
              </p>
            </div>
          </div>

          <div className="bg-white px-4 py-3 rounded-lg border border-green-200 shadow-sm">
            <div className="text-sm text-green-600">Total Requests</div>
            <div className="text-2xl font-bold text-green-900">
              {filteredTickets.length}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 shadow-sm border border-green-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                <input
                  type="text"
                  placeholder="Search by ticket number, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50 placeholder-green-400"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-100"
              >
                <Filter className="h-4 w-4" />
                Filters
                {statusFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-red-500"
                  ></Badge>
                )}
              </Button>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-800 hover:bg-red-100 flex items-center"
                >
                  <Snowflake className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-green-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-green-700 mb-2 flex items-center">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-green-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50"
                  >
                    <option value="all"> All Requests</option>
                    <option value="open"> Open Wishes</option>
                    <option value="In Progress"> In Santa's Workshop</option>
                    <option value="Approved"> Approved with Cheer</option>
                    <option value="closed"> Delivered</option>
                    <option value="Rejected"> Needs More Details</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-green-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                     Open Wishes
                  </p>
                  <p className="text-xl font-bold text-green-900">
                    {
                      allTicket.filter((t) => t.status.toLowerCase() === "open")
                        .length
                    }
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-red-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600"> Delivered</p>
                  <p className="text-xl font-bold text-red-900">
                    {
                      allTicket.filter(
                        (t) => t.status.toLowerCase() === "closed"
                      ).length
                    }
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Home className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-yellow-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">
                    {" "}
                    In Workshop
                  </p>
                  <p className="text-xl font-bold text-yellow-900">
                    {
                      allTicket.filter(
                        (t) => t.status.toLowerCase() === "in progress"
                      ).length
                    }
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TreePine className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    📜 Total Wishes
                  </p>
                  <p className="text-xl font-bold text-blue-900">
                    {allTicket.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Cards View */}
        <div className="block lg:hidden space-y-4 mb-6">
          {getCurrentPageTickets().length === 0 ? (
            <Card className="border border-green-200 bg-white">
              <CardContent className="text-center py-12">
                <div className="text-4xl mb-4"></div>
                <TreePine className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  No wishes found
                </h3>
                <p className="text-green-600">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No holiday requests yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            getCurrentPageTickets().map((ticket) => (
              <Card
                key={ticket._id}
                className="hover:shadow-md transition-shadow border border-green-200 bg-white"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-green-100 rounded">
                        <TicketIcon className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="font-mono font-semibold text-green-900">
                        {ticket.ticketNumber}
                      </span>
                    </div>
                    <Badge
                      className={`border ${getStatusColor(ticket.status)}`}
                    >
                      {ticket.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-red-500" />
                      <span className="text-green-700">
                        {formattedDate(ticket.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span className="text-green-900 font-medium">
                        {ticket.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-red-500" />
                      <span className="text-green-700">
                        {ticket.assignedTo || "Awaiting Santa's Helper"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-green-800 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getPriorityColor(
                          ticket.priority
                        )}`}
                      />
                      <span className="text-xs text-green-600">
                        {ticket.priority}
                      </span>
                    </div>
                    <Button
                      onClick={() => navigate(`/ticket/${ticket._id}`)}
                      size="sm"
                      className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700"
                    >
                      <Eye className="h-3 w-3" />
                      View Wish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <Card className="hidden lg:block shadow-sm border border-green-200 bg-white">
          <Table>
            <TableHeader className="bg-gradient-to-r from-green-600 to-red-600">
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="font-semibold text-white w-32">
                    Ticket #
                </TableHead>
                <TableHead className="font-semibold text-white w-36">
                    Date
                </TableHead>
                <TableHead className="font-semibold text-white w-40">
                    Category
                </TableHead>
                <TableHead className="font-semibold text-white">
                    Request Details
                </TableHead>
                <TableHead className="font-semibold text-white w-28">
                  Priority
                </TableHead>
                <TableHead className="font-semibold text-white w-32">
                    Status
                </TableHead>
                <TableHead className="font-semibold text-white w-40">
                    Admin
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
                    <div className="text-4xl mb-4"></div>
                    <TreePine className="h-12 w-12 text-green-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                      No ticket found
                    </h3>
                    <p className="text-green-600">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your filters"
                        : "No requests in Santa's list yet"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPageTickets().map((ticket, index) => (
                  <TableRow
                    key={ticket._id}
                    className={`hover:bg-green-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-green-25"
                    }`}
                  >
                    <TableCell className="font-mono font-semibold text-green-700">
                      {ticket.ticketNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-red-500" />
                        {formattedDate(ticket.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-900">
                      {ticket.category}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p
                          className="truncate text-green-800"
                          title={ticket.description}
                        >
                          {ticket.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getPriorityColor(
                            ticket.priority
                          )}`}
                        />
                        <span className="text-xs text-green-600">
                          {ticket.priority}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`border ${getStatusColor(ticket.status)}`}
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-red-500" />
                        <span className="text-green-700">
                          {ticket.assignedTo || "Awaiting Helper"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => navigate(`/ticket/${ticket._id}`)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-100"
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
            <div className="text-sm text-green-700">
               Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of{" "}
              {filteredTickets.length} wish
              {filteredTickets.length !== 1 ? "es" : ""}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-100"
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
                          ? "bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700"
                          : "border-green-300 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-green-500">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 p-0 border-green-300 text-green-700 hover:bg-green-100"
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
                className="flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-100"
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
