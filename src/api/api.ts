import axios from "axios";

const baseURL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_BASE_URL as string;
const token = import.meta.env.VITE_API_TOKEN as string;

console.log('API Configuration:', { baseURL, hasToken: !!token });

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  console.log('Making request:', config.method?.toUpperCase(), config.url);
  if (token) {
    config.headers?.set("Authorization", `Bearer ${token}`);
  }
  if (!config.headers?.get("Content-Type")) {
    config.headers?.set("Content-Type", "application/json");
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log('Response received:', res.status, res.config.url);
    return res;
  },
  (error) => {
    console.error('Request error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);
