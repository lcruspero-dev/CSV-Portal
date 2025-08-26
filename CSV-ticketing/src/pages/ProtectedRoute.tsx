import { useAuth } from "@/context/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  requiresAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiresAdmin = false,
}) => {
  const location = useLocation();
  const authState: { isAuthenticated: boolean; isAdmin: boolean } = useAuth();
  const { isAdmin } = authState;

  const isAuthorized = requiresAdmin ? isAdmin : true;

  const login = localStorage.getItem("isAuthenticated");

  return (
    <div>
      {login ? (
        isAuthorized ? (
          <Outlet />
        ) : (
          <Navigate to="/" replace />
        )
      ) : (
        <Navigate to="/sign-in" state={{ from: location }} replace />
      )}
    </div>
  );
};
