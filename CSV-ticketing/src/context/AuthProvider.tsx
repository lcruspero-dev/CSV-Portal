import React, { createContext, ReactNode, useEffect, useState } from "react";

interface isAuthenticated {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  isAuthenticated: isAuthenticated;
  login: (data: isAuthenticated) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<isAuthenticated>({
    isAuthenticated: false,
    isAdmin: false,
  });

  // Check token expiry on mount and every minute
  useEffect(() => {
    const checkTokenExpiry = () => {
      const userData = localStorage.getItem("user");
      if (!userData) return;

      try {
        const { token } = JSON.parse(userData);
        if (!token) return;

        const FIVE_DAYS_IN_MS = 5 * 24 * 60 * 60 * 1000;
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeLeft = expiryTime - currentTime;

        if (timeLeft <= FIVE_DAYS_IN_MS) {
          logout();
        }
      } catch (error) {
        console.error("Error checking token expiry:", error);
      }
    };

    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const login = (data: isAuthenticated): void => {
    setIsAuthenticated(data);
    localStorage.setItem("isAuthenticated", JSON.stringify(data));
  };

  const logout = (): void => {
    setIsAuthenticated({ isAuthenticated: false, isAdmin: false });
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("viewAsUser");
    window.location.href = "/sign-in"; // Redirect to login
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
