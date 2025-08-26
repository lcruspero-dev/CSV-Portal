import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

const NoticeToExplain: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-8">
      <Card className="w-[800px] flex flex-col ">
        <CardHeader className="bg-blue-500 text-white py-4 px-6 rounded-t sticky top-0 z-10">
          <CardTitle className="text-2xl font-bold">
            NOTICE TO EXPLAIN
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-48 space-y-6">
          <p className="mb-4 text-gray-700 text-base">
            This Notice to Explain is issued to inform an employee of an alleged
            misconduct or performance issue, providing them an opportunity to
            explain their side and present any relevant evidence before any
            disciplinary action is taken. This ensures fairness and transparency
            in the evaluation process.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Name:
                </label>
                <Input id="name" placeholder="Enter name" className="w-full" />
              </div>
              <div>
                <label
                  htmlFor="position"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Position:
                </label>
                <Input
                  id="position"
                  placeholder="Enter position"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="date-issued"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Date Issued:
                </label>
                <Input
                  id="date-issued"
                  placeholder="Enter date"
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="issued-by"
                  className="block font-medium text-gray-700 text-sm"
                >
                  Issued by:
                </label>
                <Input
                  id="issued-by"
                  placeholder="Enter issuer"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-700 text-sm">
                Based on the attached incident report, it appears that you have
                committed the following violation(s) of our Code of Conduct and
                Discipline:
              </p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <span className="text-gray-700 text-sm">Tardy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <span className="text-gray-700 text-sm">
                    Unexcused Absence
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <span className="text-gray-700 text-sm">
                    Behavior at Work
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <span className="text-gray-700 text-sm">
                    Destruction of Property
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <span className="text-gray-700 text-sm">Insubordination</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <span className="text-gray-700 text-sm">Record Keeping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <span className="text-gray-700 text-sm">
                    Safety and Security
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <span className="text-gray-700 text-sm">
                    Others, please specify:
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="offense-description"
                className="block font-medium text-gray-700 text-sm"
              >
                Description of Offense/s (cite Specific Offense/s or
                underperformance under the Code of Conduct and Discipline,
                including dates, and other necessary details) and amount of
                loss/damage, if any:
              </label>
              <Textarea
                id="offense-description"
                rows={5}
                placeholder="Enter offense description"
                className="w-full px-2 py-1 border rounded-md placeholder:text-xs"
              />
            </div>

            <div>
              <p className="font-medium text-gray-700 text-sm">
                In view of the above offense/s, please explain in not more than
                five (5) days from receipt of this notice as to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
                <li>
                  Why you should not be disciplined for committing the
                  above-mentioned violation/s,
                </li>
                <li>
                  Why you should not be held liable to pay for the amount of
                  loss caused by or damage incurred due to the above
                  violation/s.
                </li>
              </ul>
            </div>

            <p className="text-gray-700 text-sm">
              Failure to submit said response explanation shall be considered a
              waiver of your right to present your side. Management will then
              evaluate your case based on the evidence at hand and proceed to
              render its decision.
            </p>

            <div>
              <p className="font-medium text-gray-700 text-sm">
                ACKNOWLEDGEMENT:
              </p>
              <p className="text-gray-700 text-sm">
                I have received the above Notice to Explain, and read and
                understood the contents thereof.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoticeToExplain;
