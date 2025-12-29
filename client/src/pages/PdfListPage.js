import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/public.css";

const PdfListPage = () => {
  const { course, semester } = useParams();
  const [pdfs, setPdfs] = useState([]);
const navigate = useNavigate();
const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdfs = async () => {
        setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/pdfs?course=${course.toUpperCase()}&semester=${semester}`
      );
      setPdfs(res.data);
      setLoading(false);
    };
    fetchPdfs();
  }, [course, semester]);

  return (
    <div className="page-container page-animate">
      
      <div className="hero">
        <h1>{course.toUpperCase()} – Semester {semester}</h1>
        <p>Available study materials</p>
      </div>
     
     <button
  className="back-btn"
  onClick={() => navigate(-1)}
>
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
              href={`http://localhost:5000/${pdf.fileUrl}`}
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
