import { TicketAPi } from "@/API/endpoint";
import { useCallback, useEffect, useState } from "react";
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
import { ChevronLeft, ChevronRight, Eye, FileText, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formattedDate } from "@/API/helper";
import CreatePolicies from "@/pages/memo/CreatePolicies";

export interface Policy {
  _id: string;
  subject: string;
  file: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  acknowledgedby: { userId: string | undefined; _id: string; name: string }[];
}

export interface User {
  _id: string;
  name: string;
  isAdmin: boolean;
  email: string;
}

function ViewPolicies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const itemsPerPage = 8;

  const navigate = useNavigate();
  const user: User | null = (() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  })();

  const isAcknowledged = useCallback(
    (policy: Policy) => policy.acknowledgedby?.some((ack) => ack.userId === user?._id),
    [user]
  );

  const fetchPolicies = async () => {
    try {
      const res = await TicketAPi.getAllPolicies();
      const data: Policy[] = Array.isArray(res.data)
        ? res.data.map((p: Policy) => ({ ...p, acknowledgedby: p.acknowledgedby || [] }))
        : [];
      setPolicies(data);
      setFilteredPolicies(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (err) {
      console.error("Error fetching policies:", err);
      setPolicies([]);
      setFilteredPolicies([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    let filtered = policies;
    if (showPendingOnly) filtered = policies.filter((p) => !isAcknowledged(p));
    setFilteredPolicies(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [showPendingOnly, policies, isAcknowledged]);

  const paginatedPolicies = filteredPolicies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pendingCount = policies.filter((p) => !isAcknowledged(p)).length;
  const acknowledgedCount = policies.filter(isAcknowledged).length;

  const getStatusColor = (policy: Policy) =>
    isAcknowledged(policy)
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-800";

  const getStatusText = (policy: Policy) => (isAcknowledged(policy) ? "Acknowledged" : "Pending Acknowledgement");

  if (loading) return <LoadingComponent />;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}  
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Company Policies</h1>
              <p className="text-sm text-gray-600">Controlled internal communications</p>
            </div>
          </div>
          {user?.isAdmin && <CreatePolicies setPolicies={setPolicies} setLoading={setLoading} />}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total Messages</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{policies.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Acknowledged</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{acknowledgedCount}</p>
          </div>
          <div
            className={`bg-white rounded-2xl p-6 shadow border border-gray-200 cursor-pointer ${
              showPendingOnly ? "ring-2 ring-yellow-500 border-yellow-500" : ""
            }`}
            onClick={() => setShowPendingOnly(true)}
          >
            <p className="text-sm font-medium text-yellow-800">Pending Acknowledgement</p>
            <p className="text-2xl font-bold text-yellow-800 mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* Filter Notice */}
        {showPendingOnly && pendingCount > 0 && (
          <div className="mb-6 flex items-center justify-between bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <span className="text-sm text-yellow-800">{pendingCount} policy{pendingCount !== 1 ? "ies" : ""} pending your acknowledgement</span>
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
              {paginatedPolicies.map((policy) => (
                <TableRow key={policy._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formattedDate(policy.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{policy.subject}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(policy)}`}>
                      {getStatusText(policy)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/policies/${policy._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Document
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            {totalPages > 1 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex justify-center gap-2 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <Button
                          key={num}
                          variant={num === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(num)}
                        >
                          {num}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}

            {filteredPolicies.length === 0 && (
              <div className="text-center py-10 text-gray-600">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {showPendingOnly ? "All caught up!" : "No messages yet"}
                </h3>
                <p>{showPendingOnly ? "You've acknowledged all policies." : "There are no policies available."}</p>
                {showPendingOnly && (
                  <Button onClick={() => setShowPendingOnly(false)} className="mt-4">
                    View All Messages
                  </Button>
                )}
              </div>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
}

export default ViewPolicies;
