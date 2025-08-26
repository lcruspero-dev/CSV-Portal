import { SurveyAPI } from "@/API/endpoint";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Star } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Survey {
  _id: string;
  title: string;
  description: string;
  question: string;
  allowAnonymous: boolean;
  status: string;
}

interface SurveyResponse {
  surveyId: string;
  feedback: string;
  ratingAnswer: string;
  isAnonymous: boolean;
}

const SurveyModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await SurveyAPI.getAllActiveSurveys();

        if (response.data?.data && response.data.data.length > 0) {
          setCurrentSurvey(response.data.data[0]);
          setIsOpen(true); // Open the dialog when we have a survey
        } else {
          console.log("No surveys found in response");
        }
      } catch (error) {
        console.error("Error fetching surveys:", error);
        setError("Failed to load survey");
      }
    };

    fetchSurveys();
  }, []);

  const handleSubmit = async () => {
    if (!currentSurvey) {
      console.log("No survey available for submission");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const surveyResponse: SurveyResponse = {
        surveyId: currentSurvey._id,
        feedback,
        ratingAnswer: rating.toString(),
        isAnonymous,
      };

      await SurveyAPI.submitResponse(currentSurvey._id, surveyResponse);
      setIsOpen(false);
      setCurrentSurvey(null);
      toast({
        title: "Success",
        description: "Thank you for your feedback",
        variant: "default",
      });
    } catch (error) {
      console.error("Error submitting survey:", error);
      setError("Failed to submit survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const NotificationBadge = () => (
    <div
      onClick={() => {
        setIsMinimized(false);
        setIsOpen(true);
      }}
      className="fixed top-4 left-4 bg-blue-500 text-white p-2 rounded-lg cursor-pointer shadow-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 z-50"
    >
      <Star className="w-4 h-4" />
      <span className="text-sm font-medium">Complete Survey</span>
    </div>
  );

  if (!currentSurvey) return null;

  return (
    <>
      {isMinimized && <NotificationBadge />}
      <AlertDialog open={isOpen && !isMinimized}>
        <AlertDialogContent className="max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex justify-between items-center">
              {currentSurvey.title}
              <button
                onClick={() => {
                  setIsMinimized(true);
                  setIsOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Minimize"
              >
                <span className="sr-only">Minimize</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {currentSurvey.question}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="flex justify-center space-x-1">
                {[...Array(10)].map((_, index) => (
                  <Star
                    key={index}
                    className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${
                      index < (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onMouseEnter={() => setHoveredRating(index + 1)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(index + 1)}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {rating ? `Your rating: ${rating}/10` : "Select your rating"}
              </p>
            </div>

            <textarea
              className="w-full p-2 border rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your feedback (optional)..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            {currentSurvey.allowAnonymous && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600">
                  Submit anonymously
                </label>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <AlertDialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
              variant="default"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SurveyModal;
