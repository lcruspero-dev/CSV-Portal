import { TicketAPi } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogContent,
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
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paginateData = (data: any[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const totalAckPages = Math.ceil(
    (acknowledgedUsers?.length || 0) / ITEMS_PER_PAGE
  );
  const totalUnackPages = Math.ceil(
    unacknowledgedUsers.length / ITEMS_PER_PAGE
  );

  const paginatedAckUsers = acknowledgedUsers
    ? paginateData(acknowledgedUsers, currentAckPage)
    : [];
  const paginatedUnackUsers = paginateData(
    unacknowledgedUsers,
    currentUnackPage
  );

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
          Pending ({unacknowledgedUsers.length})
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
          {acknowledgedUsers?.length > ITEMS_PER_PAGE &&
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
          {unacknowledgedUsers.length > ITEMS_PER_PAGE &&
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

interface ViewIndividualDocumentProps {
  documentType?: 'memo' | 'policy';
}

const ViewIndividualDocument = ({ documentType = 'policy' }: ViewIndividualDocumentProps) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [unacknowledgedUsers, setUnacknowledgedUsers] = useState<UnacknowledgedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const userString = localStorage.getItem("user");
  const user: User | null = userString ? JSON.parse(userString) : null;
  const { toast } = useToast();
  const [isChecked, setIsChecked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempChecked, setTempChecked] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const isPolicyRoute = documentType === 'policy';

  const handleCheckboxChange = () => {
    setTempChecked(true);
    setIsDialogOpen(true);
  };

  const handleCancelAcknowledgment = () => {
    setTempChecked(false);
    setIsDialogOpen(false);
  };

  const getIndividualDocument = async (id: string) => {
    try {
      let response;
      if (isPolicyRoute) {
        response = await TicketAPi.getIndividualPolicy(id);
      } else {
        response = await TicketAPi.getIndividualMemo(id);
      }
      
      if (response.data) {
        setDocument(response.data);
        setError(null);
      } else {
        throw new Error('No data received');
      }
    } catch (error: any) {
      console.error('Error fetching document:', error);
      const errorMessage = error.response?.data?.message || `Failed to load ${documentType}`;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

const getUnacknowledgedUsers = async (id: string) => {
  try {
    let response;
    if (isPolicyRoute) {
      response = await TicketAPi.getUserUnacknowledgedPol(id);
    } else {
      response = await TicketAPi.getUserUnacknowledged(id);
    }
    
    console.log('Unacknowledged API Response:', response);
    
    if (response?.data) {
      // For policies, the response should have unacknowledgedUsers array
      if (response.data.unacknowledgedUsers && Array.isArray(response.data.unacknowledgedUsers)) {
        setUnacknowledgedUsers(response.data.unacknowledgedUsers);
      }
      // For memos or other response structures
      else if (Array.isArray(response.data)) {
        setUnacknowledgedUsers(response.data);
      }
      else if (response.data.data && Array.isArray(response.data.data)) {
        setUnacknowledgedUsers(response.data.data);
      }
      else {
        console.warn('Unexpected response structure:', response.data);
        setUnacknowledgedUsers([]);
      }
    } else {
      setUnacknowledgedUsers([]);
    }
  } catch (error: any) {
    console.error('Error fetching unacknowledged users:', error);
    setUnacknowledgedUsers([]);
  }
};

  const handleAcknowledged = async (id: string) => {
    try {
      let response;
      if (isPolicyRoute) {
        response = await TicketAPi.acknowledgementPolicy(id);
      } else {
        response = await TicketAPi.acknowledgement(id);
      }
      
      if (response.data) {
        await getIndividualDocument(id);
        await getUnacknowledgedUsers(id);
        toast({
          title: "Success",
          description: `Your acknowledgement of this ${documentType} has been recorded`,
          variant: "default",
        });
        setIsDialogOpen(false);
        setIsChecked(true);
      } else {
        throw new Error('No response data');
      }
    } catch (error: any) {
      console.error('Acknowledgment error:', error);
      setTempChecked(false);
      const errorMessage = error.response?.data?.message || `Failed to acknowledge ${documentType}`;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setError(null);
      const fetchData = async () => {
        try {
          await getIndividualDocument(id);
          // Don't wait for unacknowledged users - handle it separately
          getUnacknowledgedUsers(id).finally(() => {
            setIsLoading(false);
          });
        } catch (error) {
          console.error('Error in fetchData:', error);
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [id, documentType]);

  // Reset checked status when document loads
  useEffect(() => {
    if (document?.acknowledgedby?.some((ack) => ack.userId === user?._id)) {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }, [document, user?._id]);

  const handleFilePreview = () => {
    setShowPdfPreview(true);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-start mb-4">
          <BackButton />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Document ID: {id}</p>
          <Button 
            onClick={() => window.history.back()} 
            className="mt-4"
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-start mb-4">
          <BackButton />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Document Not Found</h2>
          <p className="text-gray-600">The requested {documentType} could not be found.</p>
          <p className="text-sm text-gray-500 mt-2">Document ID: {id}</p>
        </div>
      </div>
    );
  }

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
                  Date Posted: {formatDate(document.createdAt)}
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
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          <span>{document.file}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FIXED: Added optional chaining for acknowledgedby */}
            {!document.acknowledgedby?.some((ack) => ack.userId === user?._id) && (
              <div className="flex items-center">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="w-5 h-5 appearance-none border border-gray-400 rounded-md checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                      onChange={handleCheckboxChange}
                      checked={isChecked || tempChecked}
                    />
                    {(isChecked || tempChecked) && (
                      <Check className="w-4 h-4 absolute left-0.5 top-0.5 text-white pointer-events-none" />
                    )}
                  </div>
                  <span
                    className="text-sm font-medium text-gray-700 pb-1"
                    onClick={handleCheckboxChange}
                  >
                    Acknowledge Receipt
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="pt-1 border-t border-gray-100">
            <hr className="w-full border-t border-gray-300 my-4"></hr>
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <pre className="whitespace-pre-wrap font-sans p-3 rounded-sm overflow-x-auto text-sm">
                {document.description}
              </pre>
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
        <DialogContent className="max-w-[65vw] h-[90vh] bg-white flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              <span className="text-gray-800">{document.file}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={`${import.meta.env.VITE_UPLOADFILES_URL}/files/${
                document.file
              }#toolbar=0`}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="PDF Preview"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Acknowledgment Dialog - FIXED DOM NESTING */}
      {/* Acknowledgment Dialog - FIXED with proper DialogDescription */}
<Dialog open={isDialogOpen} onOpenChange={handleCancelAcknowledgment}>
  <DialogContent className="bg-white rounded-lg max-w-md">
    <DialogHeader>
      <DialogTitle className="text-xl text-gray-800">
        Confirm Acknowledgement
      </DialogTitle>
      <DialogDescription className="mt-4 text-gray-600">
        By acknowledging this {documentType}, you confirm that you have received
        and understood its contents.
      </DialogDescription>
    </DialogHeader>
    
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
      <p className="font-medium text-blue-800">Declaration:</p>
      <p className="mt-2 text-blue-700">
        "I acknowledge receipt of this {documentType} and understand the
        information provided. I will comply with any instructions or
        requirements outlined herein."
      </p>
    </div>
    
    <DialogFooter className="mt-6">
      <div className="flex gap-1">
        <Button
          variant="outline"
          onClick={handleCancelAcknowledgment}
          className="flex-1 text-sm scale-90"
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleAcknowledged(id as string)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm scale-90"
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