import { UserProfileAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Camera, Upload, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface ProfileFormData {
  // Personal Data
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  gender: string;
  taxStatus: string;

  // Employment Details
  department: string;
  jobPosition: string;
  employmentStatus: string;
  dateHired: string;
  probationaryDate: string;
  regularizationDate: string;
  tinNo: string;
  sssNo: string;
  philhealthNo: string;
  pagibigNo: string;
  hmoAccountNumber: number;
  bankAccountNumber: number;

  // Contact Details
  mobileNumber: number;
  emailAddress: string;
  phoneAddress: string;

  // Present Address
  presentHouseNo: string;
  presentStreet: string;
  presentBarangay: string;
  presentTown: string;
  presentCity: string;
  presentProvince: string;

  // Home Address
  homeHouseNo: string;
  homeStreet: string;
  homeBarangay: string;
  homeTown: string;
  homeCity: string;
  homeProvince: string;

  avatar?: string;
}

interface EditProfileFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData?: any;
  onCancel?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave?: (updatedData: any) => void;
}

export default function EditProfileForm({
  userData,
  onCancel,
  onSave,
}: EditProfileFormProps) {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [age, setAge] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (userData?.avatar) {
      setPreviewUrl(
        `${import.meta.env.VITE_UPLOADFILES_URL}/avatars/${userData.avatar}`
      );
    }
    if (userData?.dateOfBirth) {
      calculateAge(userData.dateOfBirth);
    }
  }, [userData]);

  const calculateAge = (birthDateString: string) => {
    if (!birthDateString) {
      setAge("");
      return;
    }

    try {
      const birthDate = new Date(birthDateString);
      const today = new Date();
      
      // Check if the date is valid
      if (isNaN(birthDate.getTime())) {
        setAge("");
        return;
      }

      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }
      
      setAge(calculatedAge.toString());
    } catch (error) {
      console.error("Error calculating age:", error);
      setAge("");
    }
  };

  const handleBirthdateChange = (dateString: string) => {
    form.setValue("dateOfBirth", dateString);
    calculateAge(dateString);
  };

  const form = useForm<ProfileFormData>({
    defaultValues: {
      // Personal Data
      firstName: userData?.firstName ?? "",
      lastName: userData?.lastName ?? "",
      middleName: userData?.middleName ?? "",
      dateOfBirth: userData?.dateOfBirth ?? "",
      gender: userData?.gender?.toLowerCase() ?? "",
      taxStatus: userData?.taxStatus ?? "",

      // Employment Details
      department: userData?.department ?? "",
      jobPosition: userData?.jobPosition ?? "",
      employmentStatus: userData?.employmentStatus ?? "",
      dateHired: userData?.dateHired ?? "",
      probationaryDate: userData?.probationaryDate ?? "",
      regularizationDate: userData?.regularizationDate ?? "",
      tinNo: userData?.tinNo ?? "",
      sssNo: userData?.sssNo ?? "",
      philhealthNo: userData?.philhealthNo ?? "",
      pagibigNo: userData?.pagibigNo ?? "",
      hmoAccountNumber: userData?.hmoAccountNumber ?? 0,
      bankAccountNumber: userData?.bankAccountNumber ?? 0,

      // Contact Details
      mobileNumber: userData?.mobileNumber ?? 0,
      emailAddress: userData?.emailAddress ?? "",
      phoneAddress: userData?.phoneAddress ?? "",

      // Present Address
      presentHouseNo: userData?.presentHouseNo ?? "",
      presentStreet: userData?.presentStreet ?? "",
      presentBarangay: userData?.presentBarangay ?? "",
      presentTown: userData?.presentTown ?? "",
      presentCity: userData?.presentCity ?? "",
      presentProvince: userData?.presentProvince ?? "",

      // Home Address
      homeHouseNo: userData?.homeHouseNo ?? "",
      homeStreet: userData?.homeStreet ?? "",
      homeBarangay: userData?.homeBarangay ?? "",
      homeTown: userData?.homeTown ?? "",
      homeCity: userData?.homeCity ?? "",
      homeProvince: userData?.homeProvince ?? "",

      avatar: userData?.avatar ?? "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      let avatarFilename = data.avatar;

      if (avatar) {
        const validImageTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!validImageTypes.includes(avatar.type)) {
          toast({
            variant: "destructive",
            title: "Invalid file type",
            description:
              "Please upload a valid image file (JPEG, PNG, GIF, or WEBP)",
          });
          return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (avatar.size > maxSize) {
          toast({
            variant: "destructive",
            title: "File too large",
            description: "Image size should not exceed 10MB",
          });
          return;
        }

        const formData = new FormData();
        formData.append("avatar", avatar);

        const uploadResponse = await fetch(
          `${import.meta.env.VITE_UPLOADFILES_URL}/upload-avatar`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          toast({
            variant: "destructive",
            title: "Upload failed",
            description: "Failed to upload avatar",
          });
          return;
        }

        const uploadResult = await uploadResponse.json();
        avatarFilename = uploadResult.filename;
      }

      const profileData = { ...data, avatar: avatarFilename };
      const response = await UserProfileAPI.createProfile(profileData);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      if (onSave) onSave(response.data);
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-3">
      {/* Avatar Upload Section */}
      <Card className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-md rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3">
          <CardTitle className="text-sm font-bold">Profile Photo</CardTitle>
          <CardDescription className="text-blue-100 text-sm">
            {userData?.avatar
              ? "Your profile picture"
              : "Upload your profile picture"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 flex flex-col items-center justify-center">
          <div className="mb-3 flex flex-col items-center space-y-2">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg group">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
              {!userData?.avatar && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <Camera className="h-6 w-6 text-white" />
                </label>
              )}
            </div>

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={!!userData?.avatar}
            />

            <div className="text-center">
              <h3 className="font-medium text-gray-800 text-sm mb-1">
                {form.watch("firstName") || "Your"}{" "}
                {form.watch("lastName") || "Profile"}
              </h3>
              <p className="text-gray-500 text-sm">
                {form.watch("emailAddress") ||
                  (userData?.avatar
                    ? "Profile photo uploaded"
                    : "Upload a professional photo")}
              </p>
            </div>

            {!userData?.avatar && (
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-md cursor-pointer hover:bg-blue-100 transition-colors h-10"
              >
                <Upload className="h-3 w-3" />
                Upload New Photo
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card className="w-full md:w-2/3 lg:w-3/4 bg-white shadow-md rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3">
          <CardTitle className="text-sm font-bold">Edit Profile</CardTitle>
          <CardDescription className="text-blue-100 text-sm">
            Update your personal information and documents
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="p-3">
              <div className="space-y-4">
                {/* Personal Data Section */}
                <div>
                  <h3 className="text-sm font-bold flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2 text-sm">
                      01
                    </span>
                    Personal Data
                  </h3>
                  <Separator className="mb-2" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            First Name<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First Name"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">Middle Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Middle Name"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Last Name<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Last Name"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Date of Birth
                            <span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleBirthdateChange(e.target.value);
                              }}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormItem className="space-y-1 pt-2">
                      <FormLabel className="text-sm">Age</FormLabel>
                      <Input
                        value={age}
                        readOnly
                        placeholder="Auto-computed"
                        className="rounded-md h-10 text-sm py-2 bg-gray-100"
                      />
                    </FormItem>
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Gender<span className="text-red-500"> *</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="rounded-md h-10 text-sm">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="taxStatus"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Tax Status<span className="text-red-500"> *</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="rounded-md h-10 text-sm">
                                <SelectValue placeholder="Select tax status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married</SelectItem>
                              <SelectItem value="head">
                                Head of Family
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Employment Details Section */}
                <div>
                  <h3 className="text-sm font-bold flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2 text-sm">
                      02
                    </span>
                    Employment Details
                  </h3>
                  <Separator className="mb-2" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Department<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Department"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jobPosition"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Job Position<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Job Position"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="employmentStatus"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Employment Status
                            <span className="text-red-500"> *</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="rounded-md h-10 text-sm">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="regular">Regular</SelectItem>
                              <SelectItem value="probationary">
                                Probationary
                              </SelectItem>
                              <SelectItem value="contractual">
                                Contractual
                              </SelectItem>
                              <SelectItem value="part-time">
                                Part-time
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="dateHired"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Date Hired<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="probationaryDate"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Probationary Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="regularizationDate"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Regularization Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="tinNo"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            TIN No.<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tax Identification Number"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sssNo"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            SSS No.<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Social Security Number"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="philhealthNo"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            PhilHealth No.
                            <span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="PhilHealth Number"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pagibigNo"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            HDMF No. (Pag-ibig)
                            <span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Pag-ibig Number"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="hmoAccountNumber"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            HMO Account No.
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="HMO Account Number"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bankAccountNumber"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Bank Account No.
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Bank Account Number"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact Details Section */}
                <div>
                  <h3 className="text-sm font-bold flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2 text-sm">
                      03
                    </span>
                    Contact Details
                  </h3>
                  <Separator className="mb-2" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Mobile Number
                            <span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Mobile Number"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emailAddress"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Email Address
                            <span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Email Address"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneAddress"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Phone Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Phone Address"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Present Address Section */}
                <div>
                  <h3 className="text-sm font-bold flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2 text-sm">
                      04
                    </span>
                    Present Address
                  </h3>
                  <Separator className="mb-2" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="presentHouseNo"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            House No.<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="House Number"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="presentStreet"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Street<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Street"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="presentBarangay"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Barangay<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Barangay"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="presentTown"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Town<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Town"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="presentCity"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            City<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="presentProvince"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">
                            Province<span className="text-red-500"> *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Province"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Home Address Section */}
                <div>
                  <h3 className="text-sm font-bold flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2 text-sm">
                      05
                    </span>
                    Home Address
                  </h3>
                  <Separator className="mb-2" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="homeHouseNo"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">House No.</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="House Number"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="homeStreet"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">Street</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Street"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="homeBarangay"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">Barangay</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Barangay"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="homeTown"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">Town</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Town"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="homeCity"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">City</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="homeProvince"
                      render={({ field }) => (
                        <FormItem className="space-y-1 pt-2">
                          <FormLabel className="text-sm">Province</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Province"
                              {...field}
                              className="rounded-md h-10 text-sm py-2"
                            />
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Employer's Data Section */}
                <div>
                  <h3 className="text-sm font-bold flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2 text-sm">
                      06
                    </span>
                    Employer's Data
                  </h3>
                  <Separator className="mb-2" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <FormItem className="space-y-1 pt-2">
                      <FormLabel className="text-sm">Company Name</FormLabel>
                      <Input
                        value="CSV NOW OPC"
                        readOnly
                        className="rounded-md h-10 text-sm py-2 bg-gray-100"
                      />
                    </FormItem>
                    <FormItem className="space-y-1 pt-2">
                      <FormLabel className="text-sm">Social Security</FormLabel>
                      <Input
                        value="80-0368897-1-000"
                        readOnly
                        className="rounded-md h-10 text-sm py-2 bg-gray-100"
                      />
                    </FormItem>
                    <FormItem className="space-y-1 pt-2">
                      <FormLabel className="text-sm">Phil. Health</FormLabel>
                      <Input
                        value="012000049916"
                        readOnly
                        className="rounded-md h-10 text-sm py-2 bg-gray-100"
                      />
                    </FormItem>
                    <FormItem className="space-y-1 pt-2">
                      <FormLabel className="text-sm">Pag-ibig</FormLabel>
                      <Input
                        value="211077860009"
                        readOnly
                        className="rounded-md h-10 text-sm py-2 bg-gray-100"
                      />
                    </FormItem>
                    <FormItem className="space-y-1 pt-2">
                      <FormLabel className="text-sm">
                        Tax Identification
                      </FormLabel>
                      <Input
                        value="647-243-779"
                        readOnly
                        className="rounded-md h-10 text-sm py-2 bg-gray-100"
                      />
                    </FormItem>
                    <FormItem className="space-y-1 pt-2">
                      <FormLabel className="text-sm">
                        Revenue District Code
                      </FormLabel>
                      <Input
                        value="081"
                        readOnly
                        className="rounded-md h-10 text-sm py-2 bg-gray-100"
                      />
                    </FormItem>
                  </div>
                </div>

                {/* Form submission buttons */}
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-sm h-10"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="text-sm h-10 bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}