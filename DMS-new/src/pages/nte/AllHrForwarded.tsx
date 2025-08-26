/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NteAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Page2 from "@/components/ui/page2";
import Page3 from "@/components/ui/page3";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PdfNteViewer from "@/components/ui/viewNteDialog";
import { AxiosResponse } from "axios";
import { Download, FileText, Search } from "lucide-react";
import React, { useEffect, useState } from "react";

import BackButton from "@/components/ui/backButton";
import Page1 from "@/components/ui/page1";
// @ts-expect-error
import html2pdf from "html2pdf.js";
import ReactDOM from "react-dom";

interface NteDetails {
  employeeId: string;
  name: string;
  position: string;
  dateIssued: string;
  issuedBy: string;
  offenseType: string;
  offenseDescription: string;
  file: string | null;
  employeeSignatureDate: string | null;
  authorizedSignatureDate: string | null;
}

interface employeeFeedbackDetails {
  name: string;
  position: string;
  responseDate: string;
  responseDetail: string;
  employeeSignatureDate: string | null;
  authorizedSignatureDate: string | null;
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

interface NteItem {
  nte: NteDetails;
  employeeFeedback: employeeFeedbackDetails;
  noticeOfDecision: NoticeOfDecisionDetails;
  _id: string;
  status: "FTHR";
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface FthrTableProps {
  onView?: (id: string) => void;
}

const FthrTable: React.FC<FthrTableProps> = () => {
  const [data, setData] = useState<NteItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedNte, setSelectedNte] = useState<NteItem | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: AxiosResponse<NteItem[]> = await NteAPI.getNteByStatus(
        "FTHR"
      );

      if (response?.data) {
        setData(response.data);
      } else {
        setData([]);
        setError("No data received from server");
      }
    } catch (error) {
      setData([]);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching data"
      );
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id: string) => {
    try {
      const response = await NteAPI.getNte(id);
      setSelectedNte(response.data);
      setShowViewDialog(true);
    } catch (error) {
      console.error("Error fetching NTE details:", error);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await NteAPI.getNte(id);
      const nteData = response.data;

      if (nteData) {
        // Create main container
        const container = document.createElement("div");
        container.style.width = "8.5in";

        // Create and style wrapper for Page1
        const page1Wrapper = document.createElement("div");
        page1Wrapper.className = "pdf-page";
        const tempDiv1 = document.createElement("div");
        ReactDOM.render(<Page1 nteData={nteData} />, tempDiv1);
        page1Wrapper.appendChild(tempDiv1);
        container.appendChild(page1Wrapper);

        // Add page break div after Page1
        const break1 = document.createElement("div");
        break1.className = "html2pdf__page-break";
        container.appendChild(break1);

        // Create and style wrapper for Page2 if it exists
        if (nteData.employeeFeedback) {
          const page2Wrapper = document.createElement("div");
          page2Wrapper.className = "pdf-page";
          const tempDiv2 = document.createElement("div");
          ReactDOM.render(
            <Page2 employeeFeedback={nteData.employeeFeedback} />,
            tempDiv2
          );
          page2Wrapper.appendChild(tempDiv2);
          container.appendChild(page2Wrapper);

          // Add page break div after Page2
          const break2 = document.createElement("div");
          break2.className = "html2pdf__page-break";
          container.appendChild(break2);
        }

        // Create and style wrapper for Page3 if it exists
        if (nteData.noticeOfDecision) {
          const page3Wrapper = document.createElement("div");
          page3Wrapper.className = "pdf-page";
          const tempDiv3 = document.createElement("div");
          ReactDOM.render(
            <Page3 noticeOfDecision={nteData.noticeOfDecision} />,
            tempDiv3
          );
          page3Wrapper.appendChild(tempDiv3);
          container.appendChild(page3Wrapper);
        }

        // Add styles to handle page breaks
        const style = document.createElement("style");
        style.textContent = `
          .pdf-page {
            margin: 0;
            padding: 0;
          }
          .html2pdf__page-break {
            margin: 0;
            padding: 0;
            page-break-before: always;
          }
        `;
        document.head.appendChild(style);

        // Wait for images to load
        const images = container.querySelectorAll("img");
        const imagePromises = Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if ((img as HTMLImageElement).complete) {
                resolve(null);
              } else {
                (img as HTMLImageElement).onload = resolve;
              }
            })
        );

        await Promise.all(imagePromises);

        // Configure PDF options
        const opt = {
          margin: 0.12,
          filename: `NTE_${nteData.nte.name}_${
            new Date().toISOString().split("T")[0]
          }.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
          },
          jsPDF: {
            unit: "in",
            format: "letter",
            orientation: "portrait",
          },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
            before: ".html2pdf__page-break",
          },
        };

        // Generate and download PDF
        await html2pdf()
          .set(opt)
          .from(container)
          .toPdf()
          .get("pdf")

          .then(
            (pdf: {
              internal: { getNumberOfPages: () => any };
              setPage: (arg0: number) => void;
            }) => {
              // Get the number of pages
              const totalPages = pdf.internal.getNumberOfPages();

              // If you want to add any page-specific modifications, you can do it here
              for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                // Add any page-specific modifications if needed
              }

              return pdf;
            }
          )
          .save();

        // Clean up the style element
        document.head.removeChild(style);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const truncateText = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    return `${text.slice(0, limit)}...`;
  };

  const filteredData = data.filter((item) =>
    item.nte.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const getStatusColor = (status: NteItem["status"]): string => {
    const statusColors = {
      FTHR: "bg-purple-100 text-purple-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusDisplay = (status: NteItem["status"]): string => {
    const statusDisplays = {
      FTHR: "Forwarded to HR",
    };
    return statusDisplays[status] || status;
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

  return (
    <div className="w-full overflow-x-auto px-6">
      <div className="text-2xl text-gray-700 text-center">FORWARD TO HR</div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <BackButton />
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by employee name..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Employee Name
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Position
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Date Issued
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Policy
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Description
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Created By
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Status
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  {searchTerm
                    ? "No matching records found"
                    : "No records found"}
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.nte.name}</TableCell>
                  <TableCell>{item.nte.position}</TableCell>
                  <TableCell>{formatDate(item.nte.dateIssued)}</TableCell>
                  <TableCell className="capitalize">
                    {item.nte.offenseType}
                  </TableCell>
                  <TableCell
                    title={item.nte.offenseDescription}
                    className="max-w-xs truncate"
                  >
                    {truncateText(item.nte.offenseDescription, 50)}
                  </TableCell>
                  <TableCell>{item.createdBy}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusDisplay(item.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleView(item._id)}
                        className="h-8 flex items-center gap-1 text-xs"
                      >
                        <FileText className="h-3 w-3" />
                        View Details
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDownload(item._id)}
                        className="h-8 flex items-center gap-1 text-xs"
                      >
                        <Download className="h-3 w-3" />
                        Download PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && !error && filteredData.length > 0 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredData.length)} of {filteredData.length}{" "}
            results
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {selectedNte && (
        <PdfNteViewer
          nteData={{
            ...selectedNte,
            nte: {
              ...selectedNte.nte,
              employeeSignatureDate: selectedNte.nte.employeeSignatureDate,
              authorizedSignatureDate: selectedNte.nte.authorizedSignatureDate,
            },
            noticeOfDecision: selectedNte.noticeOfDecision,
            employeeFeedback: selectedNte.employeeFeedback,
          }}
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
        />
      )}
    </div>
  );
};

export default FthrTable;
