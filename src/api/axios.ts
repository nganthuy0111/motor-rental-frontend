// src/api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL:  "https://motor-rental-backend.onrender.com/api", 
  // baseURL: "http://localhost:5000/api",
  timeout: 10000, // 10s timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Thêm token vào header nếu có
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi 401, refresh token sau này
    if (error.response?.status === 401) {
      console.error("Unauthorized - Token expired or invalid");
      // TODO: refresh token logic
    }
    return Promise.reject(error);
  }
);

export default api;
