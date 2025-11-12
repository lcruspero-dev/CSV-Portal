import { AuthAPI } from "@/API/authEndPoint";
import { LeaveCreditAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/useAuth";
import { ChangeEvent, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
        title: "Password too short",
        description:
          "Password must be at least 12 characters long and include alphanumeric and special characters.",
        variant: "destructive",
      });
      setIsLoading(false)
      return;
    }

    if (form.password !== form.confirm_password) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    if (!form.email.endsWith("@csvnow.com")) {
      toast({
        title: "Invalid email domain",
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
        title: "Account created successfully",
        description: "We've created your account for you.",
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
        title: "Error creating account",
        description: "User Already Exists",
        variant: "destructive",
      });
      console.error(error);
    } finally{
      setIsLoading(false)
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
    <div className="max-w-xl w-full space-y-2 bg-gradient-to-b from-amber-50 via-orange-100 to-yellow-50 p-10 rounded-2xl shadow-xl border border-amber-200">
      <form className="w-full max-w-xl space-y-6" onSubmit={handleSubmit}>
        <div className="text-center mb-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 text-transparent bg-clip-text md:text-3xl">
            Create Account
          </h1>
          <p className="text-amber-700 font-medium mt-2">
            Join our employee portal
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-4">
            <Input
              placeholder="First Name"
              name="firstName"
              type="text"
              className="w-full border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              onChange={handleChange}
              required
            />
            <Input
              placeholder="Last Name"
              name="lastName"
              type="text"
              className="w-full border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Middle Name"
              name="middleName"
              type="text"
              className="w-full border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              onChange={handleChange}
            />
            <Input
              placeholder="Company Email"
              name="email"
              type="email"
              className="w-full border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Password Input with Toggle */}
          <div className="relative">
            <Input
              placeholder="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-full border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
              className="w-full border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button
            typeof="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-amber-500/40"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Account 🍂"
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-amber-700">
          <p>
            Already have an account?{" "}
            <Link
              to={"/sign-in"}
              className="text-orange-700 hover:underline font-semibold"
            >
              Sign-in <span className="animate-pulse">🧡</span>
            </Link>
          </p>
        </div>

      </form>
    </div>
  );
};

export default Registration;
