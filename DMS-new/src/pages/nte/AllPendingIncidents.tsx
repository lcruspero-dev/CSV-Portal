import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PendingIncidents = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 space-y-6">
      <Alert className="w-full max-w-md bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <AlertDescription className="text-lg font-semibold text-yellow-800">
          PENDING INCIDENTS IS NOT AVAILABLE RIGHT NOW
        </AlertDescription>
      </Alert>

      <Button
        onClick={handleBack}
        variant="outline"
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Go Back
      </Button>
    </div>
  );
};

export default PendingIncidents;
