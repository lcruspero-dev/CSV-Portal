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
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Gift,
  Snowflake,
  TreePine,
  Star,
  Calendar,
  Download,
  FileText,
  Send,
  Tag,
  User,
  Home,
  Bell,
  CandyCane,
  MessageSquare
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-red-50">
        <div className="text-center">
          <div className="animate-bounce">
            <TreePine className="h-12 w-12 text-green-600 mx-auto mb-4" />
          </div>
          <p className="text-green-600 font-medium">Loading Santa's Note...</p>
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

  const getStatusBadgeClass = (status: string | undefined): string => {
    if (!status) return "bg-gray-500";

    switch (status.toLowerCase()) {
      case "new":
      case "open":
      case "approved":
        return "bg-gradient-to-r from-green-500 to-green-600";
      case "closed":
      case "rejected":
        return "bg-gradient-to-r from-red-500 to-red-600";
      case "in progress":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600";
      default:
        return "bg-gradient-to-r from-blue-500 to-blue-600";
    }
  };

  const getPriorityBadgeClass = (priority: string | undefined) => {
    if (!priority) return "bg-gradient-to-r from-gray-500 to-gray-600";
    switch (priority.toLowerCase()) {
      case "1-critical":
        return "bg-gradient-to-r from-red-500 to-red-700";
      case "2-high":
        return "bg-gradient-to-r from-yellow-500 to-yellow-700";
      case "3-moderate":
        return "bg-gradient-to-r from-green-500 to-green-700";
      default:
        return "bg-gradient-to-r from-blue-500 to-blue-700";
    }
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

  return (
    <div className="container py-6 mx-auto max-w-4xl min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 relative overflow-hidden">
      {/* Animated Snowflakes Background */}
      <div className="absolute top-4 right-10 opacity-5">
        <Snowflake className="h-16 w-16 text-blue-400 animate-pulse" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-5">
        <Snowflake className="h-12 w-12 text-blue-300 animate-pulse delay-300" />
      </div>
      
      <div className="text-sm scale-90 origin-top-left">
        <BackButton />
      </div>

      <Card className="mb-6 shadow-lg border border-green-200 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <TreePine className="h-24 w-24 text-green-400" />
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-green-600 to-red-600 rounded-lg">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-green-900">
                🎄 Ticket #{details?.ticketNumber}
              </h1>
              <Badge className={`${getStatusBadgeClass(details?.status)} text-white`}>
                {details?.status || "Unknown"}
              </Badge>
            </div>
            <div className="mt-2 md:mt-0">
              <Badge
                className={`${getPriorityBadgeClass(details?.priority)} text-white`}
              >
                ⭐ Priority: {details?.priority || "Unset"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  🗓️ Created: {formattedDate(details?.createdAt || "")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-red-500" />
                <span className="text-sm text-green-800">
                  👤 Submitted by: {details?.name || "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  🏷️ Category: {details?.category || "Uncategorized"}
                </span>
              </div>
              {details?.leaveDays && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-green-800">
                    📅 Leave Days: {details?.leaveDays}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  🎅 Assigned to: {details?.assignedTo || "Santa's Helper"}
                </span>
              </div>
              {details?.file && details.file.trim() !== "" && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-500" />
                  <button
                    onClick={() => handleFileDownload(details.file as string)}
                    className="text-sm text-green-600 hover:text-green-800 hover:underline flex items-center gap-1"
                    title={details.file}
                  >
                    <span>🎁 Attachment</span>
                    <Download className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Leave Balance Section */}
          {showLeaveBalance && isPaidLeave() && (
            <>
              <div className="bg-gradient-to-r from-green-50 to-red-50 p-4 rounded-lg border border-green-200 my-4 relative overflow-hidden">
                <div className="absolute -right-2 -top-2 opacity-10">
                  <Star className="h-16 w-16 text-yellow-400" />
                </div>
                <h3 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  🎅 Leave Balance Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-green-100">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Current Balance:</span>{" "}
                      {leaveCredit ? (
                        <span className="font-bold text-green-800">
                          {leaveCredit.currentBalance} days
                        </span>
                      ) : (
                        "Loading..."
                      )}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-red-100">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Balance After Approval:</span>{" "}
                      {balanceAfterApproval !== null ? (
                        <span
                          className={`font-bold ${
                            balanceAfterApproval < 5 ? "text-red-600" : "text-green-800"
                          }`}
                        >
                          {balanceAfterApproval} days
                        </span>
                      ) : (
                        "Calculating..."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator className="my-4 bg-gradient-to-r from-green-200 to-red-200" />

          <div>
            <h2 className="font-medium text-sm text-green-800 flex items-center mb-2">
              <Bell className="h-4 w-4 mr-2" />
              Description
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-red-50 p-4 rounded-lg border border-green-200">
              <pre className="whitespace-pre-wrap font-sans text-sm text-green-900">
                {details?.description || "No description provided."}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-4 text-green-800 flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          🎄 Notes & Responses
        </h2>

        {details?.status !== "closed" && (
          <Card className="mb-6 shadow-sm border border-green-200 bg-white">
            <CardContent className="pt-6">
              <form onSubmit={submitNote}>
                <Textarea
                  placeholder="🎅 Add your holiday message here..."
                  value={message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="min-h-24 resize-none border-green-300 focus:border-green-500 bg-green-50"
                />
              </form>
            </CardContent>
            <CardFooter className="flex justify-end pt-0">
              <Button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                onClick={submitNote}
                className="flex items-center gap-2 text-sm bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Sending to Santa..." : "Send Response"}
              </Button>
            </CardFooter>
          </Card>
        )}

        <div className="space-y-4">
          {notes?.length === 0 ? (
            <div className="text-center text-green-600 py-8 text-sm bg-gradient-to-r from-green-50 to-red-50 rounded-lg border border-green-200">
              <CandyCane className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <p>🎁 No notes or responses yet. Be the first to share!</p>
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
                  : `https://ui-avatars.com/api/?background=16A34A&color=fff&name=${
                      note.name || "?"
                    }`;

                return (
                  <Card
                    key={note._id}
                    className={`shadow-sm border ${
                      note.isStaff 
                        ? "border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white" 
                        : "border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 rounded-full overflow-hidden border-2 border-green-200">
                          <AvatarImage
                            src={avatarUrl}
                            alt={note.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-r from-green-500 to-red-500 text-white">
                            {note.name?.substring(0, 2).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-green-800">
                                {note.name || "Unknown User"}
                              </p>
                              {note.isStaff && (
                                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs">
                                  🎅 Santa's Helper
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-green-600">
                              ⏰ {formattedDate(note.createdAt)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-green-100">
                            <p className="text-sm text-green-700 whitespace-pre-wrap">
                              {note.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </div>
      </div>

      {/* Christmas Footer */}
      <div className="mt-8 text-center bg-gradient-to-r from-green-50 to-red-50 p-4 rounded-xl border border-green-200">
        <div className="text-green-600 text-sm flex items-center justify-center gap-2">
          <span>🎄</span>
          <span>May your holiday wishes come true!</span>
          <span>🎅</span>
        </div>
        <div className="text-xs text-green-500 mt-1 flex items-center justify-center">
          <Snowflake className="h-3 w-3 mr-1" />
          From Santa's Workshop with Cheer
        </div>
      </div>
    </div>
  );
};

export default UserViewIndividualTicket;