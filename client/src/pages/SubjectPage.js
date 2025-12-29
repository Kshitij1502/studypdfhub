import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/public.css";

const SubjectPage = () => {
  const { course, semester } = useParams();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  setLoading(true);

  const fetchSubjects = async () => {
    try {
      const res = await API.get(
        `/pdfs/subjects?course=${course.toUpperCase()}&semester=${semester}`
      );
      setSubjects(res.data);
    } catch (err) {
      console.error("Failed to load subjects", err);
    } finally {
      setLoading(false);
    }
  };

  fetchSubjects();
}, [course, semester]);

/*   useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await API.get(
          `/pdfs/subjects?course=${course.toUpperCase()}&semester=${semester}`
        );
        setSubjects(res.data);
      } catch (err) {
        console.error("Failed to load subjects", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [course, semester]);
 */
  return (
    <div className="page-container page-animate">
      <div className="hero">
        <h1>{course.toUpperCase()} – Semester {semester}</h1>
        <p>Select a subject</p>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {loading && (
        <>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </>
      )}

      {!loading && subjects.length === 0 && (
        <p>No subjects found.</p>
      )}

      <div className="card-grid">
        {subjects.map((subject, i) => (
          <div
            key={i}
            className="card"
            onClick={() =>
              navigate(
                `/course/${course}/semester/${semester}/subject/${subject}`
              )
            }
          >
            <h3>{subject.toUpperCase()}</h3>
            <span className="semester-subtext">
              View units & PDFs
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectPage;
