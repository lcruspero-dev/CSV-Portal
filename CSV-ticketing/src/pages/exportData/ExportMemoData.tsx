/* eslint-disable @typescript-eslint/no-unused-vars */
import { TicketAPi } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MemoTitleResponse {
  data: Array<{
    _id: string;
    subject: string;
    status?: string;
    file: string;
    description: string;
    acknowledgedby: Array<{
      name: string;
      userId: string;
      acknowledgedAt: string;
      _id: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface PoliciesTitleResponse {
  data: Array<{
    _id: string;
    subject: string;
    status?: string;
    file: string;
    description: string;
    acknowledgedby: Array<{
      name: string;
      userId: string;
      acknowledgedAt: string;
      _id: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface MemoDetails {
  _id: string;
  subject: string;
  description: string;
  createdAt: string;
  file: string;
  acknowledgedby: Array<{
    userId: string;
    name: string;
    acknowledgedAt: string;
    _id: string;
  }>;
}

interface PolicyDetails {
  _id: string;
  subject: string;
  description: string;
  createdAt: string;
  file: string;
  acknowledgedby: Array<{
    userId: string;
    name: string;
    acknowledgedAt: string;
    _id: string;
  }>;
}

interface SelectedItem {
  id: string;
  type: 'memo' | 'policy';
  subject: string;
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
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

const ExportData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memoTitles, setMemoTitles] = useState<MemoTitleResponse["data"]>([]);
  const [policyTitles, setPolicyTitles] = useState<PoliciesTitleResponse["data"]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);

        // Fetch memos and policies in parallel
        const [memosResponse, policiesResponse] = await Promise.all([
          TicketAPi.getAllMemos(),
          TicketAPi.getAllPolicies()
        ]);

        const memoTitleResponse: MemoTitleResponse = memosResponse;
        const policyTitleResponse: PoliciesTitleResponse = policiesResponse;

        if (Array.isArray(memoTitleResponse.data)) {
          setMemoTitles(memoTitleResponse.data);
        } else {
          throw new Error("Invalid memo response format");
        }

        if (Array.isArray(policyTitleResponse.data)) {
          setPolicyTitles(policyTitleResponse.data);
        } else {
          throw new Error("Invalid policy response format");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFileFromUrl = async (fileUrl: string): Promise<ArrayBuffer> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_UPLOADFILES_URL}/files/${fileUrl}`
      );
      if (!response.ok) throw new Error("Failed to fetch file");
      return response.arrayBuffer();
    } catch (error) {
      console.error("Error fetching file:", error);
      throw new Error("Failed to fetch file from server");
    }
  };

  const handleItemSelection = (itemId: string, type: 'memo' | 'policy', subject: string) => {
    setSelectedItems((prev) => {
      const existingItem = prev.find(item => item.id === itemId && item.type === type);
      if (existingItem) {
        return prev.filter(item => !(item.id === itemId && item.type === type));
      }
      return [...prev, { id: itemId, type, subject }];
    });
  };

  const handleExport = async () => {
    if (selectedItems.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Group items by type for better organization
      const memosToExport = selectedItems.filter(item => item.type === 'memo');
      const policiesToExport = selectedItems.filter(item => item.type === 'policy');

      // Export memos
      for (const item of memosToExport) {
        await exportMemoToPDF(item.id, item.subject);
      }

      // Export policies
      for (const item of policiesToExport) {
        await exportPolicyToPDF(item.id, item.subject);
      }

      if (memosToExport.length > 0 && policiesToExport.length > 0) {
        alert(`Successfully exported ${memosToExport.length} memo(s) and ${policiesToExport.length} policy(ies)!`);
      } else if (memosToExport.length > 0) {
        alert(`Successfully exported ${memosToExport.length} memo(s)!`);
      } else if (policiesToExport.length > 0) {
        alert(`Successfully exported ${policiesToExport.length} policy(ies)!`);
      }
    } catch (err) {
      console.error("Export error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to export items. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addFileToPDF = async (doc: jsPDFWithAutoTable, fileUrl: string) => {
    if (!fileUrl) return;

    try {
      const fileData = await getFileFromUrl(fileUrl);
      const fileType = fileUrl.split(".").pop()?.toLowerCase();

      if (fileType === "pdf") {
        // Create a temporary iframe to load the PDF
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        const blob = new Blob([fileData], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        // Load PDF in iframe and convert first page to image
        await new Promise((resolve) => {
          iframe.onload = async () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pdfjs = (window as any).pdfjsLib;

            const loadingTask = pdfjs.getDocument(url);
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            const viewport = page.getViewport({ scale: 2 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;

            const imgData = canvas.toDataURL("image/jpeg");
            doc.addImage(
              imgData,
              "JPEG",
              0,
              0,
              doc.internal.pageSize.getWidth(),
              doc.internal.pageSize.getHeight(),
              undefined,
              "FAST"
            );

            URL.revokeObjectURL(url);
            document.body.removeChild(iframe);
            resolve(true);
          };
          iframe.src = url;
        });
      } else if (["jpg", "jpeg", "png"].includes(fileType || "")) {
        const base64 = btoa(
          new Uint8Array(fileData).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        doc.addImage(
          `data:image/${fileType};base64,${base64}`,
          fileType?.toUpperCase() || "JPEG",
          0,
          0,
          doc.internal.pageSize.getWidth(),
          doc.internal.pageSize.getHeight(),
          undefined,
          "FAST"
        );
      }
    } catch (error) {
      console.error("Error adding file to PDF:", error);
      // Don't throw error - continue with PDF generation even if file fails
    }
  };

  const addDocumentDetails = (doc: jsPDFWithAutoTable, document: MemoDetails | PolicyDetails, type: 'MEMO' | 'POLICY') => {
    // Add document type header
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(type, 20, 20);

    // Add document details
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(document.subject, 20, 30);

    doc.setFontSize(12);
    doc.text(`Created: ${formatDate(document.createdAt)}`, 20, 40);
    
    // Add description
    doc.setFontSize(11);
    const splitDescription = doc.splitTextToSize(document.description, 170);
    doc.text(splitDescription, 20, 50);

    return 50 + (splitDescription.length * 7); // Return the Y position after description
  };

  const addAcknowledgedUsers = (doc: jsPDFWithAutoTable, acknowledgedby: Array<{ name: string; acknowledgedAt: string; }>, type?: string) => {
    if (acknowledgedby && acknowledgedby.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Acknowledged Users", 20, 20);

      const acknowledgedData = acknowledgedby.map((user) => [
        user.name,
        formatDate(user.acknowledgedAt),
      ]);

      autoTable(doc, {
        head: [["Name", "Acknowledged Date"]],
        body: acknowledgedData,
        startY: 30,
        theme: "striped",
        styles: { fontSize: 10 },
        headStyles: { fillColor: type === 'MEMO' ? [22, 56, 223] : [192, 47, 180] }
      });
    }
  };

  const exportMemoToPDF = async (memoId: string, subject: string) => {
    try {
      const response = await TicketAPi.getIndividualMemo(memoId);
      if (!response?.data) throw new Error("Failed to fetch memo data");

      const memo: MemoDetails = response.data;
      const doc = new jsPDF() as jsPDFWithAutoTable;

      const type = 'MEMO' as const;
      
      // Add memo details
      const yPos = addDocumentDetails(doc, memo, type);

      // Add file if exists
      if (memo.file) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Attached File", 20, 20);
        await addFileToPDF(doc, memo.file);
      }

      // Add acknowledged users page
      addAcknowledgedUsers(doc, memo.acknowledgedby, type);

      doc.save(
        `Memo_${subject.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } catch (error) {
      console.error("Error generating memo PDF:", error);
      throw new Error(`Failed to generate memo PDF: ${subject}`);
    }
  };

  const exportPolicyToPDF = async (policyId: string, subject: string) => {
    try {
      // Use the correct endpoint for individual policy
      const response = await TicketAPi.getIndividualPolicy(policyId);
      if (!response?.data) throw new Error("Failed to fetch policy data");

      const policy: PolicyDetails = response.data;
      const doc = new jsPDF() as jsPDFWithAutoTable;

      const type = 'POLICY' as const;
      
      // Add policy details
      const yPos = addDocumentDetails(doc, policy, type);

      // Add file if exists
      if (policy.file) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Attached File", 20, 20);
        await addFileToPDF(doc, policy.file);
      }

      // Add acknowledged users page
      addAcknowledgedUsers(doc, policy.acknowledgedby, type);

      doc.save(
        `Policy_${subject.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } catch (error) {
      console.error("Error generating policy PDF:", error);
      throw new Error(`Failed to generate policy PDF: ${subject}`);
    }
  };

  const isItemSelected = (itemId: string, type: 'memo' | 'policy') => {
    return selectedItems.some(item => item.id === itemId && item.type === type);
  };

  const handleSelectAll = (type: 'memo' | 'policy') => {
    const items = type === 'memo' ? memoTitles : policyTitles;
    const allSelected = items.every(item => 
      isItemSelected(item._id, type)
    );

    if (allSelected) {
      // Deselect all of this type
      setSelectedItems(prev => 
        prev.filter(item => item.type !== type)
      );
    } else {
      // Select all of this type
      const newSelectedItems = items.map(item => ({
        id: item._id,
        type,
        subject: item.subject
      }));
      
      // Remove existing items of this type and add all new ones
      setSelectedItems(prev => [
        ...prev.filter(item => item.type !== type),
        ...newSelectedItems
      ]);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-3">
      <BackButton />
      <div className="max-w-4xl mx-auto mt-5">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold py-1 sm:py-1 md:py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Export Data
          </h1>
          <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-black">
            Select memos and policies to export
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Memos Section */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1638df]">Memos</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll('memo')}
              >
                {memoTitles.every(memo => isItemSelected(memo._id, 'memo')) 
                  ? "Deselect All" 
                  : "Select All"}
              </Button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {memoTitles.length > 0 ? (
                memoTitles.map((memo) => (
                  <div key={`memo-${memo._id}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`memo-${memo._id}`}
                      checked={isItemSelected(memo._id, 'memo')}
                      onCheckedChange={() => handleItemSelection(memo._id, 'memo', memo.subject)}
                    />
                    <Label
                      htmlFor={`memo-${memo._id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center justify-between flex-1"
                    >
                      <span className="truncate mr-2">{memo.subject}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                          memo.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {memo.status || 'N/A'}
                      </span>
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No memos found</p>
              )}
            </div>
          </Card>

          {/* Policies Section */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#192fb4]">Policies</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll('policy')}
              >
                {policyTitles.every(policy => isItemSelected(policy._id, 'policy')) 
                  ? "Deselect All" 
                  : "Select All"}
              </Button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {policyTitles.length > 0 ? (
                policyTitles.map((policy) => (
                  <div key={`policy-${policy._id}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`policy-${policy._id}`}
                      checked={isItemSelected(policy._id, 'policy')}
                      onCheckedChange={() => handleItemSelection(policy._id, 'policy', policy.subject)}
                    />
                    <Label
                      htmlFor={`policy-${policy._id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center justify-between flex-1"
                    >
                      <span className="truncate mr-2">{policy.subject}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                          policy.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {policy.status || 'N/A'}
                      </span>
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No policies found</p>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Selected Items: {selectedItems.length}</p>
              <p className="text-sm text-gray-600">
                Memos: {selectedItems.filter(item => item.type === 'memo').length} | 
                Policies: {selectedItems.filter(item => item.type === 'policy').length}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedItems([])}
                variant="outline"
                disabled={selectedItems.length === 0}
              >
                Clear All
              </Button>
              <Button
                onClick={() => {
                  const allItems = [
                    ...memoTitles.map(memo => ({ 
                      id: memo._id, 
                      type: 'memo' as const, 
                      subject: memo.subject 
                    })),
                    ...policyTitles.map(policy => ({ 
                      id: policy._id, 
                      type: 'policy' as const, 
                      subject: policy.subject 
                    }))
                  ];
                  setSelectedItems(allItems);
                }}
                variant="outline"
              >
                Select All Items
              </Button>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleExport}
            disabled={isLoading || selectedItems.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              `Export Selected (${selectedItems.length})`
            )}
          </Button>

          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
          )}

          <p className="mt-3 text-sm text-gray-600 text-center">
            Note: Each selected item will be exported as a separate PDF file.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ExportData;