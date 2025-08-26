/* eslint-disable @typescript-eslint/no-explicit-any */
import { SurveyAPI } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface SurveyTitleResponse {
  success: boolean;
  count: number;
  data: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

const ExportSurveyData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyTitles, setSurveyTitles] = useState<SurveyTitleResponse["data"]>(
    []
  );
  const [selectedSurveys, setSelectedSurveys] = useState<string[]>([]);

  useEffect(() => {
    const fetchSurveyTitles = async () => {
      try {
        const response = await SurveyAPI.getAllSurveyTitle();
        const surveyTitleResponse: SurveyTitleResponse = response.data;

        if (
          surveyTitleResponse.success &&
          Array.isArray(surveyTitleResponse.data)
        ) {
          setSurveyTitles(surveyTitleResponse.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching survey titles:", err);
        setError("Failed to load surveys. Please try again later.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchSurveyTitles();
  }, []);

  const handleSurveySelection = (surveyId: string) => {
    setSelectedSurveys((prev) => {
      if (prev.includes(surveyId)) {
        return prev.filter((id) => id !== surveyId);
      }
      return [...prev, surveyId];
    });
  };

  const createSafeSheetName = (title: string, suffix: string) => {
    // Remove invalid characters
    const sanitizedTitle = title.replace(/[\\/?*[\]]/g, "");
    // Calculate maximum length for the title
    const maxLength = 31 - suffix.length - 1; // -1 for the space
    // Truncate and combine with suffix
    return `${sanitizedTitle.slice(0, maxLength)}${suffix}`;
  };

  const createSurveySheets = async (
    surveyId: string,
    workbook: XLSX.WorkBook
  ) => {
    const response = await SurveyAPI.getSurvey(surveyId);
    console.log("Survey Response:", response);

    if (!response?.data?.success) {
      throw new Error("Failed to fetch survey data");
    }

    const survey = response.data.data;
    const surveyTitle = survey.title;

    // Create detailed responses sheet
    const responseData = survey.responses.map(
      (
        response: {
          username: any;
          respondent: { email: any };
          isAnonymous: any;
          ratingAnswer: any;
          feedback: any;
          dateAnswer: string;
        },
        index: number
      ) => ({
        "Response #": index + 1,
        Username: response.username,
        Email: response.respondent.email,
        "Is Anonymous": response.isAnonymous ? "Yes" : "No",
        Rating: response.ratingAnswer,
        Feedback: response.feedback || "",
        "Submission Date": formattedDate(response.dateAnswer),
      })
    );

    const detailsSheet = XLSX.utils.json_to_sheet(responseData);
    detailsSheet["!cols"] = [
      { wch: 10 }, // Response #
      { wch: 20 }, // Username
      { wch: 30 }, // Email
      { wch: 12 }, // Is Anonymous
      { wch: 8 }, // Rating
      { wch: 40 }, // Feedback
      { wch: 20 }, // Date
    ];

    // Create sheet names using the safe naming function
    XLSX.utils.book_append_sheet(
      workbook,
      detailsSheet,
      createSafeSheetName(surveyTitle, " - Data")
    );

    // Create summary sheet
    const totalResponses = survey.responses.length;
    const avgRating =
      totalResponses > 0
        ? (
            survey.responses.reduce(
              (sum: any, r: { ratingAnswer: any }) => sum + r.ratingAnswer,
              0
            ) / totalResponses
          ).toFixed(2)
        : "0";
    const anonymousCount = survey.responses.filter(
      (r: { isAnonymous: any }) => r.isAnonymous
    ).length;

    // Rating distribution (0-10)
    const ratingDistribution = Array.from({ length: 11 }, (_, rating) => ({
      rating,
      count: survey.responses.filter(
        (r: { ratingAnswer: number }) => r.ratingAnswer === rating
      ).length,
    }));

    const summaryData = [
      ["Survey Summary"],
      [""],
      ["Basic Information"],
      ["Title", survey.title],
      ["Question", survey.question],
      ["Status", survey.status],
      ["Anonymous Allowed", survey.allowAnonymous ? "Yes" : "No"],
      ["Created Date", formattedDate(survey.createdAt)],
      ["Last Updated", formattedDate(survey.updatedAt)],
      [""],
      ["Response Statistics"],
      ["Total Responses", totalResponses],
      ["Average Rating", avgRating],
      [
        "Anonymous Responses",
        `${anonymousCount} (${((anonymousCount / totalResponses) * 100).toFixed(
          1
        )}%)`,
      ],
      [""],
      ["Rating Distribution"],
      ["Rating", "Count", "Percentage"],
      ...ratingDistribution.map(({ rating, count }) => [
        `Rating ${rating}`,
        count,
        `${((count / totalResponses) * 100).toFixed(1)}%`,
      ]),
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      createSafeSheetName(surveyTitle, " - Sum")
    );
  };

  const handleExport = async () => {
    if (selectedSurveys.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const workbook = XLSX.utils.book_new();

      // Process each selected survey
      for (const surveyId of selectedSurveys) {
        await createSurveySheets(surveyId, workbook);
      }

      // Save the file
      const fileName = `Survey_Export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Export error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to export surveys. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">
            Loading surveys...
          </p>
        </div>
      </div>
    );
  }

  // Rest of your render code remains the same...
  return (
    <div className="container p-3">
      <BackButton />
      <div className="max-w-2xl mx-auto mt-5">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold py-1 sm:py-1 md:py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Export Survey Data
          </h1>
          <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-black">
            Select surveys to export
          </p>
        </div>

        <Card className="p-4">
          <div className="space-y-4">
            {surveyTitles.map((survey) => (
              <div key={survey.id} className="flex items-center space-x-2">
                <Checkbox
                  id={survey.id}
                  checked={selectedSurveys.includes(survey.id)}
                  onCheckedChange={() => handleSurveySelection(survey.id)}
                />
                <Label
                  htmlFor={survey.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <span className="mr-2">{survey.title}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      survey.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {survey.status}
                  </span>
                </Label>
              </div>
            ))}
          </div>

          <Button
            className="w-full mt-4"
            onClick={handleExport}
            disabled={isLoading || selectedSurveys.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              "Export Selected Surveys"
            )}
          </Button>

          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ExportSurveyData;
