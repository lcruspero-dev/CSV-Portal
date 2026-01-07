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
import { Eye, Calendar } from "lucide-react";
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
    className={`p-4 rounded-lg shadow border text-center cursor-pointer ${
      highlight ? "bg-yellow-50 border-yellow-300" : "bg-white border-gray-200"
    } hover:shadow-md transition`}
  >
    <p className="text-sm font-medium text-gray-600">{label}</p>
    <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onChange }) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 py-4">
      <Button
        size="sm"
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        Previous
      </Button>
      {pageNumbers.map((page) => (
        <Button
          key={page}
          size="sm"
          variant={page === currentPage ? "default" : "outline"}
          onClick={() => onChange(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        size="sm"
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
};

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
    <div className="bg-gradient-to-b from-gray-50 to-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Company Memoranda
              </h1>
              <p className="text-sm text-gray-600">
                Controlled internal communications
              </p>
            </div>
          </div>

          {user?.isAdmin && <CreateMemo setMemos={setMemos} setLoading={setLoading} />}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard label="Total Memoranda" value={memos.length} />
          <SummaryCard label="Acknowledged" value={memos.filter(isAcknowledged).length} />
          <SummaryCard
            label="Pending Acknowledgement"
            value={pendingCount}
            highlight
            onClick={() => setShowPendingOnly(true)}
          />
        </div>

        {showPendingOnly && (
          <div className="mb-6 flex items-center justify-between bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <span className="text-sm text-yellow-800">
              Showing memoranda pending your acknowledgement
            </span>
            <Button variant="outline" size="sm" onClick={() => setShowPendingOnly(false)}>
              Show All
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Date Issued</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedMemos.map((memo) => (
                <TableRow key={memo._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formattedDate(memo.createdAt)}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium text-gray-900">{memo.subject}</TableCell>

                  <TableCell>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        isAcknowledged(memo)
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {isAcknowledged(memo) ? "Acknowledged" : "Pending Acknowledgement"}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/memo/${memo._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Document
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            {filteredMemos.length > itemsPerPage && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(filteredMemos.length / itemsPerPage)}
                      onChange={setCurrentPage}
                    />
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>

          {filteredMemos.length === 0 && (
            <div className="text-center py-10 text-gray-600">
              No memoranda available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewMemo;
