import { TicketAPi } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import LoadingComponent from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const getAllTicket = async () => {
    try {
      const response = await TicketAPi.getAllTicket();
      setAllTicket(response.data);
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

  // Get current tickets
  const getCurrentPageTickets = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allTicket.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <div className="container mx-auto text-sm">
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="absolute left-0 top-12 text-xs">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold text-center py-7">My Tickets</h1>
      </div>
      <Table>
        <TableHeader className="bg-slate-200">
          <TableRow>
            <TableHead className="text-center font-bold text-black w-48">
              Date
            </TableHead>
            <TableHead className="text-center font-bold text-black w-60">
              Category
            </TableHead>
            <TableHead className="font-bold text-black text-center w-80">
              Description
            </TableHead>
            <TableHead className="text-center font-bold text-black w-24">
              Status
            </TableHead>
            <TableHead className="text-center font-bold text-black w-36">
              Assigned to
            </TableHead>
            <TableHead className="font-bold text-black text-center w-24">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getCurrentPageTickets().map((ticket, index) => (
            <TableRow
              key={ticket._id}
              className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
            >
              <TableCell className="font-medium text-center">
                {formattedDate(ticket.createdAt)}
              </TableCell>
              <TableCell className="text-center">{ticket.category}</TableCell>
              <TableCell className="text-center max-w-xs truncate">
                {ticket.description.length > 45
                  ? `${ticket.description.substring(0, 45)}...`
                  : ticket.description}
              </TableCell>
              <TableCell>
                <p
                  className={`p-1 rounded-md text-center text-primary-foreground font-semibold text-xs ${
                    ticket.status === "new" ||
                    ticket.status === "open" ||
                    ticket.status === "Approved"
                      ? "bg-green-600"
                      : ticket.status === "closed" ||
                        ticket.status === "Rejected"
                      ? "bg-red-600"
                      : ticket.status === "In progress"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                >
                  {ticket.status}
                </p>
              </TableCell>
              <TableCell className="text-center">{ticket.assignedTo}</TableCell>
              <TableCell className="text-center">
                <Button
                  onClick={() => {
                    navigate(`/ticket/${ticket._id}`);
                  }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>
              <div className="flex items-center justify-end gap-2 py-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === currentPage ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8"
                      >
                        {pageNum}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default ViewAllTicket;
