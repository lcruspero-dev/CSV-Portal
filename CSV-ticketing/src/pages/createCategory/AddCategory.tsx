import { Button } from "@/components/ui/button";
 

import { Category,   } from "@/API/endpoint";
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
 

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Categorys } from "./CreateCatergory";
 
 
 
 
interface CreateMemoProps {
    setCategory: React.Dispatch<React.SetStateAction<Categorys[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddCategory: React.FC<CreateMemoProps> = ({ setCategory, setLoading }) => {
  const [categoryName, setCateryName] = useState("");
  const [role, setRole] = useState(""); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const getMemos = async () => {
    try {
      const response = await Category.getCategory();
      console.log(response.data);
      setCategory(response.data.categories);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Stop loading after the request is done
    }
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCateryName(e.target.value);
  };
  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple submissions

    setIsSaving(true);
    try {
      const body = {
        category: categoryName,
        role: role,
        
      };
      console.log(body);
      const response = await Category.CreateCategory(body);
      console.log(response.data);
      getMemos();
      toast({
        title: "Success",
        description: "Category Added",
        variant: "default",
      });
      setCateryName("");
      setRole('') 
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error creating category",
        description: "Please add all required fields",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSaving(false); // Set loading to false regardless of success or failure
    }
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Add Category</Button>
      </DialogTrigger>
      <DialogContent className="w-[500px] h-[400px] max-w-none bg-[#eef4ff]">
        <DialogHeader>
          <DialogTitle className="text-2xl drop-shadow-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Add Category
          </DialogTitle>
          <DialogDescription>
            Input details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 h-full   pl-4">
          <Label htmlFor="categoryName" className="text-base font-bold">
            <p>Category </p>
          </Label>
          <Input
            name="categoryName"
            placeholder="Category Name"
            type="text"
            required
            className="!mb-2"
            value={categoryName}
            onChange={handleCategoryChange}
          />
           <Label htmlFor="role" className="text-base font-bold">
          Category
        </Label>
        <Select onValueChange={handleRoleChange} required>
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="IT">
               IT Department
              </SelectItem>
              <SelectItem value="HR">HR Department</SelectItem>
               
            </SelectGroup>
          </SelectContent>
        </Select>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            className="mr-10 px-10"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategory;
