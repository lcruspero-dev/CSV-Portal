import { AuthAPI } from "@/API/authEndPoint";
import { LeaveCreditAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/useAuth";
import { ChangeEvent, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, UserPlus, Building2 } from "lucide-react";

interface Form {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  confirm_password: string;
}

const Registration = () => {
  const [form, setForm] = useState<Form>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const middleInitial = form.middleName
      ? `${form.middleName.charAt(0).toUpperCase()}.`
      : "";
    const fullName = `${form.firstName} ${middleInitial} ${form.lastName}`.trim();

    // Password validation - must be at least 12 characters with alphanumeric + special characters
    if (form.password.length < 12) {
      toast({
        title: "Password too short",
        description:
          "Password must be at least 12 characters long and include alphanumeric and special characters.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (form.password !== form.confirm_password) {
      toast({
        title: "❌ Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    if (!form.email.endsWith("@csvnow.com")) {
      toast({
        title: "Invalid email domain",
        description: "Please use your company email address (@csvnow.com)",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create payload with combined name
      const payload = {
        name: fullName,
        email: form.email,
        password: form.password,
      };

      const response = await AuthAPI.register(payload);
      console.log(response.data);
      toast({
        title: "✅ Account created successfully!",
        description: "Welcome to CSV NOW",
      });

      // Create user object that matches the User interface
      const userData = {
        _id: response.data._id,
        name: fullName,
        email: form.email,
        isAdmin: response.data.isAdmin || false,
        role: response.data.role || "user",
        token: response.data.token,
        profileImage: response.data.profileImage,
      };

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      // Update the authentication context with the proper User object
      login(userData);

      // Create leave credit for the new employee
      try {
        const leaveCreditPayload = {
          employeeId: response.data._id, // Use the newly created user ID
          employeeName: fullName,
        };

        await LeaveCreditAPI.createLeaveCredit(leaveCreditPayload);
        console.log("Leave credit created successfully");
      } catch (leaveError) {
        console.error("Error creating leave credit:", leaveError);
        toast({
          title: "Account created but leave credit setup failed",
          description: "Please contact HR to set up your leave credits",
          variant: "destructive",
        });
      }

      navigate("/");
    } catch (error) {
      toast({
        title: "❌ Error creating account",
        description: "User Already Exists",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = localStorage.getItem("user");

  // If the user is authenticated, redirect them to the homepage
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100">
              <UserPlus className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Create Your Account
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4" />
            <span>CSV NOW Employee Portal</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <Input
                  placeholder="Enter your first name"
                  name="firstName"
                  type="text"
                  className="w-full border-gray-300 focus:border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <Input
                  placeholder="Enter your last name"
                  name="lastName"
                  type="text"
                  className="w-full border-gray-300 focus:border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Middle Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Middle Name (Optional)
                </label>
                <Input
                  placeholder="Enter your middle name"
                  name="middleName"
                  type="text"
                  className="w-full border-gray-300 focus:border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Company Email *
                </label>
                <Input
                  placeholder="your.name@csvnow.com"
                  name="email"
                  type="email"
                  className="w-full border-gray-300 focus:border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  Must use @csvnow.com domain
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="relative">
                  <Input
                    placeholder="Create a strong password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full border-gray-300 focus:border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all duration-200 pr-10"
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 transition-colors duration-200"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Input
                    placeholder="Re-enter your password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full border-gray-300 focus:border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all duration-200 pr-10"
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 transition-colors duration-200"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Password Requirements:
                </h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        form.password.length >= 12
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    At least 12 characters long
                  </li>
                  <li className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        /[A-Z]/.test(form.password)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    Contains uppercase letters
                  </li>
                  <li className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        /[0-9]/.test(form.password)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    Contains numbers
                  </li>
                  <li className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        /[^A-Za-z0-9]/.test(form.password)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    Contains special characters
                  </li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <Link
                to="/sign-in"
                className="inline-flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors duration-200 text-gray-700 font-medium"
              >
                Sign In to Existing Account
              </Link>
            </div>
          </form>

          {/* Terms and Conditions */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our{" "}
              <Link
                to="/terms"
                className="text-purple-600 hover:text-purple-800 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-purple-600 hover:text-purple-800 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default Registration;