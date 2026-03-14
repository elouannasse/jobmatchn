import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface JobSearchFilters {
  title?: string;
  location?: string;
  contractType?: string;
  salaryMin?: number;
  skills?: string[];
}

export const jobService = {
  async getJobs(filters: JobSearchFilters = {}) {
    // Filter out undefined/empty values
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== "" && (Array.isArray(v) ? v.length > 0 : true))
    );

    const response = await api.get("/jobs", { params });
    return response.data;
  },

  async getJobById(id: string) {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  }
};
