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
  Bell,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  Calendar,
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
        color: "text-amber-800",
        bgColor: "bg-amber-100",
        hoverColor: "hover:bg-amber-200",
        text: "Decision Pending",
        icon: <Clock className="h-4 w-4" />,
      },
      PNODA: {
        color: "text-red-800",
        bgColor: "bg-red-100",
        hoverColor: "hover:bg-red-200",
        text: "Signature Required",
        icon: <AlertCircle className="h-4 w-4" />,
      },
      FTHR: {
        color: "text-green-800",
        bgColor: "bg-green-100",
        hoverColor: "hover:bg-green-200",
        text: "Completed",
        icon: <CheckCircle className="h-4 w-4" />,
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
          ? "Please confirm receipt of this notice"
          : "Submit your response to this notice",
      PNOD: "A decision is pending. You'll be notified soon.",
      PNODA: "Please review and sign to acknowledge the decision",
      FTHR: "This case has been completed and forwarded",
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Notice to Explain (NTE) Records
              </h1>
              <p className="text-gray-600 mt-1">
                Review and respond to disciplinary notices
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="all">
              <FileText className="h-4 w-4 mr-2" />
              All Notices
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="border border-gray-200">
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
                <Card className="border border-gray-200 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 mb-2 font-medium">No notices found</p>
                    <p className="text-gray-500 text-sm">
                      You have no pending notices at the moment.
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
                        <Card className="overflow-hidden transition-all hover:shadow-md border border-gray-200">
                          <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-2">
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                  {item.nte.name}
                                </CardTitle>
                                <Badge
                                  className={`${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.hoverColor} transition-colors duration-200 border border-gray-200 w-fit`}
                                >
                                  <span className="flex items-center">
                                    {statusInfo.icon}
                                    <span className="ml-1">
                                      {statusInfo.text}
                                    </span>
                                  </span>
                                </Badge>
                              </div>
                              <CardDescription className="text-gray-600 flex items-center mt-1">
                                <User className="h-3 w-3 mr-1" />
                                {item.nte.position} •{" "}
                                <Calendar className="h-3 w-3 mx-1" />
                                Issue Date: {formatDate(item.nte.dateIssued)}
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
                                      className="flex items-center gap-1"
                                      onClick={() => handleView(item, 1)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      View Details
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
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
                                <h3 className="font-semibold text-gray-700 flex items-center">
                                  <div className="h-5 w-1 bg-purple-500 rounded mr-2"></div>
                                  Notice to Explain
                                </h3>
                                <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <p className="font-medium text-gray-900">
                                    {item.nte.offenseType}
                                  </p>
                                  <p className="text-gray-700 mt-1">
                                    {offenseDesc.text}
                                  </p>
                                  {offenseDesc.text !== "-" && (
                                    <motion.button
                                      onClick={() => handleView(item, 1)}
                                      className="text-purple-600 hover:text-purple-800 mt-1 text-xs font-medium flex items-center"
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
                                <h3 className="font-semibold text-gray-700 flex items-center">
                                  <div className="h-5 w-1 bg-blue-500 rounded mr-2"></div>
                                  Your Response
                                </h3>
                                <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  {item.employeeFeedback ? (
                                    <>
                                      <p className="text-xs text-gray-600 flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        Responded on{" "}
                                        {formatDate(
                                          item.employeeFeedback.responseDate
                                        )}
                                      </p>
                                      <p className="text-gray-700 mt-1">
                                        {feedbackDetail.text}
                                      </p>
                                      {feedbackDetail.text !==
                                        "No response submitted yet" && (
                                        <motion.button
                                          onClick={() => handleView(item, 2)}
                                          className="text-blue-600 hover:text-blue-800 mt-1 text-xs font-medium flex items-center"
                                          whileHover={{ scale: 1.05 }}
                                        >
                                          <ChevronRight className="h-3 w-3 mr-1" />
                                          Read more
                                        </motion.button>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-gray-500 italic">
                                      No response submitted yet
                                    </p>
                                  )}
                                </div>
                              </motion.div>

                              {/* Notice of Decision */}
                              <motion.div
                                className="space-y-2"
                                whileHover={{ scale: 1.01 }}
                              >
                                <h3 className="font-semibold text-gray-700 flex items-center">
                                  <div className="h-5 w-1 bg-amber-500 rounded mr-2"></div>
                                  Decision
                                </h3>
                                <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  {item.noticeOfDecision ? (
                                    <>
                                      <p className="text-xs text-gray-600 flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        Decision date:{" "}
                                        {formatDate(
                                          item.noticeOfDecision.nteIssuanceDate
                                        )}
                                      </p>
                                      <p className="text-gray-700 mt-1">
                                        {decisionText.text}
                                      </p>
                                      {decisionText.text !==
                                        "Decision pending review" && (
                                        <motion.button
                                          onClick={() => handleView(item, 3)}
                                          className="text-amber-600 hover:text-amber-800 mt-1 text-xs font-medium flex items-center"
                                          whileHover={{ scale: 1.05 }}
                                        >
                                          <ChevronRight className="h-3 w-3 mr-1" />
                                          Read more
                                        </motion.button>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-gray-500 italic">
                                      Decision pending review
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                              <div className="flex-1">
                                <p className="text-sm text-gray-700 flex items-center">
                                  <Bell className="h-4 w-4 mr-2 text-gray-500" />
                                  {getStatusDescription(item.status, item)}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
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
                                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
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
                                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
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
                                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
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