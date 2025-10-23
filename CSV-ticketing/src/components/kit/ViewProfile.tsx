import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Edit, User, Phone, MapPin, Mail, Briefcase, Building, Home } from "lucide-react";

interface ViewProfileProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData?: any; // Make it optional to prevent errors
  onEdit: () => void;
}

interface UserType {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null | undefined;
}) => {
  // Handle all cases where we should show "—"
  const displayValue =
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "string" && value.trim() === "") ||
    (typeof value === "number" && value === 0)
      ? "—"
      : String(value).trim();

  return (
    <div className="py-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{displayValue}</p>
    </div>
  );
};

// Utility function to format mobile number with country code
const formatMobileNumber = (mobileNumber?: string | number, countryCode?: string): string => {
  if (!mobileNumber || mobileNumber === 0) return "—";
  
  // Convert to string if it's a number
  const numberString = String(mobileNumber);
  
  // Clean the mobile number - remove all non-digit characters
  const cleanedNumber = numberString.replace(/\D/g, '');
  
  // If no country code provided, default to Philippines (+63)
  const code = countryCode || "+63";
  
  // Format based on the length of the cleaned number
  if (cleanedNumber.length === 10) {
    // Format as +63 912 345 6789
    return `${code} ${cleanedNumber.slice(0, 3)} ${cleanedNumber.slice(3, 6)} ${cleanedNumber.slice(6)}`;
  } else if (cleanedNumber.length === 11) {
    // Format as +63 912 345 6789
    return `${code} ${cleanedNumber.slice(1, 4)} ${cleanedNumber.slice(4, 7)} ${cleanedNumber.slice(7)}`;
  } else if (cleanedNumber.length === 12 && cleanedNumber.startsWith('63')) {
    // Format as +63 912 345 6789
    return `${code} ${cleanedNumber.slice(2, 5)} ${cleanedNumber.slice(5, 8)} ${cleanedNumber.slice(8)}`;
  } else {
    // Return the original number if it doesn't match expected formats
    return numberString;
  }
};

// Utility function to format date as mm/dd/yyyy
const formatDate = (dateString?: string): string => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—"; // Handle invalid dates
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Utility function to calculate age from date of birth
const calculateAge = (dateOfBirth?: string): string => {
  if (!dateOfBirth) return "—";
  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) return "—"; // Handle invalid dates
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

// GitHub-style Section Component
const GitHubSection = ({ 
  children, 
  title,
  icon: Icon
}: { 
  children: React.ReactNode;
  title: string;
  icon: React.ComponentType<any>;
}) => (
  <div className="border border-gray-300 rounded-md bg-white">
    <div className="border-b border-gray-300 bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-600" />
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

export default function ViewProfile({
  userData = {},
  onEdit,
}: ViewProfileProps) {
  const storedUser = localStorage.getItem("user");
  const user: UserType | null = storedUser ? JSON.parse(storedUser) : null;

  // Format date of birth and compute age
  const formattedDateOfBirth = formatDate(userData?.dateOfBirth);
  const computedAge = calculateAge(userData?.dateOfBirth);

  // Format mobile number with country code
  const formattedMobileNumber = formatMobileNumber(
    userData?.mobileNumber, 
    userData?.countryCode
  );

  // Construct the avatar URL if it exists
  const avatarUrl = userData?.avatar
    ? `${import.meta.env.VITE_UPLOADFILES_URL}/avatars/${userData.avatar}`
    : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-4 max-w-7xl mx-auto px-4">
      {/* Left Sidebar - Profile Card */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6">
        {/* Profile Card */}
        <div className="border border-gray-300 rounded-md bg-white">
          <div className="border-b border-gray-300 bg-gray-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Profile</h2>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 mb-4">
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
            </div>

            <div className="text-center mb-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {userData?.firstName || "—"} {userData?.lastName || "—"}
              </h3>
              <p className="text-gray-500 text-sm">{user?.email || "—"}</p>
              <p className="text-gray-600 text-sm mt-1">{userData?.jobPosition || "—"}</p>
            </div>

            {/* Mobile Number Preview */}
            {userData?.mobileNumber && userData.mobileNumber !== 0 && (
              <div className="flex items-center gap-3 w-full p-3 bg-gray-50 rounded border border-gray-200 mb-4">
                <Phone className="h-4 w-4 text-gray-600" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Mobile</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formattedMobileNumber}
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={onEdit}
              className="w-full inline-flex items-center justify-center gap-2 text-sm py-2 px-4 h-9"
              variant="outline"
            >
              <Edit className="h-3 w-3" />
              Edit profile
            </Button>
          </div>
        </div>

        {/* Back Button */}
        <div className="border border-gray-300 rounded-md bg-white">
          <div className="p-4">
            <BackButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:w-3/4 flex flex-col gap-6">
        {/* Personal Data Section */}
        <GitHubSection title="Personal information" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <InfoItem label="First name" value={userData?.firstName} />
            <InfoItem label="Middle name" value={userData?.middleName} />
            <InfoItem label="Last name" value={userData?.lastName} />
            <InfoItem label="Birth date" value={formattedDateOfBirth} />
            <InfoItem label="Age" value={computedAge} />
            <InfoItem label="Gender" value={userData?.gender} />
            <InfoItem label="Tax status" value={userData?.taxStatus} />
          </div>
        </GitHubSection>

        {/* Employment Details Section */}
        <GitHubSection title="Employment details" icon={Briefcase}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <InfoItem label="Department" value={userData?.department} />
            <InfoItem label="Job position" value={userData?.jobPosition} />
            <InfoItem label="Employment status" value={userData?.employmentStatus} />
            <InfoItem label="Date hired" value={formatDate(userData?.dateHired)} />
            <InfoItem label="Probationary date" value={formatDate(userData?.probationaryDate)} />
            <InfoItem label="Regularization date" value={formatDate(userData?.regularizationDate)} />
          </div>
        </GitHubSection>

        {/* Government IDs Section */}
        <GitHubSection title="Government IDs" icon={Building}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <InfoItem label="TIN" value={userData?.tinNo} />
            <InfoItem label="SSS" value={userData?.sssNo} />
            <InfoItem label="PHILHEALTH" value={userData?.philhealthNo} />
            <InfoItem label="HDMF (PAGIBIG No.)" value={userData?.pagibigNo} />
            <InfoItem label="HMO Account Number" value={userData?.hmoAccountNumber} />
            <InfoItem label="Bank Account Number" value={userData?.bankAccountNumber} />
          </div>
        </GitHubSection>

        {/* Contact Details Section */}
        <GitHubSection title="Contact details" icon={Mail}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <InfoItem label="Country code" value={userData?.countryCode || "+63"} />
            <InfoItem label="Mobile number" value={formattedMobileNumber} />
            <InfoItem label="Email address" value={userData?.emailAddress} />
            <InfoItem label="Phone number" value={userData?.phoneAddress} />
          </div>
        </GitHubSection>

        {/* Present Address Section */}
        <GitHubSection title="Present address" icon={MapPin}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <InfoItem label="House #" value={userData?.presentHouseNo} />
            <InfoItem label="Street" value={userData?.presentStreet} />
            <InfoItem label="Barangay" value={userData?.presentBarangay} />
            <InfoItem label="Town" value={userData?.presentTown} />
            <InfoItem label="City" value={userData?.presentCity} />
            <InfoItem label="Province" value={userData?.presentProvince} />
          </div>
        </GitHubSection>

        {/* Home Address Section */}
        <GitHubSection title="Home address" icon={Home}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <InfoItem label="House #" value={userData?.homeHouseNo} />
            <InfoItem label="Street" value={userData?.homeStreet} />
            <InfoItem label="Barangay" value={userData?.homeBarangay} />
            <InfoItem label="Town" value={userData?.homeTown} />
            <InfoItem label="City" value={userData?.homeCity} />
            <InfoItem label="Province" value={userData?.homeProvince} />
          </div>
        </GitHubSection>

        {/* Employer's Data Section */}
        <GitHubSection title="Employer's data" icon={Building}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <InfoItem label="Company name" value="CSV NOW OPC" />
            <InfoItem label="Social Security" value="80-0368897-1-000" />
            <InfoItem label="Phil. Health" value="012000049916" />
            <InfoItem label="Pag-ibig" value="211077860009" />
            <InfoItem label="Tax Identification" value="647-243-779" />
            <InfoItem label="Revenue District Code" value="081" />
          </div>
        </GitHubSection>
      </div>
    </div>
  );
}