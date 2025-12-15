import { ChangeEvent, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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
    lastName: "",
    middleName: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const middleInitial = form.middleName
      ? `${form.middleName.charAt(0).toUpperCase()}.`
      : "";
    const fullName = `
        ${form.firstName} ${middleInitial} ${form.lastName}
        `.trim();

    if (!form.password !== form.confirm_password) {
      toast;
    }
  };

  return <section></section>;
};

export default AddUser;
