import axios from "axios";

const normalizeApiBase = (value, fallback) => {
  const raw = String(value || "").trim();
  const base = raw || fallback;
  const cleaned = base.replace(/\/+$/, "");
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
};

const SYSTEM_API_BASE_URL = normalizeApiBase(
  process.env.REACT_APP_SYSTEM_API_BASE_URL ||
    process.env.REACT_APP_SYSTEM_API_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_URL,
  "https://studypdfhub-api.patelkshitij1502.workers.dev/api"
);

const SYSTEM_API = axios.create({
  baseURL: SYSTEM_API_BASE_URL
});

export default SYSTEM_API;
