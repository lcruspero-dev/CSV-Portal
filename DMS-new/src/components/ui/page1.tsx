import csvlogo from "@/assets/csvlogo.png";
import React from "react";

interface NteDetails {
  employeeId: string;
  name: string;
  position: string;
  dateIssued: string;
  issuedBy: string;
  offenseType: string;
  offenseDescription: string;
  file: string | null;
  employeeSignatureDate: string | null;
  authorizedSignatureDate: string | null;
}

interface Page1Props {
  nteData: {
    nte: NteDetails;
  };
}

const Page1: React.FC<Page1Props> = ({ nteData }) => {
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

  return (
    <div className="bg-white shadow-lg p-8 mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 border-b-2 pb-2">
        <img src={csvlogo} alt="CSV Now Logo" className="h-24" />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#534292]">
            NOTICE TO EXPLAIN
          </h2>
          <p className="text-gray-600 text-xs">HR DEPARTMENT</p>
          <p className="text-gray-600 text-xs">CSV-HR-INT-009</p>
          <p className="text-gray-600 text-xs">
            7th Floor Cebu IT Tower 1, Bohol Avenue Cebu Business Park, Brgy.
            Luz, Cebu City
          </p>
        </div>
      </div>

      {/* Address */}
      <div className="mt-3 text-sm space-y-4">
        <p>
          This Notice to Explain is issued to inform an employee of an alleged
          misconduct or performance issue, providing them an opportunity to
          explain their side and present any relevant evidence before any
          disciplinary action is taken. This ensures fairness and transparency
          in the evaluation process.
        </p>
      </div>

      {/* Employee Information */}
      <div className="mt-6 space-y-4">
        <h3 className="font-bold text-[#534292]">EMPLOYEE INFORMATION</h3>
        <div className="grid grid-cols-1 text-sm">
          <div className="border grid grid-cols-[150px,1fr]">
            <div className="p-1 bg-[#DFDAF5] font-semibold">Name:</div>
            <div className="p-1 px-5 text-sm">{nteData.nte.name}</div>
          </div>
          <div className="border grid grid-cols-[150px,1fr]">
            <div className="p-1 bg-[#DFDAF5] font-semibold">Position:</div>
            <div className="p-1 px-5 text-sm">{nteData.nte.position}</div>
          </div>
          <div className="border grid grid-cols-[150px,1fr]">
            <div className="p-1 bg-[#DFDAF5] font-semibold">Date Issued:</div>
            <div className="p-1 px-5 text-sm">
              {formatDate(nteData.nte.dateIssued)}
            </div>
          </div>
          <div className="border grid grid-cols-[150px,1fr]">
            <div className="p-1 bg-[#DFDAF5] font-semibold">Issued by:</div>
            <div className="p-1 px-5 text-sm">{nteData.nte.issuedBy}</div>
          </div>
        </div>
      </div>

      {/* Offense Types */}
      <div className="mt-6 grid grid-cols-3 gap-8 text-sm">
        {/* Offense Type Checkboxes */}
        {/* ... (Copy the offense type checkboxes from PdfNteViewer) ... */}
      </div>

      {/* Description */}
      <div className="mt-6 space-y-2">
        <p className="text-sm pb-2">
          Description of Offense/s (Cite Specific Offense/s or underperformance
          under the Code of Conduct and Discipline, including dates, and other
          necessary details) and amount of loss/damage, if any:
        </p>
        <div className="p-4 border min-h-[120px] rounded bg-gray-50">
          <p className="whitespace-pre-wrap text-sm">
            {nteData.nte.offenseDescription}
          </p>
        </div>
      </div>

      {/* Notice */}
      <div className="mt-6 space-y-4 text-sm">
        <p>
          In view of the above offense/s, please explain in writing not more
          than five (5) days from receipt of this notice as to:
        </p>
        <div className="space-y-2 pl-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border" />
            <span>
              Why you should not be disciplined for committing the
              above-mentioned violation/s.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border" />
            <span>
              Why you should not be held liable to pay for the amount of loss
              caused by or damage incurred due to the above violation/s.
            </span>
          </div>
        </div>
        <p className="text-sm">
          Failure to submit said written explanation shall be considered a
          waiver of your right to present your side. Management will then
          evaluate your case based on the evidence at hand and proceed to render
          its decision.
        </p>
      </div>

      {/* Acknowledgement */}
      <div className="mt-8 space-y-4 text-sm">
        <h3 className="font-bold text-[#534292]">ACKNOWLEDGEMENT:</h3>
        <p className="italic">
          I have received the above Notice to Explain, and read and understood
          the contents thereof.
        </p>
        <div className="grid grid-cols-2 gap-8 pt-8 text-center">
          <div className="space-y-1">
            <div className="min-h-[100px] flex flex-col items-center justify-end">
              {nteData.nte.employeeSignatureDate ? (
                <img
                  src={`${import.meta.env.VITE_UPLOADFILES_URL}/form-files/${
                    nteData.nte.employeeSignatureDate
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

export default Page1;
