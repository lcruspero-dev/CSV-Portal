import { AuthAPI } from "@/API/authEndPoint";
import { LeaveCreditAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/useAuth";
import { ChangeEvent, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Star,
  CandyCane,
} from "lucide-react";

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

    // Combine names into a single string
    const middleInitial = form.middleName
      ? `${form.middleName.charAt(0).toUpperCase()}.`
      : "";
    const fullName =
      `${form.firstName} ${middleInitial} ${form.lastName}`.trim();

    // Password validation - must be at least 12 characters with alphanumeric + special characters
    if (form.password.length < 12) {
      toast({
        title: "🎅 Password too short",
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
        title: " Invalid email domain",
        description: "Please use your company email address",
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
        description: "Welcome to Santa's Workshop!",
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
          title: "🎅 Account created but leave credit setup failed",
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
    <div className="max-w-4xl w-full space-y-2 bg-gradient-to-br from-green-50 via-white to-red-50 p-10 rounded-2xl shadow-2xl border-2 border-green-300 relative overflow-hidden">
      <form
        className="w-full max-w-4xl space-y-6 relative z-10"
        onSubmit={handleSubmit}
      >
        <div className="text-center mb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-red-600 rounded-full">
              <Star className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 via-red-600 to-yellow-600 text-transparent bg-clip-text md:text-3xl">
            🎅 Join CSV now 
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="First Name"
                name="firstName"
                type="text"
                className="w-full border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-green-50 to-green-100"
                onChange={handleChange}
                required
              />
            </div>
            <div className="relative">
              <Input
                placeholder="Last Name"
                name="lastName"
                type="text"
                className="w-full border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-green-50 to-green-100"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Middle Name"
                name="middleName"
                type="text"
                className="w-full border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-yellow-50 to-yellow-100"
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Input
                placeholder="Company Email"
                name="email"
                type="email"
                className="w-full border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-red-50 to-red-100"
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Password Input with Toggle */}
          <div className="relative">
            <Input
              placeholder="Password (min 12 characters)"
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-full border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pr-10 bg-gradient-to-r from-green-50 to-green-100"
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700 transition-colors duration-200"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Confirm Password Input with Toggle */}
          <div className="relative">
            <Input
              placeholder="Confirm Password"
              name="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              className="w-full border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 pr-10 bg-gradient-to-r from-red-50 to-red-100"
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 transition-colors duration-200"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Password Requirements */}
          <div className="text-xs text-green-600 bg-gradient-to-r from-green-50 to-green-100 p-2 rounded-lg border border-green-200">
            <p className="flex items-center mb-1">
              <CandyCane className="h-3 w-3 mr-1" />
              Password must be at least 12 characters long
            </p>
          </div>

        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/40"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining Workshop...
              </>
            ) : (
              <>Sign up</>
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-green-700 pt-2">
          <p className="flex items-center justify-center">
            Already part of the team?{" "}
            <Link
              to={"/sign-in"}
              className="text-red-600 hover:underline font-semibold ml-1"
            >
              Sign In
            </Link>
            <span className="ml-1">🎅</span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Registration;