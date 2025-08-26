import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string, filename: string) => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [date, setDate] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const drawDateOnCanvas = (
    canvas: HTMLCanvasElement,
    selectedDate: string
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Format the date from YYYY-MM-DD to a more readable format
    const formattedDate = selectedDate;

    // Save the current context state
    ctx.save();

    // Set font properties
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";

    // Calculate text position (center)
    const textWidth = ctx.measureText(formattedDate).width;
    const x = (canvas.width - textWidth) / 2;
    const y = canvas.height - 20; // 20 pixels from bottom

    // Draw the date
    ctx.fillText(formattedDate, x, y);

    // Restore the context state
    ctx.restore();
  };

  const handleSave = async () => {
    if (!date) {
      setError(true);
      return;
    }

    if (signatureRef.current) {
      try {
        setIsUploading(true);

        // Get the canvas element
        const canvas = signatureRef.current.getCanvas();

        // Draw the date on the canvas
        drawDateOnCanvas(canvas, date);

        // Get the final data URL with both signature and date
        const dataUrl = canvas.toDataURL("image/png");
        const filename = `signature_${Date.now()}.png`;
        const file = dataURLtoFile(dataUrl, filename);

        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
          `${import.meta.env.VITE_UPLOADFILES_URL}/form-upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        onSave(dataUrl, response.data.filename);
        onClose();
      } catch (error) {
        console.error("Error uploading signature:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    setError(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Draw Your Signature</DialogTitle>
        </DialogHeader>
        <div className="border p-2 bg-white">
          <SignatureCanvas
            ref={signatureRef}
            penColor="black"
            canvasProps={{ width: 375, height: 150, className: "border" }}
          />
        </div>
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Input
              type="date"
              value={date}
              onChange={handleDateChange}
              required
              className={`w-full ${error ? "border-red-500" : ""}`}
            />
            {error && (
              <p className="text-sm text-red-500">Please select a date</p>
            )}
          </div>
          <div className="flex justify-between">
            <Button variant="destructive" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;
