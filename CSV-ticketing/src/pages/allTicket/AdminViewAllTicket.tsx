import { Assigns, Category, TicketAPi } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingComponent from "@/components/ui/loading";
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
  ChevronsLeftIcon, 
  ChevronsRightIcon, 
  SearchIcon,
  FilterIcon,
  TicketIcon,
  CalendarIcon,
  UserIcon,
  FileTextIcon,
  AlertCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all");
  const [searchTicketNumber, setSearchTicketNumber] = useState<string>("");
  const [, setAssignedToOptions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [itCategories, setItCategories] = useState<string[]>([]);
  const [hrCategories, setHrCatergories] = useState<string[]>([]);
  const [assign, setAssign] = useState<Assigned[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const logInUser = JSON.parse(localStorage.getItem("user")!);
  const loginUserRole = logInUser.role;
  const navigate = useNavigate();

  const getHrCategory = async () => {
    try {
      const response = await Category.getHrCategories();
      const categories: Category[] = response.data.categories;
      const categoryNames = categories.map(
        (category: Category) => category.category
      );
      setHrCatergories(categoryNames);
    } catch (error) {
      console.error(error);
    }
  };

  const getItCategory = async () => {
    try {
      const response = await Category.getItCategories();
      const categories: Category[] = response.data.categories;
      const categoryNames = categories.map(
        (category: Category) => category.category
      );
      setItCategories(categoryNames);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getHrCategory();
    getItCategory();
  }, []);

  const getAllRaisedTickets = async () => {
    try {
      const response = await TicketAPi.getAllRaisedTickets();
      if (Array.isArray(response.data)) {
        setAllRaisedTickets(response.data as Ticket[]);
        const uniqueAssignedTo = [
          "all",
          ...new Set(response.data.map((ticket: Ticket) => ticket.assignedTo)),
        ];
        setAssignedToOptions(uniqueAssignedTo);
        filterTickets(response.data as Ticket[], statusFilter, "all", userRole);
      } else {
        console.error("Unexpected response data format");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = (
    tickets: Ticket[],
    status: string,
    assignedTo: string,
    role: string
  ) => {
    let filtered = tickets;

    // Role-based filtering
    if (role === "IT") {
      filtered = filtered.filter((ticket) =>
        itCategories.includes(ticket.category)
      );
    } else if (role === "HR") {
      filtered = filtered.filter((ticket) =>
        hrCategories.includes(ticket.category)
      );
    }

    // AssignedTo filtering
    if (assignedTo === "ALL IT") {
      filtered = filtered.filter((ticket) =>
        itCategories.includes(ticket.category)
      );
    } else if (assignedTo === "ALL HR") {
      filtered = filtered.filter((ticket) =>
        hrCategories.includes(ticket.category)
      );
    } else if (assignedTo !== "all") {
      filtered = filtered.filter((ticket) => ticket.assignedTo === assignedTo);
    }

    // Status filtering
    if (status !== "all") {
      if (status === "open") {
        filtered = filtered.filter(
          (ticket) =>
            ticket.status === "open" || ticket.status === "In Progress"
        );
      } else if (status === "closed") {
        filtered = filtered.filter(
          (ticket) =>
            ticket.status === "closed" ||
            ticket.status === "Approved" ||
            ticket.status === "Rejected"
        );
      } else {
        filtered = filtered.filter((ticket) => ticket.status === status);
      }
    }

    setFilteredTickets(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const getAssigns = async () => {
    try {
      const response = await Assigns.getAssign();
      setAssign(response.data.assigns);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAssigns();
    filterTickets(allRaisedTickets, statusFilter, assignedToFilter, userRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, assignedToFilter, allRaisedTickets, userRole]);

  const getFilteredAssign = (
    assign: Assigned[],
    loginUserRole: string
  ): Assigned[] => {
    if (loginUserRole === "SUPERADMIN") {
      return assign;
    }
    return assign.filter((item) => item.role === loginUserRole);
  };

  const handleSearchSubmit = () => {
    if (searchTicketNumber.trim()) {
      const foundTicket = allRaisedTickets.find(
        (ticket) =>
          ticket.ticketNumber.toLowerCase() === searchTicketNumber.toLowerCase()
      );

      if (foundTicket) {
        navigate(`/ticket/${foundTicket._id}`);
      } else {
        toast({
          title: "Error",
          description:
            "Ticket not found. Please check the ticket number and try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "new":
        return <ClockIcon className="h-4 w-4" />;
      case "in progress":
        return <AlertCircleIcon className="h-4 w-4" />;
      case "closed":
      case "approved":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "rejected":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "new":
        return "bg-green-100 text-green-800 border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "closed":
      case "approved":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-600 font-semibold";
      case "medium":
        return "text-orange-600 font-semibold";
      case "low":
        return "text-green-600 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  const filteredAssign = getFilteredAssign(assign, loginUserRole);

  if (loading) {
    return <LoadingComponent />;
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <TicketIcon className="h-7 w-7 text-blue-600" />
                All Tickets
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage and track all support tickets in one place
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
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={searchTicketNumber}
                onChange={(e) => setSearchTicketNumber(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search by ticket number (e.g., INC-0001)..."
                className="pl-10 w-full"
              />
            </div>
            <Button 
              onClick={handleSearchSubmit}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FilterIcon className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="open">Open Tickets</option>
                  <option value="In Progress">In Progress</option>
                  <option value="closed">Closed Tickets</option>
                  <option value="all">All Statuses</option>
                </select>
              </div>

              <div>
                <label htmlFor="assignedToFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <select
                  id="assignedToFilter"
                  value={assignedToFilter}
                  onChange={(e) => setAssignedToFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Tickets</option>
                  {userRole === "SUPERADMIN" && (
                    <>
                      <option value="ALL IT">All IT Tickets</option>
                      <option value="ALL HR">All HR Tickets</option>
                    </>
                  )}
                  {filteredAssign.map((assign) => (
                    <option key={assign._id} value={assign.name}>
                      {assign.name}
                    </option>
                  ))}
                  <option value="Not Assigned">Not Assigned</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("open");
                    setAssignedToFilter("all");
                    setSearchTicketNumber("");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {/* Mobile Cards */}
          <div className="block lg:hidden">
            {currentTickets.length === 0 ? (
              <div className="text-center py-12">
                <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
                <p className="text-gray-600 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="divide-y">
                {currentTickets.map((ticket) => (
                  <div key={ticket._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <TicketIcon className="h-4 w-4 text-blue-600" />
                        <span className="font-mono font-semibold text-gray-900">
                          {ticket.ticketNumber}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{ticket.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{ticket.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{formattedDate(ticket.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority} Priority
                        </span>
                        <span className="text-sm text-gray-600">
                          {ticket.assignedTo || "Unassigned"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>

                    <div className="mt-4">
                      <Button 
                        onClick={() => navigate(`/ticket/${ticket._id}`)}
                        className="w-full"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Ticket #</TableHead>
                  <TableHead className="font-semibold text-gray-700">Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Category</TableHead>
                  <TableHead className="font-semibold text-gray-700">Requester</TableHead>
                  <TableHead className="font-semibold text-gray-700">Description</TableHead>
                  <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Assigned To</TableHead>
                  <TableHead className="font-semibold text-gray-700">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
                      <p className="text-gray-600 mt-2">Try adjusting your filters or search terms.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTickets.map((ticket, index) => (
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
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          {formattedDate(ticket.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>{ticket.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          {ticket.name}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {ticket.description.length > 60
                              ? `${ticket.description.substring(0, 60)}...`
                              : ticket.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {ticket.assignedTo || (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => navigate(`/ticket/${ticket._id}`)}
                          variant="outline"
                          size="sm"
                        >
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTickets.length)} of{" "}
                {filteredTickets.length} tickets
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronsLeftIcon className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1 mx-4">
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronsRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAllRaisedTickets;