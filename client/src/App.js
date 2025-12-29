import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import Breadcrumb from "./components/Breadcrumb";

import Home from "./pages/Home";
import SemesterPage from "./pages/SemesterPage";
import PdfListPage from "./pages/PdfListPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Disclaimer from "./pages/Disclaimer";
import About from "./pages/About";
import Footer from "./components/Footer";
import "./styles/theme.css";

function App() {
 const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") === "dark"
);

useEffect(() => {
  const theme = darkMode ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}, [darkMode]);


  return (
    <BrowserRouter>
      <Navbar
        toggleTheme={() => setDarkMode(!darkMode)}
        darkMode={darkMode}
      />

      <Breadcrumb />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:course" element={<SemesterPage />} />
        <Route path="/course/:course/semester/:semester" element={<PdfListPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
<Route path="/disclaimer" element={<Disclaimer />} />
<Route path="/about" element={<About />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
