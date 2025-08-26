import { ScheduleAndAttendanceAPI, UserAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

interface Employee {
  _id: string;
  name: string;
  department: string;
  position: string;
  avatarUrl?: string;
}

interface TeamLeader {
  _id: string;
  teamLeader: string; // Use the `teamLeader` field for display and value
}

interface AddEmployeeProps {
  onEmployeeAdded: () => Promise<void>;
}

const AddEmployee: React.FC<AddEmployeeProps> = ({
  // onAdd,
  onEmployeeAdded,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);
  const [selectedTeamLeader, setSelectedTeamLeader] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation dialog
  const [existingEntry, setExistingEntry] = useState<{
    employeeName: string;
    teamLeader: string;
  } | null>(null); // Store existing entry details

  useEffect(() => {
    const searchEmployees = async () => {
      if (searchQuery.length > 2) {
        try {
          const response = await UserAPI.searchUser(searchQuery);
          const filteredEmployees = response.data.filter(
            (emp: { status: string }) => emp.status !== "inactive"
          );
          setEmployees(filteredEmployees);
        } catch (error) {
          console.error("Error fetching employees", error);
          toast({
            title: "Error",
            description: "Failed to fetch employees. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        setEmployees([]);
      }
    };

    const debounceTimeout = setTimeout(searchEmployees, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  useEffect(() => {
    const fetchTeamLeaders = async () => {
      try {
        const response = await ScheduleAndAttendanceAPI.getTeamLeader();
        setTeamLeaders(response.data); // Set the team leaders from the API response
      } catch (error) {
        console.error("Error fetching team leaders", error);
        toast({
          title: "Error",
          description: "Failed to fetch team leaders. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchTeamLeaders();
  }, []);

  const handleAddEmployee = async () => {
    if (!selectedEmployee || !selectedTeamLeader || !selectedPosition) return;

    setIsSubmitting(true);
    try {
      // Check if the employee is already a member of the team leader
      const existingEntryResponse =
        await ScheduleAndAttendanceAPI.checkExistingEntry({
          employeeId: selectedEmployee._id,
        });

      if (existingEntryResponse.data.exists) {
        // Show confirmation dialog
        setExistingEntry({
          employeeName: existingEntryResponse.data.employeeName,
          teamLeader: existingEntryResponse.data.teamLeader,
        });
        setShowConfirmation(true);
        return; // Stop further execution until user confirms
      }

      // If no existing entry or user confirms, proceed to create/update
      await proceedWithAddEmployee();
    } catch (error) {
      console.error("Error creating schedule entry", error);
      toast({
        title: "Error",
        description: "Failed to add employee to schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const proceedWithAddEmployee = async () => {
    try {
      // Send the selected employee data to the schedule entry API
      await ScheduleAndAttendanceAPI.createScheduleEntry({
        employeeId: selectedEmployee?._id,
        employeeName: selectedEmployee?.name,
        teamLeader: selectedTeamLeader,
        position: selectedPosition,
      });

      // Call the onAdd callback to update the parent component
      if (selectedEmployee) {
        // onAdd(selectedEmployee);
      }

      // Show success message
      toast({
        title: "Success",
        description: `${selectedEmployee?.name} has been added.`,
      });

      // Reset and close the dialog
      resetForm();

      // Call the onEmployeeAdded callback after successful addition
      if (onEmployeeAdded) {
        await onEmployeeAdded(); // Make sure to await this if it's async
      }
    } catch (error) {
      console.error("Error creating schedule entry", error);
      toast({
        title: "Error",
        description: "Failed to add employee to schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setSearchQuery(emp.name); // Update search input with the selected name
  };

  const resetForm = () => {
    setIsOpen(false);
    setSearchQuery("");
    setSelectedEmployee(null);
    setSelectedTeamLeader("");
    setSelectedPosition("");
    setShowConfirmation(false); // Close confirmation dialog
    setExistingEntry(null); // Clear existing entry details
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Employee</Button>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
          setIsOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              {!selectedEmployee ? (
                <>
                  <Label>Search Employee</Label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedEmployee) setSelectedEmployee(null);
                    }}
                    placeholder="Search employee..."
                  />
                  {employees.length > 0 && (
                    <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                      {employees.map((emp) => (
                        <div
                          key={emp._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center"
                          onClick={() => handleSelectEmployee(emp)}
                        >
                          {emp.avatarUrl && (
                            <div className="w-6 h-6 rounded-full mr-2 overflow-hidden">
                              <img
                                src={emp.avatarUrl}
                                alt={emp.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <span className="font-medium">{emp.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Label>Selected Employee</Label>
                  <div className="mt-2 p-1 border rounded-md bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">{selectedEmployee.name}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setSelectedEmployee(null);
                          setSearchQuery("");
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  {/* Position selection */}
                  <div className="mt-4 mb-2">
                    <Label>Position</Label>
                    <Select
                      value={selectedPosition}
                      onValueChange={setSelectedPosition}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select Position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSR">CSR</SelectItem>
                        <SelectItem value="Human Resources">
                          Human Resources
                        </SelectItem>
                        <SelectItem value="IT Specialist">
                          IT Specialist
                        </SelectItem>
                        <SelectItem value="Team Manager">
                          Team Manager
                        </SelectItem>
                        <SelectItem value="Team Leader">Team Leader</SelectItem>
                        <SelectItem value="Executive Assistant">
                          Executive Assistant
                        </SelectItem>
                        <SelectItem value="Corporate Recruiter">
                          Corporate Recruiter
                        </SelectItem>
                        <SelectItem value="Operation Manager">
                          Operation Manager
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Team Leader selection */}
                  <div className="mt-4 mb-2">
                    <Label>Group</Label>
                    <Select
                      value={selectedTeamLeader}
                      onValueChange={setSelectedTeamLeader}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamLeaders.map((leader) => (
                          <SelectItem
                            key={leader._id}
                            value={leader.teamLeader}
                          >
                            {leader.teamLeader}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="text-xs">
            <Button
              variant="outline"
              onClick={resetForm} // Clear all states on cancel
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="w-24"
              onClick={handleAddEmployee}
              disabled={
                !selectedEmployee ||
                isSubmitting ||
                !selectedTeamLeader ||
                !selectedPosition
              }
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            {existingEntry?.employeeName} is already a member of{" "}
            {existingEntry?.teamLeader}. Do you want to continue the changes?
          </p>
          <DialogFooter>
            <Button
              className="text-xs w-16"
              variant="outline"
              onClick={() => {
                setShowConfirmation(false);
                setIsSubmitting(false); // Make sure to reset submitting state
              }}
            >
              No
            </Button>
            <Button
              className="text-xs w-16"
              onClick={async () => {
                setShowConfirmation(false);
                await proceedWithAddEmployee(); // Make sure to await this
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddEmployee;
