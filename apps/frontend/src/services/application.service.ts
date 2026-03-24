import api from "./api";

export interface CreateApplicationDto {
  jobOfferId: string;
  candidateId?: string;
  coverLetter?: string;
  status?: string;
}

export interface Application {
  id: string;
  jobOfferId: string;
  candidateId: string;
  status: string;
  createdAt: string;
}

export interface RecruiterApplication extends Application {
  score?: number;
  coverLetter?: string;
  interviewDate?: string;
  interviewMessage?: string;
  jobOffer: {
    id: string;
    title: string;
  };
  candidate: {
    location?: string;
    title?: string;
    summary?: string;
    skills?: string[];
    cvUrl?: string;
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
    return Array.isArray(response.data) ? response.data : [];
  },

  async getRecruiterApplications(): Promise<RecruiterApplication[]> {
    const response = await api.get("/applications/recruiter");
    return Array.isArray(response.data) ? response.data : [];
  },

  async getAllApplicationsAdmin(): Promise<RecruiterApplication[]> {
    const response = await api.get("/applications/admin");
    return Array.isArray(response.data) ? response.data : [];
  },

  async updateStatus(
    id: string, 
    status: string, 
    interviewDate?: string, 
    interviewMessage?: string
  ): Promise<Application> {
    const response = await api.patch(`/applications/${id}/status`, { 
      status, 
      interviewDate, 
      interviewMessage 
    });
    return response.data;
  },

  async deleteApplication(id: string): Promise<void> {
    await api.delete(`/applications/${id}`);
  }
};
