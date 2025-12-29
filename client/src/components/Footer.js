import React from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} StudyPDF Hub</p>
      <p>Built for BCA & MCA students</p>
      <div className="footer-links">
        <Link to="/about">About</Link>
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/disclaimer">Disclaimer</Link>
      </div>
    </footer>
  );
};

export default Footer;
