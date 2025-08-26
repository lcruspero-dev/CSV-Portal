import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { ViewModeProvider } from "./components/kit/ViewModeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import "./index.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ViewModeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ViewModeProvider>
    </BrowserRouter>
  </StrictMode>
);
