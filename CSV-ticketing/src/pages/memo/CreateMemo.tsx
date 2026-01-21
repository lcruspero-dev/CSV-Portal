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
import { useState } from "react";
import { Textarea } from "../../components/ui/textarea";
import { Memo } from "./ViewMemo";

interface CreateMemoProps {
  setMemos: React.Dispatch<React.SetStateAction<Memo[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateMemo: React.FC<CreateMemoProps> = ({ setMemos, setLoading }) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [filename, setFilename] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const getMemos = async () => {
    try {
      const response = await TicketAPi.getAllMemos();
      console.log(response.data);
      setMemos(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDescription(e.target.value);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value);
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const body = {
        subject: subject,
        description: description,
        file: filename,
        isPinned: isPinned,
      };
      console.log(body);
      const response = await TicketAPi.createMemo(body);
      console.log(response.data);
      getMemos();
      toast({
        title: "Success",
        description: "Memo created successfully",
        variant: "default",
        className:
          "bg-gradient-to-r from-blue-600 to-blue-600 border border-blue-400 text-white",
      });
      setSubject("");
      setDescription("");
      setFilename("");
      setIsPinned(false);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Please add all required fields",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const fileInput = event.target;
    const file = fileInput.files && fileInput.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_UPLOADFILES_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log("Upload response:", response.data);
      setFilename(response.data.filename);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className=" text-white font-medium ">Create Memo</Button>
      </DialogTrigger>
      <DialogContent className="w-[900px] h-[700px] max-w-none">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center">
            Create Memo
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-md">
            Input memo details here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Label
            htmlFor="subject"
            className="text-base font-bold flex items-center gap-2"
          >
            Subject
          </Label>
          <Input
            name="subject"
            placeholder="Title"
            type="text"
            required
            className="mb-2"
            value={subject}
            onChange={handleSubjectChange}
          />
          <Label
            htmlFor="description"
            className="text-base font-bold flex items-center gap-2"
          >
            Details
          </Label>
          <Textarea
            className="h-60"
            name="description"
            placeholder="Memo and procedures..."
            required
            value={description}
            onChange={handleDescriptionChange}
          />
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="picture"
              className="text-md font-medium text-black w-1/2 flex items-center gap-2"
            >
              Upload file
            </Label>
            <Input
              id="picture"
              type="file"
              className="block w-1/2 text-sm text-gray-700"
              onChange={handleFileUpload}
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-between items-center w-full mb-4">
            <div className="flex items-center space-x-2 pl-4">
              <Checkbox
                id="pin-memo"
                checked={isPinned}
                onCheckedChange={(checked) => setIsPinned(checked as boolean)}
                className="border-black data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label
                htmlFor="pin-memo"
                className="text-sm font-medium leading-none text-black flex items-center gap-1"
              >
                Pin Memo
              </Label>
            </div>

            {/* Save button */}
            <Button
              type="submit"
              className="px-8 text-xs text-white font-medium "
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <>saving...</> : <>Save Memo</>}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemo;
