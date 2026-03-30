import api from "./api";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  candidateProfile?: any;
  recruiterProfile?: {
    id: string;
    companyId: string;
    company?: {
      id: string;
      name: string;
      logoUrl: string;
      description: string;
      industry: string;
      location: string;
    }
  }
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get("/profile");
    return response.data;
  },

  async updateProfile(data: any): Promise<UserProfile> {
    const response = await api.put("/profile", data);
    return response.data;
  },

  async uploadLogo(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/profile/logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async getMyAuth() {
    const response = await api.get("/auth/me");
    return response.data;
  },
 
  async getPublicCompany(id: string) {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },
 
  async getRecruiterCompany() {
    const response = await api.get("/companies/me");
    return response.data;
  }
};
