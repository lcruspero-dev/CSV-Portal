import { AuthAPI } from "@/API/authEndPoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

// Define allowed roles
const ALLOWED_ROLES = ["TL", "TM", "HR", "IT", "SUPERADMIN"];

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { login } = useAuth();
  const isAuthenticated = localStorage.getItem("user");

  // If the user is authenticated, redirect them to the homepage
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateUserAccess = (userData: any) => {
    // Check if user has an allowed role
    if (!ALLOWED_ROLES.includes(userData.role)) {
      throw new Error("unauthorized_role");
    }

    // Check if user status is active
    if (userData.status !== "active") {
      throw new Error("inactive_account");
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await AuthAPI.login(form);

      try {
        // Validate user access
        validateUserAccess(response.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (validationError: any) {
        if (validationError.message === "unauthorized_role") {
          toast({
            title: "Unauthorized Access",
            description: "You do not have permission to access this system.",
            variant: "destructive",
          });
          return;
        }
        if (validationError.message === "inactive_account") {
          toast({
            title: "Account Inactive",
            description:
              "Your account is not active. Please contact your administrator.",
            variant: "destructive",
          });
          return;
        }
      }

      // If validation passes, proceed with login
      toast({
        title: "Success",
        description: "Login successful",
        variant: "success",
      });

      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(response.data));

      // Update auth context
      login({ isAuthenticated: true, isAdmin: response.data.isAdmin });

      // Redirect to the intended page or home
      navigate(from, { replace: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Handle API errors
      if (
        error?.response?.data?.message === "Invalid credentials" ||
        error.message === "Invalid credentials"
      ) {
        toast({
          title: "Invalid Credentials",
          description: "Your email or password is incorrect.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
        // Log the error for debugging
        console.error("Login error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Left side - Brand/Graphics */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center space-y-8 max-w-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Shield className="w-20 h-20" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">DMS</h1>
            <h2 className="text-2xl font-semibold text-blue-100">
              Discipline Management System
            </h2>
          </div>
          
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center justify-center space-y-4 mb-8">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">DMS</h1>
              <h2 className="text-lg text-gray-600 mt-2">
                Discipline Management System
              </h2>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Welcome Back</h3>
              <p className="text-gray-500 mt-2">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                  <Input
                    placeholder="Enter your email"
                    name="email"
                    type="email"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <Input
                    placeholder="Enter your password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600">
                  Need help?{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} DMS. All rights reserved.</p>
            <p className="mt-1">v2.1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;