import { SurveyAPI } from "@/API/endpoint";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Survey {
  _id: string;
  title: string;
  question: string;
  status: string;
}

const SurveyList = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await SurveyAPI.getSurveys();
      setSurveys(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      setError("Failed to load surveys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showList) {
      fetchSurveys();
    }
  }, [showList]);

  const handleStatusToggle = async (
    surveyId: string,
    currentStatus: string
  ) => {
    try {
      setUpdatingId(surveyId);
      const newStatus = currentStatus === "active" ? "closed" : "active";

      await SurveyAPI.updateSurvey(surveyId, {
        status: newStatus,
      });

      setSurveys((prevSurveys) =>
        prevSurveys.map((survey) =>
          survey._id === surveyId ? { ...survey, status: newStatus } : survey
        )
      );

      toast({
        title: "Success",
        description: `Survey status updated to ${newStatus}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating survey status:", error);
      toast({
        title: "Error",
        description: "Failed to update survey status",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowList(!showList)}
        variant="outline"
        className="w-full"
      >
        {showList ? "Hide Surveys" : "View All Surveys"}
      </Button>

      {showList && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Survey List</CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : surveys.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No surveys found</p>
            ) : (
              <div className="space-y-4">
                {surveys.map((survey) => (
                  <div
                    key={survey._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 mr-4">
                      <h3 className="font-medium">{survey.title}</h3>
                      <p className="text-sm text-gray-500">{survey.question}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {survey.status === "active" ? "Active" : "Closed"}
                      </span>
                      <Switch
                        checked={survey.status === "active"}
                        onCheckedChange={() =>
                          handleStatusToggle(survey._id, survey.status)
                        }
                        disabled={updatingId === survey._id}
                        className="data-[state=checked]:bg-green-500"
                      />
                      {updatingId === survey._id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SurveyList;
