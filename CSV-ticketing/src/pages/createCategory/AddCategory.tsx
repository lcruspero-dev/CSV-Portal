import { Button } from "@/components/ui/button";
import { Category } from "@/API/endpoint";
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Categorys } from "./CreateCatergory";
import { Plus, Building, Tag, Loader2 } from "lucide-react";

interface CreateMemoProps {
  setCategory: React.Dispatch<React.SetStateAction<Categorys[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddCategory: React.FC<CreateMemoProps> = ({ setCategory, setLoading }) => {
  const [categoryName, setCategoryName] = useState("");
  const [role, setRole] = useState(""); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const getCategories = async () => {
    try {
      const response = await Category.getCategory();
      setCategory(response.data.categories);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
  };

  const handleSave = async () => {
    if (isSaving) return;

    // Validation
    if (!categoryName.trim() || !role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const body = {
        category: categoryName.trim(),
        role: role,
      };
      
      await Category.CreateCategory(body);
      await getCategories();
      
      toast({
        title: "Success",
        description: "Category added successfully",
        variant: "default",
      });
      
      // Reset form
      setCategoryName("");
      setRole("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error creating category",
        description: "An error occurred while creating the category",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setCategoryName("");
      setRole("");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Add New Category
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Create a new ticket category for your organization
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category Name Field */}
          <div className="space-y-3">
            <Label htmlFor="categoryName" className="text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-4 w-4 text-blue-600" />
                Category Name
              </div>
            </Label>
            <Input
              id="categoryName"
              placeholder="e.g., Software Issue, Hardware Support, Leave Request"
              value={categoryName}
              onChange={handleCategoryChange}
              className="w-full"
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500">
              Enter a descriptive name for the category
            </p>
          </div>

          {/* Department Field */}
          <div className="space-y-3">
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Building className="h-4 w-4 text-blue-600" />
                Department
              </div>
            </Label>
            <Select onValueChange={handleRoleChange} value={role} disabled={isSaving}>
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="IT" className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      IT Department
                    </div>
                  </SelectItem>
                  <SelectItem value="HR" className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-green-600" />
                      HR Department
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Choose which department will handle this category
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !categoryName.trim() || !role}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </>
            )}
          </Button>
        </DialogFooter>

        {/* Preview Section */}
        {(categoryName || role) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="space-y-2 text-sm">
              {categoryName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-900">{categoryName}</span>
                </div>
              )}
              {role && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className={`font-medium ${
                    role === "IT" ? "text-blue-600" : "text-green-600"
                  }`}>
                    {role} Department
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddCategory;