import { Assigns, Category, TicketAPi } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Ticket,
  Calendar,
  User,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Home,
  RefreshCw,
  Eye,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Assigned } from "../assigns/CreateAssigns";

export interface Ticket {
  _id: string;
  ticketNumber: string;
  assignedTo: string;
  category: string;
  createdAt: string;
  description: string;
  status: string;
  user: string;
  name: string;
  priority: string;
}

interface Category {
  category: string;
}

const ITEMS_PER_PAGE = 10;

const ViewAllRaisedTickets: React.FC = () => {
  const [allRaisedTickets, setAllRaisedTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTicketNumber, setSearchTicketNumber] = useState<string>("");
  const [, setAssignedToOptions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [itCategories, setItCategories] = useState<string[]>([]);
  const [hrCategories, setHrCatergories] = useState<string[]>([]);
  const [assign, setAssign] = useState<Assigned[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  // Use URL search params for persistent state
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get filter values from URL params or use defaults
  const statusFilter = searchParams.get("status") || "open";
  const assignedToFilter = searchParams.get("assignedTo") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1");

  const logInUser = JSON.parse(localStorage.getItem("user")!);
  const loginUserRole = logInUser.role;

  // Update URL params when filters change
  const updateUrlParams = useCallback(
    (updates: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const getHrCategory = useCallback(async () => {
    try {
      const response = await Category.getHrCategories();
      const categories: Category[] = response.data.categories;
      const categoryNames = categories.map(
        (category: Category) => category.category,
      );
      setHrCatergories(categoryNames);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const getItCategory = useCallback(async () => {
    try {
      const response = await Category.getItCategories();
      const categories: Category[] = response.data.categories;
      const categoryNames = categories.map(
        (category: Category) => category.category,
      );
      setItCategories(categoryNames);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getHrCategory();
    getItCategory();
  }, [getHrCategory, getItCategory]);

  const getAllRaisedTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await TicketAPi.getAllRaisedTickets();
      if (Array.isArray(response.data)) {
        setAllRaisedTickets(response.data as Ticket[]);
        const uniqueAssignedTo = [
          "all",
          ...new Set(response.data.map((ticket: Ticket) => ticket.assignedTo)),
        ];
        setAssignedToOptions(uniqueAssignedTo);
      } else {
        console.error("Unexpected response data format");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const filterTickets = useCallback(
    (tickets: Ticket[], status: string, assignedTo: string, role: string) => {
      let filtered = tickets;

      // Role-based filtering
      if (role === "IT") {
        filtered = filtered.filter((ticket) =>
          itCategories.includes(ticket.category),
        );
      } else if (role === "HR") {
        filtered = filtered.filter((ticket) =>
          hrCategories.includes(ticket.category),
        );
      }

      // AssignedTo filtering
      if (assignedTo === "ALL IT") {
        filtered = filtered.filter((ticket) =>
          itCategories.includes(ticket.category),
        );
      } else if (assignedTo === "ALL HR") {
        filtered = filtered.filter((ticket) =>
          hrCategories.includes(ticket.category),
        );
      } else if (assignedTo !== "all") {
        filtered = filtered.filter(
          (ticket) => ticket.assignedTo === assignedTo,
        );
      }

      // Status filtering
      if (status !== "all") {
        if (status === "open") {
          filtered = filtered.filter(
            (ticket) =>
              ticket.status === "open" || ticket.status === "In Progress",
          );
        } else if (status === "closed") {
          filtered = filtered.filter(
            (ticket) =>
              ticket.status === "closed" ||
              ticket.status === "Approved" ||
              ticket.status === "Rejected",
          );
        } else {
          filtered = filtered.filter((ticket) => ticket.status === status);
        }
      }

      setFilteredTickets(filtered);
      // Reset to page 1 when filters change
      if (searchParams.get("page") !== "1") {
        updateUrlParams({ page: "1" });
      }
    },
    [itCategories, hrCategories, searchParams, updateUrlParams],
  );

  useEffect(() => {
    const getUserRole = () => {
      const userString = localStorage.getItem("user");
      if (userString) {
        try {
          const user = JSON.parse(userString);
          setUserRole(user.role);
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
          setUserRole("");
        }
      } else {
        console.error("User data not found in localStorage");
        setUserRole("");
      }
    };

    getUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      getAllRaisedTickets();
    }
  }, [userRole, getAllRaisedTickets]);

  const getAssigns = useCallback(async () => {
    try {
      const response = await Assigns.getAssign();
      setAssign(response.data.assigns);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAssigns();
  }, [getAssigns]);

  // Apply filters whenever URL params change
  useEffect(() => {
    filterTickets(allRaisedTickets, statusFilter, assignedToFilter, userRole);
  }, [
    statusFilter,
    assignedToFilter,
    allRaisedTickets,
    userRole,
    filterTickets,
  ]);

  const getFilteredAssign = useCallback(
    (assign: Assigned[], loginUserRole: string): Assigned[] => {
      if (loginUserRole === "SUPERADMIN") {
        return assign;
      }
      return assign.filter((item) => item.role === loginUserRole);
    },
    [],
  );

  const handleSearchSubmit = useCallback(() => {
    if (searchTicketNumber.trim()) {
      const foundTicket = allRaisedTickets.find(
        (ticket) =>
          ticket.ticketNumber.toLowerCase() ===
          searchTicketNumber.toLowerCase(),
      );

      if (foundTicket) {
        // Navigate to ticket details without clearing URL params
        navigate({
          pathname: `/ticket/${foundTicket._id}`,
          search: searchParams.toString(), // Preserve current filters in URL
        });
      } else {
        toast({
          title: "Ticket Not Found",
          description: "Please check the ticket number and try again.",
          variant: "destructive",
        });
      }
    }
  }, [searchTicketNumber, allRaisedTickets, navigate, searchParams]);

  const handleSearchKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit],
  );

  const getStatusIcon = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "new":
        return <Clock className="h-3 w-3" />;
      case "in progress":
        return <AlertCircle className="h-3 w-3" />;
      case "closed":
      case "approved":
        return <CheckCircle className="h-3 w-3" />;
      case "rejected":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "new":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "in progress":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "closed":
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium";
      case "medium":
        return "text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-medium";
      case "low":
        return "text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-medium";
      default:
        return "text-gray-600 bg-gray-50 px-2 py-1 rounded text-xs font-medium";
    }
  }, []);

  const getPriorityIcon = useCallback((priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  }, []);

  const filteredAssign = useMemo(
    () => getFilteredAssign(assign, loginUserRole),
    [assign, loginUserRole, getFilteredAssign],
  );

  const totalPages = useMemo(
    () => Math.ceil(filteredTickets.length / ITEMS_PER_PAGE),
    [filteredTickets.length],
  );

  const startIndex = useMemo(
    () => (currentPage - 1) * ITEMS_PER_PAGE,
    [currentPage],
  );

  const endIndex = useMemo(() => startIndex + ITEMS_PER_PAGE, [startIndex]);

  const currentTickets = useMemo(
    () => filteredTickets.slice(startIndex, endIndex),
    [filteredTickets, startIndex, endIndex],
  );

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      updateUrlParams({ page: (currentPage + 1).toString() });
    }
  }, [currentPage, totalPages, updateUrlParams]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      updateUrlParams({ page: (currentPage - 1).toString() });
    }
  }, [currentPage, updateUrlParams]);

  const handleStatusFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = e.target.value;
      updateUrlParams({ status: newStatus });
    },
    [updateUrlParams],
  );

  const handleAssignedToFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newAssignedTo = e.target.value;
      updateUrlParams({ assignedTo: newAssignedTo });
    },
    [updateUrlParams],
  );

  const handleClearFilters = useCallback(() => {
    // Reset all filters to defaults
    updateUrlParams({
      status: "open",
      assignedTo: "all",
      page: "1",
    });
    setSearchTicketNumber("");
  }, [updateUrlParams]);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleViewTicket = useCallback(
    (ticketId: string) => {
      // Navigate to ticket details while preserving current filters in URL
      navigate({
        pathname: `/ticket/${ticketId}`,
        search: searchParams.toString(),
      });
    },
    [navigate, searchParams],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            {/* FIX: Remove onClick prop - BackButton already handles navigation */}
            <BackButton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                Ticket Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and monitor all support tickets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-500">Total Tickets</div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredTickets.length}
              </div>
            </div>
            <Button
              onClick={getAllRaisedTickets}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={searchTicketNumber}
                onChange={(e) => setSearchTicketNumber(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search by ticket number (e.g., INC-0001)..."
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSearchSubmit}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                Search
              </Button>
              <Button
                variant="outline"
                onClick={toggleFilters}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <label
                  htmlFor="statusFilter"
                  className="text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="open">Open & In Progress</option>
                  <option value="In Progress">In Progress</option>
                  <option value="closed">Closed & Resolved</option>
                  <option value="all">All Statuses</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="assignedToFilter"
                  className="text-sm font-medium text-gray-700"
                >
                  Assigned To
                </label>
                <select
                  id="assignedToFilter"
                  value={assignedToFilter}
                  onChange={handleAssignedToFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Assignees</option>
                  {userRole === "SUPERADMIN" && (
                    <>
                      <option value="ALL IT">All IT Department</option>
                      <option value="ALL HR">All HR Department</option>
                    </>
                  )}
                  {filteredAssign.map((assign) => (
                    <option key={assign._id} value={assign.name}>
                      {assign.name}
                    </option>
                  ))}
                  <option value="Not Assigned">Unassigned</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open</p>
                <p className="text-2xl font-bold text-blue-600">
                  {allRaisedTickets.filter((t) => t.status === "open").length}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-amber-600">
                  {
                    allRaisedTickets.filter((t) => t.status === "In Progress")
                      .length
                  }
                </p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Closed</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {allRaisedTickets.filter((t) => t.status === "closed").length}
                </p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unassigned</p>
                <p className="text-2xl font-bold text-gray-600">
                  {allRaisedTickets.filter((t) => !t.assignedTo).length}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">
                    Ticket #
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Requester
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Description
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Priority
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Assignee
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Ticket className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">
                          No tickets found
                        </h3>
                        <p className="text-gray-600 mt-2">
                          Try adjusting your filters or search criteria.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTickets.map((ticket) => (
                    <TableRow
                      key={ticket._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-blue-500" />
                          {ticket.ticketNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formattedDate(ticket.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {ticket.category}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {ticket.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 line-clamp-1">
                            {ticket.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {getPriorityIcon(ticket.priority)}
                          </span>
                          <span className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(ticket.status)}`}
                        >
                          {getStatusIcon(ticket.status)}
                          {ticket.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">
                              {ticket.assignedTo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleViewTicket(ticket._id)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {currentTickets.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredTickets.length)} of{" "}
                {filteredTickets.length} tickets
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first, last, current, and pages around current
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      // Add ellipsis for large page ranges
                      if (index > 0 && page > array[index - 1] + 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-2 text-gray-400">...</span>
                            <Button
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              onClick={() =>
                                updateUrlParams({ page: page.toString() })
                              }
                              size="sm"
                              className={
                                currentPage === page ? "bg-blue-600" : ""
                              }
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() =>
                            updateUrlParams({ page: page.toString() })
                          }
                          size="sm"
                          className={currentPage === page ? "bg-blue-600" : ""}
                        >
                          {page}
                        </Button>
                      );
                    })}
                </div>
                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile View */}
        <div className="lg:hidden mt-6">
          {currentTickets.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No tickets found
              </h3>
              <p className="text-gray-600 mt-2">
                Try adjusting your filters or search criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Ticket className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-900">
                          {ticket.ticketNumber}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formattedDate(ticket.createdAt)}
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}
                    >
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {ticket.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 truncate">
                        {ticket.category}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">
                          {getPriorityIcon(ticket.priority)}
                        </span>
                        <span className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {ticket.assignedTo || "Unassigned"}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {ticket.description}
                  </p>

                  <Button
                    onClick={() => handleViewTicket(ticket._id)}
                    className="w-full flex items-center justify-center gap-2"
                    size="sm"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAllRaisedTickets;
