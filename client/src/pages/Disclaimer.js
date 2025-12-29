import React from "react";
import { Helmet } from "react-helmet-async";
import "../styles/public.css";

const Disclaimer = () => {
  return (
    <div className="page-container page-animate">
      <Helmet>
        <title>Disclaimer | StudyPDF Hub</title>
        <meta
          name="description"
          content="Disclaimer for StudyPDF Hub regarding educational content."
        />
      </Helmet>

      <h1 className="page-title">Disclaimer</h1>

      <p>
        All PDFs and study materials available on StudyPDF Hub are provided for
        educational purposes only.
      </p>

      <p>
        We do not claim ownership of third-party materials. If any content
        violates copyright, please contact us for removal.
      </p>
    </div>
  );
};

export default Disclaimer;
