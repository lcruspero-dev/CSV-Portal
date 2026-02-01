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
  Home,
  Bell,
  Loader2,
  AlertCircle,
  FilterX,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
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

type StatusFilter =
  | "all"
  | "open"
  | "in progress"
  | "approved"
  | "closed"
  | "rejected";

const ITEMS_PER_PAGE = 10;
const MAX_PAGE_BUTTONS = 5;

const ViewAllTicket: React.FC = () => {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const navigate = useNavigate();

  const getAllTicket = useCallback(async () => {
    try {
      setError(null);
      const response = await TicketAPi.getAllTicket();
      setAllTickets(response.data);
      setFilteredTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    getAllTicket();
  }, [getAllTicket]);

  // Memoized filtered tickets
  const filteredTicketsMemo = useMemo(() => {
    let filtered = allTickets;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.ticketNumber.toLowerCase().includes(term) ||
          ticket.description.toLowerCase().includes(term) ||
          ticket.category.toLowerCase().includes(term) ||
          ticket.assignedTo.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (ticket) => ticket.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return filtered;
  }, [allTickets, searchTerm, statusFilter]);

  useEffect(() => {
    setFilteredTickets(filteredTicketsMemo);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredTicketsMemo]);

  // Memoized pagination values
  const totalPages = useMemo(
    () => Math.ceil(filteredTickets.length / ITEMS_PER_PAGE) || 1,
    [filteredTickets.length]
  );

  const currentPageTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTickets.slice(startIndex, endIndex);
  }, [filteredTickets, currentPage]);

  // Pagination page numbers to display
  const pageNumbers = useMemo(() => {
    if (totalPages <= MAX_PAGE_BUTTONS) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
    const end = Math.min(totalPages, start + MAX_PAGE_BUTTONS - 1);

    if (end - start + 1 < MAX_PAGE_BUTTONS) {
      start = Math.max(1, end - MAX_PAGE_BUTTONS + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "new":
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const handleRefresh = () => {
    setRefreshing(true);
    getAllTicket();
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/ticket/${ticketId}`);
  };

  // Statistics
  const stats = useMemo(
    () => ({
      open: allTickets.filter((t) => t.status.toLowerCase() === "open").length,
      closed: allTickets.filter((t) => t.status.toLowerCase() === "closed")
        .length,
      inProgress: allTickets.filter(
        (t) => t.status.toLowerCase() === "in progress"
      ).length,
      total: allTickets.length,
    }),
    [allTickets]
  );

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-green-600 font-medium">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error && !refreshing) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to load tickets
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
               
                View All Tickets
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Track and manage all support tickets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600">Total Tickets</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets by number, description, category, or assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  aria-label="Search tickets"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
                aria-expanded={showFilters}
                aria-controls="filters-section"
              >
                <Filter className="h-4 w-4" />
                Filters
                {statusFilter !== "all" && (
                  <span
                    className="ml-1 w-2 h-2 bg-red-500 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div
                id="filters-section"
                className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as StatusFilter)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="approved">Approved</option>
                    <option value="closed">Closed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  {(searchTerm || statusFilter !== "all") && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <FilterX className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Open</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.open}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Gift className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Home className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Closed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.closed}
                  </p>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <TicketIcon className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Cards View */}
        <div className="block lg:hidden space-y-4 mb-6">
          {currentPageTickets.length === 0 ? (
            <Card className="border border-gray-200">
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tickets found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "No tickets available"}
                </p>
              </CardContent>
            </Card>
          ) : (
            currentPageTickets.map((ticket) => (
              <Card
                key={ticket._id}
                className="hover:shadow-md transition-shadow border border-gray-200"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gray-100 rounded">
                        <TicketIcon className="h-3 w-3 text-gray-600" />
                      </div>
                      <span className="font-mono font-semibold text-gray-900">
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
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        {formattedDate(ticket.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 font-medium">
                        {ticket.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        {ticket.assignedTo || "Unassigned"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-800 line-clamp-2">
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
                      <span className="text-xs text-gray-600">
                        {ticket.priority}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleViewTicket(ticket._id)}
                      size="sm"
                      variant="default"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <Card className="hidden lg:block shadow-sm border border-gray-200">
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
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tickets found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "No tickets available"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                currentPageTickets.map((ticket, index) => (
                  <TableRow
                    key={ticket._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <TableCell className="font-mono font-semibold text-gray-900">
                      {ticket.ticketNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {formattedDate(ticket.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {ticket.category}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p
                          className="truncate text-gray-800"
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
                        <span className="text-sm text-gray-600">
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
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          {ticket.assignedTo || "Unassigned"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleViewTicket(ticket._id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="View ticket details"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View ticket</span>
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
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)}{" "}
              of {filteredTickets.length} ticket
              {filteredTickets.length !== 1 ? "s" : ""}
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

              <div className="flex items-center gap-1">
                {pageNumbers.map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[2rem] h-8 ${
                      pageNum === currentPage
                        ? "bg-gray-900 hover:bg-gray-800"
                        : ""
                    }`}
                  >
                    {pageNum}
                  </Button>
                ))}
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
