import { ResetPassword as ResetPasswordAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, EyeIcon, EyeOffIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ResetPasswordFormData {
  email: string;
  password: string;
  confirmPassword: string;
  secretKey: string;
}

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    secretKey: "",
  });
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ResetPasswordFormData> = {};

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{12,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be at least 12 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords must match";
    }

    if (!formData.secretKey) {
      newErrors.secretKey = "Secret key is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await ResetPasswordAPI.AdminResetPassword(formData);
      toast({
        title: "Success",
        description: response.data.message,
        variant: "default",
      });
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        secretKey: "",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-blue-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Reset Password Card */}
        <Card className="overflow-hidden rounded-3xl border border-slate-200 shadow-2xl backdrop-blur-sm bg-white/90">
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
            <CardHeader className="space-y-6 py-8">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="w-fit text-white hover:bg-white/20 rounded-full px-3"
              >
                <ArrowLeft size={18} />
                <span className="ml-2">Back</span>
              </Button>

              <div>
                <CardTitle className="text-3xl font-bold text-white">
                  Reset Password
                </CardTitle>

                <p className="text-blue-100 mt-2">
                  Reset a user's password securely using their email and
                  security key.
                </p>
              </div>
            </CardHeader>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus-visible:ring-2 focus-visible:ring-blue-500`}
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="password" className="text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword.password ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } focus-visible:ring-2 focus-visible:ring-blue-500 pr-10`}
                    placeholder="At least 12 characters"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("password")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.password ? (
                      <EyeOffIcon size={18} />
                    ) : (
                      <EyeIcon size={18} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword.confirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus-visible:ring-2 focus-visible:ring-blue-500 pr-10`}
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.confirmPassword ? (
                      <EyeOffIcon size={18} />
                    ) : (
                      <EyeIcon size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey" className="text-gray-700">
                  Security Key
                </Label>
                <Input
                  type="password"
                  id="secretKey"
                  name="secretKey"
                  value={formData.secretKey}
                  onChange={handleChange}
                  className={`${
                    errors.secretKey ? "border-red-500" : "border-gray-300"
                  } focus-visible:ring-2 focus-visible:ring-blue-500`}
                  placeholder="Enter admin security key"
                />
                {errors.secretKey && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.secretKey}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="
    h-12
    rounded-xl
    text-base
    font-semibold
    bg-gradient-to-r
    from-blue-600
    via-blue-700
    to-indigo-700
    hover:scale-[1.02]
    hover:shadow-xl
    transition-all
    duration-300
    "
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
