import { Button } from "@/components/ui/button";
import axios from "axios";
import { TicketAPi } from "@/API/endpoint";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";

export interface Memo {
  _id: string;
  subject: string;
  description: string;
  file: string;
  isPinned: boolean;
  createdAt: string;
}

interface UpdateMemoProps {
  memo: Memo;
  onUpdateSuccess?: () => void;
}

const UpdateMemo: React.FC<UpdateMemoProps> = ({
  memo,
  onUpdateSuccess,
}) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [filename, setFilename] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // ✅ preload memo data
  useEffect(() => {
    if (memo) {
      setSubject(memo.subject || "");
      setDescription(memo.description || "");
      setFilename(memo.file || "");
      setIsPinned(memo.isPinned || false);
    }
  }, [memo]);

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const body = {
        subject,
        description,
        file: filename,
        isPinned,
      };

      await TicketAPi.updateMemo(memo._id, body);

      toast({
        title: "Updated",
        description: "Memo updated successfully",
      });

      setIsDialogOpen(false);
      
      // Call the success callback if provided
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update memo",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_UPLOADFILES_URL}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setFilename(response.data.filename);
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Edit size={16} />
          Edit {memo.isPinned && "(Pinned)"}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[900px] h-[700px] max-w-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Update Memo
          </DialogTitle>
          <DialogDescription>Edit memo details</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 overflow-y-auto flex-1 pr-2">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter memo subject"
            />
          </div>

          <div className="space-y-2">
            <Label>Details</Label>
            <Textarea
              className="h-60"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter memo details"
            />
          </div>

          <div className="space-y-2">
            <Label>Current File</Label>
            {filename && (
              <div className="text-sm text-blue-600 mb-2">
                Current: {filename}
              </div>
            )}
            <Label>Upload New File (Optional)</Label>
            <Input type="file" onChange={handleFileUpload} />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to keep the current file
            </p>
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isPinned}
                onCheckedChange={(checked) =>
                  setIsPinned(checked as boolean)
                }
              />
              <Label className="cursor-pointer">Pin Memo</Label>
            </div>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Updating..." : "Update Memo"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateMemo;