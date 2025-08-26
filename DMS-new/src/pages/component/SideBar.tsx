import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/useAuth"; // Import the useAuth hook
import { DocumentType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  CirclePower,
  FileLock2,
  FilePlus2,
  Gauge,
  MessageCircleQuestion,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface AppSidebarProps {
  isDropdownOpen: boolean;
  setIsDropdownOpen: (value: boolean) => void;
  setSelectedDocument: React.Dispatch<
    React.SetStateAction<DocumentType | null>
  >;
}

interface MenuItem {
  title: string;
  url?: string;
  icon: React.ElementType;
  hasDropdown?: boolean;
  subItems?: Array<{
    title: string;
    url: string;
  }>;
}

const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: Gauge,
  },
  {
    title: "Create Document",
    icon: FilePlus2,
    hasDropdown: true,
    subItems: [
      {
        title: "Notice to Explain",
        url: "/nte",
      },
      {
        title: "Report Incident",
        url: "/ri",
      },
    ],
  },
  {
    title: "Policy",
    url: "/policy",
    icon: FileLock2,
  },
  {
    title: "FAQ's",
    url: "/faqs",
    icon: MessageCircleQuestion,
  },
];

export function AppSidebar({
  isDropdownOpen,
  setIsDropdownOpen,
}: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth(); // Use the logout function from useAuth

  // Fetch user data from local storage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { name, role } = user;

  const handleSubItemClick = (url: string) => {
    navigate(url);
    setIsDropdownOpen(false);
  };

  const isItemActive = (url?: string) => {
    if (!url) return false;
    return location.pathname === url;
  };

  return (
    <Sidebar>
      <SidebarHeader className="bg-blue-600">
        <div className="flex items-center space-x-2 bg-blue-600">
          <button
            onClick={logout}
            className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 focus:outline-none"
          >
            <CirclePower className="w-6 h-6 text-white" />
          </button>
          <div>
            <div className="text-sm font-medium text-white mt-5">
              {name || "USER NAME"}
            </div>
            <div className="text-xs text-white">
              {role === "TL"
                ? "(TEAM LEADER)"
                : role === "TM"
                ? "(TEAM MANAGER)"
                : "(ADMINISTRATOR)"}
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-blue-600">
        <SidebarGroup className="text-white font-semibold text-xl">
          <SidebarGroupLabel className="text-white font-semibold">
            DISCIPLINE MANAGEMENT SYSTEM
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={cn(
                      "relative",
                      isItemActive(item.url) && "bg-blue-700",
                      item.hasDropdown && isDropdownOpen && "bg-blue-700"
                    )}
                    onClick={() => {
                      if (item.hasDropdown) {
                        setIsDropdownOpen(!isDropdownOpen);
                      } else if (item.url) {
                        navigate(item.url);
                        setIsDropdownOpen(false);
                      }
                    }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.hasDropdown && (
                      <ChevronDown
                        className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </SidebarMenuButton>
                  {item.hasDropdown && isDropdownOpen && (
                    <div className="ml-6 space-y-1 mt-1">
                      {item.subItems?.map((subItem) => (
                        <SidebarMenuButton
                          key={subItem.title}
                          onClick={() => handleSubItemClick(subItem.url)}
                          className={cn(
                            isItemActive(subItem.url) && "bg-blue-700"
                          )}
                        >
                          {subItem.title}
                        </SidebarMenuButton>
                      ))}
                    </div>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
