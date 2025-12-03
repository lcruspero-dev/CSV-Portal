import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";

import "./App.css";
import { Toaster } from "./components/ui/toaster";
import HomepageLayout from "./HomepageLayout";
import Discipline from "./pages/discipline/Discipline";
import Faqs from "./pages/faqs/Faqs";
import Login from "./pages/login/Login";
import AllDraft from "./pages/nte/AllDraft";
import AllHrForwarded from "./pages/nte/AllHrForwarded";
import AllPendingAcknowledgement from "./pages/nte/AllPendingAcknowledgement";
import AllPendingDecision from "./pages/nte/AllPendingDecision";
import AllPendingIncidents from "./pages/nte/AllPendingIncidents";
import AllPendingResponse from "./pages/nte/AllPendingResponse";
import Nte from "./pages/nte/Nte";
import Policy from "./pages/policy/Policy";
import Ri from "./pages/ri/Ri";
import UserNta from "./pages/usernta/UserNta";
import Coaching from "./pages/coach/Coaching"

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user");
  const location = useLocation();

  if (!user) {
    // Redirect to login page with the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage ? (
        <ProtectedRoute>
          <HomepageLayout>
            <Routes>
              <Route path="/" element={<Discipline />} />
              <Route path="/policy" element={<Policy />} />
              <Route path="/faqs" element={<Faqs />} />
              <Route path="/nte" element={<Nte />} />
              <Route path="/ri" element={<Ri />} />
              <Route path="/usernta" element={<UserNta />} />
              <Route path="/coaching" element={<Coaching />} />
              <Route path="/alldraft" element={<AllDraft />} />
              <Route path="/allper" element={<AllPendingResponse />} />
              <Route path="/allfthr" element={<AllHrForwarded />} />
              <Route path="/allpnod" element={<AllPendingDecision />} />
              <Route path="/allpnoda" element={<AllPendingAcknowledgement />} />
              <Route path="/allpending" element={<AllPendingIncidents />} />
            </Routes>
          </HomepageLayout>
        </ProtectedRoute>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      )}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
      <Toaster />
    </Router>
  );
};

export default App;
