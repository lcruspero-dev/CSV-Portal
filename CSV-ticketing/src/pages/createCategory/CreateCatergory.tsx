import { useEffect, useState } from "react";
import { Category } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingComponent from "@/components/ui/loading";
import AddCategory from "./AddCategory";
import { Edit, Trash2, Building, Tag, MoreVertical, Search } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Categorys {
  _id: string;
  category: string;
  role: string;
}

export interface User {
  _id: string;
  name: string;
  isAdmin: boolean;
  email: string;
}

function CreateCategory() {
  const [category, setCategory] = useState<Categorys[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Categorys[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingCategory, setEditingCategory] = useState<Categorys | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [editedRole, setEditedRole] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Categorys | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const { toast } = useToast();

  const userString = localStorage.getItem("user");
  const user: User | null = userString ? JSON.parse(userString) : null;

  const getCategory = async () => {
    try {
      const response = await Category.getCategory();
      setCategory(response.data.categories);
      setFilteredCategories(response.data.categories);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  // Filter categories based on search and department
  useEffect(() => {
    let filtered = category;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cat =>
        cat.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(cat => cat.role === departmentFilter);
    }

    setFilteredCategories(filtered);
  }, [category, searchTerm, departmentFilter]);

  const handleEdit = (categoryItem: Categorys) => {
    setEditingCategory(categoryItem);
    setEditedCategoryName(categoryItem.category);
    setEditedRole(categoryItem.role);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;

    try {
      const body = {
        category: editedCategoryName,
        role: editedRole,
      };
      await Category.updateCategory(editingCategory._id, body);
      await getCategory(); // Refresh the list
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Category updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error updating category",
        description: "An error occurred while updating the category",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (categoryItem: Categorys) => {
    setCategoryToDelete(categoryItem);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await Category.DeleteCatergory(categoryToDelete._id);
      await getCategory(); // Refresh the list
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Category deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error deleting category",
        description: "An error occurred while deleting the category",
        variant: "destructive",
      });
    }
  };

  const getDepartmentColor = (role: string) => {
    switch (role) {
      case "IT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "HR":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-6">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Category Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and organize ticket categories across departments
              </p>
            </div>
          </div>
          
          {user?.isAdmin && (
            <div className="flex items-center gap-4">
              <div className="bg-white px-4 py-3 rounded-lg border shadow-sm">
                <div className="text-sm text-gray-600">Total Categories</div>
                <div className="text-2xl font-bold text-gray-900">{category.length}</div>
              </div>
              <AddCategory setCategory={setCategory} setLoading={setLoading} />
            </div>
          )}
        </div>

        {/* Filters Section */}
        <Card className="mb-6 shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search categories or departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Department Filter */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-48">
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

              {/* Clear Filters */}
              {(searchTerm || departmentFilter !== "all") && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Tag className="h-5 w-5 text-blue-600" />
              All Categories
            </CardTitle>
            <CardDescription>
              {filteredCategories.length} category{filteredCategories.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700 w-1/3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Category Name
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 w-1/3">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Department
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 w-1/3 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12">
                      <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                      <p className="text-gray-600">
                        {searchTerm || departmentFilter !== "all" 
                          ? "Try adjusting your search or filters" 
                          : "No categories have been created yet"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((categoryItem, index) => (
                    <TableRow 
                      key={categoryItem._id} 
                      className={`hover:bg-gray-50/50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Tag className="h-4 w-4 text-blue-600" />
                          </div>
                          {categoryItem.category}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getDepartmentColor(categoryItem.role)}`}>
                          <Building className="h-3 w-3 mr-1" />
                          {categoryItem.role} Department
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {user?.isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(categoryItem)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Category
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(categoryItem)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Category
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        {category.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Categories</p>
                    <p className="text-2xl font-bold">{category.length}</p>
                  </div>
                  <Tag className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">IT Categories</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {category.filter(cat => cat.role === "IT").length}
                    </p>
                  </div>
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">HR Categories</p>
                    <p className="text-2xl font-bold text-green-600">
                      {category.filter(cat => cat.role === "HR").length}
                    </p>
                  </div>
                  <Building className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Category
            </DialogTitle>
            <DialogDescription>
              Update the category details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName" className="text-sm font-medium">
                Category Name
              </Label>
              <Input
                id="categoryName"
                placeholder="Enter category name"
                value={editedCategoryName}
                onChange={(e) => setEditedCategoryName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Department
              </Label>
              <Select onValueChange={setEditedRole} value={editedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="IT">IT Department</SelectItem>
                    <SelectItem value="HR">HR Department</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.category}"? 
              This action cannot be undone and will permanently remove the category from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CreateCategory;