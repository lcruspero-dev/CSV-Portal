/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ChevronLeft, ChevronRight, Eye, Calendar } from "lucide-react";
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


const StatCard = ({ label, value, tone = "default", onClick }: any) => {
  const tones: any = {
    default: "bg-white border-gray-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-6 rounded-2xl border shadow-sm
        hover:shadow-lg hover:-translate-y-1
        transition-all cursor-pointer
        ${tones[tone]}
      `}
    >
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

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
    (policy: Policy) =>
      policy.acknowledgedby?.some((ack) => ack.userId === user?._id),
    [user]
  );

  const fetchPolicies = async () => {
    try {
      const res = await TicketAPi.getAllPolicies();
      const data: Policy[] = Array.isArray(res.data)
        ? res.data.map((p: Policy) => ({
            ...p,
            acknowledgedby: p.acknowledgedby || [],
          }))
        : [];

      setPolicies(data);
      setFilteredPolicies(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    let filtered = policies;

    if (showPendingOnly) {
      filtered = policies.filter((p) => !isAcknowledged(p));
    }

    setFilteredPolicies(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [showPendingOnly, policies, isAcknowledged]);

  const paginated = filteredPolicies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pendingCount = policies.filter((p) => !isAcknowledged(p)).length;
  const acknowledgedCount = policies.filter(isAcknowledged).length;

  if (loading) return <LoadingComponent />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-6 py-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Company Policies
              </h1>
              <p className="text-sm text-gray-500">
                Controlled internal governance documents
              </p>
            </div>
          </div>

          {user?.isAdmin && (
            <CreatePolicies setPolicies={setPolicies} setLoading={setLoading} />
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard label="Total Policies" value={policies.length} />
          <StatCard
            label="Acknowledged"
            value={acknowledgedCount}
            tone="success"
          />
          <StatCard
            label="Pending Review"
            value={pendingCount}
            tone="warning"
            onClick={() => setShowPendingOnly(true)}
          />
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white/80 backdrop-blur border border-gray-200 shadow-xl rounded-2xl overflow-hidden">

          {/* FILTER BAR */}
          {showPendingOnly && (
            <div className="flex items-center justify-between px-6 py-3 bg-yellow-50 border-b border-yellow-200">
              <span className="text-sm text-yellow-800">
                Showing only policies pending acknowledgement
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPendingOnly(false)}
              >
                Clear filter
              </Button>
            </div>
          )}

          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Date Issued</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.map((policy) => (
                <TableRow
                  key={policy._id}
                  className="hover:bg-gray-50 transition"
                >
                  <TableCell>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formattedDate(policy.createdAt)}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium text-gray-900">
                    {policy.subject}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        isAcknowledged(policy)
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {isAcknowledged(policy)
                        ? "Acknowledged"
                        : "Pending"}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => navigate(`/policies/${policy._id}`)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex justify-center items-center gap-2 py-4">

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <span className="text-sm text-gray-600 px-2">
                        Page {currentPage} / {totalPages}
                      </span>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>

          {/* EMPTY STATE */}
          {filteredPolicies.length === 0 && (
            <div className="text-center py-14 text-gray-500">
              {showPendingOnly
                ? "No pending policies 🎉"
                : "No policies available"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewPolicies;