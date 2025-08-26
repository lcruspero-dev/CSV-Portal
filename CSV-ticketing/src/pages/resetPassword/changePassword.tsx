import { ChangePasswordAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, EyeIcon, EyeOffIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChangePassword: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {};
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{12,}$/;

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword = "Password must be at least 12 characters";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords must match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await ChangePasswordAPI.updatePassword(formData);
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
        });
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast({
          title: "Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const togglePasswordVisibility = (field: keyof typeof formData) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="flex  justify-center  bg-gray-100 p-4 md:p-8">
      <Card className="w-full max-w-md relative mb-52">
        {/* Custom Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <CardHeader>
          <CardTitle className="text-center">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {Object.entries(formData).map(([key, value]) => (
              <div className="relative" key={key}>
                <Label htmlFor={key}>
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </Label>
                <Input
                  type={
                    showPassword[key as keyof typeof formData]
                      ? "text"
                      : "password"
                  }
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  className={
                    errors[key as keyof typeof formData]
                      ? "border-red-500 pr-10"
                      : "pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    togglePasswordVisibility(key as keyof typeof formData)
                  }
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                  aria-label={
                    showPassword[key as keyof typeof formData]
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword[key as keyof typeof formData] ? (
                    <EyeOffIcon size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </button>
                {errors[key as keyof typeof formData] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[key as keyof typeof formData]}
                  </p>
                )}
              </div>
            ))}
            <Button type="submit" className="w-full mt-6">
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
