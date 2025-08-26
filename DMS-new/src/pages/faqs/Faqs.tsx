import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DocumentType } from "@/lib/types";

interface FaqsProps {
  selectedDocument?: DocumentType | null;
}

const Faqs = ({ selectedDocument }: FaqsProps) => {
  console.log(selectedDocument);
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-8">
        <div className="text-2xl text-gray-600 mb-6 text-center">
          FREQUENTLY ASKED QUESTIONS (FAQs)
        </div>

        <Accordion
          type="multiple"
          defaultValue={["item-1", "item-2", "item-3"]}
          className="w-full space-y-4"
        >
          <AccordionItem
            value="item-1"
            className="rounded-md overflow-hidden bg-gray-100"
          >
            <AccordionTrigger className="px-8 py-4 hover:no-underline hover:bg-gray-50 border-l-4 border-y-2 border-l-red-500">
              <div className="flex gap-4 text-center font-medium text-base">
                <span className="text-red-500">Q.</span>
                <span className="text-gray-900">
                  What will happen to the previously issued NTEs and CANs?
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 py-4 bg-white border-l-4 border-b-2 border-l-black">
              <div className="flex gap-4 font-medium text-sm">
                <span className="text-gray-600">A.</span>
                <span className="text-gray-600">
                  These are all uploaded to the DMS tool.
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-2"
            className="rounded-md overflow-hidden bg-gray-100"
          >
            <AccordionTrigger className="px-8 py-4 hover:no-underline hover:bg-gray-50 border-l-4 border-y-2 border-l-red-500">
              <div className="flex gap-4 text-center font-medium text-base">
                <span className="text-red-500">Q.</span>
                <span className="text-gray-900">
                  Will the tool be able to issue the next corrective action to a
                  previously issued NTE that is still within the prescriptive
                  period?
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 py-4 bg-white border-l-4 border-b-2 border-l-black">
              <div className="flex gap-4 font-medium text-sm">
                <span className="text-gray-600">A.</span>
                <span className="text-gray-600">
                  Yes, the tool has the capacity to issue the next corrective
                  action since the previously issued NTE that is still within
                  the prescriptive period is already uploaded on the tool.
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-3"
            className="rounded-md overflow-hidden bg-gray-100"
          >
            <AccordionTrigger className="px-8 py-4 hover:no-underline hover:bg-gray-50 border-l-4 border-y-2 border-l-red-500">
              <div className="flex gap-4 text-center font-medium text-base">
                <span className="text-red-500">Q.</span>
                <span className="text-gray-900">
                  Can the supervisor still check the previously issued NTEs even
                  if it is beyond the prescriptive period, for tracking
                  purposes?
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 py-4 bg-white border-l-4 border-b-2 border-l-black">
              <div className="flex gap-4 font-medium text-sm">
                <span className="text-gray-600">A.</span>
                <span className="text-gray-600">
                  Yes, all previously issued NTEs/CANs will be stored on the
                  tool even if the employee resigns (up to the maximum period of
                  5 years).
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Faqs;
