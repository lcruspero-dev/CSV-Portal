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
        color: "text-purple-800",
        bgColor: "bg-purple-100",
        hoverColor: "hover:bg-purple-200",
        text:
          item?.nte.employeeSignatureDate === null
            ? "Pending Receipt"
            : "Pending Response",
        icon: <ClipboardCheck className="h-4 w-4" />,
      },
      PNOD: {
        color: "text-blue-800",
        bgColor: "bg-blue-100",
        hoverColor: "hover:bg-blue-200",
        text: "Decision Pending",
        icon: <Eye className="h-4 w-4" />,
      },
      PNODA: {
        color: "text-amber-800",
        bgColor: "bg-amber-100",
        hoverColor: "hover:bg-amber-200",
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
          ? "Please confirm receipt of this notice to explain"
          : "Submit your feedback to this notice",
      PNOD: "A decision is pending. You'll be notified once it's finalized.",
      PNODA: "Please review and sign to acknowledge the decision",
      FTHR: "This case has been forwarded to HR department and is now complete",
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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center mb-4">
        <div className="scale-90">
          <BackButton />
        </div>
        <motion.h1
          className="text-3xl font-bold text-gray-800 flex-1 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Employee Notice
        </motion.h1>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="all">All Notices</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24 mt-1" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
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
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-gray-500 mb-2">No notices found</p>
                  <p className="text-gray-400 text-sm">
                    Any notices issued to you will appear here
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
                    : { text: "No feedback submitted yet", isTruncated: false };
                  const decisionText = item.noticeOfDecision
                    ? truncateText(item.noticeOfDecision.decision, 100)
                    : { text: "No decision yet", isTruncated: false };

                  return (
                    <motion.div
                      key={item._id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden transition-all hover:shadow-md">
                        <CardHeader className="pb-2 flex flex-row items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-lg">
                                {item.nte.name}
                              </CardTitle>
                              <Badge
                                className={`${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.hoverColor} transition-colors duration-200`}
                              >
                                <span className="flex items-center">
                                  {statusInfo.icon}
                                  <span className="ml-1">
                                    {statusInfo.text}
                                  </span>
                                </span>
                              </Badge>
                            </div>
                            <CardDescription>
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
                                    className="flex items-center gap-1 scale-95"
                                    onClick={() => handleView(item, 1)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span>View Details</span>
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View full details of this notice</p>
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
                              <h3 className="font-semibold text-gray-800 flex items-center">
                                <span className="h-6 w-1 bg-blue-500 rounded mr-2"></span>
                                Notice to Explain
                              </h3>
                              <div className="text-sm">
                                <p className="font-medium">
                                  {item.nte.offenseType}
                                </p>
                                <p className="text-gray-600 mt-1">
                                  {offenseDesc.text}
                                </p>
                                {offenseDesc.text !== "-" && (
                                  <motion.button
                                    onClick={() => handleView(item, 1)}
                                    className="text-blue-600 hover:text-blue-800 mt-1 text-xs font-medium"
                                    whileHover={{ scale: 1.05 }}
                                  >
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
                              <h3 className="font-semibold text-gray-800 flex items-center">
                                <span className="h-6 w-1 bg-green-500 rounded mr-2"></span>
                                Employee Feedback
                              </h3>
                              <div className="text-sm">
                                {item.employeeFeedback ? (
                                  <>
                                    <p className="text-xs text-gray-500">
                                      Responded on{" "}
                                      {formatDate(
                                        item.employeeFeedback.responseDate
                                      )}
                                    </p>
                                    <p className="text-gray-600 mt-1">
                                      {feedbackDetail.text}
                                    </p>
                                    {feedbackDetail.text !==
                                      "No feedback submitted yet" && (
                                      <motion.button
                                        onClick={() => handleView(item, 2)}
                                        className="text-blue-600 hover:text-blue-800 mt-1 text-xs font-medium"
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        Read more
                                      </motion.button>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-gray-400 italic">
                                    No feedback submitted yet
                                  </p>
                                )}
                              </div>
                            </motion.div>

                            {/* Notice of Decision */}
                            <motion.div
                              className="space-y-2"
                              whileHover={{ scale: 1.01 }}
                            >
                              <h3 className="font-semibold text-gray-800 flex items-center">
                                <span className="h-6 w-1 bg-purple-500 rounded mr-2"></span>
                                Notice of Decision
                              </h3>
                              <div className="text-sm">
                                {item.noticeOfDecision ? (
                                  <>
                                    <p className="text-xs text-gray-500">
                                      Decision date:{" "}
                                      {formatDate(
                                        item.noticeOfDecision.nteIssuanceDate
                                      )}
                                    </p>
                                    <p className="text-gray-600 mt-1">
                                      {decisionText.text}
                                    </p>
                                    {decisionText.text !==
                                      "No decision yet" && (
                                      <motion.button
                                        onClick={() => handleView(item, 3)}
                                        className="text-blue-600 hover:text-blue-800 mt-1 text-xs font-medium"
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        Read more
                                      </motion.button>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-gray-400 italic">
                                    Decision pending
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                            <p className="text-sm text-gray-500 flex-1 mt-1">
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
                                        className="bg-blue-600 hover:bg-blue-700 text-white scale-95"
                                      >
                                        <ClipboardCheck className="h-4 w-4 mr-1" />
                                        Confirm Receipt
                                      </Button>
                                    </motion.div>
                                  ) : (
                                    // Submit Response Button (simplified without arrow)
                                    <motion.div
                                      variants={buttonVariants}
                                      whileHover="hover"
                                      whileTap="tap"
                                    >
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRespond(item)}
                                        className="bg-green-600 hover:bg-green-700 text-white scale-95"
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
                                    className="bg-amber-600 hover:bg-amber-700"
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
