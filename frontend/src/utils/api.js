import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("swasthai_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    if (error.response?.status === 401) {
      localStorage.removeItem("swasthai_token");
      window.location.href = "/login";
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again.");
    }
    return Promise.reject({ ...error, message });
  }
);

export default api;
