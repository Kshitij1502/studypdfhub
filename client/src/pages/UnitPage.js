import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/public.css";

const UnitPage = () => {
  const { course, semester, subject } = useParams();
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const res = await API.get(
          `/pdfs/units?course=${course.toUpperCase()}&semester=${semester}&subject=${subject}`
        );
        setUnits(res.data);
      } catch (err) {
        console.error("Failed to load units", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [course, semester, subject]);

  return (
    <div className="page-container page-animate">
      {/* HERO */}
      <div className="hero">
        <h1>
          {subject.toUpperCase()} – Semester {semester}
        </h1>
        <p>Select a unit</p>
      </div>

      {/* BACK */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* LOADING */}
      {loading && (
        <>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </>
      )}

      {/* EMPTY */}
      {!loading && units.length === 0 && <p>No units found.</p>}
{loading && (
  <p style={{ textAlign: "center" }}>Loading PDFs...</p>
)}

      {/* UNITS */}
      <div className="card-grid">
        {units.map((unit) => (
          <div
            key={unit}
            className="card"
            onClick={() =>
              navigate(
                `/course/${course}/semester/${semester}/subject/${subject}/unit/${unit}`
              )
            }
          >
            <h3>Unit {unit}</h3>
            <span className="semester-subtext">
              View PDFs
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitPage;
