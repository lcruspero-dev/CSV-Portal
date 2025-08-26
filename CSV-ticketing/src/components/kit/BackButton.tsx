import IonArrowBackCircleSharp from "@/assets/arrow";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // This navigates back to the previous page
  };

  return (
    <Button
      onClick={handleBack}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center  justify-center gap-1"
    >
      <IonArrowBackCircleSharp className="w-5 h-5" />
      Back
    </Button>
  );
};

export default BackButton;
