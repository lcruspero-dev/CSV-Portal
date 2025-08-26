import { SurveyAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import SurveyList from "@/components/kit/SurveyList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SurveyFormData {
  title: string;
  question: string;
}

const CreateSurveyForm = () => {
  const [formData, setFormData] = useState<SurveyFormData>({
    title: "",
    question: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.title.trim() || !formData.question.trim()) {
        throw new Error("Title and question are required");
      }

      await SurveyAPI.createSurvey(formData);

      toast({
        title: "Success",
        description: "Survey created successfully",
        variant: "default",
      });

      // Reset form
      setFormData({
        title: "",
        question: "",
      });
      navigate("/");
    } catch (error) {
      console.error("Error creating survey:", error);
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6 w-full max-w-xl mx-auto pt-1">
      <div className="absolute top-32 left-[10rem] md:top-40 md:left-8 lg:top-32 lg:left-[10rem]">
        <BackButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Create New Survey</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter survey title"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="question" className="text-sm font-medium">
                Question
              </label>
              <Textarea
                id="question"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                placeholder="Enter your survey question"
                className="w-full"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Survey..." : "Create Survey"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <SurveyList />
    </div>
  );
};

export default CreateSurveyForm;
