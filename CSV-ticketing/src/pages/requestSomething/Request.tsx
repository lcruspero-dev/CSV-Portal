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
import { Paperclip, User, Mail, FolderOpen, CalendarIcon, FileText, Clock, Building, Gift, TreePine , Snowflake, Star, CandyCane } from "lucide-react";
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
  const [selectedFileName, setSelectedFileName] = useState<string>("");
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

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFileName(file.name);

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
      toast({
        title: "File uploaded successfully",
        description: "Attachment has been added to your request",
        variant: "default",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      setSelectedFileName("");
      toast({
        title: "File upload failed",
        description: "Could not upload attachment",
        variant: "destructive",
      });
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
        title: "🎄 Request submitted successfully!",
        description: `Ticket #${response.data.ticketNumber} has been created`,
        variant: "default",
      });
      navigate("/view-ticket");
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to create request",
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
      <div className="space-y-6 mt-6">
        {/* Leave Balance Display - Only show for paid leave */}
        {form.isPaidLeave && leaveBalance && (
          <div className="p-4 border border-green-200 rounded-xl bg-green-50 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Gift className="h-16 w-16 text-green-500" />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-semibold text-gray-700">
                  Current Leave Balance:
                </span>
                <span className="ml-2 font-bold text-green-700">
                  {leaveBalance.currentBalance}{" "}
                  {leaveBalance.currentBalance <= 1 ? "day" : "days"}
                </span>
              </div>
              {updatedBalance !== null && (
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-700">
                    Balance After Leave:
                  </span>
                  <span className="ml-2 font-bold text-red-600">
                    {updatedBalance} {updatedBalance <= 1 ? "day" : "days"}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-green-600">
              🎅 Next accrual: {new Date(leaveBalance.nextAccrualDate).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Leave Status Indicator */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-red-50 to-green-50 border border-red-200 shadow-sm relative">
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
            <CandyCane className="h-6 w-6 text-red-400 rotate-12" />
          </div>
          <span className="font-semibold text-gray-700">Leave Status: </span>
          <span
            className={`font-bold ml-2 ${
              form.isPaidLeave ? "text-green-600" : "text-red-600"
            }`}
          >
            {form.isPaidLeave ? "🎁 Paid Leave" : "❄️ Unpaid Leave"}
          </span>
          {!form.isPaidLeave && (
            <p className="text-sm text-gray-600 mt-1">
              This leave will not deduct from your leave credits.
            </p>
          )}
        </div>

        {/* Leave Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leaveType" className="text-sm font-semibold flex items-center text-gray-700">
              <FileText className="h-4 w-4 mr-2 text-green-600" />
              Leave Type *
            </Label>
            <Select
              onValueChange={(value) => setForm({ ...form, leaveType: value })}
              required
            >
              <SelectTrigger className="h-11 border-green-200 focus:border-green-500 bg-white">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                  <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                  <SelectItem value="Vacation Leave">Vacation Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                  <SelectItem value="Bereavement Leave">Bereavement Leave</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Leave Category */}
          <div className="space-y-2">
            <Label htmlFor="leaveCategory" className="text-sm font-semibold flex items-center text-gray-700">
              <Clock className="h-4 w-4 mr-2 text-red-500" />
              Leave Category *
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
              <SelectTrigger className="h-11 border-red-200 focus:border-red-500 bg-white">
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
          </div>
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department" className="text-sm font-semibold flex items-center text-gray-700">
            <Building className="h-4 w-4 mr-2 text-green-600" />
            Department *
          </Label>
          <Select
            value={form.formDepartment}
            onValueChange={(value) => setForm({ ...form, formDepartment: value })}
            required
          >
            <SelectTrigger className="h-11 border-green-200 focus:border-green-500 bg-white">
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
        </div>

        {/* Date Selection based on Leave Category */}
        {form.leaveCategory === "Full-Day Leave" ? (
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center text-gray-700">
              <CalendarIcon className="h-4 w-4 mr-2 text-red-500" />
              Select Leave Dates *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full h-11 justify-start text-left font-normal border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.selectedDates.length > 0
                    ? `${form.selectedDates.length} date(s) selected`
                    : "Pick dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-green-200" align="start">
                <Calendar
                  mode="multiple"
                  selected={form.selectedDates}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={isDateDisabled}
                  className="p-3"
                  classNames={{
                    day_selected: "bg-green-600 text-white hover:bg-green-700",
                    day_today: "border border-red-400",
                  }}
                />
              </PopoverContent>
            </Popover>
            {form.selectedDates.length > 0 && (
              <div className="text-sm text-gray-600 p-2 bg-green-50 rounded-lg border border-green-100">
                <span className="font-medium">🎄 Selected dates:</span> {formatSelectedDates()}
                {leaveBalance &&
                  form.selectedDates.length === leaveBalance.currentBalance &&
                  form.isPaidLeave === true && (
                    <div className="text-red-600 text-xs mt-1 font-medium flex items-center">
                      <Snowflake className="h-3 w-3 mr-1" />
                      You've reached your maximum leave balance. Cannot select more dates.
                    </div>
                  )}
              </div>
            )}
          </div>
        ) : (
          (form.leaveCategory === "AM Leave" ||
            form.leaveCategory === "PM Leave") && (
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-semibold flex items-center text-gray-700">
                <CalendarIcon className="h-4 w-4 mr-2 text-green-600" />
                Leave Date *
              </Label>
              <Input
                name="startDate"
                type="date"
                required
                className="h-11 border-green-200 focus:border-green-500 bg-white"
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          )
        )}

        {/* Display calculated leave days */}
        {form.leaveDays > 0 && (
          <div className="p-3 bg-gradient-to-r from-green-50 to-red-50 border border-green-200 rounded-lg relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-20">
              <Star className="h-12 w-12 text-green-400" />
            </div>
            <span className="text-sm font-semibold text-gray-700">🎁 Leave Days Requested:</span>
            <span className="ml-2 font-bold text-green-700">
              {form.leaveDays} {form.leaveDays <= 1 ? "day" : "days"}
            </span>
          </div>
        )}

        {/* Reason and Delegation */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leaveReason" className="text-sm font-semibold text-gray-700 flex items-center">
              <Gift className="h-4 w-4 mr-2 text-red-500" />
              Why are you requesting for a leave? *
            </Label>
            <Textarea
              className="min-h-[100px] resize-none border-green-200 focus:border-green-500 bg-white"
              name="leaveReason"
              placeholder="Please provide the reason for your leave..."
              required
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delegatedTasks" className="text-sm font-semibold text-gray-700 flex items-center">
              <TreePine  className="h-4 w-4 mr-2 text-green-600" />
              Tasks to be delegated while out of office *
            </Label>
            <Textarea
              className="min-h-[100px] resize-none border-red-200 focus:border-red-500 bg-white"
              name="delegatedTasks"
              placeholder="List tasks that need to be handled by others during your absence..."
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* File attachment */}
        <div className="space-y-2">
          <Label htmlFor="attachment" className="text-sm font-semibold flex items-center text-gray-700">
            <Paperclip className="h-4 w-4 mr-2 text-green-600" />
            Attach File (Optional)
          </Label>
          <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors duration-200 bg-gradient-to-br from-green-50 to-white relative overflow-hidden">
            <div className="absolute top-2 left-2 opacity-10">
              <Snowflake className="h-8 w-8 text-blue-400" />
            </div>
            <Input
              id="attachment"
              name="attachment"
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isSubmitting}
            />
            <label htmlFor="attachment" className="cursor-pointer block">
              <Paperclip className="mx-auto h-8 w-8 text-green-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                Maximum file size: 5MB
              </p>
            </label>
          </div>
          {selectedFileName && (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <span className="text-sm text-green-700 flex items-center">
                <Paperclip className="h-3 w-3 mr-2" />
                {selectedFileName}
              </span>
              <span className="text-xs text-green-600 flex items-center">
                <Star className="h-3 w-3 mr-1" />
                Uploaded ✓
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-12 bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden group"
        >
          <div className="absolute -left-4 top-0 opacity-20 group-hover:opacity-30 transition-opacity">
            <Snowflake className="h-12 w-12 text-white animate-spin-slow" />
          </div>
          {isSubmitting ? (
            <span className="flex items-center justify-center">
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
              Submitting Leave Request...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Gift className="mr-2 h-5 w-5" />
              Submit Leave Request
            </span>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Snowflake Background Decorations */}
      <div className="absolute top-10 left-10 opacity-10">
        <Snowflake className="h-12 w-12 text-blue-400 animate-pulse" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10">
        <Snowflake className="h-16 w-16 text-blue-300 animate-pulse" />
      </div>
      <div className="absolute top-1/3 right-20 opacity-5">
        <TreePine  className="h-24 w-24 text-green-400" />
      </div>
      
      <BackButton />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden relative">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-red-600 px-6 py-8 text-center relative overflow-hidden">
            {/* Christmas decorative elements */}
            <div className="absolute top-2 left-4 opacity-20">
              <Snowflake className="h-8 w-8 text-white" />
            </div>
            <div className="absolute bottom-2 right-4 opacity-20">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <div className="absolute top-4 right-8 opacity-20">
              <Star className="h-6 w-6 text-yellow-300" />
            </div>
            
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 border-2 border-white/30">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 relative z-10">
              🎄 HR Support Request Form
            </h1>
            <p className="text-green-100 text-sm sm:text-base relative z-10">
              Submit your HR-related requests and leave applications
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center text-gray-700">
                    <User className="mr-2 h-4 w-4 text-green-600" />
                    Name
                  </Label>
                  <div className="relative">
                    <Input
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      readOnly
                      className="bg-green-50 border-green-200 text-gray-600 pl-10 h-11"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold flex items-center text-gray-700">
                    <Mail className="mr-2 h-4 w-4 text-red-500" />
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      readOnly
                      className="bg-red-50 border-red-200 text-gray-600 pl-10 h-11"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Category Field */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold flex items-center text-gray-700">
                  <FolderOpen className="mr-2 h-4 w-4 text-green-600" />
                  Request Category *
                </Label>
                <Select onValueChange={handleCategoryChange} required>
                  <SelectTrigger className="h-11 border-green-200 focus:border-green-500 bg-white">
                    <SelectValue placeholder="Select request category" />
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
              </div>

              {/* Dynamic Content Based on Category */}
              {form.category !== "Leave Request" && (
                <div className="space-y-4">
                  {/* Certificate of Employment Purpose */}
                  {form.category === "Certificate of Employment" && (
                    <div className="space-y-2">
                      <Label htmlFor="purpose" className="text-sm font-semibold text-gray-700 flex items-center">
                        <Gift className="h-4 w-4 mr-2 text-red-500" />
                        Purpose *
                      </Label>
                      <Input
                        name="purpose"
                        placeholder="Purpose for requesting Certificate of Employment"
                        type="text"
                        required
                        className="h-11 border-green-200 focus:border-green-500 bg-white"
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}

                  {/* Description for non-leave requests */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-green-600" />
                      Description of the request *
                    </Label>
                    <Textarea
                      className="min-h-[120px] resize-none border-green-200 focus:border-green-500 bg-white"
                      name="description"
                      placeholder="Please describe your request in detail..."
                      required
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* File attachment for non-leave requests */}
                  <div className="space-y-2">
                    <Label htmlFor="attachment" className="text-sm font-semibold flex items-center text-gray-700">
                      <Paperclip className="h-4 w-4 mr-2 text-green-600" />
                      Attach File (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors duration-200 bg-gradient-to-br from-green-50 to-white">
                      <Input
                        id="attachment"
                        name="attachment"
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="attachment" className="cursor-pointer block">
                        <Paperclip className="mx-auto h-8 w-8 text-green-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          Maximum file size: 5MB
                        </p>
                      </label>
                    </div>
                    {selectedFileName && (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <span className="text-sm text-green-700 flex items-center">
                          <Paperclip className="h-3 w-3 mr-2" />
                          {selectedFileName}
                        </span>
                        <span className="text-xs text-green-600 flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          Uploaded ✓
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button for non-leave requests */}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden group"
                  >
                    <div className="absolute -right-4 top-0 opacity-20 group-hover:opacity-30 transition-opacity">
                      <Snowflake className="h-12 w-12 text-white animate-spin-slow" />
                    </div>
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
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
                        Creating Request...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <TreePine  className="mr-2 h-5 w-5" />
                        Submit Request
                      </span>
                    )}
                  </Button>
                </div>
              )}

              {/* Leave Request Content */}
              {form.category === "Leave Request" && renderLeaveRequestContent()}
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200">
          <p className="text-sm text-gray-600 flex items-center justify-center">
            <span className="mr-2">🎅</span>
            Need immediate assistance? Contact HR at{" "}
            <a href="tel:+1234567890" className="text-green-600 hover:text-green-700 font-medium ml-1">
              (123) 456-7890
            </a>
            <span className="ml-2">☃️</span>
          </p>
        </div>
      </div>

      {/* Leave Type Selection Dialog */}
      <Dialog open={showLeaveTypeDialog} onOpenChange={setShowLeaveTypeDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-green-50 to-red-50 border-green-200 relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-10">
            <TreePine  className="h-16 w-16 text-green-400" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-green-800">🎄 Select Leave Type</DialogTitle>
            <DialogDescription className="text-center text-green-600">
              Choose between paid or unpaid leave
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => handleLeaveTypeSelect("paid")}
                className="py-6 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg relative overflow-hidden group"
                disabled={!isRegularEmployee}
              >
                <div className="absolute -left-2 top-0 opacity-20 group-hover:opacity-30">
                  <Star className="h-12 w-12 text-yellow-300" />
                </div>
                <div className="text-center relative z-10">
                  <div className="font-bold">🎁 Paid Leave</div>
                  <div className="text-sm font-normal opacity-90">
                    Uses Leave Credits
                  </div>
                  {!isRegularEmployee && (
                    <div className="text-xs text-green-200 mt-1">
                      Available for regular employees only
                    </div>
                  )}
                </div>
              </Button>
              <Button
                onClick={() => handleLeaveTypeSelect("unpaid")}
                className="py-6 text-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg relative overflow-hidden group"
              >
                <div className="absolute -right-2 bottom-0 opacity-20 group-hover:opacity-30">
                  <Snowflake className="h-12 w-12 text-white" />
                </div>
                <div className="text-center relative z-10">
                  <div className="font-bold">❄️ Unpaid Leave</div>
                  <div className="text-sm font-normal opacity-90">
                    No leave credits required
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Request;