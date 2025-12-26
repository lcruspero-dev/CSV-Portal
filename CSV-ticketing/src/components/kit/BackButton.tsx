import IonArrowBackCircleSharp from "@/assets/arrow";
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
      className="bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
    >
      <IonArrowBackCircleSharp  className="w-5 h-5" />
      Back 
    </Button>
  );
};

export default BackButton;