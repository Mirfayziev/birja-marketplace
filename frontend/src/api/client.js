import axios from "axios";
import i18n from "../i18n";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Har bir so'rovga joriy til (?lang=) va JWT tokenni avtomatik qo'shish
apiClient.interceptors.request.use((config) => {
  config.params = { ...config.params, lang: i18n.language?.split("-")[0] || "uz" };

  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
