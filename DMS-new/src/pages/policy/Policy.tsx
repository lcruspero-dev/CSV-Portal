import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DocumentType } from "@/lib/types";

interface PolicyAccordionProps {
  selectedDocument?: DocumentType | null;
}

const PolicyAccordion = ({ selectedDocument }: PolicyAccordionProps) => {
  console.log(selectedDocument);
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-8">
        <div className="text-2xl text-gray-600 mb-6 text-center">POLICY</div>

        <Accordion
          type="multiple"
          defaultValue={["attendance", "cocd"]}
          className="w-full space-y-4"
        >
          <AccordionItem
            value="attendance"
            className="rounded-md overflow-hidden bg-gray-100"
          >
            <AccordionTrigger className="px-8 py-4 hover:no-underline hover:bg-gray-50 border-l-4 border-y-2 border-l-red-500">
              <div className="flex gap-4 text-center font-medium text-base">
                <span className="text-red-500">Policy</span>
                <span className="text-gray-900">Attendance</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 py-4 bg-white border-l-4 border-b-2 border-l-black">
              <div>
                <div className="flex gap-4 font-medium text-sm">
                  <span className="text-gray-600">1.</span>
                  <span className="text-gray-600">Tardy</span>
                </div>
                <div className="flex gap-4 font-medium text-sm">
                  <span className="text-gray-600">2.</span>
                  <span className="text-gray-600">Unexcused Absence</span>
                </div>
                <div className="flex gap-4 font-medium text-sm">
                  <span className="text-gray-600">3.</span>
                  <span className="text-gray-600">No call no show</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="cocd"
            className="rounded-md overflow-hidden bg-gray-100"
          >
            <AccordionTrigger className="px-8 py-4 hover:no-underline hover:bg-gray-50 border-l-4 border-y-2 border-l-red-500">
              <div className="flex gap-4 text-center font-medium text-base">
                <span className="text-red-500">Policy</span>
                <span className="text-gray-900">COCD (Code of Conduct)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 py-4 bg-white border-l-4 border-b-2 border-l-black">
              <div>
                <div className="flex gap-4 font-medium text-sm">
                  <span className="text-gray-600">1.</span>
                  <span className="text-gray-600">Behavior at work</span>
                </div>
                <div className="flex gap-4 font-medium text-sm">
                  <span className="text-gray-600">2.</span>
                  <span className="text-gray-600">Destruction of property</span>
                </div>
                <div className="flex gap-4 font-medium text-sm">
                  <span className="text-gray-600">3.</span>
                  <span className="text-gray-600">Insubordination</span>
                </div>
                <div className="flex gap-4 font-medium text-sm">
                  <span className="text-gray-600">4.</span>
                  <span className="text-gray-600">Record keeping</span>
                </div>
                <div className="flex gap-4 font-medium text-sm">
                  <span className="text-gray-600">5.</span>
                  <span className="text-gray-600">Safety and security</span>
                </div>
                <div className="flex gap-4 font-medium text-sm">
                  <span className="text-gray-600">6.</span>
                  <span className="text-gray-600">Others</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default PolicyAccordion;
