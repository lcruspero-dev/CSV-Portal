import React, { useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

import { ItMemoAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import Logo from "../../assets/csvlogo.png";

interface LoggedInUser {
  _id?: string;
  id?: string;
  employeeId?: string;
  employeeID?: string;
  name?: string;
  fullName?: string;
  employeeName?: string;
  witness?: string;
}

interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

const MEMO_CODE = "CSV-TM-MEMO-014";
const MEMO_SUBJECT = "UNAUTHORIZED HANDLING OF IT AND NETWORK EQUIPMENT";
const MEMO_DATE = "05-AUG-2026";

const UnauthorizedHandlingMemo: React.FC = () => {
  const signatureRef = useRef<SignatureCanvas>(null);

  const [loading, setLoading] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [witnessName, setWitnessName] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const user = useMemo<LoggedInUser>(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const employeeName =
    user.name || user.fullName || user.employeeName || "Unknown Employee";

  const employeeId =
    user.employeeId || user.employeeID || user._id || user.id || "";

  const acknowledgementDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  const handleClearSignature = () => {
    if (loading || hasSubmitted) return;

    signatureRef.current?.clear();
  };

  const handleWitnessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWitnessName(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      if (hasSubmitted) {
        alert("You have already acknowledged this memorandum.");
        return;
      }

      if (!employeeId) {
        alert("Employee information is missing. Please sign in again.");
        return;
      }

      if (!isAcknowledged) {
        alert("Please confirm that you have read and understood the memo.");
        return;
      }

      if (!signatureRef.current || signatureRef.current.isEmpty()) {
        alert("Please provide your signature.");
        return;
      }

      if (!witnessName.trim()) {
        alert("Please enter the name of the witness.");
        return;
      }

      const trimmedCanvas = signatureRef.current.getTrimmedCanvas();

      const signature = trimmedCanvas.toDataURL("image/png");

      setLoading(true);

      await ItMemoAPI.createItMemo({
        employeeId,
        employeeName,
        signature,
        witness: witnessName,
      });

      setHasSubmitted(true);
      setIsAcknowledged(false);

      alert("Memo acknowledgement submitted successfully.");
    } catch (error: unknown) {
      console.error("Memo acknowledgement error:", error);

      const apiError = error as ApiErrorResponse;

      if (apiError.response?.status === 409) {
        setHasSubmitted(true);

        alert(
          apiError.response.data?.message ||
            "You have already acknowledged this memorandum.",
        );

        return;
      }

      alert(
        apiError.response?.data?.message ||
          "Failed to submit memo acknowledgement.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-[950px] px-4 pt-6">
        <BackButton />
      </div>

      <div className="flex flex-col items-center gap-10 bg-gray-100 px-4 py-10">
        {/* ================= MEMO PAGE ================= */}

        <DocumentPage>
          <MemoInformation />

          <MemoParagraph>
            To ensure the security, integrity, and reliability of the
            Company&apos;s IT infrastructure, all employees are hereby reminded
            that only authorized IT personnel are permitted to handle, install,
            modify, relocate, or troubleshoot any IT and network equipment.
          </MemoParagraph>

          <MemoParagraph>
            Employees are strictly prohibited from touching, moving, connecting,
            disconnecting, reconfiguring, or making any modifications to company
            IT and network equipment. This includes, but is not limited to:
          </MemoParagraph>

          <BulletList
            items={[
              "Network cables and ports",
              "Network switches and routers",
              "Wireless access points",
              "Desktop computers",
              "Printers and other peripherals",
              "Servers and related IT devices",
            ]}
          />

          <MemoParagraph>
            Should you encounter any IT-related concern, malfunction, or
            connectivity issue, do not attempt to troubleshoot or repair the
            equipment yourself. Instead, immediately report the concern to the
            IT Department and allow authorized personnel to assess and resolve
            the issue.
          </MemoParagraph>

          <MemoParagraph>
            Unauthorized handling or modification of IT and network equipment
            may result in service interruptions, equipment damage, data loss,
            security vulnerabilities, and disruption of business operations.
            Such acts shall be considered unauthorized tampering with company
            systems and equipment and may subject the employee to appropriate
            disciplinary action in accordance with the Company&apos;s Code of
            Conduct and applicable policies.
          </MemoParagraph>

          <MemoParagraph>
            All employees are expected to comply with this directive to help
            maintain a secure, stable, and efficient IT environment.
          </MemoParagraph>

          <p className="mt-8">Thank you for your cooperation.</p>
        </DocumentPage>

        {/* ================= ACKNOWLEDGEMENT PAGE ================= */}

        <DocumentPage>
          {hasSubmitted ? (
            <div className="mt-10 rounded-xl border border-green-300 bg-green-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
                  ✓
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-green-900">
                    Memorandum Acknowledged
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-green-800">
                    Your signature has been submitted successfully. You cannot
                    submit another acknowledgement for this memorandum.
                  </p>

                  <div className="mt-4 space-y-1 text-sm text-green-800">
                    <p>
                      <span className="font-semibold">Employee:</span>{" "}
                      {employeeName}
                    </p>

                    <p>
                      <span className="font-semibold">Witness:</span>{" "}
                      {witnessName}
                    </p>

                    <p>
                      <span className="font-semibold">Date:</span>{" "}
                      {acknowledgementDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-10 overflow-hidden border border-gray-300 text-[11px]">
                <AcknowledgementRow label="Employee Name">
                  <Input
                    value={employeeName}
                    disabled
                    className="h-8 border-0 bg-transparent shadow-none disabled:cursor-default disabled:opacity-100"
                  />
                </AcknowledgementRow>

                <AcknowledgementRow label="Employee Signature">
                  <div className="space-y-3">
                    <div className="w-fit max-w-full overflow-x-auto rounded-md border bg-white">
                      <SignatureCanvas
                        ref={signatureRef}
                        penColor="black"
                        canvasProps={{
                          width: 500,
                          height: 160,
                          className: "block bg-white touch-none",
                        }}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearSignature}
                      disabled={loading}
                    >
                      Clear Signature
                    </Button>
                  </div>
                </AcknowledgementRow>

                <AcknowledgementRow label="Date">
                  <Input
                    value={acknowledgementDate}
                    disabled
                    className="h-8 border-0 bg-transparent shadow-none disabled:cursor-default disabled:opacity-100"
                  />
                </AcknowledgementRow>

                <AcknowledgementRow label="Witness">
                  <Input
                    type="text"
                    value={witnessName}
                    onChange={handleWitnessChange}
                    placeholder="Enter the full name of the witness"
                    disabled={loading}
                    autoComplete="off"
                    maxLength={100}
                    className="h-9"
                  />
                </AcknowledgementRow>

                <AcknowledgementRow label="Date" isLast>
                  <Input
                    value={acknowledgementDate}
                    disabled
                    className="h-8 border-0 bg-transparent shadow-none disabled:cursor-default disabled:opacity-100"
                  />
                </AcknowledgementRow>
              </div>

              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-md border border-gray-300 bg-gray-50 p-4">
                <input
                  type="checkbox"
                  checked={isAcknowledged}
                  onChange={(event) => setIsAcknowledged(event.target.checked)}
                  disabled={loading}
                  className="mt-1 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                />

                <span className="text-sm leading-6">
                  I confirm that I have read, understood, and agree to comply
                  with the requirements stated in this memorandum.
                </span>
              </label>

              <div className="mt-8 flex justify-end">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !isAcknowledged || !witnessName.trim()}
                >
                  {loading ? "Submitting..." : "Submit Acknowledgement"}
                </Button>
              </div>
            </>
          )}
        </DocumentPage>
      </div>
    </section>
  );
};

/* ================= DOCUMENT COMPONENTS ================= */

const DocumentPage = ({ children }: { children: React.ReactNode }) => (
  <Card className="flex min-h-[1202px] w-full max-w-[850px] flex-col rounded-none border bg-white shadow-md">
    <DocumentHeader />

    <CardContent className="flex flex-1 flex-col px-6 py-8 text-sm text-[#17375e] sm:px-14">
      <div className="flex-1">{children}</div>

      <Footer />
    </CardContent>
  </Card>
);

const DocumentHeader = () => (
  <CardHeader className="p-0">
    <div className="px-6 pt-6 sm:px-12">
      <div className="flex items-start gap-4">
        <img
          src={Logo}
          alt="CSV Now logo"
          className="h-24 w-24 object-contain"
        />

        <div className="pt-6 text-[11px] text-gray-400">
          <p>15th Floor, iNito Tower</p>

          <p>Archbishop Reyes Ave, Cebu City, 6000 Cebu</p>

          <p>Website: www.csvnow.com</p>
        </div>
      </div>
    </div>

    <div className="flex">
      <div className="flex-1 bg-[#60477f] px-6 py-4 text-white sm:px-12">
        <CardTitle className="text-[18px] font-bold tracking-[4px]">
          MEMORANDUM
        </CardTitle>
      </div>

      <div className="w-[210px] bg-[#b9a8ca] text-center">
        <p className="py-3 text-[11px] text-white">TOP MANAGEMENT</p>

        <div className="bg-[#ded4e8] py-1">
          <p className="text-[10px] text-purple-900">{MEMO_CODE}</p>
        </div>
      </div>
    </div>
  </CardHeader>
);

const MemoInformation = () => (
  <div className="mb-8 border-b border-gray-300 pb-6">
    <MemoInformationRow label="To:" value="ALL DEPARTMENT" />

    <MemoInformationRow label="From:" value="MANAGEMENT / IT DEPARTMENT" />

    <MemoInformationRow label="Date:" value={MEMO_DATE} />

    <MemoInformationRow label="Subject:" value={MEMO_SUBJECT} />
  </div>
);

const MemoInformationRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="grid grid-cols-[85px_1fr] gap-3 py-1">
    <span className="font-bold">{label}</span>

    <span className="font-semibold">{value}</span>
  </div>
);

const MemoParagraph = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-6 text-justify leading-7">{children}</p>
);

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="mb-7 list-disc space-y-2 pl-10 leading-6">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

interface AcknowledgementRowProps {
  label: string;
  children: React.ReactNode;
  isLast?: boolean;
}

const AcknowledgementRow = ({
  label,
  children,
  isLast = false,
}: AcknowledgementRowProps) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-[180px_1fr] ${
      isLast ? "" : "border-b border-gray-300"
    }`}
  >
    <div className="border-b border-gray-300 bg-gray-50 p-3 font-bold sm:border-b-0 sm:border-r">
      {label}:
    </div>

    <div className="p-3">{children}</div>
  </div>
);

const Footer = () => (
  <div className="mt-16 border-t border-gray-200 pt-4 text-[9px] italic text-gray-400">
    CONFIDENTIALITY NOTICE: This document contains confidential information
    intended only for the recipient. Any unauthorized disclosure, copying, or
    distribution is strictly prohibited.
  </div>
);

export default UnauthorizedHandlingMemo;
