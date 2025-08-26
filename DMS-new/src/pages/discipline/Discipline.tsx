import { NteAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  BellRing,
  FilePenLine,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Add this CSS animation to your global styles or as a style tag
const styles = `
  @keyframes bell-swing {
    0% { transform: rotate(0deg); }
    15% { transform: rotate(-15deg); }
    30% { transform: rotate(10deg); }
    45% { transform: rotate(-10deg); }
    60% { transform: rotate(6deg); }
    75% { transform: rotate(-4deg); }
    100% { transform: rotate(0deg); }
  }

  .swing-icon {
    animation: bell-swing 1s ease-in-out infinite;
    transform-origin: top center;
    display: inline-block;
  }
`;

interface NteDocument {
  nte: {
    employeeId: string;
    name: string;
    position: string;
    dateIssued: string;
    issuedBy: string;
    offenseType: string;
    offenseDescription: string;
    file: null | string;
  };
  _id: string;
  status: "DRAFT" | "PER" | "PNOD" | "PNODA" | "FTHR";
  createdAt: string;
  updatedAt: string;
}

interface DisciplineProps {
  selectedDocument?: DocumentType | null;
}

const Discipline = ({ selectedDocument }: DisciplineProps) => {
  console.log("Selected document:", selectedDocument);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [ntes, setNtes] = useState<NteDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNtes = async () => {
    try {
      setLoading(true);
      const response = await NteAPI.getNtes();

      // Check for successful response
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Optional: Check for error in response data if your API works that way
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setNtes(response.data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = (reason = "session_expired") => {
    localStorage.removeItem("user");
    // You can pass a reason for logout to the login page
    window.location.href = `/login?reason=${encodeURIComponent(reason)}`;
  };
  useEffect(() => {
    fetchNtes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNtes();
    toast({
      variant: "success",
      title: "Success",
      description: "Latest data fetched successfully",
    });
    setIsRefreshing(false);
  };

  const getCounts = () => {
    const counts = {
      PER: 0,
      PNOD: 0,
      PNODA: 0,
      FTHR: 0,
      DRAFT: 0,
      PENDING: 0,
    };

    ntes.forEach((nte) => {
      counts[nte.status] = (counts[nte.status] || 0) + 1;
    });

    return counts;
  };

  const statusCounts = getCounts();

  const cards = [
    {
      title: "PENDING EMPLOYEE RESPONSE",
      count: statusCounts.PER,
      icon: <FilePenLine className="w-6 h-6 text-gray-400" />,
      color: "bg-white",
      path: "/allper",
    },
    {
      title: "PENDING NOTICE OF DECISION",
      count: statusCounts.PNOD,
      icon:
        statusCounts.PNOD > 0 ? (
          <div className="relative">
            <style>{styles}</style>
            <BellRing className="w-6 h-6 text-red-500 swing-icon" />
          </div>
        ) : (
          <Bell className="w-6 h-6 text-gray-400" />
        ),
      color: "bg-white",
      path: "/allpnod",
    },
    {
      title: "PENDING NOD ACKNOWLEDGEMENT",
      count: statusCounts.PNODA,
      icon: <Bell className="w-6 h-6 text-gray-400" />,
      color: "bg-white",
      path: "/allpnoda",
    },
    {
      title: "PENDING INCIDENTS",
      count: statusCounts.PENDING,
      icon: <Bell className="w-6 h-6 text-gray-400" />,
      color: "bg-white",
      path: "/allpending",
    },
    {
      title: "FORWARDED TO HR",
      count: statusCounts.FTHR,
      icon: <Bell className="w-6 h-6 text-gray-400" />,
      color: "bg-white",
      path: "/allfthr",
    },
    {
      title: "DRAFTS",
      count: statusCounts.DRAFT,
      icon: <FolderOpen className="w-6 h-6 text-gray-400" />,
      color: "bg-white",
      path: "/alldraft",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-center items-center mb-6">
          <span className="text-2xl text-gray-700">DISCIPLINE MANAGEMENT</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleRefresh}
                  className="ml-2 p-2 rounded-full hover:bg-green-50 transition-all duration-300 group"
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`w-7 h-7 text-green-600 transform transition-transform duration-500 
                      ${
                        isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                      }`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex space-x-4 mb-6 border-b">
          <Button
            variant="ghost"
            className="text-gray-600 border-b-2 border-transparent hover:border-blue-500"
          >
            Home
          </Button>
          <Button
            variant="ghost"
            className="text-gray-600 border-b-2 border-transparent hover:border-blue-500"
          >
            My Summary
          </Button>
          <Button
            variant="ghost"
            className="text-gray-600 border-b-2 border-transparent hover:border-blue-500"
          >
            Employee Summary
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-gray-500 text-sm font-medium mb-2">
                      {card.title}
                    </div>
                    <div className="text-3xl font-semibold text-gray-700">
                      {loading ? "..." : card.count}
                    </div>
                  </div>
                  <div>{card.icon}</div>
                </div>
                <Button
                  variant="destructive"
                  className="mt-4"
                  onClick={() => navigate(card.path)}
                >
                  VIEW
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Discipline;
