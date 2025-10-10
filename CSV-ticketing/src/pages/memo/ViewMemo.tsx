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
import { ChevronLeft, ChevronRight, Eye, FileText, Calendar, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formattedDate } from "../../API/helper";

export interface Memo {
  _id: string;
  subject: string;
  file: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  acknowledgedby: {
    userId: string | undefined;
    _id: string;
    name: string;
  }[];
}

export interface User {
  _id: string;
  name: string;
  isAdmin: boolean;
  email: string;
}

function ViewMemo() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 8;

  const userString = localStorage.getItem("user");
  const user: User | null = userString ? JSON.parse(userString) : null;
  const navigate = useNavigate();

  const getMemos = async () => {
    try {
      const response = await TicketAPi.getAllMemo();
      console.log(response.data);
      setMemos(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMemos();
  }, []);

  const getCurrentPageMemos = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return memos.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getStatusColor = (memo: Memo) => {
    const isAcknowledged = memo.acknowledgedby.some(ack => ack.userId === user?._id);
    return isAcknowledged ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50";
  };

  const getStatusText = (memo: Memo) => {
    const isAcknowledged = memo.acknowledgedby.some(ack => ack.userId === user?._id);
    return isAcknowledged ? "Acknowledged" : "Pending";
  };

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="relative mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <BackButton />
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Company Memos
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    View and acknowledge company announcements
                  </p>
                </div>
              </div>
            </div>
            
            {user?.isAdmin && (
              <div className="sm:absolute sm:right-0 sm:top-0">
                <CreateMemo setMemos={setMemos} setLoading={setLoading} />
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Memos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{memos.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {memos.filter(memo => memo.acknowledgedby.some(ack => ack.userId === user?._id)).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {memos.filter(memo => !memo.acknowledgedby.some(ack => ack.userId === user?._id)).length}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Memos Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="text-white font-bold text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="text-white font-bold text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" />
                      Subject
                    </div>
                  </TableHead>
                  <TableHead className="text-white font-bold text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead className="text-white font-bold text-center py-4">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPageMemos().map((memo, index) => (
                  <TableRow 
                    key={memo._id} 
                    className={`border-b border-gray-200 transition-colors hover:bg-blue-50 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <TableCell className="py-4 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mb-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {formattedDate(memo.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-center max-w-md mx-auto">
                        <p className="font-medium text-gray-900 line-clamp-2">
                          {memo.subject}
                        </p>
                        {memo.subject.length > 100 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Click view to read full content
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(memo)}`}>
                        {memo.acknowledgedby.some(ack => ack.userId === user?._id) ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                        )}
                        {getStatusText(memo)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Button
                        onClick={() => navigate(`/memo/${memo._id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {getCurrentPageMemos().map((memo) => (
              <div 
                key={memo._id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {formattedDate(memo.createdAt)}
                    </span>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(memo)}`}>
                    {memo.acknowledgedby.some(ack => ack.userId === user?._id) ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                    )}
                    {getStatusText(memo)}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">Subject:</h3>
                  <p className="text-gray-700 line-clamp-3 text-sm">
                    {memo.subject}
                  </p>
                </div>
                
                <Button
                  onClick={() => navigate(`/memo/${memo._id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Memo
                </Button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <TableFooter className="bg-gray-50">
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-600 text-center sm:text-left">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, memos.length)} of{" "}
                      {memos.length} memos
                    </div>
                    
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:block">Previous</span>
                      </Button>
                      
                      <div className="flex items-center gap-1">
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
                              className="w-8 h-8 p-0 text-xs"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1"
                      >
                        <span className="hidden sm:block">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}

          {/* Empty State */}
          {memos.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No memos found</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                There are no company memos available at the moment. Check back later for updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewMemo;