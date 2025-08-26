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
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  if (loading) {
    return <LoadingComponent />;
  }

  console.log("memos", memos);

  return (
    <>
      <div className="container mx-auto">
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute left-36 top-12 text-xs">
            <BackButton />
          </div>
          {user?.isAdmin && (
            <div className="absolute right-36 top-12 text-xs">
              <CreateMemo setMemos={setMemos} setLoading={setLoading} />
            </div>
          )}
          <h1 className="text-3xl font-bold text-center py-7">Memo List</h1>
        </div>
        <Table>
          <TableHeader className="bg-slate-200">
            <TableRow>
              <TableHead className="text-center font-bold text-black w-40">
                Date
              </TableHead>
              <TableHead className="text-center font-bold text-black w-96">
                Subject
              </TableHead>
              <TableHead className="text-center font-bold text-black w-16">
                Acknowledgement
              </TableHead>
              <TableHead className="text-center font-bold text-black w-16">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentPageMemos().map((memo, index) => (
              <TableRow
                key={memo._id}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <TableCell className="font-medium text-center">
                  {formattedDate(memo.createdAt)}
                </TableCell>
                <TableCell className="text-center max-w-xs truncate">
                  {memo.subject.length > 100
                    ? `${memo.subject.substring(0, 100)}...`
                    : memo.subject}
                </TableCell>
                <TableCell className="text-center">
                  {memo.acknowledgedby.some(
                    (ack) => ack.userId === user?._id
                  ) ? (
                    <CheckCircleRoundedIcon className="text-green-500" />
                  ) : (
                    <CheckCircleRoundedIcon className="text-gray-400" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    className="text-xs"
                    onClick={() => {
                      navigate(`/memo/${memo._id}`);
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
              <TableCell colSpan={4}>
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
    </>
  );
}

export default ViewMemo;
