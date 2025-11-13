import { useViewMode } from "@/components/kit/ViewModeContext";
import { Button } from "@/components/ui/button";
import AdminHome from "@/pages/homePage/AdminHomePage";
import UserHome from "@/pages/homePage/UserHomePage";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import React from "react";
import Background from "../../assets/bg.jpg"

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

const Homepage: React.FC = () => {

  const { viewAsUser, toggleView } = useViewMode();

  const getUserFromLocalStorage = (): User | null => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) return null;
      return JSON.parse(userString) as User;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const user = getUserFromLocalStorage();

  if (!user) {
    return (
      <div>
        <p>Please log in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full justify-center bg-cover bg-center bg-no-repeat" 
    style={{
      backgroundImage: `url(${Background})`
    }}
    >
      {user.isAdmin && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={toggleView}
            variant="outline"
            className="flex items-center gap-2"
          >
            {viewAsUser ? (
              <>
                <EyeOffIcon className="w-4 h-4" />
                <span className="text-xs">View as Admin</span>
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4" />
                <span className="text-xs">View as User</span>
              </>
            )}
          </Button>
        </div>
      )}

      {user.isAdmin ? viewAsUser ? <UserHome /> : <AdminHome /> : <UserHome />}
    </div>
  );
};

export default Homepage;
