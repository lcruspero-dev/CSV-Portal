import { ExportDatas } from "@/API/endpoint";
import SurveyModal from "@/components/kit/Survey";
import Sidebar from "@/components/ui/Sidebar";
import Chart from "@/components/ui/charts";
import { useEffect, useState } from "react";

const AdminHome = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await ExportDatas.getAllTicket();
        setTickets(response.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, []);

  return (
    <>
      <SurveyModal />
      <div className="flex min-h-[50vh] bg-gradient-to-b from-[#eef4ff] to-white">
        {/* Sidebar - now properly handling mobile visibility */}
        <div className={`${isMobile ? "fixed" : "relative"} z-20`}>
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        </div>

        {/* Overlay for mobile */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10"
            onClick={toggleSidebar}
          />
        )}

        {/* Main content */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out min-h-[50vh] ${
            sidebarOpen && !isMobile ? "md:ml-[10px]" : "md:ml-[72px]"
          }`}
        >
          {/* Main content area */}
          <main className="mx-auto px-4 py-6 w-full">
            <section className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
                Welcome to Admin Dashboard
              </h2>
              <p className="text-xl font-bold mt-2 text-gray-700">
                Please select an option
              </p>
            </section>

            <div className="bg-white rounded-lg shadow p-4 w-full">
              <Chart tickets={tickets} />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminHome;
