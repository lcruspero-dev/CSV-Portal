import { Button } from "@/components/ui/button";
import { Assigns } from "@/API/endpoint";
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
import "quill/dist/quill.core.css";
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Assigned } from "./CreateAssigns";
import { 
  UserPlus, 
  Save, 
  Loader2 
} from "lucide-react";

interface CreateMemoProps {
  setAssign: React.Dispatch<React.SetStateAction<Assigned[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddAssign: React.FC<CreateMemoProps> = ({ setAssign, setLoading }) => {
  const [assignName, setAssignName] = useState("");
  const [role, setRole] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const getAssigns = async () => {
    try {
      const response = await Assigns.getAssign();
      console.log(response.data);
      setAssign(response.data.assigns);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssignName(e.target.value);
  };

  const handleSave = async () => {
    if (isSaving || !assignName.trim() || !role.trim()) return;

    setIsSaving(true);
    try {
      const body = {
        name: assignName.trim(),
        role: role,
      };
      console.log(body);
      const response = await Assigns.CreateAssign(body);
      console.log(response.data);
      await getAssigns();
      toast({
        title: "Success",
        description: "Assignee added successfully",
        variant: "default",
      });
      setAssignName("");
      setRole("");
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error creating assignee",
        description: "Please check all required fields",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
  };

  const isFormValid = assignName.trim() && role.trim();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#1638df] to-[#192fb4] hover:from-[#192fb4] hover:to-[#1638df] transition-all duration-300 shadow-md hover:shadow-lg">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Assignee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] w-[95vw] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50/30 border-blue-200/60 shadow-xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#1638df] to-[#192fb4]">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
                Add Assignee
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Enter assignee details below. All fields are required.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="assignName" className="text-sm font-semibold text-gray-700 flex items-center">
              Name
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="assignName"
              name="assignName"
              placeholder="Enter assignee name"
              type="text"
              required
              value={assignName}
              onChange={handleCategoryChange}
              className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-lg px-4 py-3 text-base"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="role" className="text-sm font-semibold text-gray-700 flex items-center">
              Department
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select onValueChange={handleRoleChange} required disabled={isSaving}>
              <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-lg px-4 py-3 text-base">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="border-gray-200 shadow-lg rounded-lg">
                <SelectGroup>
                  <SelectItem value="IT" className="py-3 text-base hover:bg-blue-50 cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>IT Department</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="HR" className="py-3 text-base hover:bg-blue-50 cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>HR Department</span>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {role && (
            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                Selected: <span className="font-semibold">{role === "IT" ? "IT Department" : "HR Department"}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center border-t border-gray-200 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            className="w-full sm:w-auto order-2 sm:order-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={isSaving || !isFormValid}
            className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-[#1638df] to-[#192fb4] hover:from-[#192fb4] hover:to-[#1638df] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Assignee
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAssign;