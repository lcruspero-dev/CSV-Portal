import AdminViewIndovidualTicket from "@/pages/allTicket/AdminViewIndividualTicket";
import UserViewIndovidualTicket from "@/pages/allTicket/UserViewIndividualTicket";
import React from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

const ViewIndividualTicket: React.FC = () => {
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
    // Handle case where user is not logged in
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div>
      {user.isAdmin ? (
        <AdminViewIndovidualTicket />
      ) : (
        <UserViewIndovidualTicket />
      )}
    </div>
  );
};

export default ViewIndividualTicket;
