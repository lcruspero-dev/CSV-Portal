import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { LeaAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Logo from "../../assets/csvlogo.png";

const TeamExpectationsAcknowledgement: React.FC = () => {
  const sigRef = useRef<SignatureCanvas>(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const employeeName = user?.name || user?.fullName || user?.employeeName || "";

  const employeeId = user?.employeeId || user?.employeeID || user?._id || "";

  const today = new Date().toLocaleDateString();

  const handleSubmit = async () => {
    try {
      if (!sigRef.current || sigRef.current.isEmpty()) {
        alert("Please provide your signature.");
        return;
      }

      const signature = sigRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");

      setLoading(true);

      await LeaAPI.createTea({
        employeeId,
        employeeName,
        signature,
      });

      alert("Acknowledgement submitted successfully.");

      sigRef.current.clear();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message || "Failed to submit acknowledgement.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="min-h-screen bg-gray-100">
      <BackButton />
      <div className="bg-gray-100 py-10 flex flex-col items-center gap-10">
        {/* ================= DOCUMENT 1 ================= */}

        <DocumentPage>
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-2">
              <b className="w-[120px]">EMPLOYEE NAME:</b>
              <Input value={employeeName} disabled />
            </div>

            <div className="flex items-center gap-2">
              <b className="w-[120px]">POSITION:</b>
              <Input value="Team Leader" disabled />
            </div>

            <div className="flex items-center gap-2">
              <b className="w-[120px]">DATE:</b>
              <Input value={today} disabled />
            </div>
          </div>

          <hr className="border-gray-300 mb-7" />

          <p className="leading-6 mb-6">
            As discussed during our leadership meeting, the following
            expectations are effective immediately. As a Team Lead, I understand
            that I am responsible for ensuring my team follows company
            procedures, maintains productivity standards, and receives ongoing
            coaching throughout every shift.
          </p>

          <p className="leading-6 mb-8">
            By signing below, I acknowledge that I understand these expectations
            and my responsibility to consistently enforce them.
          </p>

          <h2 className="font-bold text-[14px] mb-5">
            TEAM LEAD RESPONSIBILITIES
          </h2>

          <NumberedSection number={1} title="SOP Compliance">
            <BulletList
              items={[
                "Ensure all agents follow the approved Customer Support SOP and workflow.",
                "Do not allow agents to create or follow personal workflows using Notes, Slack, MS Teams, personal macros, or other unofficial resources.",
                "Correct any SOP deviations immediately through coaching.",
              ]}
            />
          </NumberedSection>

          <NumberedSection number={2} title="Floor Walks">
            <p className="mb-3">During every floor walk, I will:</p>

            <BulletList
              items={[
                "Observe agent workflows.",
                "Ensure agents are actively working.",
                "Verify agents are following the approved SOP.",
                "Identify workflow issues and coach agents in real time.",
                "Escalate repeated non-compliance to management.",
              ]}
            />

            <p className="leading-6">
              Floor walks are not only for answering questions. They are also
              used to monitor performance and ensure operational standards are
              being followed.
            </p>
          </NumberedSection>
        </DocumentPage>

        {/* ================= DOCUMENT 2 ================= */}

        <DocumentPage>
          <NumberedSection number={3} title="Productivity Management">
            <BulletList
              items={[
                "Review my team's productivity every hour.",
                "Identify the three lowest productivity agents during each hourly review.",
                "Observe their workflow to identify blockers, work avoidance, or training opportunities.",
                "Provide coaching immediately instead of waiting until the end of the shift.",
              ]}
            />
          </NumberedSection>

          <NumberedSection number={4} title="Productivity Goal">
            <BulletList
              items={[
                "Reinforce the current productivity goal of 80 closed conversations per shift for all agents.",
                "I understand not every agent will reach this goal immediately, but I am responsible for coaching my team throughout the week so they continuously improve toward this expectation.",
              ]}
            />
          </NumberedSection>

          <NumberedSection number={5} title="Communication">
            <BulletList
              items={[
                "Encourage agents to communicate recurring customer inquiries that may require new macros or workflow improvements.",
                "Escalate process gaps or operational issues instead of allowing agents to create their own solutions.",
              ]}
            />
          </NumberedSection>

          <NumberedSection number={6} title="Accountability">
            <BulletList
              items={[
                "I understand that if agents on my team are consistently not following the approved SOP, using unauthorized workflows, or failing to meet productivity expectations without timely coaching or intervention, I will be held accountable for my team's operational performance and leadership.",
              ]}
            />
          </NumberedSection>
        </DocumentPage>

        {/* ================= DOCUMENT 3 ================= */}

        <DocumentPage>
          <h1 className="text-center font-bold tracking-[6px] underline text-[18px] mb-10">
            ACKNOWLEDGEMENT
          </h1>

          <p className="leading-6 mb-6">
            I understand that my role as a Team Lead is not only to answer
            questions, but to actively lead, coach, monitor performance, and
            enforce company standards throughout every shift.
          </p>

          <p className="leading-6 mb-10">
            I acknowledge that failure to fulfill these leadership
            responsibilities may result in additional coaching, performance
            management, or further disciplinary action in accordance with
            company policy.
          </p>

          {/* INPUT SIGNATURE FORM */}

          <div className="w-[500px] border border-gray-300 text-[11px]">
            <div className="grid grid-cols-[160px_1fr]">
              <div className="border-r border-b border-gray-300 font-bold p-2">
                Employee Name & Signature:
              </div>

              <div className="border-b border-gray-300 p-2">
                <Input
                  value={employeeName}
                  disabled
                  className="border-0 shadow-none h-6"
                />

                <div className="mt-2 border rounded">
                  <SignatureCanvas
                    ref={sigRef}
                    canvasProps={{
                      width: 300,
                      height: 120,
                      className: "bg-white",
                    }}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => sigRef.current?.clear()}
                >
                  Clear Signature
                </Button>
              </div>

              <div className="border-r border-b border-gray-300 font-bold p-2">
                Date:
              </div>

              <div className="border-b border-gray-300 p-2">
                <Input
                  value={today}
                  disabled
                  className="border-0 shadow-none h-6"
                />
              </div>

              <div className="border-r border-b border-gray-300 font-bold p-2">
                Manager / Witness:
              </div>

              <div className="border-b border-gray-300 p-2">
                <Input
                  value="Ronalyn Booc"
                  disabled
                  className="border-0 shadow-none h-6"
                />
              </div>

              <div className="border-r border-gray-300 font-bold p-2">
                Date:
              </div>

              <div className="p-2">
                <Input
                  value={today}
                  disabled
                  className="border-0 shadow-none h-6"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Acknowledgement"}
            </Button>
          </div>
        </DocumentPage>
      </div>
    </section>
  );
};

/* ================= REUSABLE SAME FILE COMPONENTS ================= */

const DocumentPage = ({ children }: { children: React.ReactNode }) => (
  <Card className="w-[850px] min-h-[1202px] bg-white rounded-none shadow-md border flex flex-col">
    <DocumentHeader />

    <CardContent className="px-14 py-8 text-[#17375e] text-sm flex-1 flex flex-col">
      <div className="flex-1">{children}</div>

      <Footer />
    </CardContent>
  </Card>
);

const DocumentHeader = () => (
  <CardHeader className="p-0">
    <div className="px-12 pt-6">
      <div className="flex items-start gap-4">
        <img src={Logo} className="w-24 h-24 object-contain" />

        <div className="text-[11px] text-gray-400 pt-6">
          <p>15th Floor, iNito Tower</p>
          <p>Archbishop Reyes Ave, Cebu City, 6000 Cebu</p>
          <p>Website: www.csvnow.com</p>
        </div>
      </div>
    </div>

    <div className="flex">
      <div className="bg-[#60477f] text-white px-12 py-4 flex-1">
        <CardTitle className="text-[18px] font-bold">
          TEAM LEAD EXPECTATIONS ACKNOWLEDGEMENT
        </CardTitle>
      </div>

      <div className="bg-[#b9a8ca] w-[210px] text-center">
        <p className="text-white text-[11px] py-3">OPERATIONS DEPARTMENT</p>

        <div className="bg-[#ded4e8] py-1">
          <p className="text-[10px] text-purple-900">CSV-OPS-MEMO-003</p>
        </div>
      </div>
    </div>
  </CardHeader>
);

const NumberedSection = ({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-8">
    <h3 className="font-bold text-[13px] mb-3">
      {number}. {title}
    </h3>

    <div className="pl-6">{children}</div>
  </section>
);

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-7 space-y-2 mb-4">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

const Footer = () => (
  <div className="mt-16 text-[9px] text-gray-400 italic">
    CONFIDENTIALITY NOTICE: This document contains confidential information
    intended only for the recipient. Any unauthorized disclosure, copying, or
    distribution is strictly prohibited.
  </div>
);

export default TeamExpectationsAcknowledgement;
