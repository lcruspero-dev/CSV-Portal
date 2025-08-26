import { useAuth } from "@/context/useAuth";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const PublicRoute: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return !isAuthenticated ? <Outlet /> : <Navigate to={`${location.state?.from?.pathname || "/"}`} />;
};
