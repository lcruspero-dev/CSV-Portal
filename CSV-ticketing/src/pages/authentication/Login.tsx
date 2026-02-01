/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthAPI } from "@/API/authEndPoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/useAuth";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";

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

  // Redirect authenticated users
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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

    try {
      const response = await AuthAPI.login(form);

      if (response.data.status === "inactive") {
        toast({
          title: "Account Deactivated",
          description:
            "Your account has been deactivated. Please contact admin.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const userData = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        isAdmin: response.data.isAdmin,
        role: response.data.role,
        status: response.data.status,
        token: response.data.token,
        loginLimit: response.data.loginLimit,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem(
        "isAuthenticated",
        JSON.stringify({
          isAuthenticated: true,
          isAdmin: response.data.isAdmin,
        })
      );

      login(userData);

      toast({
        title: "Welcome Back!",
        description: "You're successfully signed in.",
        variant: "default",
      });

      navigate(from, { replace: true });
    } catch (error: any) {
      if (error.message === "Invalid credentials") {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "An error occurred during login",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="pt-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to access your employee portal
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-purple-500" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your work email"
                  className="w-full pl-10 pr-4 py-3 border-gray-300 focus:border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-purple-500" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border-gray-300 focus:border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  onChange={handleChange}
                  disabled={isLoading}
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
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 12 characters with alphanumeric and special
                characters
              </p>
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/sign-up"
                className="inline-flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors duration-200 text-gray-700 font-medium"
              >
                Create Account
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="text-purple-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-purple-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
