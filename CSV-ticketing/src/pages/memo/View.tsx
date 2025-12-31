import { useNavigate } from "react-router-dom";
import BackButton from "@/components/kit/BackButton";

type SelectionOption = "memo" | "all-policies";

const View: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (option: SelectionOption) => {
    if (option === "memo") {
      navigate("/all-memo");
    } else if (option === "all-policies") {
      navigate("/all-policies");
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 to-red-50">

      <div className="mt-2 pl-2">
        <BackButton />
      </div>

      <div className="flex flex-col items-center justify-center p-8">

        {/* Christmas Header */}
        <div className="text-center mb-12 ">
          <h1 className="text-5xl font-bold text-green-800 mb-4">
            Company Memos and Policies
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-12 justify-center items-center">
          <div
            className="p-12 rounded-2xl cursor-pointer transition-all duration-300 min-w-[320px] min-h-[280px] text-center shadow-2xl bg-gradient-to-br from-green-100 to-red-100 border-2 border-green-200 text-green-900 hover:bg-gradient-to-br hover:from-green-500 hover:to-red-500 hover:text-white hover:transform hover:scale-105 hover:shadow-2xl flex flex-col items-center justify-center group relative overflow-hidden"
            onClick={() => handleCardClick("memo")}
          >
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-2xl">📝</div> 

            <h3 className="text-3xl font-bold mb-4 group-hover:text-white">
              Memo
            </h3>
            <p className="text-lg opacity-90 leading-relaxed">
              Share thoughts and
              <br />
               memos
            </p>

            {/* Hover effect decoration */}
            <div className="absolute inset-0 border-4 border-transparent group-hover:border-green-200 rounded-2xl transition-all duration-300"></div>
          </div>

          {/* all-policies Card - Christmas Theme */}
          <div
            className="p-12 rounded-2xl cursor-pointer transition-all duration-300 min-w-[320px] min-h-[280px] text-center shadow-2xl bg-gradient-to-br from-green-100 to-red-100 border-2 border-green-200 text-green-900 hover:bg-gradient-to-br hover:from-green-500 hover:to-red-500 hover:text-white hover:transform hover:scale-105 hover:shadow-2xl flex flex-col items-center justify-center group relative overflow-hidden"
            onClick={() => handleCardClick("all-policies")}
          >
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 text-2xl">📋</div>

            <h3 className="text-3xl font-bold mb-4 group-hover:text-white">
              Policies
            </h3>
            <p className="text-lg opacity-90 leading-relaxed">
              Review Policies guidelines and
              <br />
               procedures
            </p>

            {/* Hover effect decoration */}
            <div className="absolute inset-0 border-4 border-transparent group-hover:border-green-200 rounded-2xl transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default View;
