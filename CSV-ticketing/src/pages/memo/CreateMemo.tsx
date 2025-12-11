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
import { Gift, Snowflake, Star } from "lucide-react";

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
    e: React.ChangeEvent<HTMLTextAreaElement>
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
        title: "🎄 Success",
        description: "Holiday memo created successfully",
        variant: "default",
        className: "bg-gradient-to-r from-green-600 to-red-600 border border-green-400 text-white"
      });
      setSubject("");
      setDescription("");
      setFilename("");
      setIsPinned(false);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "❄️ Error",
        description: "Please add all required fields",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
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
        }
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
        <Button className="bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white font-medium border border-green-400">
          <Gift className="mr-2 h-4 w-4" />
          Compose Holiday Memo
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[900px] h-[800px] max-w-none bg-gradient-to-br from-green-50 to-red-50">
        <DialogHeader>
          <DialogTitle className="text-2xl drop-shadow-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-red-600 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Compose Holiday Memo
            <Snowflake className="h-5 w-5 text-blue-400 animate-pulse" />
          </DialogTitle>
          <DialogDescription className="text-green-700">
            Input holiday details here. Click save when you're ready to spread the cheer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 h-full pl-4">
          <Label htmlFor="subject" className="text-base font-bold text-green-800 flex items-center gap-2">
            <span className="text-red-500">🎄</span>
            Subject
          </Label>
          <Input
            name="subject"
            placeholder="Enter holiday subject..."
            type="text"
            required
            className="!mb-2 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white"
            value={subject}
            onChange={handleSubjectChange}
          />
          <Label htmlFor="description" className="text-base font-bold text-green-800 flex items-center gap-2">
            <span className="text-red-500">❄️</span>
            Holiday Details
          </Label>
          <Textarea
            className="h-60 border-green-300 focus:border-green-500 focus:ring-green-500 bg-white"
            name="description"
            placeholder="Share the holiday spirit with festive details..."
            required
            value={description}
            onChange={handleDescriptionChange}
          />
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="picture"
              className="text-sm font-medium text-green-700 w-1/2 flex items-center gap-2"
            >
              <span className="text-red-500">🎁</span>
              Upload holiday file
            </Label>
            <Input
              id="picture"
              type="file"
              className="block w-1/2 text-sm text-green-900 border border-green-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white"
              onChange={handleFileUpload}
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-between items-center w-full mb-4">
            {/* Star This Memo checkbox */}
            <div className="flex items-center space-x-2 pl-4">
              <Checkbox
                id="pin-memo"
                checked={isPinned}
                onCheckedChange={(checked) => setIsPinned(checked as boolean)}
                className="border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <Label
                htmlFor="pin-memo"
                className="text-sm font-medium leading-none text-green-700 flex items-center gap-1"
              >
                <Star className="h-3 w-3 text-yellow-500" />
                Star This Holiday Memo
              </Label>
            </div>

            {/* Save button */}
            <Button
              type="submit"
              className="px-8 text-xs bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white font-medium border border-green-400"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Snowflake className="h-3 w-3 mr-2 animate-spin" />
                  Spreading Cheer...
                </>
              ) : (
                <>
                  <Gift className="h-3 w-3 mr-2" />
                  Save Holiday Memo
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemo;