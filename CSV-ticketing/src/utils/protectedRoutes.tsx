// src/components/ProtectedRoute.tsx
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthorized } from "../utils/auth";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthorized()) {
      navigate("/"); // or '/login' depending on your flow
    }
  }, [navigate]);

  return isAuthorized() ? <>{children}</> : null;
};

export default ProtectedRoute;
