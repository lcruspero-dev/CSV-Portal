import { NteAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import RespondToNteDialog from "@/components/kit/RespondDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PdfNteViewer from "@/components/ui/viewNteDialog";
import { motion } from "framer-motion";
import {
  CheckSquare,
  ChevronRight,
  ClipboardCheck,
  Eye,
  MessageSquare,
  Snowflake,
  TreePine,
  Star,
  Bell,
  FileText
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface NteDetails {
  employeeId: string;
  name: string;
  position: string;
  dateIssued: string;
  issuedBy: string;
  offenseType: string;
  offenseDescription: string;
  file: string | null;
  employeeSignatureDate: string;
  authorizedSignatureDate: string;
}

interface employeeFeedbackDetails {
  name: string;
  position: string;
  responseDate: string;
  responseDetail: string;
  employeeSignatureDate?: string;
}

interface NoticeOfDecisionDetails {
  name: string;
  position: string;
  nteIssuanceDate: string;
  writtenExplanationReceiptDate: string;
  offenseType: string;
  offenseDescription: string;
  findings: string;
  decision: string;
  employeeSignatureDate: string;
  authorizedSignatureDate: string;
}

interface NteData {
  nte: NteDetails;
  employeeFeedback: employeeFeedbackDetails;
  noticeOfDecision: NoticeOfDecisionDetails;
  _id: string;
  status: "PER" | "PNOD" | "PNODA" | "FTHR";
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const NteSummaryTable: React.FC = () => {
  const [data, setData] = useState<NteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNte, setSelectedNte] = useState<NteData | null>(null);
  const [showViewDialog, setShowViewDialog] = useState<boolean>(false);
  const [initialPage, setInitialPage] = useState<number>(1);
  const [showRespondDialog, setShowRespondDialog] = useState<boolean>(false);
  const [selectedNteForResponse, setSelectedNteForResponse] =
    useState<NteData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await NteAPI.getNtesByUser();
      setData(response.data);
    } catch (error) {
      console.error("Error fetching NTE data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleView = async (item: NteData, page: number): Promise<void> => {
    setSelectedNte(item);
    setInitialPage(page);
    setShowViewDialog(true);
  };

  const handleViewDialogClose = () => {
    setShowViewDialog(false);
    setSelectedNte(null);
    fetchData();
  };

  const handleRespond = (item: NteData) => {
    setSelectedNteForResponse(item);
    setShowRespondDialog(true);
  };

  const handleRespondDialogClose = () => {
    setShowRespondDialog(false);
    setSelectedNteForResponse(null);
    fetchData();
  };

  const handleAcknowledge = async (_id: string, item: NteData) => {
    try {
      await handleView(item, 3);
    } catch (error) {
      console.error("Error acknowledging decision:", error);
    }
  };

  const handleConfirmReceipt = async (_id: string, item: NteData) => {
    try {
      await handleView(item, 1);
    } catch (error) {
      console.error("Error acknowledging decision:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[month - 1]} ${day}, ${year}`;
  };

  const getStatusInfo = (
    status: NteData["status"],
    item?: NteData
  ): {
    color: string;
    text: string;
    bgColor: string;
    hoverColor: string;
    icon: React.ReactNode;
  } => {
    const statusMap = {
      PER: {
        color: "text-green-800",
        bgColor: "bg-green-100",
        hoverColor: "hover:bg-green-200",
        text:
          item?.nte.employeeSignatureDate === null
            ? "Pending Receipt"
            : "Pending Response",
        icon: <ClipboardCheck className="h-4 w-4" />,
      },
      PNOD: {
        color: "text-yellow-800",
        bgColor: "bg-yellow-100",
        hoverColor: "hover:bg-yellow-200",
        text: "Decision Pending",
        icon: <Eye className="h-4 w-4" />,
      },
      PNODA: {
        color: "text-red-800",
        bgColor: "bg-red-100",
        hoverColor: "hover:bg-red-200",
        text: "Signature Required",
        icon: <CheckSquare className="h-4 w-4" />,
      },
      FTHR: {
        color: "text-green-800",
        bgColor: "bg-green-100",
        hoverColor: "hover:bg-green-200",
        text: "Completed",
        icon: <CheckSquare className="h-4 w-4" />,
      },
    };

    return (
      statusMap[status] || {
        color: "text-gray-800",
        bgColor: "bg-gray-100",
        hoverColor: "hover:bg-gray-200",
        text: status,
        icon: <ChevronRight className="h-4 w-4" />,
      }
    );
  };

  const getStatusDescription = (
    status: NteData["status"],
    item?: NteData
  ): string => {
    const statusText: Record<NteData["status"], string> = {
      PER:
        item?.nte.employeeSignatureDate === null
          ? "🎄 Please confirm receipt of this notice"
          : "🎁 Submit your response to this notice",
      PNOD: "⭐ A decision is pending. You'll be notified soon.",
      PNODA: "📜 Please review and sign to acknowledge the decision",
      FTHR: "✅ This case has been completed and forwarded",
    };
    return statusText[status] || status;
  };

  const truncateText = (
    text: string | undefined,
    limit: number
  ): { text: string; isTruncated: boolean } => {
    if (!text) return { text: "-", isTruncated: false };
    if (text.length <= limit) return { text, isTruncated: false };
    return { text: `${text.slice(0, limit)}...`, isTruncated: true };
  };

  const filteredData =
    activeTab === "all"
      ? data
      : data.filter((item) => {
          switch (activeTab) {
            case "pending":
              return ["PER", "PNOD", "PNODA"].includes(item.status);
            case "completed":
              return item.status === "FTHR";
            default:
              return true;
          }
        });

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.03 },
    tap: { scale: 0.98 },
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 relative overflow-hidden">
      {/* Animated Snowflakes Background */}
      <div className="absolute top-4 left-4 opacity-5">
        <Snowflake className="h-12 w-12 text-blue-400 animate-pulse" />
      </div>
      <div className="absolute top-20 right-10 opacity-5">
        <Snowflake className="h-8 w-8 text-blue-300 animate-pulse delay-300" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-5">
        <Snowflake className="h-10 w-10 text-blue-400 animate-pulse delay-700" />
      </div>
      
      <div className="flex items-center mb-6">
        <div className="scale-90">
          <BackButton />
        </div>
        <motion.div
          className="flex-1 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-green-900 flex items-center justify-center gap-2">
            <div className="p-2 bg-gradient-to-r from-green-600 to-red-600 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            🎅 Santa's Notice Board
          </h1>
          <p className="text-green-700 text-sm mt-1 flex items-center justify-center">
            <Star className="h-3 w-3 mr-1" />
            Review and respond to holiday notices
          </p>
        </motion.div>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4 bg-gradient-to-r from-green-50 to-red-50 border border-green-200">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-red-600 data-[state=active]:text-white"
            >
              🎄 All Notices
            </TabsTrigger>
            <TabsTrigger 
              value="pending"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-red-600 data-[state=active]:text-white"
            >
              ⭐ Pending
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-red-600 data-[state=active]:text-white"
            >
              ✅ Completed
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="overflow-hidden border-green-200 bg-white">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-32 bg-green-100" />
                    <Skeleton className="h-4 w-24 mt-1 bg-green-100" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Skeleton className="h-24 w-full bg-green-100" />
                      <Skeleton className="h-24 w-full bg-red-100" />
                      <Skeleton className="h-24 w-full bg-yellow-100" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-red-50 border-green-200 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <TreePine className="h-16 w-16 text-green-400 mb-4 opacity-70 animate-bounce" />
                  <p className="text-green-700 mb-2 font-medium">No notices found</p>
                  <p className="text-green-600 text-sm">
                    🎄 You're on the nice list! No notices at the moment.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-4">
                {filteredData.map((item, index) => {
                  const statusInfo = getStatusInfo(item.status, item);
                  const offenseDesc = truncateText(
                    item.nte.offenseDescription,
                    100
                  );
                  const feedbackDetail = item.employeeFeedback
                    ? truncateText(item.employeeFeedback.responseDetail, 100)
                    : { text: "No response submitted yet", isTruncated: false };
                  const decisionText = item.noticeOfDecision
                    ? truncateText(item.noticeOfDecision.decision, 100)
                    : { text: "Decision pending review", isTruncated: false };

                  return (
                    <motion.div
                      key={item._id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden transition-all hover:shadow-lg border-green-200 bg-gradient-to-br from-white to-green-50 shadow-sm">
                        <CardHeader className="pb-2 flex flex-row items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-lg text-green-900">
                                {item.nte.name}
                              </CardTitle>
                              <Badge
                                className={`${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.hoverColor} transition-colors duration-200 border-green-200`}
                              >
                                <span className="flex items-center">
                                  {statusInfo.icon}
                                  <span className="ml-1">
                                    {statusInfo.text}
                                  </span>
                                </span>
                              </Badge>
                            </div>
                            <CardDescription className="text-green-700 flex items-center">
                              <span className="mr-2">🎄</span>
                              {item.nte.position} • Issue Date:{" "}
                              {formatDate(item.nte.dateIssued)}
                            </CardDescription>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div
                                  variants={buttonVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 scale-95 border-gradient-to-r to-red-300 bg-gradient-to-r from-green-50 text-green-700 hover:bg-gradient-to-r hover:from-green-100 hover:to-red-100"
                                    onClick={() => handleView(item, 1)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span>View Details</span>
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gradient-to-r from-green-600 to-red-600 text-white">
                                <p className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View full details of this notice
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CardHeader>

                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Notice to Explain */}
                            <motion.div
                              className="space-y-2"
                              whileHover={{ scale: 1.01 }}
                            >
                              <h3 className="font-semibold text-green-800 flex items-center">
                                <span className="h-6 w-1 bg-gradient-to-b from-green-500 to-green-700 rounded mr-2"></span>
                                📜 Notice to Explain
                              </h3>
                              <div className="text-sm bg-green-50 p-3 rounded-lg border border-green-100">
                                <p className="font-medium text-green-900">
                                  {item.nte.offenseType}
                                </p>
                                <p className="text-green-700 mt-1">
                                  {offenseDesc.text}
                                </p>
                                {offenseDesc.text !== "-" && (
                                  <motion.button
                                    onClick={() => handleView(item, 1)}
                                    className="text-green-600 hover:text-green-800 mt-1 text-xs font-medium flex items-center"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <ChevronRight className="h-3 w-3 mr-1" />
                                    Read more
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>

                            {/* Employee Feedback */}
                            <motion.div
                              className="space-y-2"
                              whileHover={{ scale: 1.01 }}
                            >
                              <h3 className="font-semibold text-red-800 flex items-center">
                                <span className="h-6 w-1 bg-gradient-to-b from-red-500 to-red-700 rounded mr-2"></span>
                                🎁 Your Response
                              </h3>
                              <div className="text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                {item.employeeFeedback ? (
                                  <>
                                    <p className="text-xs text-red-600">
                                      🗓️ Responded on{" "}
                                      {formatDate(
                                        item.employeeFeedback.responseDate
                                      )}
                                    </p>
                                    <p className="text-red-700 mt-1">
                                      {feedbackDetail.text}
                                    </p>
                                    {feedbackDetail.text !==
                                      "No response submitted yet" && (
                                      <motion.button
                                        onClick={() => handleView(item, 2)}
                                        className="text-red-600 hover:text-red-800 mt-1 text-xs font-medium flex items-center"
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        <ChevronRight className="h-3 w-3 mr-1" />
                                        Read more
                                      </motion.button>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-red-500 italic">
                                    ⏳ No response submitted yet
                                  </p>
                                )}
                              </div>
                            </motion.div>

                            {/* Notice of Decision */}
                            <motion.div
                              className="space-y-2"
                              whileHover={{ scale: 1.01 }}
                            >
                              <h3 className="font-semibold text-yellow-800 flex items-center">
                                <span className="h-6 w-1 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded mr-2"></span>
                                ⭐ Santa's Decision
                              </h3>
                              <div className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                {item.noticeOfDecision ? (
                                  <>
                                    <p className="text-xs text-yellow-600">
                                      🎅 Decision date:{" "}
                                      {formatDate(
                                        item.noticeOfDecision.nteIssuanceDate
                                      )}
                                    </p>
                                    <p className="text-yellow-700 mt-1">
                                      {decisionText.text}
                                    </p>
                                    {decisionText.text !==
                                      "Decision pending review" && (
                                      <motion.button
                                        onClick={() => handleView(item, 3)}
                                        className="text-yellow-600 hover:text-yellow-800 mt-1 text-xs font-medium flex items-center"
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        <ChevronRight className="h-3 w-3 mr-1" />
                                        Read more
                                      </motion.button>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-yellow-500 italic">
                                    🤔 Decision pending review
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 pt-3 border-t border-green-200 flex justify-end">
                            <p className="text-sm text-green-700 flex-1 mt-1 flex items-center">
                              <Bell className="h-4 w-4 mr-1" />
                              {getStatusDescription(item.status, item)}
                            </p>

                            <div className="flex gap-2">
                              {item.status === "PER" && (
                                <>
                                  {item.nte.employeeSignatureDate === null ? (
                                    <motion.div
                                      variants={buttonVariants}
                                      whileHover="hover"
                                      whileTap="tap"
                                    >
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleConfirmReceipt(item._id, item)
                                        }
                                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white scale-95 border-green-700"
                                      >
                                        <ClipboardCheck className="h-4 w-4 mr-1" />
                                        Confirm Receipt
                                      </Button>
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      variants={buttonVariants}
                                      whileHover="hover"
                                      whileTap="tap"
                                    >
                                      <Button
                                        size="sm"
                                        onClick={() => handleRespond(item)}
                                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white scale-95"
                                      >
                                        <MessageSquare className="h-4 w-4 mr-1" />
                                        Submit Response
                                      </Button>
                                    </motion.div>
                                  )}
                                </>
                              )}
                              {item.status === "PNODA" && (
                                <motion.div
                                  variants={buttonVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleAcknowledge(item._id, item)
                                    }
                                    className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white"
                                  >
                                    <CheckSquare className="h-4 w-4 mr-1" />
                                    Sign & Acknowledge
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {/* Christmas Footer */}
      <div className="mt-8 text-center bg-gradient-to-r from-green-50 to-red-50 p-4 rounded-xl border border-green-200">
        <div className="text-green-600 text-sm flex items-center justify-center gap-2">
          <span>🎄</span>
          <span>May your holiday season be peaceful and bright!</span>
          <span>🎅</span>
        </div>
        <div className="text-xs text-green-500 mt-1 flex items-center justify-center">
          <Snowflake className="h-3 w-3 mr-1" />
          From Santa's Workshop with Care
        </div>
      </div>

      {selectedNte && (
        <PdfNteViewer
          nteData={{
            ...selectedNte,
            nte: {
              ...selectedNte.nte,
              employeeSignatureDate: selectedNte.nte.employeeSignatureDate,
              authorizedSignatureDate: selectedNte.nte.authorizedSignatureDate,
            },
          }}
          initialPage={initialPage}
          open={showViewDialog}
          onOpenChange={handleViewDialogClose}
        />
      )}

      {selectedNteForResponse && (
        <RespondToNteDialog
          open={showRespondDialog}
          onOpenChange={handleRespondDialogClose}
          nteId={selectedNteForResponse._id}
          nteData={selectedNteForResponse}
          onRespondSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default NteSummaryTable;