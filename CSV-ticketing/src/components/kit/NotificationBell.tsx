import { TicketAPi } from "@/API/endpoint";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Ticket {
  name: string;
  category: string;
  department: string;
  priority: string;
  description: string;
  user: { name: string };
  createdAt: string;
  updatedAt: string;
  closingNote: string;
  assignedTo: string;
  _id: string;
  status: string;
  file: string | null;
}

const NotificationBell = () => {
  const navigate = useNavigate();
  const [openTickets, setOpenTickets] = useState<Ticket[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const bellRef = useRef<HTMLDivElement | null>(null);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const response = await TicketAPi.getAllOpenTickets();
      setOpenTickets(response.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticketId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/ticket/${ticketId}`);
    setIsOpen(false);
  };

  const handleBellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Function to get user role from localStorage
  const getUserRole = (): string | null => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.role || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Check if user has required role (HR, IT, or SUPERADMIN)
  const hasRequiredRole = (): boolean => {
    const role = getUserRole();
    return role === "HR" || role === "IT" || role === "SUPERADMIN";
  };

  // Filter tickets based on user's role and department
  const getFilteredTickets = (tickets: Ticket[]): Ticket[] => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return [];

      const user = JSON.parse(userStr);

      if (user.role === "SUPERADMIN") {
        return tickets.filter(
          (ticket) => ticket.department === "IT" || ticket.department === "HR"
        );
      }

      if (["HR", "IT"].includes(user.role)) {
        return tickets.filter((ticket) => ticket.department === user.role);
      }

      return [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const fetchOpenTickets = async () => {
      try {
        const response = await TicketAPi.getAllOpenTickets();
        setOpenTickets(response.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    if (hasRequiredRole()) {
      const interval = setInterval(fetchOpenTickets, 60000);
      fetchOpenTickets();
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return null;
  if (error) return null;
  if (!hasRequiredRole()) return null;

  const filteredTickets = getFilteredTickets(openTickets);

  // Group tickets by department for SUPERADMIN view
  const groupedTickets = filteredTickets.reduce((acc, ticket) => {
    const dept = ticket.department;
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(ticket);
    return acc;
  }, {} as Record<string, Ticket[]>);

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <div
      key={ticket._id}
      className="p-3 hover:bg-gray-50 rounded-lg border cursor-pointer"
      onClick={(e) => handleTicketClick(ticket._id, e)}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-sm">{ticket.name}</p>
          <p className="text-xs text-gray-600">{ticket.category}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            ticket.priority === "1-Critical"
              ? "bg-red-100 text-red-800"
              : ticket.priority === "2-High"
              ? "bg-orange-100 text-orange-800"
              : ticket.priority === "3-Medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {ticket.priority}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {ticket.description.length > 100
          ? `${ticket.description.substring(0, 100)}...`
          : ticket.description}
      </p>
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Assigned to: {ticket.assignedTo}</span>
        <span>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div
        ref={bellRef}
        className="cursor-pointer flex items-center"
        onClick={handleBellClick}
      >
        <Bell className="h-6 w-6 text-blue-800" />
        {filteredTickets.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {filteredTickets.length}
          </span>
        )}
      </div>

      {isOpen && (
        <Card
          ref={cardRef}
          className="absolute right-0 mt-2 w-96 shadow-lg z-50 bg-white"
        >
          <div className="p-4 border-b">
            <h3 className="font-semibold">
              Open Tickets ({filteredTickets.length})
            </h3>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    {/* Loading spinner SVG */}
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
          <ScrollArea className="h-96">
            <div className="p-4 space-y-4">
              {filteredTickets.length === 0 ? (
                <p className="text-center text-gray-500">No open tickets</p>
              ) : getUserRole() === "SUPERADMIN" ? (
                // SUPERADMIN view with department grouping
                Object.entries(groupedTickets).map(([dept, tickets]) => (
                  <div key={dept} className="mb-4">
                    <h4 className="font-medium text-sm mb-2 text-gray-700">
                      {dept} Department ({tickets.length})
                    </h4>
                    <div className="space-y-3">
                      {tickets.map((ticket) => (
                        <TicketCard key={ticket._id} ticket={ticket} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Regular view for HR and IT users
                filteredTickets.map((ticket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

export default NotificationBell;
