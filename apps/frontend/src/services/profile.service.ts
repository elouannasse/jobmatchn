import axios from "axios";
import Cookies from "js-cookie";
import { CandidateProfileInput, RecruiterOnboardingInput } from "../lib/validations/profile.schema";

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

export const profileService = {
  async updateCandidateProfile(data: CandidateProfileInput) {
    const response = await api.patch("/profiles/candidate", data);
    return response.data;
  },

  async createCompany(data: RecruiterOnboardingInput) {
    const response = await api.post("/companies", data);
    return response.data;
  },

  async getMyProfile() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  async getPublicCompany(id: string) {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  }
};
