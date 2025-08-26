import { NteAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";

interface CreateNODDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nteId: string;
  nteData: {
    nte: {
      name: string;
      position: string;
      dateIssued: string;
      offenseType: string;
      offenseDescription: string;
    };
    employeeFeedback?: {
      responseDate: string;
    };
  };
  onCreateSuccess: () => void;
}

const CreateNODDialog: React.FC<CreateNODDialogProps> = ({
  open,
  onOpenChange,
  nteId,
  nteData,
  onCreateSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [findings, setFindings] = useState<string>("");
  const [decision, setDecision] = useState<string>("");
  const [suspensionDays, setSuspensionDays] = useState<string>("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Validate required fields
    if (!findings || !decision) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill out all required fields.",
      });
      return;
    }

    // Validate suspension days if the decision is "Suspension w/o Pay"
    if (decision === "Suspension w/o Pay for: ____ Day(s)" && !suspensionDays) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please specify the number of suspension days.",
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare the noticeOfDecision object
      const noticeOfDecision = {
        name: nteData.nte.name,
        position: nteData.nte.position,
        nteIssuanceDate: nteData.nte.dateIssued,
        writtenExplanationReceiptDate: nteData.employeeFeedback?.responseDate,
        offenseType: nteData.nte.offenseType,
        offenseDescription: nteData.nte.offenseDescription,
        findings,
        decision:
          decision === "Suspension w/o Pay for: ____ Day(s)"
            ? `Suspension w/o Pay for: ${suspensionDays} Day(s)`
            : decision,
      };

      // Update the NTE with the noticeOfDecision
      await NteAPI.updateNte(nteId, {
        noticeOfDecision,
        status: "PNODA", // Update status to "Pending Notice of Decision Acknowledgement"
      });

      toast({
        title: "Success",
        variant: "success",
        description: "Notice of Decision created successfully",
      });

      onCreateSuccess();
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create Notice of Decision",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Notice of Decision</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Name */}
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

          {/* Position */}
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

          {/* NTE Issuance Date */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              NTE Issuance Date:
            </label>
            <Input
              value={nteData.nte.dateIssued}
              readOnly
              className="w-full bg-gray-100"
            />
          </div>

          {/* Written Explanation Receipt Date */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Written Explanation Receipt Date:
            </label>
            <Input
              value={nteData.employeeFeedback?.responseDate}
              readOnly
              className="w-full bg-gray-100"
            />
          </div>

          {/* Offense Type */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Policy / COCD Violated:
            </label>
            <Input
              value={nteData.nte.offenseType}
              readOnly
              className="w-full bg-gray-100"
            />
          </div>

          {/* Offense Description */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Description:
            </label>
            <Input
              value={nteData.nte.offenseDescription}
              readOnly
              className="w-full bg-gray-100"
            />
          </div>

          {/* Findings (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Findings: <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Enter findings"
              className="w-full min-h-[120px] resize-y"
              required
            />
          </div>

          {/* Decision (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Decision: <span className="text-red-500">*</span>
            </label>
            <Select onValueChange={setDecision} value={decision}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Absolved" className="hover:bg-blue-100">
                  Absolved
                </SelectItem>
                <SelectItem value="Coaching" className="hover:bg-blue-100">
                  Coaching
                </SelectItem>
                <SelectItem
                  value="Verbal Warning"
                  className="hover:bg-blue-100"
                >
                  Verbal Warning
                </SelectItem>
                <SelectItem
                  value="Written Warning"
                  className="hover:bg-blue-100"
                >
                  Written Warning
                </SelectItem>
                <SelectItem
                  value="Final Written Warning"
                  className="hover:bg-blue-100"
                >
                  Final Written Warning
                </SelectItem>
                <SelectItem
                  value="Suspension w/o Pay for: ____ Day(s)"
                  className="hover:bg-blue-100"
                >
                  Suspension w/o Pay for: ____ Day(s)
                </SelectItem>
                <SelectItem value="Termination" className="hover:bg-blue-100">
                  Termination
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Suspension Days Input (Conditional) */}
          {decision === "Suspension w/o Pay for: ____ Day(s)" && (
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Number of Suspension Days:{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={suspensionDays}
                onChange={(e) => setSuspensionDays(e.target.value)}
                placeholder="Enter number of days"
                className="w-full"
                required
              />
            </div>
          )}

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
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create NOD"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNODDialog;
