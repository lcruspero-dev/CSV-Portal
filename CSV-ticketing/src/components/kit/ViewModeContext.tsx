import React, { createContext, useContext, useEffect, useState } from "react";

type ViewModeContextType = {
  viewAsUser: boolean;
  toggleView: () => void;
  setAdminView: (isAdminView: boolean) => void;
};

const ViewModeContext = createContext<ViewModeContextType | undefined>(
  undefined
);

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [viewAsUser, setViewAsUser] = useState<boolean>(true);

  useEffect(() => {
    const storedView = localStorage.getItem("viewAsUser");
    setViewAsUser(storedView ? JSON.parse(storedView) : true);
  }, []);

  const toggleView = () => {
    setViewAsUser((prev) => {
      const newState = !prev;
      localStorage.setItem("viewAsUser", JSON.stringify(newState));
      return newState;
    });
  };

  const setAdminView = (isAdminView: boolean) => {
    const newState = !isAdminView;
    setViewAsUser(newState);
    localStorage.setItem("viewAsUser", JSON.stringify(newState));
  };

  return (
    <ViewModeContext.Provider value={{ viewAsUser, toggleView, setAdminView }}>
      {children}
    </ViewModeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (!context)
    throw new Error("useViewMode must be used within ViewModeProvider");
  return context;
};
