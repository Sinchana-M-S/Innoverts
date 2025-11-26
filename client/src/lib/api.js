import axios from "axios";

// ✅ Use your JSON backend or fallback to local server
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ Create axios instance WITHOUT tokens
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ No interceptors needed
export default api;