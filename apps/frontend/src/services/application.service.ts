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

export interface CreateApplicationDto {
  jobOfferId: string;
  coverLetter?: string;
}

export interface Application {
  id: string;
  jobOfferId: string;
  status: string;
  createdAt: string;
}

export interface RecruiterApplication extends Application {
  score?: number;
  jobOffer: {
    id: string;
    title: string;
  };
  candidate: {
    location?: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export const applicationService = {
  async apply(dto: CreateApplicationDto): Promise<Application> {
    const response = await api.post("/applications", dto);
    return response.data;
  },

  async getMyApplications(): Promise<Application[]> {
    const response = await api.get("/applications/my");
    return response.data;
  },

  async getRecruiterApplications(): Promise<RecruiterApplication[]> {
    const response = await api.get("/applications/recruiter");
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<Application> {
    const response = await api.patch(`/applications/${id}/status`, { status });
    return response.data;
  },
};
