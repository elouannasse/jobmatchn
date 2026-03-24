import api from "./api";

export interface GlobalStats {
  totalJobs: number;
  totalApplications: number;
  totalCandidates: number;
  totalCompanies: number;
  totalRecruiters: number;
  totalPendingRecruiters: number;
  totalPendingJobs: number;
  statusDistribution: { status: string; count: number }[];
  averageScore: number;
}

export interface GrowthData {
  month: string;
  users: number;
}

export const adminService = {
  async getGlobalStats(): Promise<GlobalStats> {
    const response = await api.get("/stats/global");
    return response.data;
  },

  async getGrowthData(): Promise<GrowthData[]> {
    const response = await api.get("/stats/growth");
    return response.data;
  },

  async getUsersByRole(role: string, isApproved?: boolean): Promise<any[]> {
    const url = isApproved !== undefined 
      ? `/users?role=${role}&isApproved=${isApproved}`
      : `/users?role=${role}`;
    const response = await api.get(url);
    return response.data;
  },

  async approveRecruiter(userId: string): Promise<any> {
    const response = await api.patch(`/users/${userId}/approve`);
    return response.data;
  },

  async rejectRecruiter(userId: string, reason: string): Promise<any> {
    const response = await api.patch(`/users/${userId}/reject`, { reason });
    return response.data;
  },
  
  async getPendingJobs(): Promise<any[]> {
    const response = await api.get("/admin/jobs/pending");
    return response.data;
  },

  async approveJob(jobId: string): Promise<any> {
    const response = await api.patch(`/admin/jobs/${jobId}/approve`);
    return response.data;
  },

  async rejectJob(jobId: string, reason: string): Promise<any> {
    const response = await api.patch(`/admin/jobs/${jobId}/reject`, { reason });
    return response.data;
  },

  async createUser(userData: any): Promise<any> {
    const response = await api.post("/users", userData);
    return response.data;
  },

  async updateUser(id: string, userData: any): Promise<any> {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  async getCompanies(): Promise<any[]> {
    const response = await api.get("/companies");
    return response.data;
  },
  
  async getCandidates(): Promise<any[]> {
    const response = await api.get("/candidates");
    return response.data;
  },

  async createCandidate(candidateData: any): Promise<any> {
    const response = await api.post("/candidates", candidateData);
    return response.data;
  },

  async updateCandidate(id: string, candidateData: any): Promise<any> {
    const response = await api.put(`/candidates/${id}`, candidateData);
    return response.data;
  },

  async deleteCandidate(id: string): Promise<any> {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },
};
