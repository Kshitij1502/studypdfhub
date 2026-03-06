import React, { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [pdfs, setPdfs] = useState([]);
  const [search, setSearch] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [modeLoading, setModeLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    course: "BCA",
    semester: 1,
    subject: "",
    unit: 1,
    pdf: null
  });

  const apiOrigin = (API.defaults.baseURL || "").replace(/\/api\/?$/, "");

  const resolveFileUrl = (fileUrl) => {
    if (!fileUrl) return "#";
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    return `${apiOrigin}/${String(fileUrl).replace(/^\/+/, "")}`;
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  }, [navigate]);

  const fetchPdfs = useCallback(async () => {
    try {
      const res = await API.get(`/pdfs?course=${form.course}&semester=${form.semester}`);
      setPdfs(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Unauthorized. Login again.");
        handleLogout();
      }
    }
  }, [form.course, form.semester, handleLogout]);

  const fetchSystemMode = useCallback(async () => {
    try {
      const res = await API.get("/system/status");
      setMaintenanceMode(Boolean(res.data?.maintenanceMode));
    } catch (err) {
      console.error("Failed to fetch system mode", err);
    }
  }, []);

  useEffect(() => {
    fetchPdfs();
  }, [fetchPdfs]);

  useEffect(() => {
    fetchSystemMode();
  }, [fetchSystemMode]);

  const handleToggleMode = async (nextMode) => {
    try {
      setModeLoading(true);
      const res = await API.put("/system/maintenance", {
        maintenanceMode: nextMode
      });

      setMaintenanceMode(Boolean(res.data?.maintenanceMode));
      alert(nextMode ? "Maintenance mode is ON" : "Live mode is ON");
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Session expired. Login again.");
        handleLogout();
      } else if (err.response?.status === 403) {
        alert("Only admin can change mode.");
      } else {
        alert("Failed to change mode.");
      }
    } finally {
      setModeLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", form.title);
    data.append("course", form.course);
    data.append("semester", form.semester);
    data.append("subject", form.subject.toLowerCase());
    data.append("unit", form.unit);
    data.append("pdf", form.pdf);

    try {
      await API.post("/pdfs/upload", data);
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

        <div className="dashboard-header-actions">
          <div className="mode-toggle-card">
            <span className={`mode-status ${maintenanceMode ? "maintenance" : "live"}`}>
              {maintenanceMode ? "Maintenance" : "Live"}
            </span>
            <div className="mode-toggle-buttons">
              <button
                type="button"
                className={`mode-btn live ${!maintenanceMode ? "active" : ""}`}
                onClick={() => handleToggleMode(false)}
                disabled={modeLoading}
              >
                Live
              </button>
              <button
                type="button"
                className={`mode-btn maintenance ${maintenanceMode ? "active" : ""}`}
                onClick={() => handleToggleMode(true)}
                disabled={modeLoading}
              >
                Maintenance
              </button>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="filters">
        <select
          value={form.course}
          onChange={(e) => setForm({ ...form, course: e.target.value, semester: 1 })}
        >
          <option value="BCA">BCA</option>
          <option value="MCA">MCA</option>
        </select>

        <select
          value={form.semester}
          onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
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
            placeholder="PdfName"
            required
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            placeholder="Subject"
            required
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: Number(e.target.value) })}
            required
          >
            <option value={1}>Unit 1</option>
            <option value={2}>Unit 2</option>
            <option value={3}>Unit 3</option>
            <option value={4}>Unit 4</option>
            <option value={5}>Unit 5</option>
          </select>

          <input
            type="file"
            accept="application/pdf"
            required
            onChange={(e) => setForm({ ...form, pdf: e.target.files[0] })}
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
        {form.course} - Semester {form.semester}
      </h3>

      {pdfs
        .filter((p) => p.subject.toLowerCase().includes(search.toLowerCase()))
        .map((pdf) => (
          <div key={pdf._id} className="pdf-card">
            <div>
              <strong>{pdf.title}</strong>
              <div>{pdf.subject}</div>
            </div>
            <div>
              <a href={resolveFileUrl(pdf.fileUrl)} target="_blank" rel="noreferrer">
                <button>Preview</button>
              </a>
              <button onClick={() => deletePdf(pdf._id)}>Delete</button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default AdminDashboard;
