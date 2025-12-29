/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Assigns,
  LeaveCreditAPI,
  TicketAPi,
  UserProfileAPI,
} from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Loading from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  MessageSquare,
  PenSquare,
  Send,
  Tag,
  User,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Ticket } from "./ViewAllTicket";

interface LeaveCredit {
  _id: string;
  userId: string;
  currentBalance: number;
  updatedAt: string;
  employeeName: string;
  employeeId: string;
}

const AdminViewIndividualTicket: React.FC = () => {
  const [details, setDetails] = useState<Ticket>();
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assign, setAssign] = useState<any>();
  const [status, setStatus] = useState<any>();
  const [priority, setPriority] = useState<any>();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [listAssigns, setListAssigns] = useState<any[]>([]);
  const [closeMessage, setCloseMessage] = useState("");
  const [showTextArea, setShowTextArea] = useState(false);
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});
  const [leaveCredit, setLeaveCredit] = useState<LeaveCredit | null>(null);

  // Helper function to check if leave is paid
  const isPaidLeave = () => {
    if (!details?.description) return false;
    return details.description.includes("Leave Status: Paid");
  };

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

  const getLeaveCreditForUser = async (userId: string) => {
    try {
      const response = await LeaveCreditAPI.getLeaveCredit();
      console.log("Leave credit data:", response.data);

      if (response.data) {
        // Find the leave credit for the employee who created the ticket
        const employeeLeaveCredit = response.data.find(
          (credit: LeaveCredit) =>
            credit.userId === userId || credit.employeeId === userId
        );
        console.log("Ticket user ID:", userId);
        console.log("Matching leave credit:", employeeLeaveCredit);
        setLeaveCredit(employeeLeaveCredit || null);
      }
    } catch (error) {
      console.error("Error fetching leave credit:", error);
      setLeaveCredit(null);
    }
  };

  const getTicket = async (ticketId: string) => {
    try {
      const response = await TicketAPi.getIndividualTicket(ticketId);
      setDetails(response.data);

      // Get the user ID correctly
      const userId = response.data.user?._id || response.data.user;

      if (response.data.category === "Leave Request" && userId) {
        await getLeaveCreditForUser(userId);
      }
    } catch (error) {
      console.error(error);
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

  const getAssigns = async () => {
    try {
      const response = await Assigns.getAssign();
      setListAssigns(response.data.assigns);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAssigns();
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

  const handleAssignChange = (value: string) => {
    setAssign({ ...assign, assign: value });
  };

  const handleStatusChange = (value: string) => {
    setStatus({ ...status, status: value });
    setShowTextArea(value === "closed" || value === "Rejected");
  };

  const handlePriorityChange = (value: string) => {
    setPriority({ ...priority, priority: value });
  };

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !message.trim()) return;
    if (!id || !details) {
      console.error("Ticket ID or details are missing");
      return;
    }

    // Get the user ID correctly based on the structure
    const userId = details.user?._id || details.user;

    if (!userId) {
      console.error("User ID is missing");
      return;
    }

    setIsSubmitting(true);
    const body = {
      ticket: id,
      text: message,
      isStaff: true,
      user: userId,
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

  const calculateBalanceAfterApproval = () => {
    if (!leaveCredit || !details?.leaveDays) return null;

    const currentBalance = leaveCredit.currentBalance;
    const requestedDays = parseFloat(details.leaveDays.toString());
    const balanceAfterApproval = currentBalance - requestedDays;

    return balanceAfterApproval < 0 ? 0 : balanceAfterApproval;
  };

  const balanceAfterApproval = calculateBalanceAfterApproval();

  const handleEditButton = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;

    setIsUpdating(true);
    const body = {
      assignedTo: assign?.assign,
      status: status?.status,
      priority: priority?.priority,
      closingNote: closeMessage,
    };

    try {
      const response = await TicketAPi.updateTicket(id, body);
      console.log(response);

      // Update leave credit history only for paid leave requests
      if (
        (status?.status === "Approved" || status?.status === "Rejected") &&
        details?.category === "Leave Request" &&
        leaveCredit &&
        isPaidLeave() // Only proceed if it's paid leave
      ) {
        const historyEntry = {
          date: details?.createdAt,
          description: details?.description,
          days: parseFloat(details.leaveDays.toString()),
          ticket: details?.ticketNumber,
          status: status?.status,
        };

        // For approved requests, also update the balance
        const updateData =
          status?.status === "Approved"
            ? {
                currentBalance: calculateBalanceAfterApproval(),
                $push: { history: historyEntry },
              }
            : {
                $push: { history: historyEntry },
              };

        await LeaveCreditAPI.updateLeaveCredit(leaveCredit._id, updateData);
      }

      if (
        status?.status === "closed" ||
        (status?.status === "Rejected" && closeMessage.trim())
      ) {
        const userId = details?.user?._id || details?.user;
        if (!userId) {
          console.error("User ID is missing");
          return;
        }

        const noteBody = {
          ticket: id,
          text: closeMessage,
          isStaff: true,
          user: userId,
        };
        await TicketAPi.createNote(id, noteBody);
        setCloseMessage("");
      }

      getTicket(String(id));
      getAllNotes(String(id));
      setIsSheetOpen(false);
      toast({
        title: "Ticket Updated",
        description: "The ticket has been updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while updating the ticket",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileDownload = (file: string) => {
    window.open(
      `${import.meta.env.VITE_UPLOADFILES_URL}/files/${file}`,
      "_blank"
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  const getStatusInfo = (status: string | undefined) => {
    if (!status)
      return { color: "bg-gray-500", icon: <Clock className="h-4 w-4" /> };

    switch (status) {
      case "new":
      case "open":
        return {
          color: "bg-emerald-500",
          icon: <CheckCircle className="h-4 w-4" />,
        };
      case "closed":
        return {
          color: "bg-gray-500",
          icon: <AlertCircle className="h-4 w-4" />,
        };
      case "In Progress":
        return {
          color: "bg-blue-500",
          icon: <Clock className="h-4 w-4" />,
        };
      case "Approved":
        return {
          color: "bg-emerald-500",
          icon: <CheckCircle className="h-4 w-4" />,
        };
      case "Rejected":
        return {
          color: "bg-red-500",
          icon: <AlertCircle className="h-4 w-4" />,
        };
      default:
        return {
          color: "bg-blue-500",
          icon: <AlertCircle className="h-4 w-4" />,
        };
    }
  };

  const getPriorityInfo = (priority: string | undefined) => {
    if (!priority)
      return { color: "bg-gray-500", icon: <Clock className="h-4 w-4" /> };

    if (priority.includes("Critical") || priority.includes("1-")) {
      return {
        color: "bg-red-500",
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    } else if (priority.includes("High") || priority.includes("2-")) {
      return {
        color: "bg-orange-500",
        icon: <AlertTriangle className="h-4 w-4" />,
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

  const statusInfo = getStatusInfo(details?.status);
  const priorityInfo = getPriorityInfo(details?.priority);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
            <BackButton />
            <ChevronRight className="h-4 w-4" />
            <span>Tickets</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium">#{details?.ticketNumber}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ticket Details
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and update ticket information
              </p>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                {details?.status !== "closed" &&
                  details?.status !== "Rejected" &&
                  details?.status !== "Approved" && (
                    <Card className="border-0 shadow-sm">
                        <Button
                          className="w-full justify-start gap-2"
                          onClick={() => setIsSheetOpen(true)}
                        >
                          <PenSquare className="h-4 w-4" />
                          Update Status
                        </Button>
                    </Card>
                  )}
              </SheetTrigger>
              <SheetContent className="sm:max-w-md">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-gray-900">
                    Update Ticket Status
                  </SheetTitle>
                  <SheetDescription className="text-gray-600">
                    Update ticket assignment, status, and priority.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="assign"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Assign to
                    </Label>
                    <Select onValueChange={handleAssignChange} required>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={details?.assignedTo || "Select assignee"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {listAssigns.map((assign: any) => (
                            <SelectItem key={assign.name} value={assign.name}>
                              {assign.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="status"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Status
                    </Label>
                    <Select onValueChange={handleStatusChange} required>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={details?.status || "Select status"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {details?.category === "Leave Request" ? (
                            <>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="In Progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {details?.category !== "Leave Request" && (
                    <div>
                      <Label
                        htmlFor="priority"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Priority
                      </Label>
                      <Select onValueChange={handlePriorityChange} required>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={details?.priority || "Select priority"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="1-Critical">Critical</SelectItem>
                            <SelectItem value="2-High">High</SelectItem>
                            <SelectItem value="3-Moderate">Moderate</SelectItem>
                            <SelectItem value="4-Low">Low</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {showTextArea &&
                    (status?.status === "closed" ||
                      status?.status === "Rejected") && (
                      <div>
                        <Label
                          htmlFor="closeNote"
                          className="text-sm font-medium text-gray-700 mb-2 block"
                        >
                          {status?.status === "Rejected"
                            ? "Rejection Note"
                            : "Closing Note"}
                        </Label>
                        <Textarea
                          id="closeNote"
                          placeholder={
                            status?.status === "Rejected"
                              ? "Enter a rejection note"
                              : "Enter a closing note"
                          }
                          value={closeMessage}
                          onChange={(e) => setCloseMessage(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                    )}
                </div>

                <SheetFooter className="mt-8">
                  <SheetClose asChild>
                    <Button
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                      type="submit"
                      onClick={handleEditButton}
                      disabled={
                        isUpdating ||
                        ((status?.status === "closed" ||
                          status?.status === "Rejected") &&
                          !closeMessage.trim())
                      }
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Ticket Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Ticket Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${statusInfo.color} bg-opacity-10`}
                    >
                      <div
                        className={`${statusInfo.color.replace(
                          "bg-",
                          "text-"
                        )}`}
                      >
                        {statusInfo.icon}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        #{details?.ticketNumber} - {details?.category}
                      </h2>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge className={`${statusInfo.color} text-white`}>
                          {statusInfo.icon}
                          <span className="ml-1">
                            {details?.status || "Unknown"}
                          </span>
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`border ${priorityInfo.color.replace(
                            "bg-",
                            "border-"
                          )} ${priorityInfo.color.replace("bg-", "text-")}`}
                        >
                          {priorityInfo.icon}
                          <span className="ml-1">
                            {details?.priority?.replace(/^\d-/, "") || "Unset"}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Description */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-5 w-5 text-gray-700" />
                    <h3 className="font-medium text-gray-900">Description</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">
                      {details?.description || "No description provided."}
                    </pre>
                  </div>
                </div>

                {/* Leave Balance Section - Only for paid leave requests */}
                {details?.category === "Leave Request" && isPaidLeave() && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium text-gray-900">
                        Leave Balance
                      </h3>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Current Balance
                          </p>
                          <p className="text-2xl font-bold text-blue-700">
                            {leaveCredit ? (
                              <>{leaveCredit.currentBalance} days</>
                            ) : (
                              "Loading..."
                            )}
                          </p>
                        </div>
                        {details?.status === "open" && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              After Approval
                            </p>
                            <p
                              className={`text-2xl font-bold ${
                                balanceAfterApproval !== null &&
                                balanceAfterApproval < 5
                                  ? "text-orange-600"
                                  : "text-emerald-700"
                              }`}
                            >
                              {balanceAfterApproval !== null ? (
                                <>{balanceAfterApproval} days</>
                              ) : (
                                "Calculating..."
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                      {details?.leaveDays && (
                        <div className="mt-4 pt-4 border-t border-blue-100">
                          <p className="text-sm text-gray-600">
                            Requested Leave:{" "}
                            <span className="font-medium">
                              {details.leaveDays} days
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-gray-700" />
                      <h3 className="font-medium text-gray-900">
                        Conversation
                      </h3>
                      <Badge variant="secondary" className="ml-2">
                        {notes.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Add Note Form */}
                  {details?.status !== "closed" &&
                    details?.status !== "Rejected" &&
                    details?.status !== "Approved" && (
                      <Card className="mb-6 shadow-sm border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <Avatar className="h-10 w-10 border-2 border-gray-100">
                              <AvatarImage
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                                alt="Admin"
                              />
                              <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <form onSubmit={submitNote}>
                                <Textarea
                                  placeholder="Type your response here..."
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
                                        Send Response
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

                  {/* Notes List */}
                  <div className="space-y-4">
                    {notes?.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Start the conversation
                        </p>
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
                              className={`flex gap-3 ${
                                note.isStaff
                                  ? "pl-2 border-l-2 border-blue-500"
                                  : ""
                              }`}
                            >
                              <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-gray-100">
                                <AvatarImage
                                  src={avatarUrl}
                                  alt={note.name}
                                  className="object-cover"
                                />
                                <AvatarFallback>
                                  {note.name?.substring(0, 2).toUpperCase() ||
                                    "?"}
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
                                        Staff
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

          {/* Right Column - Sidebar Information */}
          <div className="space-y-6">
            {/* Ticket Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <h3 className="font-semibold text-gray-900">
                  Ticket Information
                </h3>
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
                        <p className="font-medium text-gray-900">
                          {details.leaveDays}
                        </p>
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
                        <p className="text-sm font-medium text-gray-900">
                          Attachment
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleFileDownload(details.file as string)
                        }
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

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewIndividualTicket;
