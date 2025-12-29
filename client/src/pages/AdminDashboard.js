import React, { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [pdfs, setPdfs] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    course: "BCA",
    semester: 1,
    subject: "",
    pdf: null,
  });

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = useCallback(() => {
  localStorage.removeItem("token");
  navigate("/admin/login");
}, [navigate]);


  /* =========================
     FETCH PDFs
  ========================= */
  const fetchPdfs = useCallback(async () => {
  try {
    const res = await API.get(
      `/pdfs?course=${form.course}&semester=${form.semester}`
    );
    setPdfs(res.data);
  } catch (err) {
    if (err.response?.status === 401) {
      alert("Unauthorized. Login again.");
      handleLogout();
    }
  }
}, [form.course, form.semester, handleLogout]); // ✅ handleLogout removed



  useEffect(() => {
    fetchPdfs();
  }, [fetchPdfs]);

  /* =========================
     UPLOAD PDF
  ========================= */
const handleUpload = async (e) => {
  e.preventDefault();

  const data = new FormData();
  data.append("title", form.title);
  data.append("course", form.course);
  data.append("semester", form.semester);
  data.append("subject", form.subject);
  data.append("pdf", form.pdf);

  try {
    await API.post("/pdfs/upload", data); // 👈 NO HEADERS
    alert("PDF uploaded successfully");
    fetchPdfs();
  } catch (err) {
    if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
      handleLogout();
    } else {
      alert("Upload failed. Try again.");
      console.error(err);
    }
  }
};




  /* =========================
     DELETE PDF
  ========================= */
  const deletePdf = async (id) => {
    if (!window.confirm("Delete this PDF?")) return;

    try {
      await API.delete(`/pdfs/${id}`);
      fetchPdfs();
    } catch {
      alert("Delete failed");
    }
  };

  const semesterCount = form.course === "BCA" ? 6 : 4;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="filters">
        <select
          value={form.course}
          onChange={(e) =>
            setForm({ ...form, course: e.target.value, semester: 1 })
          }
        >
          <option value="BCA">BCA</option>
          <option value="MCA">MCA</option>
        </select>

        <select
          value={form.semester}
          onChange={(e) =>
            setForm({ ...form, semester: Number(e.target.value) })
          }
        >
          {[...Array(semesterCount)].map((_, i) => (
            <option key={i} value={i + 1}>
              Semester {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="upload-card">
        <form onSubmit={handleUpload}>
          <input
            placeholder="Title"
            required
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
          <input
            placeholder="Subject"
            required
            onChange={(e) =>
              setForm({ ...form, subject: e.target.value })
            }
          />
          <input
            type="file"
            accept="application/pdf"
            required
            onChange={(e) =>
              setForm({ ...form, pdf: e.target.files[0] })
            }
          />
          <button type="submit">Upload</button>
        </form>
      </div>

      <input
        className="search-input"
        placeholder="Search by subject..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <h3>
        {form.course} – Semester {form.semester}
      </h3>

      {pdfs
        .filter((p) =>
          p.subject.toLowerCase().includes(search.toLowerCase())
        )
        .map((pdf) => (
          <div key={pdf._id} className="pdf-card">
            <div>
              <strong>{pdf.title}</strong>
              <div>{pdf.subject}</div>
            </div>
            <div>
              <a
                href={`http://localhost:5000/${pdf.fileUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                <button>Preview</button>
              </a>
              <button onClick={() => deletePdf(pdf._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default AdminDashboard;
