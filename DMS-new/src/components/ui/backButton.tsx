import { Button } from "@/components/ui/button";
import { ArrowBigLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  customClass?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ customClass = "" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={`flex items-center gap-2 hover:bg-gray-100 ${customClass}`}
    >
      <ArrowBigLeft className="h-4 w-4" />
      <span>Back</span>
    </Button>
  );
};

export default BackButton;
