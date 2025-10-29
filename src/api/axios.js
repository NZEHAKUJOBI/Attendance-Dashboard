import axios from "axios";

// Use Vite environment variable (VITE_API_URL) when available.
// In development, set VITE_API_URL in a .env file at project root, e.g.:
// VITE_API_URL=http://localhost:5044/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5044/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
