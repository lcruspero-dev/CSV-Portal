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
import { Paperclip } from "lucide-react";
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
        title: "Ticket created successfully",
        description: `Ticket #${response.data.ticketNumber} has been created`,
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
    <div className="container flex justify-center p-3">
      <div className="text-xs">
        <BackButton />
      </div>
      <form className="w-full max-w-2xl" onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Create IT Support Ticket
          </h1>
          <p className="text-lg font-bold text-black">
            Please fill out the form below
          </p>
        </div>

        {/* Attachment */}

        <Label
          htmlFor="attachment"
          className="text-sm font-bold flex items-center"
        >
          <Paperclip className="mr-2" size={16} />
          Attach File (Optional)
        </Label>
        <Input
          id="attachment"
          name="attachment"
          type="file"
          onChange={handleFileUpload}
          className="mt-1 cursor-pointer"
          disabled={isSubmitting}
        />

        {/* Name */}

        <Label htmlFor="name" className="text-sm font-bold">
          Name
        </Label>
        <Input
          name="name"
          type="text"
          required
          className="!mb-2"
          value={form.name}
          readOnly
        />

        {/* Email */}

        <Label htmlFor="email" className="text-sm font-bold">
          Email
        </Label>
        <Input
          name="email"
          type="email"
          required
          className="!mb-2"
          value={form.email}
          readOnly
        />

        {/* Category */}

        <Label htmlFor="category" className="text-sm font-bold">
          Category *
        </Label>
        <Select
          onValueChange={handleCategoryChange}
          required
          disabled={isSubmitting}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a category" />
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

        {/* Description */}
        <div className="mb-2">
          <Label htmlFor="description" className="text-sm font-bold mt-2">
            Description of the issue/request *
          </Label>
          <Textarea
            className="h-36 mt-1"
            name="description"
            placeholder="Please describe your issue or request in detail..."
            required
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <Button className="w-full py-2" type="submit" disabled={isSubmitting}>
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
              Creating Ticket...
            </span>
          ) : (
            "Create Ticket"
          )}
        </Button>
      </form>
    </div>
  );
};

export default CreateTicket;
