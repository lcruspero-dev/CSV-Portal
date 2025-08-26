import React, { createContext, ReactNode, useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role: string;
  token: string;
  profileImage?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<{
    isAuthenticated: boolean;
    isAdmin: boolean;
    user: User | null;
    isLoading: boolean;
  }>({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("isAuthenticated");
      const userData = localStorage.getItem("user");

      if (storedAuth && userData) {
        const authData = JSON.parse(storedAuth);
        const user = JSON.parse(userData);
        setState({
          isAuthenticated: authData.isAuthenticated,
          isAdmin: authData.isAdmin,
          user,
          isLoading: false,
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User): void => {
    const authData = {
      isAuthenticated: true,
      isAdmin: userData.isAdmin,
    };
    localStorage.setItem("isAuthenticated", JSON.stringify(authData));
    localStorage.setItem("user", JSON.stringify(userData));
    setState({
      isAuthenticated: true,
      isAdmin: userData.isAdmin,
      user: userData,
      isLoading: false,
    });
  };

  const logout = (): void => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("viewAsUser");
    setState({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      isLoading: false,
    });
    // window.location.href = "/sign-in";
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        user: state.user,
        login,
        logout,
        isLoading: state.isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
