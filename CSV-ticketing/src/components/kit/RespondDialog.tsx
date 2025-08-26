/* eslint-disable @typescript-eslint/no-unused-vars */
import { NteAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "lucide-react";
import React, { useState } from "react";
import SignatureModal from "./SignatureModal";

interface RespondToNteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nteId: string;
  nteData: {
    nte: {
      name: string;
      position: string;
    };
  };
  onRespondSuccess: () => void;
}

const RespondToNteDialog: React.FC<RespondToNteDialogProps> = ({
  open,
  onOpenChange,
  nteId,
  nteData,
  onRespondSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [responseDetail, setResponseDetail] = useState<string>("");
  const [responseDate, setResponseDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signature, setSignature] = useState<string>("");
  // const [signatureDate, setSignatureDate] = useState<string>("");
  const [signatureFilename, setSignatureFilename] = useState<string>("");
  const [errors, setErrors] = useState<{
    responseDetail?: string;
    signature?: string;
    declaration?: string;
  }>({});
  const { toast } = useToast();

  const handleSignatureSave = (dataUrl: string, filename: string) => {
    setSignature(dataUrl);
    setSignatureFilename(filename);
    setErrors((prev) => ({ ...prev, signature: undefined }));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!responseDetail.trim()) {
      newErrors.responseDetail = "Please provide your response details";
    }

    if (!signature) {
      newErrors.signature = "Please add your signature";
    }

    if (!isConfirmed) {
      newErrors.declaration = "Please confirm the declaration";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const employeeFeedback = {
        name: nteData.nte.name,
        position: nteData.nte.position,
        responseDate: responseDate,
        responseDetail: responseDetail,
        employeeSignatureDate: signatureFilename,
        // signatureDate: signatureDate,
      };

      await NteAPI.updateNte(nteId, {
        employeeFeedback,
        status: "PNOD",
      });

      toast({
        title: "Success",
        variant: "default",
        description: "Response submitted successfully",
      });

      onRespondSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit response",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>EMPLOYEE FEEDBACK FORM</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Name and Position in one row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Name:
              </label>
              <Input
                value={nteData.nte.name}
                readOnly
                className="w-full bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Position:
              </label>
              <Input
                value={nteData.nte.position}
                readOnly
                className="w-full bg-gray-100"
              />
            </div>
          </div>

          {/* Response Date */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Response Date:
            </label>
            <div className="relative">
              <Input
                type="date"
                value={responseDate}
                onChange={(e) => setResponseDate(e.target.value)}
                className="w-full"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Response Details */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Response Details: <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={responseDetail}
              onChange={(e) => {
                setResponseDetail(e.target.value);
                if (e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, responseDetail: undefined }));
                }
              }}
              placeholder="Please provide your detailed response(s) to the Notice to Explain (NTE) issued to you. Be specific with date and provide clear reasoning for each point addressed:"
              className={`w-full min-h-[150px] resize-y mt-2 ${
                errors.responseDetail ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.responseDetail && (
              <p className="text-sm text-red-500 mt-1">
                {errors.responseDetail}
              </p>
            )}
          </div>

          {/* Signature Section */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Signature: <span className="text-red-500">*</span>
            </label>
            <div>
              <div className="flex flex-col items-center space-y-2">
                {signature ? (
                  <div className="flex flex-col items-center w-full">
                    <img
                      src={signature}
                      alt="Signature"
                      className="h-16 mb-2"
                    />
                    {/* <p className="text-sm">{signatureDate}</p> */}
                    <div className="border-t border-black w-full" />
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsSignatureModalOpen(true)}
                    className={errors.signature ? "border-red-500" : ""}
                  >
                    Sign Here
                  </Button>
                )}
              </div>
              {errors.signature && (
                <p className="text-sm text-red-500 mt-1">{errors.signature}</p>
              )}
            </div>
          </div>

          {/* Declaration Checkbox */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="declaration"
              checked={isConfirmed}
              onCheckedChange={(checked) => {
                setIsConfirmed(checked as boolean);
                if (checked) {
                  setErrors((prev) => ({ ...prev, declaration: undefined }));
                }
              }}
              className={`border-2 border-gray-300 w-5 h-5 mt-1 ${
                errors.declaration ? "border-red-500" : ""
              }`}
            />
            <div>
              <label
                htmlFor="declaration"
                className="text-xs font-medium text-gray-900 italic cursor-pointer"
              >
                I hereby declare that the information provided in my response is
                true and correct to the best of my knowledge. I understand that
                any false statements or omissions may result in disciplinary
                action.
              </label>
              {errors.declaration && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.declaration}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? "Submitting..." : "Submit Response"}
            </Button>
          </div>
        </div>

        {/* Signature Modal */}
        <SignatureModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          onSave={handleSignatureSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RespondToNteDialog;
