import { AuthAPI } from "@/API/authEndPoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

// Define allowed roles
const ALLOWED_ROLES = ["TL", "TM", "HR", "IT", "SUPERADMIN"];

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
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
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600">
      <div className="flex w-full justify-center items-center p-4">
        <div className="w-full max-w-md space-y-8 bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Shield className="w-16 h-16 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">DMS</h1>
            <h2 className="text-xl text-gray-600 text-center">
              Discipline Management System
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Email"
                  name="email"
                  type="email"
                  className="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative">
                <Input
                  placeholder="Password"
                  name="password"
                  type="password"
                  className="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
