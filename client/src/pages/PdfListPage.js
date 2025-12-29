import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/public.css";
import API from "../services/api";

const PdfListPage = () => {
  const { course, semester } = useParams();
  const navigate = useNavigate();

  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        setLoading(true);
        const res = await API.get(
          `/pdfs?course=${course.toUpperCase()}&semester=${semester}`
        );
        setPdfs(res.data);
      } catch (err) {
        console.error("Failed to fetch PDFs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, [course, semester]);

  return (
    <div className="page-container page-animate">
      <div className="hero">
        <h1>{course.toUpperCase()} – Semester {semester}</h1>
        <p>Available study materials</p>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {loading && (
        <>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </>
      )}

      {!loading && pdfs.length === 0 && <p>No PDFs available.</p>}

      <div className="pdf-grid">
        {pdfs.map((pdf) => (
          <div className="pdf-card" key={pdf._id}>
            <div>
              <h3>📄 {pdf.title}</h3>
              <p>{pdf.subject}</p>
            </div>

            <a
  href={`https://studypdfhub-production.up.railway.app/${pdf.fileUrl}`}
  target="_blank"
  rel="noopener noreferrer"
>

              <button className="primary-btn">Download</button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PdfListPage;
