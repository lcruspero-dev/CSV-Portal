/* eslint-disable @typescript-eslint/no-unused-vars */
import { LeaveCreditAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import ExportLeaveCredits from "@/pages/exportData/ExportLeaveData";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LeaveHistoryItem {
  date: string;
  description: string;
  days: number;
  ticket: string;
  status: string;
  _id: string;
}

interface EmployeeLeaveCredit {
  _id: string;
  employeeId: string;
  employeeName: string;
  annualLeaveCredit: number;
  currentBalance: number;
  startDate: string;
  accrualRate: number;
  lastAccrualDate: string;
  nextAccrualDate: string;
  timezone: string;
  history: LeaveHistoryItem[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  isActive?: boolean;
  startingLeaveCredit?: number;
  employmentStatus?: "Probationary" | "Regular"; // Added employment status
}

const LoadingState = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h2 className="mt-6 text-xl font-semibold text-gray-800">
          Loading Leave Credits
        </h2>
        <p className="mt-2 text-gray-600">Preparing your employee data...</p>
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const calculateDaysTenure = (startDate: string): number => {
  const start = new Date(startDate);
  const today = new Date();

  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
};

const calculateUsedDays = (history: LeaveHistoryItem[]): number => {
  if (!history || history.length === 0) return 0;

  return history.reduce((total, item) => {
    if (item.status === "Approved") {
      return total + item.days;
    }
    return total;
  }, 0);
};

const LeaveCredit = () => {
  const { toast } = useToast();
  const [allEmployees, setAllEmployees] = useState<EmployeeLeaveCredit[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<
    EmployeeLeaveCredit[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] =
    useState<EmployeeLeaveCredit | null>(null);
  const [editedCredit, setEditedCredit] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [editedStartDate, setEditedStartDate] = useState("");
  const [editedEmploymentStatus, setEditedEmploymentStatus] = useState<
    "Probationary" | "Regular"
  >("Probationary");

  const navigate = useNavigate();

  const employeesPerPage = 10; // Reduced for better mobile display

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setShowLoading(false);
    }, 500);

    const fetchLeaveCredits = async () => {
      try {
        const response = await LeaveCreditAPI.getLeaveCredit();
        if (response.data) {
          const activeEmployees = response.data.filter(
            (emp: EmployeeLeaveCredit) => emp.isActive !== false
          );
          setAllEmployees(activeEmployees);
          setFilteredEmployees(activeEmployees);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load leave credits",
          variant: "destructive",
        });
      }
    };

    fetchLeaveCredits();

    return () => {
      clearTimeout(loadingTimer);
    };
  }, [toast]);

  useEffect(() => {
    const filtered = allEmployees.filter((employee) =>
      employee?.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchTerm, allEmployees]);

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const handleEditClick = (employee: EmployeeLeaveCredit) => {
    setCurrentEmployee(employee);
    setEditedCredit(employee.currentBalance);
    setEditedStartDate(employee.startDate);
    setEditedEmploymentStatus(employee.employmentStatus || "Probationary");
    setIsEditDialogOpen(true);
  };

  const handleViewHistory = (employee: EmployeeLeaveCredit) => {
    setCurrentEmployee(employee);
    setIsHistoryDialogOpen(true);
  };

  const handleDeleteClick = (employee: EmployeeLeaveCredit) => {
    setCurrentEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!currentEmployee) return;

    setIsDeleting(true);
    try {
      const response = await LeaveCreditAPI.updateLeaveCredit(
        currentEmployee._id,
        {
          isActive: false,
        }
      );

      if (response.data) {
        setAllEmployees((prevEmployees) =>
          prevEmployees.filter((emp) => emp._id !== currentEmployee._id)
        );
        toast({
          title: "Success",
          description: "Leave record deleted successfully",
          variant: "default",
        });
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete leave record",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!currentEmployee) return;

    setIsSaving(true);
    try {
      const response = await LeaveCreditAPI.updateLeaveCredit(
        currentEmployee._id,
        {
          currentBalance: editedCredit,
          employmentStatus: editedEmploymentStatus,
        }
      );

      if (response.data) {
        setAllEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp._id === currentEmployee._id
              ? {
                  ...emp,
                  currentBalance: editedCredit,
                  employmentStatus: editedEmploymentStatus,
                  annualLeaveCredit:
                    response.data.annualLeaveCredit || emp.annualLeaveCredit,
                  updatedAt: response.data.updatedAt || emp.updatedAt,
                }
              : emp
          )
        );
        toast({
          title: "Success",
          description: "Leave credit updated successfully",
          variant: "default",
        });
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update leave credit",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (showLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4 pt-0">
      <Card className="w-full max-w-screen-2xl shadow-lg overflow-x-auto">
        <CardHeader className="space-y-4">
          <div className="relative flex items-center justify-center">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="absolute left-0 text-blue-600 hover:text-blue-800 p-0 hover:bg-transparent"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>

            <div className="text-center">
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
                Employee Leave Credits
              </CardTitle>
              <p className="text-sm md:text-base text-gray-500 mt-2">
                Manage and update employee leave balances
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-64 ">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search employees..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ExportLeaveCredits employees={filteredEmployees} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="min-w-[120px] text-center">
                    Employee
                  </TableHead>
                  <TableHead className="min-w-[100px] text-center">
                    Start Date
                  </TableHead>
                  <TableHead className="min-w-[120px] text-center">
                    Status
                  </TableHead>
                  <TableHead className="min-w-[100px] text-center">
                    Days Tenure
                  </TableHead>
                  <TableHead className="min-w-[80px] text-center">
                    Starting
                  </TableHead>
                  <TableHead className="min-w-[80px] text-center">
                    Used
                  </TableHead>
                  <TableHead className="min-w-[100px] text-center">
                    Current
                  </TableHead>
                  <TableHead className="min-w-[120px] text-center">
                    Next Accrual
                  </TableHead>
                  <TableHead className="min-w-[100px] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((employee) => {
                    const usedDays = calculateUsedDays(employee.history);
                    const daysTenure = calculateDaysTenure(employee.startDate);

                    return (
                      <TableRow key={employee._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-center">
                          <div className="line-clamp-1">
                            {employee.employeeName}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {formattedDate(employee.startDate)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              employee.employmentStatus === "Regular"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {employee.employmentStatus || "Probationary"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {daysTenure} days
                        </TableCell>
                        <TableCell className="text-center">
                          {employee.startingLeaveCredit} days
                        </TableCell>
                        <TableCell className="text-red-600 text-center">
                          {usedDays} days
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {employee.currentBalance} days
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {formattedDate(employee.nextAccrualDate)}
                        </TableCell>
                        <TableCell className="flex justify-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewHistory(employee)}
                            className="text-green-600 hover:text-green-800 h-8 w-8"
                            title="History"
                          >
                            <Calendar className="h-5 w-5" />
                          </Button>
                          <div className="flex items-center border-l border-gray-200 pl-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(employee)}
                              className="text-blue-600 hover:text-blue-800 h-8 w-8 mr-2"
                              title="Edit"
                            >
                              <Pencil className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(employee)}
                              className="text-red-600 hover:text-red-800 h-8 w-8"
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />{" "}
                              {/* You'll need to import Trash2 from lucide-react */}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredEmployees.length > employeesPerPage && (
            <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstEmployee + 1} to{" "}
                {Math.min(indexOfLastEmployee, filteredEmployees.length)} of{" "}
                {filteredEmployees.length} employees
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only">Previous</span>
                </Button>
                <div className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only md:not-sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Edit Leave Credit Data
            </DialogTitle>
            <DialogDescription>
              Name: {currentEmployee?.employeeName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                value={editedStartDate ? formattedDate(editedStartDate) : ""}
                className="col-span-3"
                disabled
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employmentStatus" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <select
                  id="employmentStatus"
                  value={editedEmploymentStatus}
                  onChange={(e) =>
                    setEditedEmploymentStatus(
                      e.target.value as "Probationary" | "Regular"
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Probationary">Probationary</option>
                  <option value="Regular">Regular</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentBalance" className="text-right">
                Current Balance
              </Label>
              <Input
                id="currentBalance"
                type="number"
                value={editedCredit}
                onChange={(e) => setEditedCredit(Number(e.target.value))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextAccrual" className="text-right">
                Next Accrual
              </Label>
              <Input
                id="nextAccrual"
                value={
                  currentEmployee?.nextAccrualDate
                    ? formattedDate(currentEmployee.nextAccrualDate)
                    : ""
                }
                className="col-span-3"
                disabled
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="scale-95"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 scale-95"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Leave History for {currentEmployee?.employeeName}
            </DialogTitle>
            <DialogDescription>
              View all leave requests and usage
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">
                  Starting Balance
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {currentEmployee?.startingLeaveCredit} days
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-red-800">Used Days</h3>
                <p className="text-2xl font-bold text-red-600">
                  {calculateUsedDays(currentEmployee?.history || [])} days
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">
                  Current Balance
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {currentEmployee?.currentBalance} days
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Days</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Ticket</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-center">
                {currentEmployee?.history &&
                currentEmployee.history.length > 0 ? (
                  currentEmployee.history.map((history) => (
                    <TableRow key={history._id}>
                      <TableCell>{formattedDate(history.date)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {history.description
                          .split("\n")
                          .find((line) => line.includes("Leave Type:"))
                          ?.split("Leave Type:")[1]
                          ?.trim()}
                      </TableCell>

                      <TableCell>{history.days}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            history.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : history.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {history.status}
                        </span>
                      </TableCell>
                      <TableCell>{history.ticket}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No leave history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsHistoryDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Delete Leave Record
            </DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {currentEmployee?.employeeName}'s
              </span>{" "}
              leave data?
              <br />
              This action cannot be undone. This will permanently delete the
              record.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-center space-x-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveCredit;
