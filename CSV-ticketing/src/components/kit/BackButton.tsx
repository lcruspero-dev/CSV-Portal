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
      className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#A0522D] hover:to-[#CD853F] text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-1 transition-all duration-300 transform hover:scale-105"
    >
      <IonArrowBackCircleSharp className="w-5 h-5" />
      Back 🦃
    </Button>
  );
};

export default BackButton;