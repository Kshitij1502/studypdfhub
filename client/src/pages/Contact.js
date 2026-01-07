import React from "react";
import "../styles/public.css";

const Contact = () => {
  return (
    <div className="page-container page-animate">
      
      {/* HERO */}
      <div className="hero">
        <h1>📩 Contact Us</h1>
        <p>
          Have a question, suggestion, or found an issue with any PDF?
          <br />
          Feel free to reach out to us.
        </p>
      </div>

      {/* CONTACT CARD */}
      <div
        className="card"
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          padding: "30px",
        }}
      >
        <h3 style={{ marginBottom: "15px" }}>📧 Email Support</h3>

        <p style={{ marginBottom: "20px", lineHeight: "1.6" }}>
          You can contact us directly via email.  
          We usually reply within <strong>24–48 hours</strong>.
        </p>

        <a
          href="mailto:studypdfhub@yahoo.com?subject=StudyPDF Hub Support"
          className="primary-btn"
          style={{
            display: "inline-block",
            textDecoration: "none",
          }}
        >
          ✉️ Email Us
        </a>

        <p
          style={{
            marginTop: "20px",
            fontSize: "14px",
            opacity: 0.7,
          }}
        >
          For:
          <br />• PDF issues  
          <br />• Notes requests  
          <br />• Suggestions & feedback
        </p>
      </div>
    </div>
  );
};

export default Contact;
