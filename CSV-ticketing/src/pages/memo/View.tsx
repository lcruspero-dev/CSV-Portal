import { useNavigate } from "react-router-dom";
import BackButton from "@/components/kit/BackButton";
import { FileText, ShieldCheck } from "lucide-react";

type SelectionOption = "memo" | "all-policies";

interface DocumentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  description,
  icon,
  onClick,
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    className="
      relative group
      p-8 w-full max-w-[380px] min-h-[260px]
      rounded-3xl
      bg-white/80 backdrop-blur-md
      border border-gray-200
      shadow-lg
      hover:shadow-2xl
      hover:-translate-y-2
      transition-all duration-300 ease-out
      cursor-pointer
      overflow-hidden
    "
  >
    {/* Gradient Accent */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#5602FF]/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl" />
    </div>

    {/* Content */}
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div>
        {/* Icon */}
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#5602FF]/10 text-[#5602FF] mb-4 group-hover:scale-110 transition">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#5602FF] transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400 group-hover:text-[#5602FF] transition">
          Open
        </span>

        <span className="text-[#5602FF] transform group-hover:translate-x-1 transition">
          →
        </span>
      </div>
    </div>
  </div>
);

const View: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (option: SelectionOption) => {
    navigate(option === "memo" ? "/all-memo" : "/all-policies");
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#5602FF]/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl opacity-50" />

      {/* Top Bar */}
      <div className="relative z-10 pt-4 pl-4">
        <BackButton />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Controlled Documents
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            Access and manage official memoranda and company policies.
            All documents are version-controlled and maintained for compliance.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <DocumentCard
            title="Company Memoranda"
            description="Internal communications issued by management. Includes announcements, updates, and time-sensitive directives."
            icon={<FileText size={22} />}
            onClick={() => handleNavigate("memo")}
          />

          <DocumentCard
            title="Company Policies"
            description="Formal policies and procedures governing operations, compliance, and employee conduct."
            icon={<ShieldCheck size={22} />}
            onClick={() => handleNavigate("all-policies")}
          />
        </div>
      </div>
    </section>
  );
};

export default View;