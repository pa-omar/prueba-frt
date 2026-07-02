import axios from "axios";

const baseURL = (import.meta as any).env?.VITE_API_URL || "http://localhost:5286/api/v1";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("farmacorp_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      const isAdmin = localStorage.getItem("farmacorp_role") === "admin";
      localStorage.removeItem("farmacorp_token");
      localStorage.removeItem("farmacorp_user");
      localStorage.removeItem("farmacorp_role");
      window.location.href = isAdmin ? "/admin/login" : "/login";
    }
    return Promise.reject(error);
  }
);