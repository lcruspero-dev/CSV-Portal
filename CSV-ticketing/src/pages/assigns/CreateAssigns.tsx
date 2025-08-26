import { useEffect, useState } from "react";
import { Assigns } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingComponent from "@/components/ui/loading";

import { Edit, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import AddAssign from "./AddAssign";

export interface Assigned {
  _id: string;
  name: string;
  role: string;
}

export interface User {
  _id: string;
  name: string;
  isAdmin: boolean;
  email: string;
}

function CreateAssign() {
  const [assigns, setAssign] = useState<Assigned[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingAssign, setEditAssign] = useState<Assigned | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedAssign, setEditedAssign] = useState("");
  const [editedRole, setEditedRole] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Assigned | null>(null);
  const { toast } = useToast();

  const userString = localStorage.getItem("user");
  const user: User | null = userString ? JSON.parse(userString) : null;

  const getAssigned = async () => {
    try {
      const response = await Assigns.getAssign();
      setAssign(response.data.assigns);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAssigned();
  }, []);

  const handleEdit = (AssignItem: Assigned) => {
    setEditAssign(AssignItem);
    setEditedAssign(AssignItem.name);
    setEditedRole(AssignItem.role);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAssign) return;

    try {
      const body = {
        name: editedAssign,
        role: editedRole,
      };
      await Assigns.updateAssign(editingAssign._id, body);
      await getAssigned(); // Refresh the list
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Category updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error updating assigns",
        description: "An error occurred while updating the assigns",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (categoryItem: Assigned) => {
    setCategoryToDelete(categoryItem);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await Assigns.DeleteAssign(categoryToDelete._id);
      await getAssigned(); // Refresh the list
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Category deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error deleting assigns",
        description: "An error occurred while deleting the assigns",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <>
      <div className="container mx-auto">
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute left-36 top-12">
            <BackButton />
          </div>
          {user?.isAdmin && (
            <div className="absolute right-36 top-12">
              <AddAssign setAssign={setAssign} setLoading={setLoading} />
            </div>
          )}
          <h1 className="text-4xl font-bold text-center py-7">Assignee List</h1>
        </div>
        <Table>
          <TableHeader className="bg-slate-200 ">
            <TableRow>
              <TableHead className="text-center font-bold text-black w-40">Name</TableHead>
              <TableHead className="text-center font-bold text-black w-96">Department</TableHead>
              <TableHead className="text-center font-bold text-black w-16">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assigns.map((memo, index) => (
              <TableRow key={memo._id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <TableCell className="font-medium text-center">{memo.name}</TableCell>
                <TableCell className="text-center">{memo.role}</TableCell>
                <TableCell className="text-center flex justify-center gap-2 items-center">
                  <div onClick={() => handleEdit(memo)}>
                    <Edit className="text-blue-500 cursor-pointer" />
                  </div>
                  <div onClick={() => handleDelete(memo)}>
                    <Trash2Icon className="text-red-500 cursor-pointer" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[500px] h-[400px] max-w-none bg-[#eef4ff]">
          <DialogHeader>
            <DialogTitle className="text-2xl drop-shadow-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
              Edit Category
            </DialogTitle>
            <DialogDescription>Edit the details here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 h-full pl-4">
            <Label htmlFor="assignName" className="text-base font-bold">
              <p>Category </p>
            </Label>
            <Input
              name="assignName"
              placeholder="Assign Name"
              type="text"
              required
              className="!mb-2"
              value={editedAssign}
              onChange={(e) => setEditedAssign(e.target.value)}
            />
            <Label htmlFor="role" className="text-base font-bold">
              Department
            </Label>
            <Select onValueChange={setEditedRole} value={editedRole}>
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="IT">IT Department</SelectItem>
                  <SelectItem value="HR">HR Department</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" className="mr-10 px-10" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this assigns?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assigns.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default CreateAssign;
