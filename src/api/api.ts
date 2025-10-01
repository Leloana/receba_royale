import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL as string;
const token = import.meta.env.VITE_API_TOKEN as string;

export const api = axios.create({
  baseURL,
  timeout: 15000,
    headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (token) {
    config.headers?.set("Authorization", `Bearer ${token}`);
  }
  if (!config.headers?.get("Content-Type")) {
    config.headers?.set("Content-Type", "application/json");
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    return Promise.reject(error);
  }
);
