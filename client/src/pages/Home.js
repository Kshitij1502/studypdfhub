import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../styles/public.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container page-animate">

      {/* SEO */}
      <Helmet>
        <title>BCA & MCA Study PDFs | Free Semester-wise Notes</title>
        <meta
          name="description"
          content="Download Free BCA and MCA semester-wise PDFs, notes, and study materials. Simple, fast, and student-friendly."
        />
        <meta
          name="keywords"
          content="BCA PDFs, MCA PDFs, semester wise notes, BCA study material, MCA study material"
        />
      </Helmet>

      {/* HERO */}
      <div className="hero">
        <h1>📚 BCA & MCA Study Materials</h1>
        <p>
          Semester-wise PDFs, notes & resources — simple, fast & free
        </p>
      </div>

      {/* FEATURES */}
      <div className="feature-grid">
        <div className="feature">✅ Semester-wise PDFs</div>
        <div className="feature">📥 Easy Download</div>
        <div className="feature">🌙 Dark Mode</div>
      </div>

      {/* COURSE CARDS */}
      <div className="card-grid">
        <div className="card" onClick={() => navigate("/course/bca")}>
          <h2>🎓 BCA</h2>
          <p>Bachelor of Computer Applications</p>
        </div>

        <div className="card" onClick={() => navigate("/course/mca")}>
          <h2>🎓 MCA</h2>
          <p>Master of Computer Applications</p>
        </div>
      </div>

    </div>
  );
};

export default Home;
