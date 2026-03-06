import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [message, setMessage] = useState("");

  const checkBackend = async () => {
    try {
      await API.get("/health", { timeout: 4000 });
      setBackendOnline(true);
      setMessage("");
    } catch {
      setBackendOnline(false);
      setMessage("Backend is offline right now. Admin login is temporarily unavailable.");
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!backendOnline) {
      setMessage("Backend is offline. Please start server and try again.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/admin/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      if (!err.response) {
        setBackendOnline(false);
        setMessage("Backend is unreachable. Please try again once server is live.");
      } else if (err.response.status === 401) {
        setMessage("Invalid admin credentials.");
      } else {
        setMessage("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 20 }}>
      <h2>Admin Login</h2>

      {!backendOnline && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "10px 12px",
            borderRadius: 8,
            marginBottom: 12,
            fontWeight: 600
          }}
        >
          Backend Offline
        </div>
      )}

      {message && (
        <p style={{ marginBottom: 12, color: backendOnline ? "#b91c1c" : "#991b1b" }}>{message}</p>
      )}

      <form onSubmit={handleLogin}>
        <input
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 10 }}
        />

        <button type="submit" disabled={loading || !backendOnline} style={{ marginRight: 8 }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <button type="button" onClick={checkBackend} disabled={loading}>
          Retry Connection
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
