import { NteAPI } from "@/API/endpoint";
import csvlogo from "@/assets/csvlogo.png";
import SignatureModal from "@/components/kit/SignatureModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Page2 from "@/components/ui/page2";
import Page3 from "@/components/ui/page3";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Minus, Plus, Printer } from "lucide-react";
import { useEffect, useState } from "react";

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
interface NoticeOfDecision {
  name: string;
  position: string;
  nteIssuanceDate: string;
  writtenExplanationReceiptDate: string;
  offenseType: string;
  offenseDescription: string;
  findings: string;
  decision: string;
  employeeSignatureDate?: string; // Make optional with ?
  authorizedSignatureDate?: string; // Make optional with ?
}
interface NteItem {
  noticeOfDecision: NoticeOfDecision | undefined;
  employeeFeedback:
    | {
        name: string;
        position: string;
        responseDate: string;
        responseDetail: string;
        employeeSignatureDate?: string;
      }
    | undefined;
  nte: NteDetails;
  _id: string;
  status: "PER" | "PNOD" | "PNODA" | "FTHR"; // Updated status types
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface PdfNteViewerProps {
  nteData: NteItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPage: number;
}

const PdfNteViewer: React.FC<PdfNteViewerProps> = ({
  nteData,
  open,
  onOpenChange,
  initialPage,
}) => {
  const [zoom, setZoom] = useState(70);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCurrentPage(initialPage);
    }
  }, [open, initialPage]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const formatDate = (dateString: string) => {
    // Split YYYY-MM-DD into parts
    const [year, month, day] = dateString.split("-").map(Number);

    // Custom month names mapping
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

    // Format as "Month DD, YYYY"
    return `${months[month - 1]} ${day}, ${year}`;
  };

  const handlePageChange = (direction: "next" | "prev") => {
    if (direction === "next" && currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSignatureSave = async (
    _signatureData: string,
    filename: string
  ) => {
    const updatedNte = {
      ...nteData,
      nte: {
        ...nteData.nte,
        employeeSignatureDate: filename, // Use filename directly
      },
    };

    try {
      await NteAPI.updateNte(nteData._id, updatedNte);
      setSignature(_signatureData); // Update local state after successful API call
      setIsSignatureModalOpen(false);
    } catch (error) {
      console.error("Error updating signature:", error);
    }
  };
  console.log("signature", nteData.nte.employeeSignatureDate);

  const getTotalPages = () => {
    switch (nteData.status) {
      case "PER":
        return 1;
      case "PNOD":
        return 2;
      case "PNODA":
      case "FTHR":
        return 3;
      default:
        return 1;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="bg-white shadow-lg p-8 mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-4 border-b-2 pb-2">
              <img src={csvlogo} alt="CSV Now Logo" className="h-24" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#534292]">
                  NOTICE TO EXPLAIN
                </h2>
                <p className="text-gray-600 text-xs">HR DEPARTMENT</p>
                <p className="text-gray-600 text-xs">CSV-HR-INT-009</p>
                <p className="text-gray-600 text-xs">
                  7th Floor Cebu IT Tower 1, Bohol Avenue Cebu Business Park,
                  Brgy. Luz, Cebu City
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="mt-3 text-sm space-y-4">
              <p>
                This Notice to Explain is issued to inform an employee of an
                alleged misconduct or performance issue, providing them an
                opportunity to explain their side and present any relevant
                evidence before any disciplinary action is taken. This ensures
                fairness and transparency in the evaluation process.
              </p>
            </div>

            {/* Employee Information */}
            <div className="mt-6 space-y-4">
              <h3 className="font-bold text-[#534292]">EMPLOYEE INFORMATION</h3>
              <div className="grid grid-cols-1 text-sm">
                <div className="border grid grid-cols-[150px,1fr]">
                  <div className="p-1 bg-[#DFDAF5] font-semibold">Name:</div>
                  <div className="p-1 px-5 text-sm">{nteData?.nte.name}</div>
                </div>
                <div className="border grid grid-cols-[150px,1fr]">
                  <div className="p-1 bg-[#DFDAF5] font-semibold">
                    Position:
                  </div>
                  <div className="p-1 px-5 text-sm">
                    {nteData?.nte.position}
                  </div>
                </div>
                <div className="border grid grid-cols-[150px,1fr]">
                  <div className="p-1 bg-[#DFDAF5] font-semibold">
                    Date Issued:
                  </div>
                  <div className="p-1 px-5 text-sm">
                    {nteData?.nte.dateIssued
                      ? formatDate(nteData.nte.dateIssued)
                      : ""}
                  </div>
                </div>
                <div className="border grid grid-cols-[150px,1fr]">
                  <div className="p-1 bg-[#DFDAF5] font-semibold">
                    Issued by:
                  </div>
                  <div className="p-1 px-5 text-sm">
                    {nteData?.nte.issuedBy}
                  </div>
                </div>
              </div>
            </div>

            {/* Offense Types */}
            <div className="mt-6 grid grid-cols-3 gap-8 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 border flex items-center justify-center ${
                      nteData?.nte.offenseType.toLowerCase() === "tardiness"
                        ? "border-[#534292]"
                        : "border-gray-400"
                    }`}
                  >
                    {nteData?.nte.offenseType.toLowerCase() === "tardiness" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.6667 2L4.00004 10L1.33337 7.33333"
                          stroke="#534292"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span>Tardy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 border flex items-center justify-center ${
                      nteData?.nte.offenseType.toLowerCase() ===
                      "unauthorized/unexcused absence"
                        ? "border-[#534292]"
                        : "border-gray-400"
                    }`}
                  >
                    {nteData?.nte.offenseType.toLowerCase() ===
                      "unauthorized/unexcused absence" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.6667 2L4.00004 10L1.33337 7.33333"
                          stroke="#534292"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span>Unexcused Absence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 border flex items-center justify-center ${
                      nteData?.nte.offenseType.toLowerCase() ===
                      "no call no show (ncns)"
                        ? "border-[#534292]"
                        : "border-gray-400"
                    }`}
                  >
                    {nteData?.nte.offenseType.toLowerCase() ===
                      "no call no show (ncns)" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.6667 2L4.00004 10L1.33337 7.33333"
                          stroke="#534292"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span>No Call No Show</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 border flex items-center justify-center ${
                      nteData?.nte.offenseType.toLowerCase() ===
                      "behavior at work"
                        ? "border-[#534292]"
                        : "border-gray-400"
                    }`}
                  >
                    {nteData?.nte.offenseType.toLowerCase() ===
                      "behavior at work" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.6667 2L4.00004 10L1.33337 7.33333"
                          stroke="#534292"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span>Behavior at Work</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 border flex items-center justify-center ${
                      nteData?.nte.offenseType.toLowerCase() ===
                      "destruction of property"
                        ? "border-[#534292]"
                        : "border-gray-400"
                    }`}
                  >
                    {nteData?.nte.offenseType.toLowerCase() ===
                      "destruction of property" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.6667 2L4.00004 10L1.33337 7.33333"
                          stroke="#534292"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span>Destruction of Property</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 border flex items-center justify-center ${
                      nteData?.nte.offenseType.toLowerCase() ===
                      "insubordination"
                        ? "border-[#534292]"
                        : "border-gray-400"
                    }`}
                  >
                    {nteData?.nte.offenseType.toLowerCase() ===
                      "insubordination" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.6667 2L4.00004 10L1.33337 7.33333"
                          stroke="#534292"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span>Insubordination</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 border flex items-center justify-center ${
                      nteData?.nte.offenseType.toLowerCase() ===
                      "record keeping"
                        ? "border-[#534292]"
                        : "border-gray-400"
                    }`}
                  >
                    {nteData?.nte.offenseType.toLowerCase() ===
                      "record keeping" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.6667 2L4.00004 10L1.33337 7.33333"
                          stroke="#534292"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span>Record Keeping</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 border flex items-center justify-center ${
                      nteData?.nte.offenseType.toLowerCase() ===
                      "safety and security"
                        ? "border-[#534292]"
                        : "border-gray-400"
                    }`}
                  >
                    {nteData?.nte.offenseType.toLowerCase() ===
                      "safety and security" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.6667 2L4.00004 10L1.33337 7.33333"
                          stroke="#534292"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span>Safety and Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 border flex items-center justify-center ${
                      ![
                        "tardiness",
                        "unauthorized/unexcused absence",
                        "no call no show (ncns)",
                        "behavior at work",
                        "destruction of property",
                        "insubordination",
                        "record keeping",
                        "safety and security",
                      ].some((type) =>
                        nteData?.nte.offenseType.toLowerCase().includes(type)
                      )
                        ? "border-[#534292]"
                        : "border-gray-400"
                    }`}
                  >
                    {![
                      "tardiness",
                      "unauthorized/unexcused absence",
                      "no call no show (ncns)",
                      "behavior at work",
                      "destruction of property",
                      "insubordination",
                      "record keeping",
                      "safety and security",
                    ].some((type) =>
                      nteData?.nte.offenseType.toLowerCase().includes(type)
                    ) && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.6667 2L4.00004 10L1.33337 7.33333"
                          stroke="#534292"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span>Others:____________</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Description */}
            <div className="mt-6 space-y-2">
              <p className="text-sm pb-2">
                Description of Offense/s (Cite Specific Offense/s or
                underperformance under the Code of Conduct and Discipline,
                including dates, and other necessary details) and amount of
                loss/damage, if any:
              </p>
              <div className="p-4 border min-h-[120px] rounded bg-gray-50">
                <p className="whitespace-pre-wrap text-sm">
                  {/* Display offenseType if it is "other" */}
                  {![
                    "tardiness",
                    "unauthorized/unexcused absence",
                    "no call no show (ncns)",
                    "behavior at work",
                    "destruction of property",
                    "insubordination",
                    "record keeping",
                    "safety and security",
                  ].some((type) =>
                    nteData?.nte.offenseType.toLowerCase().includes(type)
                  ) && (
                    <p className="font-medium text-sm italic pb-2">
                      {nteData?.nte.offenseType}
                    </p>
                  )}
                  {nteData?.nte.offenseDescription}
                </p>
              </div>
            </div>

            {/* Notice */}
            <div className="mt-6 space-y-4 text-sm">
              <p>
                In view of the above offense/s, please explain in writing not
                more than five (5) days from receipt of this notice as to:
              </p>
              <div className="space-y-2 pl-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border" />
                  <span>
                    Why you should not be disciplined for committing the
                    above-mentioned violation/s.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border" />
                  <span>
                    Why you should not be held liable to pay for the amount of
                    loss caused by or damage incurred due to the above
                    violation/s.
                  </span>
                </div>
              </div>
              <p className="text-sm">
                Failure to submit said written explanation shall be considered a
                waiver of your right to present your side. Management will then
                evaluate your case based on the evidence at hand and proceed to
                render its decision.
              </p>
            </div>

            {/* Acknowledgement */}
            <div className="mt-8 space-y-4 text-sm">
              <h3 className="font-bold text-[#534292]">ACKNOWLEDGEMENT:</h3>
              <p className="italic">
                I have received the above Notice to Explain, and read and
                understood the contents thereof.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-2 text-center">
                <div className="space-y-1">
                  <div className="min-h-[100px] flex flex-col items-center justify-end">
                    {signature ? (
                      // Display the newly saved signature in state (persists until refresh)
                      <>
                        <img
                          src={signature}
                          alt="Signature"
                          className="h-16 mb-2"
                        />
                      </>
                    ) : nteData.nte.employeeSignatureDate ? (
                      // If no local signature but there is a saved one from API, show it
                      <div className="space-y-2">
                        <img
                          src={`${
                            import.meta.env.VITE_UPLOADFILES_URL
                          }/form-files/${nteData.nte.employeeSignatureDate}`}
                          alt="Employee Signature"
                          className="mx-auto h-16 object-contain mb-2"
                        />
                      </div>
                    ) : (
                      // Show the "Sign here" button if no signature is available
                      <Button
                        onClick={() => setIsSignatureModalOpen(true)}
                        className="mb-4"
                      >
                        Sign here
                      </Button>
                    )}
                    <div className="border-t border-black w-full mt-2" />
                  </div>

                  <p className="text-sm">Employee Signature & Date</p>
                </div>
                <div className="space-y-1">
                  <div className="min-h-[100px] flex flex-col items-center justify-end">
                    <div className="border-t border-black w-full mt-2" />
                  </div>
                  <p className="text-sm">Authorized Signatory & Date</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 space-y-4 text-xs text-gray-500">
              <p>
                CONFIDENTIALITY NOTICE: This document contains confidential
                information intended only for the recipient. Any unauthorized
                disclosure, copying, or distribution is strictly prohibited.
              </p>
              <div className="flex justify-between border-t pt-2">
                <p>Version Number: 1.0</p>
                <p>Effective Date: September 30, 2024</p>
                <p>Classification: Confidential</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return <Page2 employeeFeedback={nteData.employeeFeedback} />;
      case 3:
        return (
          <Page3 noticeOfDecision={nteData.noticeOfDecision} id={nteData._id} />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-6xl p-0 gap-0">
          {/* PDF Viewer Toolbar */}
          <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  className="p-1 hover:bg-gray-200 rounded"
                  onClick={() => handlePageChange("prev")}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm">
                  Page {currentPage} of {getTotalPages()}
                </span>
                <button
                  className="p-1 hover:bg-gray-200 rounded"
                  onClick={() => handlePageChange("next")}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-1 hover:bg-gray-200 rounded"
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="text-sm w-16 text-center">{zoom}%</span>
                <button
                  className="p-1 hover:bg-gray-200 rounded"
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-200 rounded mr-10">
                <Printer className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* PDF Content Area */}
          <div className="bg-gray-800 p-8">
            <ScrollArea className="h-[80vh]">
              <div className="mx-auto" style={{ maxWidth: `${zoom}%` }}>
                {renderPage()}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSignatureSave}
      />
    </>
  );
};

export default PdfNteViewer;
