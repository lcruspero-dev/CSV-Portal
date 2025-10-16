import { useEffect, useState } from "react";
import { Assigns } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingComponent from "@/components/ui/loading";
import { Edit, Trash2Icon, Users, Search, Filter } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
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

  // Filter assigns based on search and role filter
  const filteredAssigns = assigns.filter(assign => {
    const matchesSearch = assign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || assign.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
      await getAssigned();
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Assignee updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error updating assignee",
        description: "An error occurred while updating the assignee",
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
      await getAssigned();
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Assignee deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error deleting assignee",
        description: "An error occurred while deleting the assignee",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === "IT" ? "default" : "secondary";
  };

  const getRoleDisplayName = (role: string) => {
    return role === "IT" ? "IT Department" : "HR Department";
  };

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <BackButton />
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#1638df] to-[#192fb4]">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
                  Assignee List
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  {filteredAssigns.length} assignee{filteredAssigns.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>
          
          {user?.isAdmin && (
            <div className="flex-shrink-0">
              <AddAssign setAssign={setAssign} setLoading={setLoading} />
            </div>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search assignees by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="IT">IT Department</SelectItem>
                  <SelectItem value="HR">HR Department</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-[#1638df] to-[#192fb4]">
                <TableRow className="hover:bg-transparent border-b-0">
                  <TableHead className="text-white font-semibold text-center py-4">
                    Name
                  </TableHead>
                  <TableHead className="text-white font-semibold text-center py-4">
                    Department
                  </TableHead>
                  {user?.isAdmin && (
                    <TableHead className="text-white font-semibold text-center py-4">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssigns.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={user?.isAdmin ? 3 : 2} 
                      className="text-center py-12 text-gray-500"
                    >
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No assignees found</p>
                      <p className="text-sm mt-1">
                        {searchTerm || roleFilter !== "all" 
                          ? "Try adjusting your search or filter criteria" 
                          : "Get started by adding your first assignee"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssigns.map((assign, index) => (
                    <TableRow 
                      key={assign._id} 
                      className={`transition-colors hover:bg-blue-50/30 ${
                        index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                      }`}
                    >
                      <TableCell className="font-medium text-center py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-semibold text-gray-800">{assign.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge 
                          variant={getRoleBadgeVariant(assign.role)}
                          className="px-3 py-1 text-sm font-medium"
                        >
                          {getRoleDisplayName(assign.role)}
                        </Badge>
                      </TableCell>
                      {user?.isAdmin && (
                        <TableCell className="text-center py-4">
                          <div className="flex justify-center items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(assign)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(assign)}
                              className="h-8 w-8 p-0 hover:bg-red-50 text-red-600 hover:text-red-700"
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px] w-[95vw] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50/30 border-blue-200/60 shadow-xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#1638df] to-[#192fb4]">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
                  Edit Assignee
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update assignee details below.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="editAssignName" className="text-sm font-semibold text-gray-700">
                Name
              </Label>
              <Input
                id="editAssignName"
                placeholder="Enter assignee name"
                type="text"
                required
                value={editedAssign}
                onChange={(e) => setEditedAssign(e.target.value)}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="editRole" className="text-sm font-semibold text-gray-700">
                Department
              </Label>
              <Select onValueChange={setEditedRole} value={editedRole}>
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
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center border-t border-gray-200 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSaveEdit}
              disabled={!editedAssign.trim() || !editedRole.trim()}
              className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-[#1638df] to-[#192fb4] hover:from-[#192fb4] hover:to-[#1638df] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px] w-[95vw]">
          <AlertDialogHeader>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-red-100">
                <Trash2Icon className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-red-800">
                Delete Assignee
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600 text-base">
              Are you sure you want to delete <span className="font-semibold text-gray-800">{categoryToDelete?.name}</span>? 
              This action cannot be undone and will permanently remove this assignee from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 mt-0 border-gray-300 hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
            >
              Delete Assignee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default CreateAssign;