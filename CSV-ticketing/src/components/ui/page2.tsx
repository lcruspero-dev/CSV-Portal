import csvlogo from "@/assets/csvlogo.png";
import React from "react";

interface EmployeeFeedbackProps {
  employeeFeedback?: {
    name: string;
    position: string;
    responseDate: string;
    responseDetail: string;
    employeeSignatureDate?: string | null;
    signatureFilename?: string | null;
  };
}

const Page2: React.FC<EmployeeFeedbackProps> = ({ employeeFeedback }) => {
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
            EMPLOYEE FEEDBACK
          </h2>
          <p className="text-gray-600 text-xs">OPERATIONS DEPARTMENT</p>
          <p className="text-gray-600 text-xs">CSV-OP-INT-002</p>
          <p className="text-gray-600 text-xs">
            7th Floor Cebu IT Tower 1, Bohol Avenue Cebu Business Park, Brgy.
            Luz, Cebu City
          </p>
        </div>
      </div>
      <div className="mt-3 text-sm space-y-4">
        <p>
          This form is used for collecting employees' opinions on their work
          environment, job satisfaction, and company policies. It helps identify
          areas for improvement and enhance employee engagement and
          satisfaction. It is also used to provide responses to Notices to
          Explain served to employees.
        </p>
      </div>

      {/* Employee Information */}
      <div className="mt-6 space-y-4">
        <h3 className="font-bold text-[#534292]">EMPLOYEE INFORMATION</h3>
        <div className="grid grid-cols-1 text-sm">
          <div className="border grid grid-cols-[150px,1fr]">
            <div className="p-1 bg-[#DFDAF5] font-semibold">Name:</div>
            <div className="p-1 px-5 text-sm">
              {employeeFeedback?.name || "N/A"}
            </div>
          </div>
          <div className="border grid grid-cols-[150px,1fr]">
            <div className="p-1 bg-[#DFDAF5] font-semibold">Position:</div>
            <div className="p-1 px-5 text-sm">
              {employeeFeedback?.position || "N/A"}
            </div>
          </div>
          <div className="border grid grid-cols-[150px,1fr]">
            <div className="p-1 bg-[#DFDAF5] font-semibold">Response Date:</div>
            <div className="p-1 px-5 text-sm">
              {employeeFeedback?.responseDate
                ? formatDate(employeeFeedback.responseDate)
                : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Explanation */}
      <div className="mt-6 space-y-2">
        <p className="text-sm pb-2">
          Please provide your detailed response(s) to the Notice to Explain
          (NTE) issued to you. Be specific with dates and provide clear
          reasoning for each point addressed:
        </p>
        <div className="p-4 border min-h-[120px] rounded bg-gray-50">
          <p className="whitespace-pre-wrap text-sm">
            {employeeFeedback?.responseDetail || "[No response provided]"}
          </p>
        </div>
      </div>
      <div className="mt-8 space-y-4 text-sm">
        <h3 className="font-bold text-[#534292]">ACKNOWLEDGEMENT:</h3>
        <p className="italic">
          I hereby declare that the information provided in my response is true
          and correct to the best of my knowledge. I understand that any false
          statements or omissions may result in disciplinary action.
        </p>

        <div className="grid grid-cols-2 gap-8 pt-8 text-center">
          <div className="space-y-1">
            {employeeFeedback?.employeeSignatureDate && (
              <div className="space-y-2">
                <img
                  src={`${import.meta.env.VITE_UPLOADFILES_URL}/form-files/${
                    employeeFeedback.employeeSignatureDate
                  }`}
                  alt="Employee Signature"
                  className="mx-auto h-16 object-contain mb-2"
                />
              </div>
            )}
            <div className="border-t border-black" />
            <p className="text-sm">Employee Signature & Date</p>
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

export default Page2;
