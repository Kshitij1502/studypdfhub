import axios from "axios";

const SYSTEM_API_BASE_URL =
  process.env.REACT_APP_SYSTEM_API_BASE_URL ||
  "https://studypdfhub-api.patelkshitij1502.workers.dev/api";

const SYSTEM_API = axios.create({
  baseURL: SYSTEM_API_BASE_URL
});

export default SYSTEM_API;
