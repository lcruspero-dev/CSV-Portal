/* eslint-disable react-hooks/exhaustive-deps */
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
import { format, parseISO, isValid } from "date-fns";
import { 
  Paperclip, 
  User, 
  Mail, 
  CalendarIcon, 
  FileText, 
  Loader2,
  AlertCircle,
  UploadCloud,
  CheckCircle2,
  Briefcase,
  FileCheck,
  PlusCircle,
  Trash2
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/kit/BackButton";

interface LeaveBalance {
  currentBalance: number;
  nextAccrualDate: string;
  employmentStatus: string;
}

interface FormData {
  name: string;
  email: string;
  category: string;
  description: string;
  purpose: string;
  file: string | null;
  department: string;
  leaveType: string;
  leaveCategory: string;
  leaveReason: string;
  startDate: string;
  endDate: string;
  delegatedTasks: string;
  formDepartment: string;
  leaveDays: number;
  selectedDates: Date[];
  isPaidLeave: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const Request = () => {
  const userLogin = JSON.parse(localStorage.getItem("user")!);

  const [form, setForm] = useState<FormData>({
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
    selectedDates: [],
    isPaidLeave: true,
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [showLeaveTypeDialog, setShowLeaveTypeDialog] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch leave balance on component mount
  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const response = await LeaveCreditAPI.getLeaveCreditById();
        const data = await response.data;
        setLeaveBalance(data);
      } catch (error) {
        console.error("Error fetching leave balance:", error);
        toast({
          title: "Failed to load leave balance",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    };

    fetchLeaveBalance();
  }, [toast]);

  // Calculate leave days when leave category or dates change
  useEffect(() => {
    if (form.category === "Leave Request") {
      let days = 0;

      if (form.leaveCategory === "Full-Day Leave") {
        days = form.selectedDates.length;
      } else if (form.leaveCategory && form.startDate) {
        days = 0.5;
      }

      setForm((prev) => ({ ...prev, leaveDays: days }));
    }
  }, [form.startDate, form.leaveCategory, form.selectedDates, form.category]);

  const handleDateSelect = useCallback((dates: Date[] | undefined) => {
    if (!dates) return;

    if (form.isPaidLeave && leaveBalance) {
      const maxSelectableDates = Math.min(
        dates.length,
        leaveBalance.currentBalance
      );
      const cappedDates = dates.slice(0, maxSelectableDates);
      setForm((prev) => ({ ...prev, selectedDates: cappedDates }));
      
      if (dates.length > leaveBalance.currentBalance) {
        toast({
          title: "Maximum days selected",
          description: `You can only select up to ${leaveBalance.currentBalance} days for paid leave`,
          variant: "destructive",
        });
      }
    } else {
      setForm((prev) => ({ ...prev, selectedDates: dates }));
    }
    setShowDatePicker(false);
  }, [form.isPaidLeave, leaveBalance, toast]);

  const isDateDisabled = useCallback((date: Date) => {
    if (!leaveBalance || !form.isPaidLeave) return false;

    return (
      form.selectedDates.length >= leaveBalance.currentBalance &&
      !form.selectedDates.some(
        (selectedDate) => selectedDate.getTime() === date.getTime()
      )
    );
  }, [form.selectedDates, form.isPaidLeave, leaveBalance]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileInput = event.target;
    const file = fileInput.files && fileInput.files[0];

    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, Word, or image files only",
        variant: "destructive",
      });
      return;
    }

    setSelectedFileName(file.name);
    setIsFileUploading(true);

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
          timeout: 30000,
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
        description: "Could not upload attachment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFileUploading(false);
      fileInput.value = "";
    }
  };

  const removeFile = () => {
    setSelectedFileName("");
    setForm(prev => ({ ...prev, file: null }));
  };

  const handleCategoryChange = (value: string) => {
    if (value === "Leave Request") {
      setShowLeaveTypeDialog(true);
    }
    setForm({ ...form, category: value });
    if (validationErrors.category) {
      setValidationErrors(prev => ({ ...prev, category: "" }));
    }
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
      leaveCategory: "",
      leaveType: "",
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

  const formatSelectedDates = () => {
    if (form.selectedDates.length === 0) return "No dates selected";
    return form.selectedDates
      .map((date) => format(date, "MMM dd, yyyy"))
      .join(", ");
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.category) {
      errors.category = "Please select a request category";
    }

    if (form.category === "Leave Request") {
      if (!form.leaveType) errors.leaveType = "Please select leave type";
      if (!form.leaveCategory) errors.leaveCategory = "Please select leave category";
      if (!form.leaveReason.trim()) errors.leaveReason = "Please provide a reason for leave";
      if (!form.formDepartment) errors.formDepartment = "Please select department";
      
      if (form.leaveCategory === "Full-Day Leave") {
        if (form.selectedDates.length === 0) {
          errors.selectedDates = "Please select at least one date";
        }
      } else if (form.leaveCategory && !form.startDate) {
        errors.startDate = "Please select a leave date";
      }
    } else if (form.category === "Certificate of Employment") {
      if (!form.purpose.trim()) errors.purpose = "Please specify purpose";
      if (!form.description.trim()) errors.description = "Please provide details";
    } else if (form.category) {
      if (!form.description.trim()) errors.description = "Please describe your request";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please complete all required fields",
        description: "Check the form for errors",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let description = "";

      if (form.category === "Leave Request") {
        let dateRange = "";
        if (form.leaveCategory === "Full-Day Leave") {
          dateRange = `Selected Dates: ${formatSelectedDates()}`;
        } else {
          dateRange = `Date: ${form.startDate}`;
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
        title: "Request submitted successfully!",
        description: `Ticket #${response.data.ticketNumber} has been created`,
        variant: "default",
      });
      
      // Reset form
      setForm({
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
        selectedDates: [],
        isPaidLeave: true,
      });
      setSelectedFileName("");
      setValidationErrors({});
      
      // Navigate after a short delay
      setTimeout(() => navigate("/view-ticket"), 1500);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Failed to create request. Please try again.",
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
      toast({
        title: "Failed to load categories",
        description: "Please refresh the page",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  const updatedBalance = useMemo(() => {
    if (!leaveBalance || !form.isPaidLeave) return null;
    return leaveBalance.currentBalance - form.leaveDays;
  }, [leaveBalance, form.isPaidLeave, form.leaveDays]);

  const formatNextAccrualDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return dateString;
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const renderLeaveRequestContent = () => {
    return (
      <div className="space-y-6 mt-6 animate-in fade-in duration-300">
        {/* Leave Balance Display - Only show for paid leave */}
        {form.isPaidLeave && leaveBalance && (
          <div className="p-4 border border-blue-100 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Briefcase className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-semibold text-gray-700">
                    Leave Balance
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-blue-700">
                    {leaveBalance.currentBalance}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    day{leaveBalance.currentBalance !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-1 text-xs text-blue-600">
                  <CalendarIcon className="h-3 w-3 inline mr-1" />
                  Next accrual: {formatNextAccrualDate(leaveBalance.nextAccrualDate)}
                </div>
              </div>
              
              {updatedBalance !== null && (
                <div className="bg-white px-4 py-3 rounded-lg border border-blue-200 min-w-[160px]">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Balance After Leave
                  </div>
                  <div className={`text-lg font-bold ${updatedBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {updatedBalance.toFixed(1)} day{Math.abs(updatedBalance) !== 1 ? 's' : ''}
                  </div>
                  {updatedBalance < 0 && (
                    <div className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Negative balance
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leave Status Indicator */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-700">Leave Type: </span>
              <span className={`font-bold ml-2 ${form.isPaidLeave ? 'text-green-600' : 'text-blue-600'}`}>
                {form.isPaidLeave ? "Paid Leave" : "Unpaid Leave"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLeaveTypeDialog(true)}
              className="text-xs h-8"
            >
              Change
            </Button>
          </div>
          {!form.isPaidLeave && (
            <p className="text-sm text-gray-600 mt-2">
              This leave will not deduct from your leave credits.
            </p>
          )}
        </div>

        {/* Leave Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leaveType" className="text-sm font-semibold text-gray-700">
              Leave Type *
            </Label>
            <Select
              value={form.leaveType}
              onValueChange={(value) => {
                setForm({ ...form, leaveType: value });
                if (validationErrors.leaveType) {
                  setValidationErrors(prev => ({ ...prev, leaveType: "" }));
                }
              }}
              required
            >
              <SelectTrigger className={`h-11 ${validationErrors.leaveType ? 'border-red-500' : 'border-gray-300'}`}>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Vacation Leave">Vacation Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                  <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                  <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                  <SelectItem value="Bereavement Leave">Bereavement Leave</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {validationErrors.leaveType && (
              <p className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.leaveType}
              </p>
            )}
          </div>

          {/* Leave Category */}
          <div className="space-y-2">
            <Label htmlFor="leaveCategory" className="text-sm font-semibold text-gray-700">
              Duration *
            </Label>
            <Select
              value={form.leaveCategory}
              onValueChange={(value) => {
                setForm({
                  ...form,
                  leaveCategory: value,
                  startDate: "",
                  endDate: "",
                  selectedDates: [],
                });
                if (validationErrors.leaveCategory) {
                  setValidationErrors(prev => ({ ...prev, leaveCategory: "" }));
                }
              }}
              required
            >
              <SelectTrigger className={`h-11 ${validationErrors.leaveCategory ? 'border-red-500' : 'border-gray-300'}`}>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Full-Day Leave">Full Day</SelectItem>
                  <SelectItem value="AM Leave">Morning (AM)</SelectItem>
                  <SelectItem value="PM Leave">Afternoon (PM)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {validationErrors.leaveCategory && (
              <p className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.leaveCategory}
              </p>
            )}
          </div>
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department" className="text-sm font-semibold text-gray-700">
            Department *
          </Label>
          <Select
            value={form.formDepartment}
            onValueChange={(value) => {
              setForm({ ...form, formDepartment: value });
              if (validationErrors.formDepartment) {
                setValidationErrors(prev => ({ ...prev, formDepartment: "" }));
              }
            }}
            required
          >
            <SelectTrigger className={`h-11 ${validationErrors.formDepartment ? 'border-red-500' : 'border-gray-300'}`}>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {validationErrors.formDepartment && (
            <p className="text-xs text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {validationErrors.formDepartment}
            </p>
          )}
        </div>

        {/* Date Selection based on Leave Category */}
        {form.leaveCategory === "Full-Day Leave" ? (
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Select Leave Dates *
            </Label>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 justify-start text-left font-normal border-gray-300 hover:border-gray-400 bg-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  {form.selectedDates.length > 0
                    ? `${form.selectedDates.length} date${form.selectedDates.length !== 1 ? 's' : ''} selected`
                    : "Select dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="multiple"
                  selected={form.selectedDates}
                  onSelect={handleDateSelect}
                  disabled={isDateDisabled}
                  className="p-3"
                  classNames={{
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                    day_today: "border border-blue-400",
                  }}
                />
              </PopoverContent>
            </Popover>
            {validationErrors.selectedDates && (
              <p className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.selectedDates}
              </p>
            )}
            {form.selectedDates.length > 0 && (
              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="font-medium mb-1">Selected dates:</div>
                <div className="flex flex-wrap gap-1">
                  {form.selectedDates.map((date, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {format(date, "MMM dd")}
                    </span>
                  ))}
                </div>
                {leaveBalance &&
                  form.selectedDates.length === leaveBalance.currentBalance &&
                  form.isPaidLeave === true && (
                    <div className="text-amber-600 text-xs mt-2 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Maximum leave balance reached
                    </div>
                  )}
              </div>
            )}
          </div>
        ) : (
          (form.leaveCategory === "AM Leave" ||
            form.leaveCategory === "PM Leave") && (
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">
                Leave Date *
              </Label>
              <Input
                name="startDate"
                type="date"
                value={form.startDate}
                required
                className={`h-11 ${validationErrors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                onChange={handleChange}
                disabled={isSubmitting}
                min={new Date().toISOString().split('T')[0]}
              />
              {validationErrors.startDate && (
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.startDate}
                </p>
              )}
            </div>
          )
        )}

        {/* Display calculated leave days */}
        {form.leaveDays > 0 && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-semibold text-gray-700">
                  Total Leave Duration:
                </span>
              </div>
              <span className="text-lg font-bold text-green-700">
                {form.leaveDays} {form.leaveDays <= 1 ? "day" : "days"}
              </span>
            </div>
          </div>
        )}

        {/* Reason and Delegation */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leaveReason" className="text-sm font-semibold text-gray-700">
              Reason for Leave *
            </Label>
            <Textarea
              className={`min-h-[100px] resize-none ${validationErrors.leaveReason ? 'border-red-500' : 'border-gray-300'}`}
              name="leaveReason"
              placeholder="Please provide the reason for your leave..."
              value={form.leaveReason}
              required
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {validationErrors.leaveReason && (
              <p className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.leaveReason}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="delegatedTasks" className="text-sm font-semibold text-gray-700">
              Tasks to be Delegated
            </Label>
            <Textarea
              className="min-h-[100px] resize-none border-gray-300"
              name="delegatedTasks"
              placeholder="List tasks that need to be handled by others during your absence..."
              value={form.delegatedTasks}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* File attachment */}
        <div className="space-y-2">
          <Label htmlFor="attachment" className="text-sm font-semibold text-gray-700">
            Supporting Documents (Optional)
          </Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200 bg-gray-50">
            <Input
              id="attachment"
              name="attachment"
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isSubmitting || isFileUploading}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label htmlFor="attachment" className="cursor-pointer block">
              {isFileUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              ) : (
                <>
                  <UploadCloud className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, Word, JPG, PNG up to 5MB
                  </p>
                </>
              )}
            </label>
          </div>
          {selectedFileName && (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="flex items-center min-w-0">
                <Paperclip className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                <span className="text-sm text-green-700 truncate">
                  {selectedFileName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3 text-gray-500" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button and Header */}
        <div className="mb-8">
          <BackButton />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              HR Request Form
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Submit your HR-related requests and leave applications
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      readOnly
                      className="pl-10 bg-gray-50 border-gray-300 text-gray-600 h-11"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      readOnly
                      className="pl-10 bg-gray-50 border-gray-300 text-gray-600 h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Category Field */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                  Request Type *
                </Label>
                <Select 
                  value={form.category} 
                  onValueChange={handleCategoryChange} 
                  required
                >
                  <SelectTrigger className={`h-11 ${validationErrors.category ? 'border-red-500' : 'border-gray-300'}`}>
                    <SelectValue placeholder="Select request type" />
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
                {validationErrors.category && (
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validationErrors.category}
                  </p>
                )}
              </div>

              {/* Dynamic Content Based on Category */}
              {form.category && form.category !== "Leave Request" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Certificate of Employment Purpose */}
                  {form.category === "Certificate of Employment" && (
                    <div className="space-y-2">
                      <Label htmlFor="purpose" className="text-sm font-semibold text-gray-700">
                        Purpose *
                      </Label>
                      <Input
                        name="purpose"
                        placeholder="Purpose for requesting Certificate of Employment"
                        type="text"
                        required
                        value={form.purpose}
                        className={`h-11 ${validationErrors.purpose ? 'border-red-500' : 'border-gray-300'}`}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      {validationErrors.purpose && (
                        <p className="text-xs text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {validationErrors.purpose}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Description for non-leave requests */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                      Description *
                    </Label>
                    <Textarea
                      className={`min-h-[120px] resize-none ${validationErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                      name="description"
                      placeholder="Please describe your request in detail..."
                      required
                      value={form.description}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    {validationErrors.description && (
                      <p className="text-xs text-red-500 flex items-center mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {validationErrors.description}
                      </p>
                    )}
                  </div>

                  {/* File attachment for non-leave requests */}
                  <div className="space-y-2">
                    <Label htmlFor="attachment" className="text-sm font-semibold text-gray-700">
                      Supporting Documents (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200 bg-gray-50">
                      <Input
                        id="general-attachment"
                        name="attachment"
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isSubmitting || isFileUploading}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <label htmlFor="general-attachment" className="cursor-pointer block">
                        {isFileUploading ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                            <p className="text-sm text-gray-600">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF, Word, JPG, PNG up to 5MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                    {selectedFileName && (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <div className="flex items-center min-w-0">
                          <Paperclip className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                          <span className="text-sm text-green-700 truncate">
                            {selectedFileName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Leave Request Content */}
              {form.category === "Leave Request" && renderLeaveRequestContent()}

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 mt-8"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                    {form.category === "Leave Request" ? "Submitting Leave Request..." : "Creating Request..."}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {form.category === "Leave Request" ? (
                      <>
                        <FileCheck className="mr-2 h-5 w-5" />
                        Submit Leave Request
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Submit Request
                      </>
                    )}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">
            Need assistance? Contact HR at{" "}
            <a href="tel:+1234567890" className="text-blue-600 hover:text-blue-700 font-medium">
              (123) 456-7890
            </a>
          </p>
        </div>
      </div>

      {/* Leave Type Selection Dialog */}
      <Dialog open={showLeaveTypeDialog} onOpenChange={setShowLeaveTypeDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-blue-100 rounded-full opacity-10" />
          <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-indigo-100 rounded-full opacity-10" />
          
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-gray-900">
              Select Leave Type
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Choose between paid or unpaid leave
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              onClick={() => handleLeaveTypeSelect("paid")}
              className="py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl relative overflow-hidden group"
              disabled={!isRegularEmployee}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="text-center relative z-10">
                <div className="font-bold text-lg">Paid Leave</div>
                <div className="text-sm font-normal opacity-90 mt-1">
                  Uses Leave Credits
                </div>
                {!isRegularEmployee && (
                  <div className="text-xs text-green-200 mt-2">
                    Available for regular employees only
                  </div>
                )}
              </div>
            </Button>
            <Button
              onClick={() => handleLeaveTypeSelect("unpaid")}
              className="py-6 text-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="text-center relative z-10">
                <div className="font-bold text-lg">Unpaid Leave</div>
                <div className="text-sm font-normal opacity-90 mt-1">
                  No leave credits required
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Request;