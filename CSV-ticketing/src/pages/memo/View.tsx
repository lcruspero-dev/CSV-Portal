import { useNavigate } from "react-router-dom";
import BackButton from "@/components/kit/BackButton";

type SelectionOption = "memo" | "all-policies";

interface DocumentCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  description,
  onClick,
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    className="
      p-10 min-w-[340px] min-h-[240px]
      rounded-lg
      border border-gray-300
      bg-white
      shadow-sm
      transition-colors duration-150
      hover:border-[#5602FF]
      focus:outline-none focus:ring-2 focus:ring-[#5602FF]
      flex flex-col justify-center
    "
  >
    <h3 className="text-xl font-semibold text-gray-900 mb-3">
      {title}
    </h3>
    <p className="text-sm text-gray-600 leading-relaxed">
      {description}
    </p>
  </div>
);

const View: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (option: SelectionOption) => {
    navigate(option === "memo" ? "/all-memo" : "/all-policies");
  };

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white">
      <div className="pt-4 pl-4">
        <BackButton />
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12 max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Controlled Documents
          </h1>
          <p className="text-gray-700 text-base">
            This section provides access to approved company memoranda and
            policy documents.
          </p>
        </div>

        {/* Document Categories */}
        <div className="flex flex-col md:flex-row gap-8">
          <DocumentCard
            title="Company Memoranda"
            description="Official internal communications issued by management. Memoranda are time-bound and subject to version control and retention policies."
            onClick={() => handleNavigate("memo")}
          />

          <DocumentCard
            title="Company Policies"
            description="Approved policies and procedural documents governing company operations. All policies are controlled documents and subject to periodic review."
            onClick={() => handleNavigate("all-policies")}
          />
        </div>
      </div>
    </section>
  );
};

export default View;
