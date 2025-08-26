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

const ExportMemoData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memoTitles, setMemoTitles] = useState<MemoTitleResponse["data"]>([]);
  const [selectedMemos, setSelectedMemos] = useState<string[]>([]);

  useEffect(() => {
    const fetchMemoTitles = async () => {
      try {
        const response = await TicketAPi.getAllMemo();
        const memoTitleResponse: MemoTitleResponse = response;

        if (Array.isArray(memoTitleResponse.data)) {
          setMemoTitles(memoTitleResponse.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching memo titles:", err);
        setError("Failed to load memos. Please try again later.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchMemoTitles();
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

  const handleMemoSelection = (memoId: string) => {
    setSelectedMemos((prev) => {
      if (prev.includes(memoId)) {
        return prev.filter((id) => id !== memoId);
      }
      return [...prev, memoId];
    });
  };

  const handleExport = async () => {
    if (selectedMemos.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      for (const memoId of selectedMemos) {
        await exportMemoToPDF(memoId);
      }
    } catch (err) {
      console.error("Export error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to export memos. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const exportMemoToPDF = async (memoId: string) => {
    try {
      const response = await TicketAPi.getIndividualMemo(memoId);
      if (!response?.data) throw new Error("Failed to fetch memo data");

      const memo: MemoDetails = response.data;
      const doc = new jsPDF() as jsPDFWithAutoTable;

      if (memo.file) {
        try {
          const fileData = await getFileFromUrl(memo.file);
          const fileType = memo.file.split(".").pop()?.toLowerCase();

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
        }
      }

      // // Add memo details page
      // doc.addPage();
      // doc.setFontSize(16);
      // doc.text("Memo Details", 20, 20);

      // doc.setFontSize(12);
      // doc.text(`Subject: ${memo.subject}`, 20, 30);
      // doc.text(`Created Date: ${formattedDate(memo.createdAt)}`, 20, 40);
      // doc.text(`Attached File: ${memo.file || "No file attached"}`, 20, 50);

      // doc.setFontSize(10);
      // const splitDescription = doc.splitTextToSize(memo.description, 170);
      // doc.text(splitDescription, 20, 70);

      // Add acknowledged users page
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Acknowledged Users", 20, 20);

      const acknowledgedData = memo.acknowledgedby.map((user) => [
        user.name,
        formatDate(user.acknowledgedAt),
      ]);

      autoTable(doc, {
        columns: [
          { header: "Name", dataKey: "name" },
          { header: "Acknowledged Date", dataKey: "acknowledgedAt" },
        ],
        head: [["Name", "Acknowledged Date"]],
        body: acknowledgedData,
        startY: 30,
        theme: "striped",
      });

      doc.save(
        `Memo_${memo.subject}_${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Loading memos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-3">
      <BackButton />
      <div className="max-w-2xl mx-auto mt-5">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold py-1 sm:py-1 md:py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Export Memo Data
          </h1>
          <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-black">
            Select memos to export
          </p>
        </div>

        <Card className="p-4">
          <div className="space-y-4">
            {memoTitles.map((memo) => (
              <div key={memo._id} className="flex items-center space-x-2">
                <Checkbox
                  id={memo._id}
                  checked={selectedMemos.includes(memo._id)}
                  onCheckedChange={() => handleMemoSelection(memo._id)}
                />
                <Label
                  htmlFor={memo._id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <span className="mr-2">{memo.subject}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      memo.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {memo.status}
                  </span>
                </Label>
              </div>
            ))}
          </div>

          <Button
            className="w-full mt-4"
            onClick={handleExport}
            disabled={isLoading || selectedMemos.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              "Export Selected Memos"
            )}
          </Button>

          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ExportMemoData;
