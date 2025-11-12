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
          description: "Your account has been deactivated. Please contact admin.",
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
        description: "You’re successfully signed in. Happy Thanksgiving! 🦃",
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
    <div className="max-w-md w-full space-y-8 bg-gradient-to-b from-amber-50 via-orange-100 to-yellow-50 p-10 rounded-2xl shadow-xl border border-amber-200">
      {/* Header */}
      <div className="flex flex-col items-center space-y-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 text-transparent bg-clip-text md:text-3xl">
          Employee Portal
        </h1>
        <p className="text-amber-700 font-medium">
         Sign in to your account
        </p>
      </div>

      {/* Login Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-amber-800">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your work email"
              className="w-full pl-10 pr-4 py-3 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-amber-800">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full pl-10 pr-12 py-3 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500 hover:text-amber-700 transition-colors duration-200"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-amber-500/40"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in 🍂"
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-amber-700">
          Not a member?{" "}
          <Link
            to={"/sign-up"}
            className="text-orange-700 hover:underline font-semibold"
          >
            Join the family <span className="animate-pulse">🧡</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
