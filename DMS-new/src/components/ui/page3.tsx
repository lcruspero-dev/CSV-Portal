import csvlogo from "@/assets/csvlogo.png";
import React from "react";

interface NoticeOfDecisionProps {
  noticeOfDecision?: {
    name: string;
    position: string;
    nteIssuanceDate: string;
    writtenExplanationReceiptDate: string;
    offenseType: string;
    offenseDescription: string;
    findings: string;
    decision: string;
    employeeSignatureDate: string;
    authorizedSignatureDate: string;
  };
}

const Page3: React.FC<NoticeOfDecisionProps> = ({ noticeOfDecision }) => {
  const formatDate = (dateString: string) => {
    // Split YYYY-MM-DD into parts
    const [year, month, day] = dateString.split("-").map(Number);

    // Custom month names mapping
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Format as "Month DD, YYYY"
    return `${months[month - 1]} ${day}, ${year}`;
  };

  // Function to extract the number of days from the decision string
  const extractDaysFromDecision = (decision: string | undefined): string => {
    if (!decision || !decision.includes("Suspension")) return "___";
    const match = decision.match(/\d+/); // Extract the first number in the string
    return match ? match[0] : "___";
  };

  return (
    <div className="bg-white shadow-lg p-8 mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 border-b-2 pb-2">
        <img src={csvlogo} alt="CSV Now Logo" className="h-24" />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#534292]">
            NOTICE OF DECISION
          </h2>
          <p className="text-gray-600 text-xs">HR DEPARTMENT</p>
          <p className="text-gray-600 text-xs">CSV-HR-INT-010</p>
          <p className="text-gray-600 text-xs">
            7th Floor Cebu IT Tower 1, Bohol Avenue Cebu Business Park, Brgy.
            Luz, Cebu City
          </p>
        </div>
      </div>
      <div className="mt-3 text-sm space-y-4">
        <p>
          This Notice of Decision informs an employee of the final outcome
          regarding an alleged misconduct or performance issue. It details the
          decision, any disciplinary actions, and the reasons behind them,
          ensuring fairness and transparency.
        </p>
      </div>

      {/* Employee Information */}
      <div className="mt-6 space-y-4">
        <h3 className="font-bold text-[#534292]">EMPLOYEE INFORMATION</h3>
        <div className="grid grid-cols-1 text-sm">
          <div className="border grid grid-cols-[260px,1fr]">
            <div className="p-1 bg-[#DFDAF5] font-semibold">Name:</div>
            <div className="p-1 px-5 text-sm">
              {noticeOfDecision?.name || "N/A"}
            </div>
          </div>
          <div className="border grid grid-cols-[260px,1fr]">
            <div className="p-1 bg-[#DFDAF5] font-semibold">Position:</div>
            <div className="p-1 px-5 text-sm">
              {noticeOfDecision?.position || "N/A"}
            </div>
          </div>
          <div className="border grid grid-cols-[260px,1fr]">
            <div className="p-1 bg-[#DFDAF5] font-semibold">
              Date of Issuance of NTE:
            </div>
            <div className="p-1 px-5 text-sm">
              {noticeOfDecision?.nteIssuanceDate
                ? formatDate(noticeOfDecision.nteIssuanceDate)
                : "N/A"}
            </div>
          </div>
          <div className="border grid grid-cols-[260px,1fr]">
            <div className="p-1 bg-[#DFDAF5] font-semibold">
              Date of Receipt of Written Explanation:
            </div>
            <div className="p-1 px-5 text-sm">
              {noticeOfDecision?.writtenExplanationReceiptDate
                ? formatDate(noticeOfDecision.writtenExplanationReceiptDate)
                : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Explanation */}
      <div className="mt-6 space-y-2">
        <p className="text-sm pb-1">
          This letter pertains to the administrative charges against you as
          outlined in the Notice to Explain (NTE) dated{" "}
          {noticeOfDecision?.nteIssuanceDate
            ? formatDate(noticeOfDecision.nteIssuanceDate)
            : "N/A"}
          , which you received on{" "}
          {noticeOfDecision?.writtenExplanationReceiptDate
            ? formatDate(noticeOfDecision.writtenExplanationReceiptDate)
            : "N/A"}
          .
        </p>
        <p className="text-sm pb-1">
          For your reference, the incidents in question and the relevant
          provisions of the Code of Conduct and/or Company standards (as
          indicated in the NTE) are restated below:
        </p>
        <p className="text-sm font-semibold">
          Specific Provisions of the Company Code of Conduct alleged to have
          been violated:
        </p>
        <div className="px-4">
          <p className="text-sm">
            {noticeOfDecision?.offenseType
              ? noticeOfDecision.offenseType
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
              : "N/A"}
          </p>
          <p className="whitespace-pre-wrap text-sm">
            {noticeOfDecision?.offenseDescription || "N/A"}
          </p>
        </div>
        <p className="text-sm font-semibold">Findings:</p>
        <div className="px-4">
          <p className="whitespace-pre-wrap text-sm">
            {noticeOfDecision?.findings || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Decision:</p>
          <p className="text-sm pb-1">
            On account of the above violation/s, you are hereby given the
            following corrective action or disciplinary sanction, to wit:
          </p>
          <div className="px-4 text-sm">
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={noticeOfDecision?.decision === "Absolved"}
                  readOnly
                />
                <span className="ml-2">Absolved</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={noticeOfDecision?.decision === "Coaching"}
                  readOnly
                />
                <span className="ml-2">Coaching</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={noticeOfDecision?.decision === "Verbal Warning"}
                  readOnly
                />
                <span className="ml-2">Verbal Warning</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={noticeOfDecision?.decision === "Written Warning"}
                  readOnly
                />
                <span className="ml-2">Written Warning</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={
                    noticeOfDecision?.decision === "Final Written Warning"
                  }
                  readOnly
                />
                <span className="ml-2">Final Written Warning</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={noticeOfDecision?.decision?.includes("Suspension")}
                  readOnly
                />
                <span className="ml-2">
                  Suspension w/o Pay for{" "}
                  {extractDaysFromDecision(noticeOfDecision?.decision)} Day(s)
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={noticeOfDecision?.decision === "Termination"}
                  readOnly
                />
                <span className="ml-2">Termination</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledgement */}
      <div className="mt-8 space-y-4 text-sm">
        <h3 className="font-bold text-[#534292]">ACKNOWLEDGEMENT:</h3>
        <p className="italic">
          I have received the above Notice of Decision, read and understood the
          contents thereof.
        </p>
        <div className="grid grid-cols-2 gap-8 pt-8 text-center">
          <div className="space-y-1">
            <div className="min-h-[100px] flex flex-col items-center justify-end">
              {noticeOfDecision?.employeeSignatureDate ? (
                <img
                  src={`${import.meta.env.VITE_UPLOADFILES_URL}/form-files/${
                    noticeOfDecision.employeeSignatureDate
                  }`}
                  alt="Employee Signature"
                  className="h-16 mb-2 object-contain"
                />
              ) : (
                <span className="mb-2 text-gray-500">Pending Signature</span>
              )}
              <div className="border-t border-black w-full mt-2" />
            </div>
            <p className="text-sm">Employee Signature & Date</p>
          </div>

          <div className="space-y-1">
            <div className="min-h-[100px] flex flex-col items-center justify-end">
              <div className="border-t border-black w-full mt-2" />
            </div>
            <p className="text-sm">Authorized Signatory & Date</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 space-y-4 text-xs text-gray-500">
        <p>
          CONFIDENTIALITY NOTICE: This document contains confidential
          information intended only for the recipient. Any unauthorized
          disclosure, copying, or distribution is strictly prohibited.
        </p>
        <div className="flex justify-between border-t pt-2">
          <p>Version Number: 1.0</p>
          <p>Effective Date: September 30, 2024</p>
          <p>Classification: Confidential</p>
        </div>
      </div>
    </div>
  );
};

export default Page3;
