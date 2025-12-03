import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

const CoachingForm: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-2xl font-bold text-gray-800">
            COACHING FORM
          </CardTitle>
          <p className="text-gray-600 mt-2">
    
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Employee Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              EMPLOYEE INFORMATION
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Name:
                </label>
                <Input placeholder="Enter employee name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Position:
                </label>
                <Input placeholder="Enter employee position" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Date of Coaching Session:
                </label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Coach's Name:
                </label>
                <Input placeholder="Enter coach's name" />
              </div>
            </div>
          </div>

          {/* Coaching Objectives Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              COACHING OBJECTIVES:
            </h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Checkbox id={`objective-${index}`} />
                  <Input
                    placeholder={`Enter objective ${index}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Employee Response/Commitment Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              EMPLOYEE RESPONSE / COMMITMENT:
            </h2>
            <Textarea
              placeholder="Enter employee response and commitment here..."
              className="min-h-[150px]"
            />
          </div>

          {/* Acknowledgement Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ACKNOWLEDGEMENT:
            </h2>
            <p className="text-gray-600 mb-6">
              I acknowledge the feedback provided during this coaching session
              and commit to working towards the agreed-upon goals and
              objectives.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Employee Signature:
                </label>
                <Input placeholder="Enter signature" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Authorized Signatory & Date:
                </label>
                <Input placeholder="Enter signature and date" />
              </div>
            </div>
          </div>

          {/* Confidentiality Notice */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500 italic">
              CONFIDENTIALITY NOTICE:{" "}
              <em>
                This document contains confidential information intended only
                for the recipient. Any unauthorized disclosure, copying or
                distribution is strictly prohibited.
              </em>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachingForm;
