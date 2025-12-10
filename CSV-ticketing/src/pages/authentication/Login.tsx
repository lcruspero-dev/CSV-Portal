/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthAPI } from "@/API/authEndPoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/useAuth";
import { Eye, EyeOff, Lock, Mail, Loader2, TreePine , Sparkles } from "lucide-react";
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
        description: "You're successfully signed in. Merry Christmas! 🎄",
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
    <div className="max-w-md w-full space-y-8 bg-gradient-to-b from-red-50 via-white to-green-50 p-10 rounded-2xl shadow-xl border border-red-200 relative overflow-hidden">
      {/* Christmas decorations */}
      <div className="absolute -top-6 -left-6 text-green-600 opacity-20">
        <TreePine  size={48} />
      </div>
      <div className="absolute -bottom-6 -right-6 text-red-600 opacity-20 rotate-90">
        <TreePine  size={48} />
      </div>
      <div className="absolute top-4 right-4 text-green-500 opacity-30">
        <Sparkles size={24} />
      </div>
      <div className="absolute bottom-4 left-4 text-red-500 opacity-30">
        <Sparkles size={24} />
      </div>

      {/* Header */}
      <div className="flex flex-col items-center space-y-3 relative z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 via-red-600 to-green-600 text-transparent bg-clip-text md:text-3xl">
            Employee Portal
          </h1>
          <Sparkles className="h-6 w-6 text-red-500 animate-pulse" />
        </div>
        <p className="text-green-700 font-medium bg-gradient-to-r from-red-500 to-green-600 text-transparent bg-clip-text">
          Sign in to your account
        </p>
      </div>

      {/* Login Form */}
      <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-green-800">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your work email"
              className="w-full pl-10 pr-4 py-3 border-red-300 focus:border-green-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-green-800">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full pl-10 pr-12 py-3 border-red-300 focus:border-green-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800 transition-colors duration-200"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/30 relative overflow-hidden"
          disabled={isLoading}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in 
              <Sparkles className="ml-2 h-4 w-4 animate-pulse" />
            </>
          )}
        </Button>
      </form>

      {/* Sign up link */}
      <div className="text-center relative z-10">
        <p className="text-sm text-green-700">
          Not a member?{" "}
          <Link
            to={"/sign-up"}
            className="text-red-600 hover:text-red-800 font-semibold hover:underline transition-colors duration-200"
          >
            Join the family <span className="animate-pulse">🎁</span>
          </Link>
        </p>
      </div>

      {/* Christmas pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-red-400"></div>
        <div className="absolute bottom-1/3 right-1/3 w-6 h-6 rounded-full bg-green-400"></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-red-400"></div>
        <div className="absolute bottom-1/4 left-1/3 w-6 h-6 rounded-full bg-green-400"></div>
      </div>
    </div>
  );
};

export default Login;