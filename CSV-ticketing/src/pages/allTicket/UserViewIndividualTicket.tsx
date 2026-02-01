/* eslint-disable @typescript-eslint/no-explicit-any */
import { LeaveCreditAPI, TicketAPi, UserProfileAPI } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Download,
  FileText,
  Send,
  Tag,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Ticket } from "./ViewAllTicket";

interface LeaveCredit {
  _id: string;
  userId: string;
  currentBalance: number;
  updatedAt: string;
}

const UserViewIndividualTicket: React.FC = () => {
  const [details, setDetails] = useState<Ticket>();
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});
  const [leaveCredit, setLeaveCredit] = useState<LeaveCredit | null>(null);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await UserProfileAPI.getAllUserAvatar();
        const map = response.data.reduce(
          (
            acc: Record<string, string>,
            curr: { userId: string; avatar: string }
          ) => {
            acc[curr.userId] = curr.avatar;
            return acc;
          },
          {}
        );
        setAvatarMap(map);
      } catch (error) {
        console.error("Error fetching avatars:", error);
      }
    };

    fetchAvatars();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const getTicket = async (ticketId: string) => {
    try {
      const response = await TicketAPi.getIndividualTicket(ticketId);
      setDetails(response.data);
      getLeaveCreditForUser();
    } catch (error) {
      console.error(error);
    }
  };

  const getLeaveCreditForUser = async () => {
    try {
      const response = await LeaveCreditAPI.getLeaveCreditById();
      setLeaveCredit(response.data);
    } catch (error) {
      console.error("Error fetching leave credit:", error);
    }
  };

  const getAllNotes = async (ticketId: string) => {
    try {
      const response = await TicketAPi.getNotes(ticketId);
      setNotes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      Promise.all([getTicket(id), getAllNotes(id)])
        .then(() => setIsLoading(false))
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!id || !details?._id) {
      console.error("Ticket ID or User ID is missing");
      return;
    }
    setIsSubmitting(true);
    const body = {
      ticket: id,
      text: message,
      isStaff: false,
      user: details?._id,
    };
    try {
      const response = await TicketAPi.createNote(id, body);
      console.log(response);
      setMessage("");
      getAllNotes(id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  const handleFileDownload = (file: string) => {
    window.open(
      `${import.meta.env.VITE_UPLOADFILES_URL}/files/${file}`,
      "_blank"
    );
  };

  const getStatusInfo = (status: string | undefined) => {
    if (!status) return { color: "bg-gray-500", icon: <Clock className="h-4 w-4" /> };

    switch (status.toLowerCase()) {
      case "new":
      case "open":
      case "approved":
        return {
          color: "bg-emerald-500",
          icon: <CheckCircle className="h-4 w-4" />,
        };
      case "closed":
      case "rejected":
        return {
          color: "bg-gray-500",
          icon: <AlertCircle className="h-4 w-4" />,
        };
      case "in progress":
        return {
          color: "bg-blue-500",
          icon: <Clock className="h-4 w-4" />,
        };
      default:
        return {
          color: "bg-blue-500",
          icon: <AlertCircle className="h-4 w-4" />,
        };
    }
  };

  const getPriorityInfo = (priority: string | undefined) => {
    if (!priority) return { color: "bg-gray-500", icon: <Clock className="h-4 w-4" /> };

    if (priority.includes("Critical") || priority.includes("1-")) {
      return {
        color: "bg-red-500",
        icon: <AlertCircle className="h-4 w-4" />,
      };
    } else if (priority.includes("High") || priority.includes("2-")) {
      return {
        color: "bg-orange-500",
        icon: <AlertCircle className="h-4 w-4" />,
      };
    } else if (priority.includes("Moderate") || priority.includes("3-")) {
      return {
        color: "bg-yellow-500",
        icon: <Clock className="h-4 w-4" />,
      };
    } else if (priority.includes("Low") || priority.includes("4-")) {
      return {
        color: "bg-emerald-500",
        icon: <CheckCircle className="h-4 w-4" />,
      };
    }

    return { color: "bg-blue-500", icon: <AlertCircle className="h-4 w-4" /> };
  };

  const calculateBalanceAfterApproval = () => {
    if (!leaveCredit || !details?.leaveDays) return null;

    const currentBalance = leaveCredit.currentBalance;
    const requestedDays = parseFloat(details.leaveDays.toString());
    const balanceAfterApproval = currentBalance - requestedDays;

    return balanceAfterApproval < 0 ? 0 : balanceAfterApproval;
  };

  const showLeaveBalance = details?.category === "Leave Request";
  const balanceAfterApproval = calculateBalanceAfterApproval();
  const isPaidLeave = () => {
    if (!details?.description) return false;
    return details.description.includes("Leave Status: Paid");
  };

  const statusInfo = getStatusInfo(details?.status);
  const priorityInfo = getPriorityInfo(details?.priority);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
            <BackButton />
            <span>Tickets #{details?.ticketNumber}</span>
            <span className="font-medium"></span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Support Ticket</h1>
              <p className="text-gray-600 mt-1">View and manage your support request</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={`${statusInfo.color} text-white flex items-center gap-1`}>
                {statusInfo.icon}
                <span>{details?.status || "Unknown"}</span>
              </Badge>
              <Badge variant="outline" className={`border ${priorityInfo.color.replace('bg-', 'border-')} ${priorityInfo.color.replace('bg-', 'text-')} flex items-center gap-1`}>
                {priorityInfo.icon}
                <span>{details?.priority?.replace(/^\d-/, "") || "Unset"}</span>
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${statusInfo.color} bg-opacity-10`}>
                    <div className={`${statusInfo.color.replace('bg-', 'text-')}`}>
                      {statusInfo.icon}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      #{details?.ticketNumber} - {details?.category}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Created on {formattedDate(details?.createdAt || "")}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Description</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">
                      {details?.description || "No description provided."}
                    </pre>
                  </div>
                </div>

                {/* Leave Balance Section */}
                {showLeaveBalance && isPaidLeave() && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-blue-600" />
                      Leave Balance Information
                    </h3>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Current Balance</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {leaveCredit ? (
                              <>{leaveCredit.currentBalance} days</>
                            ) : (
                              "Loading..."
                            )}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">After Approval</p>
                          <p className={`text-2xl font-bold ${balanceAfterApproval !== null && balanceAfterApproval < 5 ? "text-orange-600" : "text-emerald-700"}`}>
                            {balanceAfterApproval !== null ? (
                              <>{balanceAfterApproval} days</>
                            ) : (
                              "Calculating..."
                            )}
                          </p>
                        </div>
                      </div>
                      {details?.leaveDays && (
                        <div className="mt-4 pt-4 border-t border-blue-100">
                          <p className="text-sm text-gray-600">
                            Requested Leave: <span className="font-medium">{details.leaveDays} days</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Conversation Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Conversation</h3>
                    <Badge variant="secondary">{notes.length} messages</Badge>
                  </div>

                  {/* Add Message Form */}
                  {details?.status !== "closed" && (
                    <Card className="mb-6 shadow-sm border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10 border-2 border-gray-100">
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?background=2563EB&color=fff&name=${details?.name || "?"}`}
                              alt={details?.name}
                            />
                            <AvatarFallback>{details?.name?.substring(0, 2).toUpperCase() || "?"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <form onSubmit={submitNote}>
                              <Textarea
                                placeholder="Type your message here..."
                                value={message}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="min-h-[100px] resize-none border-gray-300 focus:border-blue-500"
                              />
                              <div className="flex justify-end mt-3">
                                <Button
                                  type="submit"
                                  disabled={isSubmitting || !message.trim()}
                                  onClick={submitNote}
                                  className="gap-2 bg-gray-900 hover:bg-gray-800 text-white"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="h-4 w-4" />
                                      Send Message
                                    </>
                                  )}
                                </Button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Messages List */}
                  <div className="space-y-4">
                    {notes?.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-1">Start the conversation</p>
                      </div>
                    ) : (
                      notes
                        ?.slice()
                        .reverse()
                        .map((note: any) => {
                          const avatarFilename = avatarMap[note.user];
                          const avatarUrl = avatarFilename
                            ? `${
                                import.meta.env.VITE_UPLOADFILES_URL
                              }/avatars/${avatarFilename}`
                            : `https://ui-avatars.com/api/?background=2563EB&color=fff&name=${
                                note.name || "?"
                              }`;

                          return (
                            <div
                              key={note._id}
                              className={`flex gap-3 ${note.isStaff ? "pl-2 border-l-2 border-blue-500" : ""}`}
                            >
                              <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-gray-100">
                                <AvatarImage
                                  src={avatarUrl}
                                  alt={note.name}
                                  className="object-cover"
                                />
                                <AvatarFallback>
                                  {note.name?.substring(0, 2).toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">
                                      {note.name || "Unknown User"}
                                    </p>
                                    {note.isStaff && (
                                      <Badge
                                        variant="outline"
                                        className="bg-blue-50 text-blue-600 border-blue-200 text-xs"
                                      >
                                        Support
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {formattedDate(note.createdAt)}
                                  </p>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                  {note.text}
                                </p>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Ticket Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <h3 className="font-semibold text-gray-900">Ticket Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="font-medium text-gray-900">
                        {formattedDate(details?.createdAt || "")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <User className="h-4 w-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Submitter</p>
                      <p className="font-medium text-gray-900">
                        {details?.name || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Tag className="h-4 w-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-medium text-gray-900">
                        {details?.category || "Uncategorized"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <User className="h-4 w-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Assigned To</p>
                      <p className="font-medium text-gray-900">
                        {details?.assignedTo || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  {details?.leaveDays && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Leave Days</p>
                        <p className="font-medium text-gray-900">{details.leaveDays}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* File Attachment */}
                {details?.file && details.file.trim() !== "" && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-700" />
                        <p className="text-sm font-medium text-gray-900">Attachment</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleFileDownload(details.file as string)}
                        className="w-full justify-start gap-2 border-gray-300 hover:border-gray-400"
                      >
                        <Download className="h-4 w-4" />
                        <span className="truncate">{details.file}</span>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <h3 className="font-semibold text-gray-900">Current Status</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={`${statusInfo.color} text-white`}>
                      {statusInfo.icon}
                      <span className="ml-1">{details?.status || "Unknown"}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Priority</span>
                    <Badge variant="outline" className={`border ${priorityInfo.color.replace('bg-', 'border-')} ${priorityInfo.color.replace('bg-', 'text-')}`}>
                      {priorityInfo.icon}
                      <span className="ml-1">
                        {details?.priority?.replace(/^\d-/, "") || "Unset"}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

          
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserViewIndividualTicket;