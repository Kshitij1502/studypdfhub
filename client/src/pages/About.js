import React from "react";
import { Helmet } from "react-helmet-async";
import "../styles/public.css";

const About = () => {
  return (
    <div className="page-container page-animate">
      <Helmet>
        <title>About Us | StudyPDF Hub</title>
        <meta
          name="description"
          content="About StudyPDF Hub – Free BCA & MCA study materials."
        />
      </Helmet>

      <h1 className="page-title">About Us</h1>

      <p>
        StudyPDF Hub is a student-focused platform that provides free,
        semester-wise BCA and MCA study materials.
      </p>

      <p>
        Our goal is to help students easily access quality notes, PDFs, and
        academic resources in one place.
      </p>
    </div>
  );
};

export default About;
