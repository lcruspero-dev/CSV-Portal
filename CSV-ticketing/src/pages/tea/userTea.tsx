import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { TeaAPI } from "@/API/endpoint";
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

      await TeaAPI.createTea({
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
              <Input value="Customer Service" disabled />
            </div>

            <div className="flex items-center gap-2">
              <b className="w-[120px]">DATE:</b>
              <Input value={today} disabled />
            </div>
          </div>

          <hr className="border-gray-300 mb-7" />

          <Section title="PURPOSE">
            <p className="leading-6 mb-6">
              As our company continues to grow and adapt to changing business
              needs, client requirements, and operational priorities, all
              employees are expected to maintain professional standards, support
              organizational changes, and contribute positively to team success.
            </p>

            <p className="leading-6">
              This acknowledgement serves to confirm understanding of the
              expectations that apply to all employees.
            </p>
          </Section>

          <Section title="PROFESSIONAL CONDUCT">
            <p className="mb-3">I understand that I am expected to:</p>

            <BulletList
              items={[
                "Treat coworkers, supervisors, managers, and clients with professionalism and respect at all times.",
                "Maintain a positive and constructive attitude when discussing company decisions, policies, procedures, or operational changes.",
                "Raise concerns through appropriate channels in a respectful and professional manner.",
                "Avoid behavior that negatively impacts team morale, productivity, or working relationships.",
              ]}
            />
          </Section>

          <Section title="COMMUNICATION EXPECTATIONS">
            <p className="mb-3">I understand that I am expected to:</p>

            <BulletList
              items={[
                "Follow established communication and escalation processes.",
                "Seek clarification when instructions or expectations are unclear.",
                "Communicate concerns directly with my Team Lead, Manager, HR, or appropriate leadership channels.",
                "Participate in discussions professionally and respectfully, even when opinions differ.",
              ]}
            />
          </Section>
        </DocumentPage>

        {/* ================= DOCUMENT 2 ================= */}

        <DocumentPage>
          <Section title="ADAPTABILITY AND CHANGE">
            <p className="leading-6 mb-4">
              I understand that business needs, client requirements, staffing
              levels, schedules, responsibilities, workflows, and team
              structures may change over time.
            </p>

            <p className="mb-3">I acknowledge that I am expected to:</p>

            <BulletList
              items={[
                "Remain flexible and adaptable to operational changes.",
                "Participate in cross-training, skill development, and new workflows when required.",
                "Support organizational initiatives designed to improve efficiency, service quality, and business performance.",
                "Make reasonable efforts to learn new processes, tools, and responsibilities assigned as part of my role.",
              ]}
            />
          </Section>

          <Section title="TEAMWORK AND COLLABORATION">
            <p className="mb-3">I understand that I am expected to:</p>

            <BulletList
              items={[
                "Work cooperatively with teammates and leadership.",
                "Support company initiatives intended to improve customer experience and operational performance.",
                "Contribute positively to a collaborative work environment.",
                "Focus on solutions and continuous improvement when challenges arise.",
              ]}
            />
          </Section>

          <Section title="PERFORMANCE EXPECTATIONS">
            <p className="mb-3">I understand that I am expected to:</p>

            <BulletList
              items={[
                "Perform assigned duties to the best of my ability.",
                "Follow company policies, procedures, and client requirements.",
                "Meet established performance, quality, attendance, and productivity expectations.",
                "Accept coaching and feedback professionally and apply reasonable efforts toward improvement.",
              ]}
            />
          </Section>
        </DocumentPage>

        {/* ================= DOCUMENT 3 ================= */}

        <DocumentPage>
          <h1 className="text-center font-bold tracking-[6px] underline text-[18px] mb-10">
            ACKNOWLEDGEMENT
          </h1>

          <p className="leading-6 mb-6">
            I acknowledge that I have read and understand the expectations
            outlined above.
          </p>

          <p className="leading-6 mb-10">
            My signature confirms receipt and understanding of these
            expectations. It does not alter my employment status or any existing
            company policies.
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
  <Card className="w-[850px] bg-white rounded-none shadow-md border">
    <DocumentHeader />

    <CardContent className="px-14 py-8 text-[#17375e] text-sm">
      {children}

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
          <p>Website: www.csv.com</p>
        </div>
      </div>
    </div>

    <div className="flex">
      <div className="bg-[#60477f] text-white px-12 py-4 flex-1">
        <CardTitle className="text-[18px] font-bold">
          TEAM EXPECTATIONS ACKNOWLEDGEMENT
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

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-8">
    <h2 className="font-bold text-[14px] mb-5">{title}</h2>

    {children}
  </section>
);

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-7 space-y-2 mb-6">
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
