import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import Breadcrumb from "./components/Breadcrumb";

import Home from "./pages/Home";
import SemesterPage from "./pages/SemesterPage";
import SubjectPage from "./pages/SubjectPage";
import UnitPage from "./pages/UnitPage";
import PdfListPage from "./pages/PdfListPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Disclaimer from "./pages/Disclaimer";
import About from "./pages/About";
import MaintenancePage from "./pages/MaintenancePage";
import Footer from "./components/Footer";

import API from "./services/api";
import SYSTEM_API from "./services/systemApi";
import "./styles/theme.css";

const AppContent = ({ darkMode, setDarkMode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [healthCheckDone, setHealthCheckDone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkSystemStatus = async () => {
      const [systemStatusResult, backendHealthResult] = await Promise.allSettled([
        SYSTEM_API.get("/system/status", { timeout: 5000 }),
        API.get("/health", { timeout: 5000 })
      ]);

      if (!isMounted) {
        return;
      }

      setIsBackendHealthy(backendHealthResult.status === "fulfilled");

      if (systemStatusResult.status === "fulfilled") {
        setIsMaintenanceMode(Boolean(systemStatusResult.value.data?.maintenanceMode));
      } else {
        // If Worker status endpoint fails, fall back to maintenance for safety.
        setIsMaintenanceMode(true);
      }

      setHealthCheckDone(true);
    };

    checkSystemStatus();
    const intervalId = setInterval(checkSystemStatus, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (healthCheckDone && !isAdminRoute && (!isBackendHealthy || isMaintenanceMode)) {
    return <MaintenancePage />;
  }

  return (
    <>
      <Navbar toggleTheme={() => setDarkMode(!darkMode)} darkMode={darkMode} />

      <Breadcrumb />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:course" element={<SemesterPage />} />
        <Route path="/course/:course/semester/:semester" element={<SubjectPage />} />
        <Route
          path="/course/:course/semester/:semester/subject/:subject"
          element={<UnitPage />}
        />
        <Route
          path="/course/:course/semester/:semester/subject/:subject/unit/:unit"
          element={<PdfListPage />}
        />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/about" element={<About />} />
      </Routes>

      <Footer />
    </>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [darkMode]);

  return (
    <BrowserRouter>
      <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
    </BrowserRouter>
  );
}

export default App;
