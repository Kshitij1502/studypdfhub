import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../styles/public.css";

const SemesterPage = () => {
  const { course } = useParams();
  const navigate = useNavigate();

  const totalSemesters = course === "bca" ? 6 : 4;
  const courseName = course.toUpperCase();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page-container page-animate">

      {/* SEO */}
      <Helmet>
        <title>{courseName} Semester-wise PDFs | StudyPDF Hub</title>
        <meta
          name="description"
          content={`Download ${courseName} semester-wise PDFs, notes, and study materials for free.`}
        />
      </Helmet>

      {/* HERO */}
      <div className="hero">
        <h1>{courseName} Semesters</h1>
        <p>Select your semester to access subject-wise PDFs</p>
      </div>

      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* CONTENT */}
      <div className="card-grid">
        {loading
          ? [...Array(totalSemesters)].map((_, i) => (
              <div key={i} className="skeleton skeleton-card"></div>
            ))
          : [...Array(totalSemesters)].map((_, i) => (
              <div
                key={i}
                className="card semester-card"
                onClick={() =>
                  navigate(`/course/${course}/semester/${i + 1}`)
                }
              >
                <div className="semester-icon">📘</div>
                <h3>Semester {i + 1}</h3>
                <span className="semester-subtext">
                  View study materials
                </span>
              </div>
            ))}
      </div>

    </div>
  );
};

export default SemesterPage;
