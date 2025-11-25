import { TicketAPi } from "@/API/endpoint";
import { useEffect, useState } from "react";
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
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Calendar,
  Heart,
  Clover,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formattedDate } from "@/API/helper";
import CreatePolicies from "@/pages/memo/CreatePolicies";

export interface Policies {
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

function ViewPolicies() {
   const [policies, setPolicies] = useState<Policies[]>([]);
   const [filteredPolicies, setFilteredPolicies] = useState<Policies[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [currentPages, setCurrentPages] = useState<number>(1);
   const [totalPages, setTotalPages] = useState<number>(1);
   const [showPendingOnly, setShowPendingOnly] = useState<boolean>(false);
   const itemsPerPage = 8;

   const userString = localStorage.getItem("user");
   const user: User | null = userString ? JSON.parse(userString) : null;
   const navigate = useNavigate();

   // Safe function to check if policy is acknowledged by current user
   const isPolicyAcknowledged = (policy: Policies): boolean => {
     if (!policy.acknowledgedby || !Array.isArray(policy.acknowledgedby)) {
       return false;
     }
     return policy.acknowledgedby.some((ack) => ack.userId === user?._id);
   };

   {/** Functions for Policies features */}
   const getPolicies = async () => {
    try {
      const response = await TicketAPi.getAllPolicies();
      console.log("API Response:", response);
      
      // Ensure we're working with an array and each policy has acknowledgedby
      const policiesData = Array.isArray(response.data) 
        ? response.data.map((policy: Policies) => ({
            ...policy,
            acknowledgedby: policy.acknowledgedby || []
          }))
        : [];
      
      console.log("Processed policies data:", policiesData);
      setPolicies(policiesData);
      setFilteredPolicies(policiesData);
      setTotalPages(Math.ceil(policiesData.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching policies:", error);
      // Set empty array on error
      setPolicies([]);
      setFilteredPolicies([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
   };

   useEffect(() => {
    getPolicies();
   }, []);

   useEffect(() => {
    // Ensure policies is always treated as an array
    const policiesArray = Array.isArray(policies) ? policies : [];
    
    let filtered = policiesArray;
    if (showPendingOnly) {
      filtered = policiesArray.filter(
        (policy) => !isPolicyAcknowledged(policy)
      );
    }
    setFilteredPolicies(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPages(1); // Reset to first page when filter changes
  }, [showPendingOnly, policies, user?._id]);

  const getCurrentPagePolicies = () => {
    const startIndex = (currentPages - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return Array.isArray(filteredPolicies) ? filteredPolicies.slice(startIndex, endIndex) : [];
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPages(pageNumber);
  };

  const handleShowPendingClick = () => {
    setShowPendingOnly(true);
  };

  const handleShowAllClick = () => {
    setShowPendingOnly(false);
  };

  const getStatusColor = (policy: Policies) => {
    const isAcknowledged = isPolicyAcknowledged(policy);
    return isAcknowledged
      ? "text-green-600 bg-green-50 border border-green-200"
      : "text-amber-600 bg-amber-50 border border-amber-200";
  };

  const getStatusText = (policy: Policies) => {
    const isAcknowledged = isPolicyAcknowledged(policy);
    return isAcknowledged
      ? "Acknowledged with Gratitude 🦃"
      : "Awaiting Your Review";
  };

  // Safe calculation of pendingCount
  const pendingCount = Array.isArray(policies) 
    ? policies.filter((policy) => !isPolicyAcknowledged(policy)).length
    : 0;

  if (loading) {
    return <LoadingComponent />;
  }

  // Safe calculation of acknowledged count for stats
  const acknowledgedCount = Array.isArray(policies)
    ? policies.filter((policy) => isPolicyAcknowledged(policy)).length
    : 0;

  return (
    <section className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="relative mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <BackButton />
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-amber-900">
                    Thanksgiving Policies
                  </h1>
                  <p className="text-amber-700 text-sm mt-1">
                    Share gratitude and important announcements this season
                  </p>
                </div>
              </div>
            </div>

            {user?.isAdmin && (
              <div className="sm:absolute sm:right-0 sm:top-0">
                <CreatePolicies setPolicies={setPolicies} setLoading={setLoading} />
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">
                  Total Blessings
                </p>
                <p className="text-2xl font-bold text-amber-900 mt-1">
                  {Array.isArray(policies) ? policies.length : 0}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Grateful Responses
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {acknowledgedCount}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-2xl p-6 shadow-lg border border-amber-200 cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-amber-400 ${
              showPendingOnly ? "ring-2 ring-amber-500 border-amber-500" : ""
            }`}
            onClick={handleShowPendingClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">
                  Awaiting Gratitude
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {pendingCount}
                </p>
                {pendingCount > 0 && (
                  <p className="text-xs text-amber-600 mt-2 font-medium flex items-center gap-1">
                    Click to share your gratitude
                    <ChevronRight className="h-3 w-3" />
                  </p>
                )}
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clover className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Status */}
        {showPendingOnly && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-amber-800 font-medium">
                  🦃 Sharing gratitude for {pendingCount} memo
                  {pendingCount !== 1 ? "s" : ""}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowAllClick}
                className="text-amber-700 border-amber-400 hover:bg-amber-100"
              >
                Show All Blessings
              </Button>
            </div>
          </div>
        )}

        {/* Policies Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader className="bg-gradient-to-r from-amber-600 to-orange-600">
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="text-white font-bold text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Clover Date
                    </div>
                  </TableHead>
                  <TableHead className="text-white font-bold text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" />
                      Message of Gratitude
                    </div>
                  </TableHead>
                  <TableHead className="text-white font-bold text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Heart className="h-4 w-4" />
                      Your Response
                    </div>
                  </TableHead>
                  <TableHead className="text-white font-bold text-center py-4">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPagePolicies().map((policy, index) => (
                  <TableRow
                    key={policy._id}
                    className={`border-b border-amber-100 transition-colors hover:bg-amber-50 ${
                      index % 2 === 0 ? "bg-amber-25" : "bg-white"
                    }`}
                  >
                    <TableCell className="py-4 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-4 w-4 text-amber-500 mb-1" />
                        <span className="text-sm font-medium text-amber-900">
                          {formattedDate(policy.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-center max-w-md mx-auto">
                        <p className="font-medium text-amber-900 line-clamp-2">
                          {policy.subject}
                        </p>
                        {policy.subject.length > 100 && (
                          <p className="text-xs text-amber-600 mt-1">
                            🍂 Click view to read full message of gratitude
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          policy
                        )}`}
                      >
                        {isPolicyAcknowledged(policy) ? (
                          <Heart className="h-3 w-3" />
                        ) : (
                          <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                        )}
                        {getStatusText(policy)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Button
                        onClick={() => navigate(`/policies/${policy._id}`)}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
                      >
                        <Eye className="h-4 w-4" />
                        Read with Gratitude
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {getCurrentPagePolicies().map((policy) => (
              <div
                key={policy._id}
                className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-900">
                      {formattedDate(policy.createdAt)}
                    </span>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      policy
                    )}`}
                  >
                    {isPolicyAcknowledged(policy) ? (
                      <Heart className="h-3 w-3" />
                    ) : (
                      <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                    )}
                    {getStatusText(policy)}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-amber-900 text-sm mb-2">
                    Message:
                  </h3>
                  <p className="text-amber-800 line-clamp-3 text-sm">
                    {policy.subject}
                  </p>
                </div>

                <Button
                  onClick={() => navigate(`/policies/${policy._id}`)}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Eye className="h-4 w-4" />
                  Read with Gratitude
                </Button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <TableFooter className="bg-amber-50">
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-amber-700 text-center sm:text-left">
                      Showing {(currentPages - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(
                        currentPages * itemsPerPage,
                        filteredPolicies.length
                      )}{ " "}
                      of {filteredPolicies.length} blessing
                      {filteredPolicies.length !== 1 ? "s" : ""}
                      {showPendingOnly && " (Awaiting your gratitude)"}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPages - 1)}
                        disabled={currentPages === 1}
                        className="flex items-center gap-1 border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:block">Previous</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(totalPages, 5) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPages <= 3) {
                              pageNum = i + 1;
                            } else if (currentPages >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPages - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  pageNum === currentPages
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 p-0 text-xs ${
                                  pageNum === currentPages
                                    ? "bg-amber-600 hover:bg-amber-700"
                                    : "border-amber-300 text-amber-700 hover:bg-amber-100"
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPages + 1)}
                        disabled={currentPages === totalPages}
                        className="flex items-center gap-1 border-amber-300 text-amber-700 hover:bg-amber-100"
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
          {filteredPolicies.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🦃</div>
              <FileText className="h-16 w-16 text-amber-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                {showPendingOnly
                  ? "All caught up with gratitude!"
                  : "No messages of gratitude yet"}
              </h3>
              <p className="text-amber-700 max-w-sm mx-auto">
                {showPendingOnly
                  ? "You've acknowledged all memos with gratitude. What a thankful heart!"
                  : "There are no Thanksgiving memos available at the moment. Check back later for messages of gratitude."}
              </p>
              {showPendingOnly && (
                <Button
                  onClick={handleShowAllClick}
                  className="mt-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  View All Blessings
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Thanksgiving Footer */}
        <div className="mt-8 text-center">
          <div className="text-amber-600 text-sm flex items-center justify-center gap-2">
            <span>🦃</span>
            <span>
              Wishing you a season filled with gratitude and blessings
            </span>
            <span>🍂</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ViewPolicies;