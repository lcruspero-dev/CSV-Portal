import React, { ReactElement, useState } from "react";
import { DocumentType } from "./lib/types";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./pages/component/SideBar";

interface HomepageLayoutProps {
  children: ReactElement;
}

const HomepageLayout = ({ children }: HomepageLayoutProps) => {
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="fixed inset-0 w-full h-full flex bg-gray-100">
        <AppSidebar
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          setSelectedDocument={setSelectedDocument}
        />
        <main className="flex-1 flex flex-col overflow-y-auto  ">
          <SidebarTrigger className="p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </SidebarTrigger>
          {React.cloneElement(children, { selectedDocument })}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default HomepageLayout;
