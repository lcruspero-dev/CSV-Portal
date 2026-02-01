import { TicketAPi } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Loading from "@/components/ui/loading";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Check, FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  isAdmin: boolean;
}

interface AcknowledgedBy {
  userId: string;
  name: string;
  acknowledgedAt: string;
}

interface UnacknowledgedUser {
  _id: string;
  name: string;
}

interface Document {
  subject: string;
  createdAt: string;
  file: string;
  description: string;
  acknowledgedby: AcknowledgedBy[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-PH", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${formattedDate} ${formattedTime}`;
};

const ITEMS_PER_PAGE = 10;

const DocumentTabs = ({
  acknowledgedUsers,
  unacknowledgedUsers,
}: {
  acknowledgedUsers: AcknowledgedBy[];
  unacknowledgedUsers: UnacknowledgedUser[];
}) => {
  const [currentAckPage, setCurrentAckPage] = useState(1);
  const [currentUnackPage, setCurrentUnackPage] = useState(1);

  const paginateData = <T,>(data: T[], page: number): T[] => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const totalAckPages = Math.ceil((acknowledgedUsers?.length || 0) / ITEMS_PER_PAGE);
  const totalUnackPages = Math.ceil((unacknowledgedUsers.length || 0) / ITEMS_PER_PAGE);

  const paginatedAckUsers = acknowledgedUsers 
    ? paginateData(acknowledgedUsers, currentAckPage)
    : [];
  const paginatedUnackUsers = unacknowledgedUsers
    ? paginateData(unacknowledgedUsers, currentUnackPage)
    : [];

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    setPage: (page: number) => void
  ) => (
    <Pagination className="my-4 text-xs">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            className={
              currentPage <= 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer hover:bg-gray-100"
            }
          />
        </PaginationItem>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => setPage(page)}
              isActive={currentPage === page}
              className="cursor-pointer hover:bg-gray-100"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            className={
              currentPage >= totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer hover:bg-gray-100"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  return (
    <Tabs defaultValue="confirmed" className="w-full">
      <TabsList className="grid w-full md:w-1/3 grid-cols-2 bg-gray-100">
        <TabsTrigger
          value="confirmed"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Confirmed ({acknowledgedUsers?.length || 0})
        </TabsTrigger>
        <TabsTrigger
          value="pending"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Pending ({unacknowledgedUsers?.length || 0})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="confirmed" className="mt-4">
        <div className="border rounded-lg overflow-hidden">
          <Table className="text-sm">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-medium text-gray-600">
                  Name
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  Date of Acknowledgement
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAckUsers.length > 0 ? (
                paginatedAckUsers.map((user, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-sm">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatDate(user.acknowledgedAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-gray-500 py-6"
                  >
                    No confirmations yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {acknowledgedUsers && acknowledgedUsers.length > ITEMS_PER_PAGE &&
            renderPagination(currentAckPage, totalAckPages, setCurrentAckPage)}
        </div>
      </TabsContent>

      <TabsContent value="pending" className="mt-4">
        <div className="border rounded-lg overflow-hidden">
          <Table className="text-sm">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-medium text-gray-600 text-sm">
                  Name
                </TableHead>
                <TableHead className="font-medium text-gray-600 text-sm">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUnackUsers.length > 0 ? (
                paginatedUnackUsers.map((user, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-gray-500 py-6"
                  >
                    All users have acknowledged this document
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {unacknowledgedUsers && unacknowledgedUsers.length > ITEMS_PER_PAGE &&
            renderPagination(
              currentUnackPage,
              totalUnackPages,
              setCurrentUnackPage
            )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

const ViewIndividualDocument = () => {
  const [document, setDocument] = useState<Document | null>(null);
  const [unacknowledgedUsers, setUnacknowledgedUsers] = useState<UnacknowledgedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const userString = localStorage.getItem("user");
  const user: User | null = userString ? JSON.parse(userString) : null;
  const { toast } = useToast();
  const [isChecked, setIsChecked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempChecked, setTempChecked] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Determine if this is a memo or policy based on the route
  const isPolicyRoute = location.pathname.includes('/policies/');
  const documentType = isPolicyRoute ? 'policy' : 'memo';

  const handleCheckboxChange = () => {
    if (!id || !user) {
      toast({
        title: "Error",
        description: "You must be logged in to acknowledge documents",
        variant: "destructive",
      });
      return;
    }
    setTempChecked(true);
    setIsDialogOpen(true);
  };

  const handleCancelAcknowledgment = () => {
    setTempChecked(false);
    setIsDialogOpen(false);
  };

  const getIndividualDocument = useCallback(async (docId: string) => {
    if (!docId) return;
    
    try {
      let response;
      if (isPolicyRoute) {
        response = await TicketAPi.getIndividualPolicy(docId);
      } else {
        response = await TicketAPi.getIndividualMemo(docId);
      }
      setDocument(response.data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: `Failed to load ${documentType}`,
        variant: "destructive",
      });
    }
  }, [isPolicyRoute, documentType, toast]);

  const getUnacknowledgedUsers = useCallback(async (docId: string) => {
    if (!docId) return;
    
    try {
      let response;
      if (isPolicyRoute) {
        response = await TicketAPi.getUserUnacknowledgedPol(docId);
      } else {
        response = await TicketAPi.getUserUnacknowledged(docId);
      }
      setUnacknowledgedUsers(response.data?.unacknowledgedUsers || response.data || []);
    } catch (error) {
      console.error(error);
      setUnacknowledgedUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [isPolicyRoute]);

  const handleAcknowledged = async (docId: string) => {
    if (!docId || !user) {
      toast({
        title: "Error",
        description: "Unable to acknowledge document",
        variant: "destructive",
      });
      return;
    }

    try {
      let response;
      if (isPolicyRoute) {
        response = await TicketAPi.acknowledgementPolicy(docId);
      } else {
        response = await TicketAPi.acknowledgement(docId);
      }
      
      if (response.data) {
        // Refresh data
        await getIndividualDocument(docId);
        await getUnacknowledgedUsers(docId);
        
        toast({
          title: "Success",
          description: `Your acknowledgement of this ${documentType} has been recorded`,
          variant: "default",
        });
        setIsDialogOpen(false);
        setIsChecked(true);
      }
    } catch (error) {
      console.error(error);
      setTempChecked(false);
      toast({
        title: "Error",
        description: `Failed to acknowledge ${documentType}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getIndividualDocument(id);
      getUnacknowledgedUsers(id);
    }
  }, [id, getIndividualDocument, getUnacknowledgedUsers]);

  useEffect(() => {
    // Check if user has already acknowledged this document
    if (document?.acknowledgedby && user) {
      const hasAcknowledged = document.acknowledgedby.some(
        (ack) => ack.userId === user._id
      );
      setIsChecked(hasAcknowledged);
    }
  }, [document, user]);

  const handleFilePreview = () => {
    if (document?.file) {
      setShowPdfPreview(true);
    } else {
      toast({
        title: "No Attachment",
        description: "This document has no file attachment",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <BackButton />
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Document Not Found
          </h2>
          <p className="text-gray-500">
            The {documentType} you are looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const isAcknowledged = document.acknowledgedby?.some(
    (ack) => ack.userId === user?._id
  );

  return (
    <div className="container mx-auto px-4 py-1 max-w-6xl">
      <div className="space-y-2">
        <div className="flex justify-start">
          <div className="flex items-center mt-1 scale-90 origin-left">
            <BackButton />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="space-y-3 flex-1">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {document.subject}
                </h2>
                <p className="text-sm text-gray-900 mt-1">
                  Date Posted: {formatDate(document.createdAt || "")}
                </p>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {documentType}
                </p>
              </div>

              {document.file && (
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Attachment
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={handleFilePreview}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 hover:underline"
                        >
                          <FileText size={16} />
                          <span className="truncate max-w-xs">{document.file}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!isAcknowledged && user && (
              <div className="flex items-center">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="w-5 h-5 appearance-none border border-gray-400 rounded-md checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors duration-200 cursor-pointer"
                      onChange={handleCheckboxChange}
                      checked={isChecked || tempChecked}
                      disabled={isChecked}
                    />
                    {(isChecked || tempChecked) && (
                      <Check className="w-4 h-4 absolute left-0.5 top-0.5 text-white pointer-events-none" />
                    )}
                  </div>
                  <span
                    className="text-sm font-medium text-gray-700 pb-1 cursor-pointer"
                    onClick={handleCheckboxChange}
                  >
                    Acknowledge Receipt
                  </span>
                </label>
              </div>
            )}

            {isAcknowledged && (
              <div className="flex items-center">
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  <Check size={16} />
                  <span className="text-sm font-medium">Acknowledged</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-1 border-t border-gray-100 mt-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
              <div className="whitespace-pre-wrap font-sans p-3 overflow-x-auto text-sm text-gray-800 bg-white rounded border">
                {document.description}
              </div>
            </div>
          </div>
        </div>

        {user?.isAdmin && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Acknowledgement Status
            </h3>
            <DocumentTabs
              acknowledgedUsers={document.acknowledgedby || []}
              unacknowledgedUsers={unacknowledgedUsers}
            />
          </div>
        )}
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-[90vw] h-[90vh] bg-white flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50">
            <DialogTitle className="flex items-center gap-2 text-gray-800">
              <FileText className="text-blue-600" size={20} />
              <span className="truncate">{document.file}</span>
            </DialogTitle>
            <DialogDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  window.open(
                    `${import.meta.env.VITE_UPLOADFILES_URL}/files/${document.file}`,
                    '_blank'
                  );
                }}
              >
                Open in New Tab
              </Button>
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={`${import.meta.env.VITE_UPLOADFILES_URL}/files/${document.file}#toolbar=0`}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="PDF Preview"
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Acknowledgment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCancelAcknowledgment}>
        <DialogContent className="bg-white rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-800">
              Confirm Acknowledgement
            </DialogTitle>
            <DialogDescription className="mt-4 text-gray-600">
              <div className="space-y-4">
                <p>
                  By acknowledging this {documentType}, you confirm that you have received
                  and understood its contents.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="font-medium text-blue-800">Declaration:</p>
                  <p className="mt-2 text-blue-700 text-sm">
                    "I acknowledge receipt of this {documentType} and understand the
                    information provided. I will comply with any instructions or
                    requirements outlined herein."
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={handleCancelAcknowledgment}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => id && handleAcknowledged(id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Confirm
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewIndividualDocument;