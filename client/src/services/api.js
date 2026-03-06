import axios from "axios";

const normalizeApiBase = (value, fallback) => {
  const raw = String(value || "").trim();
  const base = raw || fallback;
  const cleaned = base.replace(/\/+$/, "");
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
};

const API_BASE_URL = normalizeApiBase(
  process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL,
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://studypdfhub-api.patelkshitij1502.workers.dev/api"
);

const API = axios.create({
  baseURL: API_BASE_URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
