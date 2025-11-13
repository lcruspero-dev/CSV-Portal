/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category, TicketAPi } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Paperclip, User, Mail, Heart, Clover } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/kit/BackButton";

const CreateTicket = () => {
  const userLogin = JSON.parse(localStorage.getItem("user")!);
  const [form, setForm] = useState({
    name: `${userLogin.name}`,
    email: `${userLogin.email}`,
    category: "",
    description: "",
    file: null,
    department: "IT",
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

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
        description: "Attachment has been added to your ticket",
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
    setForm({ ...form, category: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate required fields
    if (!form.category || !form.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await TicketAPi.createTicket(form);
      toast({
        title: "Ticket created successfully! 🦃",
        description: `We're thankful you reached out! Ticket #${response.data.ticketNumber} has been created`,
        variant: "default",
      });
      navigate("/view-ticket");
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to create ticket",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategory = async () => {
    try {
      const response = await Category.getItCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to load categories",
        description: "Could not fetch ticket categories",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    getCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
      <BackButton />
      <div className="max-w-2xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-700 px-6 py-8 text-center relative overflow-hidden">
            {/* Thanksgiving decorative elements */}
            <div className="absolute top-2 left-4 text-amber-300">
              🍂
            </div>
            <div className="absolute top-4 right-6 text-amber-300">
              🦃
            </div>
            <div className="absolute bottom-2 left-8 text-amber-300">
              🌽
            </div>
            <div className="absolute bottom-4 right-4 text-amber-300">
              🥧
            </div>
            
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              We're Thankful You're Here!
            </h1>
            <p className="text-amber-100 text-sm sm:text-base">
              Share your needs with us this season - we're grateful to help!
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Attachment Section */}
              <div className="space-y-3">
                <Label htmlFor="attachment" className="text-sm font-semibold flex items-center text-amber-800">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Attach File (Optional)
                </Label>
                <div className="border-2 border-dashed border-amber-300 rounded-lg p-4 text-center hover:border-amber-400 transition-colors duration-200 bg-amber-50">
                  <Input
                    id="attachment"
                    name="attachment"
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="attachment" className="cursor-pointer">
                    <Paperclip className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-sm text-amber-700 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-amber-600">
                      Maximum file size: 5MB
                    </p>
                  </label>
                </div>
                {selectedFileName && (
                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-amber-800 flex items-center">
                      <Paperclip className="h-3 w-3 mr-2" />
                      {selectedFileName}
                    </span>
                    <span className="text-xs text-amber-600">Uploaded ✓</span>
                  </div>
                )}
              </div>

              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center text-amber-800">
                    <User className="mr-2 h-4 w-4" />
                    Name
                  </Label>
                  <div className="relative">
                    <Input
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      readOnly
                      className="bg-amber-50 border-amber-200 text-amber-800 pl-10"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold flex items-center text-amber-800">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      readOnly
                      className="bg-amber-50 border-amber-200 text-amber-800 pl-10"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                  </div>
                </div>
              </div>

              {/* Category Field */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold flex items-center text-amber-800">
                  <Clover className="mr-2 h-4 w-4" />
                  Category *
                </Label>
                <Select
                  onValueChange={handleCategoryChange}
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full h-11 border-amber-200 focus:border-amber-500">
                    <SelectValue placeholder="Select a category for your ticket" />
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

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-amber-800">
                  Description of the issue/request *
                </Label>
                <Textarea
                  className="min-h-[120px] resize-none border-amber-200 focus:border-amber-500 transition-colors duration-200 bg-amber-50"
                  name="description"
                  placeholder="We're thankful you're sharing this with us. Please describe your issue or request in detail..."
                  required
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-amber-600">
                  We're grateful for the opportunity to assist you - please provide as much detail as possible
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
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
                    Creating with Gratitude...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Heart className="mr-2 h-5 w-5" />
                    Share Your Request 🦃
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-amber-700">
            We're thankful to serve you! Need immediate assistance? Contact us at{" "}
            <a href="tel:+1234567890" className="text-amber-600 hover:text-amber-700 font-medium">
              (123) 456-7890
            </a>
          </p>
          <div className="mt-2 text-amber-600">
            🍂 Happy Thanksgiving! 🦃
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;