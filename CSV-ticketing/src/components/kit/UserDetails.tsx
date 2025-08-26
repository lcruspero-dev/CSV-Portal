import { UserProfileAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Camera, Edit, Upload, User } from "lucide-react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface UserProfileData {
  userId?: string;
  _id?: string;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  gender: string;
  civilStatus?: string;
  taxStatus?: string;
  department?: string;
  jobPosition?: string;
  employmentStatus?: string;
  dateHired?: string;
  probationaryDate?: string;
  regularizationDate?: string;
  tinNo?: string;
  sssNo?: string;
  philhealthNo?: string;
  pagibigNo?: string;
  hmoAccountNumber?: string;
  bankAccountNumber?: string;
  mobileNumber?: string;
  contactNumber?: string;
  emailAddress?: string;
  personalEmail?: string;
  phoneAddress?: string;
  presentHouseNo?: string;
  presentStreet?: string;
  presentBarangay?: string;
  presentTown?: string;
  presentCity?: string;
  presentProvince?: string;
  homeHouseNo?: string;
  homeStreet?: string;
  homeBarangay?: string;
  homeTown?: string;
  homeCity?: string;
  homeProvince?: string;
  streetAddress?: string;
  barangay?: string;
  cityMunicipality?: string;
  province?: string;
  zipCode?: string;
  emergencyContactPerson?: string;
  emergencyContactNumber?: string;
  relationship?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface ViewProfileProps {
  userData?: UserProfileData;
  onSave?: (updatedData: UserProfileData) => void;
  isNewProfile?: boolean;
  userId?: string;
}

const InfoItem = ({
  label,
  value,
  isEditing = false,
  onChange,
  onSelectChange,
  name,
  type = "text",
  options,
  required = false,
}: {
  label: string;
  value?: string | number | null | undefined;
  isEditing?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange?: (value: string) => void;
  name?: string;
  type?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}) => {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "—"
      : String(value).trim();

  if (isEditing) {
    if (options) {
      return (
        <div className="py-1">
          <p className="text-sm font-medium text-gray-500">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <Select
            onValueChange={(value) => {
              if (onSelectChange) {
                onSelectChange(value);
              } else {
                onChange?.({
                  target: { name, value },
                } as React.ChangeEvent<HTMLInputElement>);
              }
            }}
            defaultValue={displayValue !== "—" ? displayValue : ""}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div className="py-1">
        <p className="text-sm font-medium text-gray-500">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </p>
        <Input
          type={type}
          name={name}
          defaultValue={displayValue !== "—" ? displayValue : ""}
          onChange={onChange}
          className="h-8 text-sm"
          placeholder={label}
          required={required}
        />
      </div>
    );
  }

  return (
    <div className="py-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{displayValue}</p>
    </div>
  );
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

const calculateAge = (dateOfBirth?: string): string => {
  if (!dateOfBirth) return "—";
  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) return "—";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age.toString();
};

export default function ViewProfile({
  userData = {
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    gender: "",
    taxStatus: "",
    department: "",
    jobPosition: "",
    employmentStatus: "",
    dateHired: "",
    probationaryDate: "",
    regularizationDate: "",
    tinNo: "",
    sssNo: "",
    philhealthNo: "",
    pagibigNo: "",
    hmoAccountNumber: "",
    bankAccountNumber: "",
    mobileNumber: "",
    emailAddress: "",
    phoneAddress: "",
    presentHouseNo: "",
    presentStreet: "",
    presentBarangay: "",
    presentTown: "",
    presentCity: "",
    presentProvince: "",
    homeHouseNo: "",
    homeStreet: "",
    homeBarangay: "",
    homeTown: "",
    homeCity: "",
    homeProvince: "",
    avatar: "",
  },
  onSave,
  isNewProfile = false,
  userId,
}: ViewProfileProps) {
  const [isEditing, setIsEditing] = useState(isNewProfile);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [localUserData, setLocalUserData] = useState<UserProfileData>({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    middleName: userData?.middleName || "",
    dateOfBirth: userData?.dateOfBirth || "",
    gender: userData?.gender || "",
    taxStatus: userData?.taxStatus || "",
    department: userData?.department || "",
    jobPosition: userData?.jobPosition || "",
    employmentStatus: userData?.employmentStatus || "",
    dateHired: userData?.dateHired || "",
    probationaryDate: userData?.probationaryDate || "",
    regularizationDate: userData?.regularizationDate || "",
    tinNo: userData?.tinNo || "",
    sssNo: userData?.sssNo || "",
    philhealthNo: userData?.philhealthNo || "",
    pagibigNo: userData?.pagibigNo || "",
    hmoAccountNumber: userData?.hmoAccountNumber || "",
    bankAccountNumber: userData?.bankAccountNumber || "",
    mobileNumber: userData?.mobileNumber || "",
    emailAddress: userData?.emailAddress || "",
    phoneAddress: userData?.phoneAddress || "",
    presentHouseNo: userData?.presentHouseNo || "",
    presentStreet: userData?.presentStreet || "",
    presentBarangay: userData?.presentBarangay || "",
    presentTown: userData?.presentTown || "",
    presentCity: userData?.presentCity || "",
    presentProvince: userData?.presentProvince || "",
    homeHouseNo: userData?.homeHouseNo || "",
    homeStreet: userData?.homeStreet || "",
    homeBarangay: userData?.homeBarangay || "",
    homeTown: userData?.homeTown || "",
    homeCity: userData?.homeCity || "",
    homeProvince: userData?.homeProvince || "",
    avatar: userData?.avatar || "",
    userId: userData?.userId || userId || "",
  });

  const [birthDate, setBirthDate] = useState<Date | null>(
    userData?.dateOfBirth ? new Date(userData.dateOfBirth) : null
  );
  const [age, setAge] = useState(calculateAge(userData?.dateOfBirth));
  const { toast } = useToast();

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const taxStatusOptions = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "head", label: "Head of Family" },
  ];

  const employmentStatusOptions = [
    { value: "regular", label: "Regular" },
    { value: "probationary", label: "Probationary" },
    { value: "contractual", label: "Contractual" },
    { value: "part-time", label: "Part-time" },
  ];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalUserData({
      ...userData,
      userId: userData?.userId || userId || "",
    });
    setBirthDate(userData?.dateOfBirth ? new Date(userData.dateOfBirth) : null);
    setAvatar(null);
    setPreviewUrl("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let avatarFilename = userData?.avatar || "";

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
          throw new Error("Failed to upload avatar");
        }

        const uploadResult = await uploadResponse.json();
        avatarFilename = uploadResult.filename;
      }

      const targetUserId = userId || userData?.userId;
      if (!targetUserId) {
        throw new Error("No user ID found for profile update");
      }

      const profileData = {
        ...localUserData,
        avatar: avatarFilename,
      };

      const response = await UserProfileAPI.adminUpdateUserProfile(
        targetUserId,
        profileData
      );

      toast({
        title: "Success",
        description: "Profile saved successfully",
      });

      setIsEditing(false);
      if (onSave) onSave(response.data);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setLocalUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | null, field: string) => {
    if (field === "dateOfBirth") {
      setBirthDate(date);
      if (date) {
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < date.getDate())
        ) {
          age--;
        }
        setAge(age.toString());
      } else {
        setAge("—");
      }
    }
    setLocalUserData((prev) => ({
      ...prev,
      [field]: date ? date.toISOString() : "",
    }));
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

  const formattedDateOfBirth = formatDate(localUserData?.dateOfBirth);
  const computedAge = calculateAge(localUserData?.dateOfBirth);
  const avatarUrl =
    previewUrl ||
    (localUserData?.avatar
      ? `${import.meta.env.VITE_UPLOADFILES_URL}/avatars/${
          localUserData.avatar
        }`
      : null);

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      {/* Profile Photo Card */}
      <Card className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-md rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3">
          <CardTitle className="text-sm font-bold">Profile Picture</CardTitle>
          <CardDescription className="text-blue-100 text-sm">
            Your professional picture
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 flex flex-col items-center justify-center">
          <div className="mb-3 flex flex-col items-center space-y-2">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
              {isEditing && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <Camera className="h-6 w-6 text-white" />
                </label>
              )}
            </div>

            {isEditing && (
              <>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-md cursor-pointer hover:bg-blue-100 transition-colors h-10"
                >
                  <Upload className="h-3 w-3" />
                  Upload New Photo
                </label>
              </>
            )}

            <div className="text-center">
              <h3 className="font-medium text-gray-800 text-sm mb-1">
                {localUserData?.firstName || "—"}{" "}
                {localUserData?.lastName || "—"}
              </h3>
              <p className="text-gray-500 text-sm">
                {localUserData?.emailAddress || "—"}
              </p>
            </div>
          </div>
          {!isEditing ? (
            <Button
              variant="default"
              size="sm"
              className="text-white hover:bg-white/10 text-sm"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="text-white text-sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="text-white text-sm px-5"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Details Card */}
      <Card className="w-full md:w-2/3 lg:w-3/4 bg-white shadow-md rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 flex justify-between items-center">
          <div>
            <CardTitle className="text-sm font-bold">
              Employee Profile
            </CardTitle>
            <CardDescription className="text-blue-100 text-sm">
              {isEditing
                ? "Edit employee information"
                : "Complete employee information"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-4">
            {/* Personal Data Section */}
            <div>
              <h3 className="text-sm font-bold flex items-center mb-2">
                <span className="bg-blue-100 text-blue-800 p-1 rounded-md mr-2 text-sm text-bold">
                  01
                </span>
                Personal Data
              </h3>
              <Separator className="mb-1" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-0 text-sm">
                <InfoItem
                  label="First Name"
                  value={localUserData.firstName}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="firstName"
                  required
                />
                <InfoItem
                  label="Middle Name"
                  value={localUserData.middleName}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="middleName"
                />
                <InfoItem
                  label="Last Name"
                  value={localUserData.lastName}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="lastName"
                  required
                />
                {isEditing ? (
                  <div className="py-1">
                    <p className="text-sm font-medium text-gray-500">
                      Birth Date<span className="text-red-500 ml-1">*</span>
                    </p>
                    <DatePicker
                      selected={birthDate}
                      onChange={(date) => handleDateChange(date, "dateOfBirth")}
                      dateFormat="MM/dd/yyyy"
                      placeholderText="mm/dd/yyyy"
                      className="border border-gray-300 rounded-md h-8 text-sm px-3 w-full"
                    />
                  </div>
                ) : (
                  <InfoItem label="Birth Date" value={formattedDateOfBirth} />
                )}
                <InfoItem label="Age" value={isEditing ? age : computedAge} />
                <InfoItem
                  label="Gender"
                  value={localUserData.gender}
                  isEditing={isEditing}
                  onSelectChange={(value) =>
                    handleSelectChange("gender", value)
                  }
                  options={genderOptions}
                  required
                />
                <InfoItem
                  label="Tax Status"
                  value={localUserData.taxStatus}
                  isEditing={isEditing}
                  onSelectChange={(value) =>
                    handleSelectChange("taxStatus", value)
                  }
                  options={taxStatusOptions}
                  required
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
              <Separator className="mb-1" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-0">
                <InfoItem
                  label="Department"
                  value={localUserData.department}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="department"
                  required
                />
                <InfoItem
                  label="Job Position"
                  value={localUserData.jobPosition}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="jobPosition"
                  required
                />
                <InfoItem
                  label="Employment Status"
                  value={localUserData.employmentStatus}
                  isEditing={isEditing}
                  onSelectChange={(value) =>
                    handleSelectChange("employmentStatus", value)
                  }
                  options={employmentStatusOptions}
                  required
                />
                <InfoItem
                  label="Date Hired"
                  value={formatDate(localUserData.dateHired)}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="dateHired"
                  type="date"
                />
                <InfoItem
                  label="Probationary Date"
                  value={formatDate(localUserData.probationaryDate)}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="probationaryDate"
                  type="date"
                />
                <InfoItem
                  label="Regularization Date"
                  value={formatDate(localUserData.regularizationDate)}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="regularizationDate"
                  type="date"
                />
                <InfoItem
                  label="TIN"
                  value={localUserData.tinNo}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="tinNo"
                />
                <InfoItem
                  label="SSS"
                  value={localUserData.sssNo}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="sssNo"
                />
                <InfoItem
                  label="PHILHEALTH"
                  value={localUserData.philhealthNo}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="philhealthNo"
                />
                <InfoItem
                  label="HDMF (PAGIBIG No.)"
                  value={localUserData.pagibigNo}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="pagibigNo"
                />
                <InfoItem
                  label="HMO Account Number"
                  value={localUserData.hmoAccountNumber}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="hmoAccountNumber"
                  type="number"
                />
                <InfoItem
                  label="Bank Account Number"
                  value={localUserData.bankAccountNumber}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="bankAccountNumber"
                  type="number"
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
              <Separator className="mb-1" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-0">
                <InfoItem
                  label="Mobile Number"
                  value={localUserData.mobileNumber}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="mobileNumber"
                  type="tel"
                  required
                />
                <InfoItem
                  label="Email Address"
                  value={localUserData.emailAddress}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="emailAddress"
                  type="email"
                  required
                />
                <InfoItem
                  label="Phone Address"
                  value={localUserData.phoneAddress}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="phoneAddress"
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
              <Separator className="mb-1" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-0">
                <InfoItem
                  label="House #"
                  value={localUserData.presentHouseNo}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="presentHouseNo"
                />
                <InfoItem
                  label="Street"
                  value={localUserData.presentStreet}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="presentStreet"
                />
                <InfoItem
                  label="Barangay"
                  value={localUserData.presentBarangay}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="presentBarangay"
                />
                <InfoItem
                  label="Town"
                  value={localUserData.presentTown}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="presentTown"
                />
                <InfoItem
                  label="City"
                  value={localUserData.presentCity}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="presentCity"
                />
                <InfoItem
                  label="Province"
                  value={localUserData.presentProvince}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="presentProvince"
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
              <Separator className="mb-1" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-0">
                <InfoItem
                  label="House #"
                  value={localUserData.homeHouseNo}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="homeHouseNo"
                />
                <InfoItem
                  label="Street"
                  value={localUserData.homeStreet}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="homeStreet"
                />
                <InfoItem
                  label="Barangay"
                  value={localUserData.homeBarangay}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="homeBarangay"
                />
                <InfoItem
                  label="Town"
                  value={localUserData.homeTown}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="homeTown"
                />
                <InfoItem
                  label="City"
                  value={localUserData.homeCity}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="homeCity"
                />
                <InfoItem
                  label="Province"
                  value={localUserData.homeProvince}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  name="homeProvince"
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
              <Separator className="mb-1" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-0">
                <InfoItem label="Company Name" value="CSV NOW OPC" />
                <InfoItem label="Social Security" value="80-0368897-1-000" />
                <InfoItem label="Phil. Health" value="012000049916" />
                <InfoItem label="Pag-ibig" value="211077860009" />
                <InfoItem label="Tax Identification" value="647-243-779" />
                <InfoItem label="Revenue District Code" value="081" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
