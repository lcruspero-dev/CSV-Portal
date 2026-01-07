import { ChevronLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Button
      onClick={handleBack}
      variant="outline"
      className="border border-gray-300 hover:border-purple-300 hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-colors duration-200"
    >
      <ChevronLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );
};

export default BackButton;
