import { TicketAPi } from "@/API/endpoint";
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
import CreateMemo from "@/pages/memo/CreateMemo";
import { Eye, Calendar, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formattedDate } from "../../API/helper";

export interface Memo {
  _id: string;
  subject: string;
  file: string;
  description: string;
  createdAt: string;
  acknowledgedby: { userId: string | undefined; _id: string; name: string }[];
}

export interface User {
  _id: string;
  name: string;
  isAdmin: boolean;
  email: string;
}

interface SummaryCardProps {
  label: string;
  value: number;
  highlight?: boolean;
  onClick?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, highlight, onClick }) => (
  <div
    onClick={onClick}
    className={`
      group cursor-pointer
      p-5 rounded-2xl
      border backdrop-blur-md
      transition-all duration-300
      hover:-translate-y-1 hover:shadow-xl
      ${highlight 
        ? "bg-yellow-50/80 border-yellow-300 shadow-md" 
        : "bg-white/80 border-gray-200 shadow-sm"}
    `}
  >
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1 group-hover:text-[#5602FF]">
      {value}
    </p>
  </div>
);

function ViewMemo() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [filteredMemos, setFilteredMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const itemsPerPage = 8;
  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user: User | null = userString ? JSON.parse(userString) : null;

  const fetchMemos = async () => {
    try {
      const response = await TicketAPi.getAllMemos();
      setMemos(response.data);
      setFilteredMemos(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  useEffect(() => {
    let data = memos;
    if (showPendingOnly) {
      data = memos.filter(
        (memo) => !memo.acknowledgedby.some((ack) => ack.userId === user?._id)
      );
    }
    setFilteredMemos(data);
    setCurrentPage(1);
  }, [showPendingOnly, memos, user?._id]);

  const isAcknowledged = (memo: Memo) =>
    memo.acknowledgedby.some((ack) => ack.userId === user?._id);

  const pendingCount = memos.filter((memo) => !isAcknowledged(memo)).length;

  const paginatedMemos = filteredMemos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <LoadingComponent />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Company Memoranda
              </h1>
              <p className="text-gray-500 text-sm">
                Controlled internal communications
              </p>
            </div>
          </div>

          {user?.isAdmin && (
            <CreateMemo setMemos={setMemos} setLoading={setLoading} />
          )}
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <SummaryCard label="Total Memoranda" value={memos.length} />
          <SummaryCard label="Acknowledged" value={memos.filter(isAcknowledged).length} />
          <SummaryCard
            label="Pending"
            value={pendingCount}
            highlight
            onClick={() => setShowPendingOnly(true)}
          />
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          
          {/* FILTER BAR */}
          {showPendingOnly && (
            <div className="flex items-center justify-between px-6 py-3 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800 text-sm">
                <Filter className="h-4 w-4" />
                Pending acknowledgement filter active
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPendingOnly(false)}
                className="border-yellow-400 text-yellow-700 hover:bg-yellow-100"
              >
                Clear
              </Button>
            </div>
          )}

          <Table>
            {/* STICKY HEADER */}
            <TableHeader className="bg-gray-50 sticky top-0 z-10">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedMemos.map((memo) => (
                <TableRow
                  key={memo._id}
                  className="hover:bg-gray-50 transition"
                >
                  <TableCell>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formattedDate(memo.createdAt)}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium text-gray-900">
                    {memo.subject}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`
                        px-3 py-1 text-xs font-medium rounded-full
                        ${isAcknowledged(memo)
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800"}
                      `}
                    >
                      {isAcknowledged(memo) ? "Acknowledged" : "Pending"}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      className="gap-1"
                      variant="outline"
                      onClick={() => navigate(`/memo/${memo._id}`)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            {filteredMemos.length > itemsPerPage && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex justify-center py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        Previous
                      </Button>

                      <span className="px-4 text-sm text-gray-600">
                        Page {currentPage} of{" "}
                        {Math.ceil(filteredMemos.length / itemsPerPage)}
                      </span>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          currentPage ===
                          Math.ceil(filteredMemos.length / itemsPerPage)
                        }
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>

          {/* EMPTY STATE */}
          {filteredMemos.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              {showPendingOnly
                ? "No pending memoranda 🎉"
                : "No memoranda available"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewMemo;