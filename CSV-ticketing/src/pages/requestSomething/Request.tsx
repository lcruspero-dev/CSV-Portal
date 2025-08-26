/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category, LeaveCreditAPI, TicketAPi } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { format } from "date-fns";
import { Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/kit/BackButton";

interface LeaveBalance {
  currentBalance: number;
  nextAccrualDate: string;
  employmentStatus: string;
}

const Request = () => {
  const userLogin = JSON.parse(localStorage.getItem("user")!);

  const [form, setForm] = useState({
    name: `${userLogin.name}`,
    email: `${userLogin.email}`,
    category: "",
    description: "",
    purpose: "",
    file: null,
    department: "HR",
    leaveType: "",
    leaveCategory: "",
    leaveReason: "",
    startDate: "",
    endDate: "",
    delegatedTasks: "",
    formDepartment: "Marketing",
    leaveDays: 0,
    selectedDates: [] as Date[],
    isPaidLeave: true,
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [updatedBalance, setUpdatedBalance] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showLeaveTypeDialog, setShowLeaveTypeDialog] = useState(false);

  // Fetch leave balance on component mount
  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const response = await LeaveCreditAPI.getLeaveCreditById();
        const data = await response.data;
        setLeaveBalance(data);
      } catch (error) {
        console.error("Error fetching leave balance:", error);
      }
    };

    fetchLeaveBalance();
  }, []);

  // Calculate leave days when leave category or dates change
  useEffect(() => {
    if (form.category === "Leave Request" && form.isPaidLeave) {
      let days = 0;

      if (form.leaveCategory === "Full-Day Leave") {
        days = form.selectedDates.length;
      } else if (form.leaveCategory && form.startDate) {
        days = 0.5;
      }

      setForm((prev) => ({ ...prev, leaveDays: days }));

      if (leaveBalance) {
        setUpdatedBalance(leaveBalance.currentBalance - days);
      }
    } else if (form.category === "Leave Request" && !form.isPaidLeave) {
      let days = 0;
      if (form.leaveCategory === "Full-Day Leave") {
        days = form.selectedDates.length;
      } else if (form.leaveCategory && form.startDate) {
        days = 0.5;
      }
      setForm((prev) => ({ ...prev, leaveDays: days }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.startDate,
    form.leaveCategory,
    form.selectedDates,
    leaveBalance,
    form.isPaidLeave,
  ]);

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) return;

    // Only cap dates if it's paid leave and we have a leave balance
    if (form.isPaidLeave && leaveBalance) {
      // Cap the selected dates at the current leave balance
      const maxSelectableDates = Math.min(
        dates.length,
        leaveBalance.currentBalance
      );
      const cappedDates = dates.slice(0, maxSelectableDates);
      setForm((prev) => ({ ...prev, selectedDates: cappedDates }));
    } else {
      // For unpaid leave or when no balance info, just set all selected dates
      setForm((prev) => ({ ...prev, selectedDates: dates }));
    }
  };

  // Also update the isDateDisabled function to account for paid/unpaid leave
  const isDateDisabled = (date: Date) => {
    if (!leaveBalance || !form.isPaidLeave) return false;

    // If we've already selected the maximum allowed dates for paid leave, disable other dates
    return (
      form.selectedDates.length >= leaveBalance.currentBalance &&
      !form.selectedDates.some(
        (selectedDate) => selectedDate.getTime() === date.getTime()
      )
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      const newFilename = response.data.filename;
      setForm((prevForm) => ({ ...prevForm, file: newFilename }));
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === "Leave Request") {
      setShowLeaveTypeDialog(true);
    }
    setForm({ ...form, category: value });
  };
  const isRegularEmployee = leaveBalance?.employmentStatus === "Regular";
  const handleLeaveTypeSelect = (type: "paid" | "unpaid") => {
    // If trying to select paid but not regular employee, force unpaid
    const actualType = type === "paid" && !isRegularEmployee ? "unpaid" : type;

    setForm((prev) => ({
      ...prev,
      isPaidLeave: actualType === "paid",
      selectedDates: [],
      startDate: "",
      endDate: "",
      leaveDays: 0,
    }));
    setShowLeaveTypeDialog(false);

    // Show toast if trying to select paid but not eligible
    if (type === "paid" && !isRegularEmployee) {
      toast({
        title: "Paid Leave Not Available",
        description: "Only regular employees can use paid leave.",
        variant: "destructive",
      });
    }
  };

  const formatDateToMMDDYYYY = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
  };

  const formatSelectedDates = () => {
    if (form.selectedDates.length === 0) return "No dates selected";
    return form.selectedDates
      .map((date) => format(date, "MM/dd/yyyy"))
      .join(", ");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let description = "";

      if (form.category === "Leave Request") {
        let dateRange = "";
        if (form.leaveCategory === "Full-Day Leave") {
          dateRange = `Selected Dates: ${formatSelectedDates()}`;
        } else {
          dateRange = `Date: ${formatDateToMMDDYYYY(form.startDate)}`;
        }

        description = `Leave Request Details:
• Leave Type: ${form.leaveType}
• Leave Category: ${form.leaveCategory}
• Leave Status: ${form.isPaidLeave ? "Paid" : "Unpaid"}
• Department: ${form.formDepartment}
• ${dateRange}
• Days Requested: ${form.leaveDays} ${form.leaveDays <= 1 ? "day" : "days"}
• Reason: ${form.leaveReason}
• Tasks to be Delegated: ${form.delegatedTasks}`;
      } else if (form.category === "Certificate of Employment") {
        description = `Purpose: ${form.purpose}\nDetails: ${form.description}`;
      } else {
        description = form.description;
      }

      const response = await TicketAPi.createTicket({
        ...form,
        description,
        startDate:
          form.leaveCategory === "Full-Day Leave" &&
          form.selectedDates.length > 0
            ? format(form.selectedDates[0], "yyyy-MM-dd")
            : form.startDate,
        endDate:
          form.leaveCategory === "Full-Day Leave" &&
          form.selectedDates.length > 0
            ? format(
                form.selectedDates[form.selectedDates.length - 1],
                "yyyy-MM-dd"
              )
            : form.startDate,
      });

      toast({
        title: "Ticket created successfully",
        description: `Ticket #${response.data.ticketNumber} has been created`,
        variant: "default",
      });
      navigate("/view-ticket");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategory = async () => {
    try {
      const response = await Category.getHrCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  const renderLeaveRequestContent = () => {
    return (
      <div className="mt-4">
        {/* Leave Balance Display - Only show for paid leave */}
        {form.isPaidLeave && leaveBalance && (
          <div className="mb-4 p-3 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">
                  Current Leave Balance:
                </span>
                <span className="ml-2 font-bold">
                  {leaveBalance.currentBalance}{" "}
                  {leaveBalance.currentBalance <= 1 ? "day" : "days"}
                </span>
              </div>
              {updatedBalance !== null && (
                <div>
                  <span className="text-sm font-medium">
                    Balance After Leave:
                  </span>
                  <span className="ml-2 font-bold text-red-500">
                    {updatedBalance} {updatedBalance <= 1 ? "day" : "days"}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Next accrual:{" "}
              {new Date(leaveBalance.nextAccrualDate).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Leave Status Indicator */}
        <div className="mb-4 p-2 rounded-md bg-blue-50 border border-blue-100">
          <span className="font-medium">Leave Status: </span>
          <span
            className={`font-bold ${
              form.isPaidLeave ? "text-blue-600" : "text-gray-600"
            }`}
          >
            {form.isPaidLeave ? "Paid Leave" : "Unpaid Leave"}
          </span>
          {!form.isPaidLeave && (
            <p className="text-sm text-gray-600 mt-1">
              This leave will not deduct from your leave credits.
            </p>
          )}
        </div>

        <Label htmlFor="leaveType" className="text-sm font-bold">
          Leave Type <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={(value) => setForm({ ...form, leaveType: value })}
          required
        >
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
              <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
              <SelectItem value="Vacation Leave">Vacation Leave</SelectItem>
              <SelectItem value="Sick Leave">Sick Leave</SelectItem>
              <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
              <SelectItem value="Bereavement Leave">
                Bereavement Leave
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Label htmlFor="leaveCategory" className="text-sm font-bold">
          Leave Category <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={(value) => {
            setForm({
              ...form,
              leaveCategory: value,
              startDate: "",
              endDate: "",
              selectedDates: [],
            });
          }}
          required
        >
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="Select leave category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="AM Leave">AM Leave</SelectItem>
              <SelectItem value="PM Leave">PM Leave</SelectItem>
              <SelectItem value="Full-Day Leave">Full-Day Leave</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Label htmlFor="department" className="text-sm font-bold">
          Department <span className="text-red-500">*</span>
        </Label>
        <Select
          value={form.formDepartment}
          onValueChange={(value) => setForm({ ...form, formDepartment: value })}
          required
        >
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Date Selection based on Leave Category */}
        {form.leaveCategory === "Full-Day Leave" ? (
          <div className="mb-2 text-sm">
            <Label className="text-sm font-bold">
              Select Leave Dates <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal mb-2"
                >
                  {form.selectedDates.length > 0
                    ? `${form.selectedDates.length} date(s) selected`
                    : "Pick dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="multiple"
                  selected={form.selectedDates}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={isDateDisabled}
                />
              </PopoverContent>
            </Popover>
            {form.selectedDates.length > 0 && (
              <div className="text-sm text-gray-600 mb-2">
                Selected: {formatSelectedDates()}
                {leaveBalance &&
                  form.selectedDates.length === leaveBalance.currentBalance &&
                  form.isPaidLeave === true && (
                    <div className="text-red-600 mt-1">
                      You've reached your maximum leave balance. Cannot select
                      more dates.
                    </div>
                  )}
              </div>
            )}
          </div>
        ) : (
          (form.leaveCategory === "AM Leave" ||
            form.leaveCategory === "PM Leave") && (
            <div>
              <Label htmlFor="startDate" className="text-sm font-bold">
                Leave Date <span className="text-red-500">*</span>
              </Label>
              <Input
                name="startDate"
                type="date"
                required
                className="!mb-2"
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          )
        )}

        {/* Display calculated leave days */}
        {form.leaveDays > 0 && (
          <div className="mb-2 p-2 bg-blue-50 rounded-md">
            <span className="text-sm font-medium">Leave Days Requested:</span>
            <span className="ml-2 font-bold">
              {form.leaveDays} {form.leaveDays <= 1 ? "day" : "days"}
            </span>
          </div>
        )}

        <Label htmlFor="leaveReason" className="text-sm font-bold">
          Why are you requesting for a leave?{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Textarea
          className="h-24 mb-2"
          name="leaveReason"
          placeholder="Please provide the reason for your leave"
          required
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <Label htmlFor="delegatedTasks" className="text-sm font-bold">
          Tasks to be delegated while out of office{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Textarea
          className="h-24"
          name="delegatedTasks"
          placeholder="List tasks that need to be handled by others during your absence"
          onChange={handleChange}
          disabled={isSubmitting}
        />

        {/* Moved file attachment to bottom for leave requests */}
        <Label
          htmlFor="attachment"
          className="text-sm font-bold flex items-center mt-4"
        >
          <Paperclip className="mr-2" size={20} />
          Attach File (Optional)
        </Label>
        <Input
          id="attachment"
          name="attachment"
          type="file"
          onChange={handleFileUpload}
          className="mt-1 cursor-pointer mb-4"
        />

        <Button className="w-full mt-2" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Leave Request"}
        </Button>
      </div>
    );
  };

  return (
    <div className="container flex justify-center p-3">
      <div className="text-xs">
        <BackButton />
      </div>
      <form className="w-1/2" onSubmit={handleSubmit}>
        <div className="text-center">
          <div className="mb-3"></div>
          <h1 className="text-xl sm:text-xl md:text-xl lg:text-2xl font-bold py-1 sm:py-1 md:py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Create HR Request Ticket
          </h1>
          <p className="text-lg sm:text-xl md:text-xl lg:text-xl font-bold text-black">
            Please fill out the form below
          </p>
        </div>

        {/* File attachment moved to leave request section */}
        {form.category !== "Leave Request" && (
          <>
            <Label
              htmlFor="attachment"
              className="text-sm font-bold flex items-center mt-2"
            >
              <Paperclip className="mr-2" size={20} />
              Attach File (Optional)
            </Label>
            <Input
              id="attachment"
              name="attachment"
              type="file"
              onChange={handleFileUpload}
              className="mt-1 cursor-pointer"
            />
          </>
        )}

        <Label htmlFor="name" className="text-sm font-bold">
          <p>Name</p>
        </Label>
        <Input
          name="name"
          placeholder="Name"
          type="text"
          required
          className="!mb-2"
          value={form.name}
          readOnly
        />
        <Label htmlFor="email" className="text-sm font-bold">
          Email
        </Label>
        <Input
          name="email"
          placeholder="Email"
          type="email"
          required
          className="!mb-2"
          value={form.email}
          readOnly
        />
        <Label htmlFor="category" className="text-sm font-bold">
          Category
        </Label>
        <Select onValueChange={handleCategoryChange} required>
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categories.map((category: any) => (
                <SelectItem key={category.category} value={category.category}>
                  {category.category}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {form.category !== "Leave Request" && (
          <>
            {form.category === "Certificate of Employment" && (
              <>
                <Label htmlFor="purpose" className="text-sm font-bold">
                  Purpose *
                </Label>
                <Input
                  name="purpose"
                  placeholder="Purpose for requesting Certificate of Employment"
                  type="text"
                  required
                  className="!mb-2"
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </>
            )}
            <Label htmlFor="description" className="text-sm font-bold">
              Description of the request
            </Label>
            <Textarea
              className="h-36"
              name="description"
              placeholder="Description"
              required
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <Button
              className="w-full mt-2"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
            </Button>
          </>
        )}

        {form.category === "Leave Request" && (
          <div>{renderLeaveRequestContent()}</div>
        )}

        {/* Leave Type Selection Dialog */}
        <Dialog
          open={showLeaveTypeDialog}
          onOpenChange={setShowLeaveTypeDialog}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Select Leave Type</DialogTitle>
              <DialogDescription>
                Choose between paid or unpaid leave
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleLeaveTypeSelect("paid")}
                  className="py-6 text-lg bg-blue-600 hover:bg-blue-700"
                >
                  Paid Leave (Uses Leave Credits)
                </Button>
                <Button
                  onClick={() => handleLeaveTypeSelect("unpaid")}
                  className="py-6 text-lg bg-gray-600 hover:bg-gray-700"
                >
                  Unpaid Leave
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
};

export default Request;
