import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = ({ toggleTheme, darkMode }) => {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">📚 StudyPDF Hub</Link>

      {/* ❌ REMOVE CONTACT LINK */}

      <button className="theme-btn" onClick={toggleTheme}>
        {darkMode ? "☀ Light" : "🌙 Dark"}
      </button>
    </nav>
  );
};


export default Navbar;
