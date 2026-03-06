import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/public.css";

const PdfListPage = () => {
  const { course, semester, subject, unit } = useParams();
  const navigate = useNavigate();

  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiOrigin = (API.defaults.baseURL || "").replace(/\/api\/?$/, "");

  const resolveFileUrl = (fileUrl) => {
    if (!fileUrl) return "#";
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    return `${apiOrigin}/${String(fileUrl).replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    if (!course || !semester || !subject || !unit) return;

    const fetchPdfs = async () => {
      try {
        setLoading(true);
        const res = await API.get(
          `/pdfs?course=${course.toUpperCase()}&semester=${Number(
            semester
          )}&subject=${subject.toLowerCase()}&unit=${Number(unit)}`
        );

        setPdfs(res.data);
      } catch (err) {
        console.error(err);
        setPdfs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, [course, semester, subject, unit]);

  return (
    <div className="page-container page-animate">
      <div className="hero">
        <h1>
          {course?.toUpperCase()} - {subject?.toUpperCase()} - Unit {unit}
        </h1>

        <p>Available study materials</p>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>

      {loading && (
        <div className="pdf-grid">
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
      )}

      {!loading && pdfs.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "40px" }}>
          No PDFs available for this unit.
        </p>
      )}

      {!loading && pdfs.length > 0 && (
        <div className="pdf-grid">
          {pdfs.map((pdf) => (
            <div className="pdf-card" key={pdf._id}>
              <div>
                <h3>{pdf.title}</h3>
                <p>
                  {pdf.subject} - Unit {pdf.unit}
                </p>
              </div>

              <a href={resolveFileUrl(pdf.fileUrl)} target="_blank" rel="noopener noreferrer">
                <button className="primary-btn">Download</button>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PdfListPage;
