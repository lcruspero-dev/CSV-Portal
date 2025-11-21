import {Button} from '@/components/ui/button';
import axios from "axios";
import { TicketAPi } from "@/API/endpoint";
import { Checkbox} from "@/components/ui/checkbox"; 
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
import { Policies } from './ViewPolicies';

interface CreatePoliciesProps {
  setPolicies: React.Dispatch<React.SetStateAction<Policies[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}


const CreatePolicies: React.FC<CreatePoliciesProps> = ({setPolicies, setLoading}) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [filename, setFilename] = useState("");
  const [isPinned, setIsPinned] = useState(false); // New state for pinned status
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

 const getPolicies = async () => {
    try {
      const response = await TicketAPi.getAllPolicies();
      console.log(response.data);
      setPolicies(response.data);
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
        const response = await TicketAPi.createPolicies(body);
        console.log(response.data);
        getPolicies();
        toast({
          title: "Success",
          description: "Policy created successfully",
          variant: "default",
        });
        setSubject("");
        setDescription("");
        setFilename("");
        setIsPinned(false); 
        setIsDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error creating policy",
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


  return(
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Compose</Button>
      </DialogTrigger>
      <DialogContent className="w-[900px] h-[600px] max-w-none bg-[#eef4ff]">
        <DialogHeader>
          <DialogTitle className="text-2xl drop-shadow-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Compose Policy
          </DialogTitle>
          <DialogDescription>
            Input details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 h-full pl-4">
          <Label htmlFor="subject" className="text-base font-bold">
            <p>Subject</p>
          </Label>
          <Input
            name="subject"
            placeholder="subject"
            type="text"
            required
            className="!mb-2"
            value={subject}
            onChange={handleSubjectChange}
          />
          <Textarea
            className="h-60"
            name="description"
            placeholder="Details"
            required
            value={description}
            onChange={handleDescriptionChange}
          />
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="picture"
              className="text-sm font-medium text-gray-700 w-1/2"
            >
              Upload file
            </Label>
            <Input
              id="picture"
              type="file"
              className="block w-1/2 text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              onChange={handleFileUpload}
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-between items-center w-full mb-4">
            {/* Pin This Memo checkbox on the left */}
            <div className="flex items-center space-x-2 pl-4">
              <Checkbox
                id="pin-memo"
                checked={isPinned}
                onCheckedChange={(checked) => setIsPinned(checked as boolean)}
              />
              <Label
                htmlFor="pin-memo"
                className="text-sm font-medium leading-none"
              >
                Pin This Memo
              </Label>
            </div>

            {/* Save button on the right */}
            <Button
              type="submit"
              className="px-8 text-xs"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePolicies;

