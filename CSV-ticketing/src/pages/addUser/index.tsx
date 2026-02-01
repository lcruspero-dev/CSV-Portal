/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, FormEvent, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "@/API/authEndPoint";

interface Form {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  confirm_password: string;
}

const AddUser = () => {
  const [form, setForm] = useState<Form>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    const middleInitial = form.middleName
      ? `${form.middleName.charAt(0).toUpperCase()}.`
      : "";

    const fullName = `${form.firstName} ${middleInitial} ${form.lastName}`.trim();

    // Password validation
    if (form.password.length < 12) {
      toast({
        title: "Password too short",
        description:
          "Password must be at least 12 characters long and include alphanumeric and special characters.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (form.password !== form.confirm_password) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Email domain validation
    if (!form.email.endsWith("@csvnow.com")) {
      toast({
        title: "Invalid email domain",
        description: "Please use a company email address.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: fullName,
        email: form.email,
        password: form.password,
      };

      const response = await AuthAPI.addUser(payload);

      toast({
        title: "Account created successfully",
        description: "Welcome to CSV NOW",
      });

      const userData = {
        _id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        isAdmin: response.data.user.isAdmin,
        role: response.data.user.role,
        status: response.data.user.status,
        loginLimit: response.data.user.loginLimit,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Failed to create account",
        description: error?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
     <section className="max-w-md mx-auto">
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={form.firstName}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="middleName"
        placeholder="Middle Name"
        value={form.middleName}
        onChange={handleChange}
      />

      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={form.lastName}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Company Email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="confirm_password"
        placeholder="Confirm Password"
        value={form.confirm_password}
        onChange={handleChange}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create User"}
      </button>

    </form>
  </section>
  );
};

export default AddUser;
