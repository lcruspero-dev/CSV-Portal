import { AuthAPI } from "@/API/authEndPoint";
import { LeaveCreditAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/useAuth";
import { ChangeEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

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
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      return;
    }

    if (form.password !== form.confirm_password) {
      toast({ title: "Passwords do not match" });
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
    }
  };

  const isAuthenticated = localStorage.getItem("user");

  // If the user is authenticated, redirect them to the homepage
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex w-full justify-end mb-40 mt-10">
      <form className="w-1/2 space-y-4" onSubmit={handleSubmit}>
        <h1 className="text-4xl drop-shadow-lg p-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
          Create Account
        </h1>

        <div className="flex gap-4">
          <Input
            placeholder="First Name"
            name="firstName"
            type="text"
            className="w-full"
            onChange={handleChange}
            required
          />
          <Input
            placeholder="Middle Name"
            name="middleName"
            type="text"
            className="w-full"
            onChange={handleChange}
          />
        </div>

        <Input
          placeholder="Last Name"
          name="lastName"
          type="text"
          className="w-full"
          onChange={handleChange}
          required
        />

        <Input
          placeholder="Company Email"
          name="email"
          type="email"
          className="w-full"
          onChange={handleChange}
          required
        />
        <Input
          placeholder="Password"
          name="password"
          type="password"
          className="w-full"
          onChange={handleChange}
          required
        />
        <Input
          placeholder="Confirm Password"
          name="confirm_password"
          type="password"
          className="w-full"
          onChange={handleChange}
          required
        />
        <Button className="w-full" type="submit">
          SignUp
        </Button>
      </form>
    </div>
  );
};

export default Registration;
