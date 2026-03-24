import api from "./api";

export interface RecruiterStats {
  myJobs: number;
  totalApplicationsReceived: number;
  statusDistribution: { status: string; count: number }[];
  monthlyApplications: { month: string; applications: number }[];
}

export const recruiterService = {
  async getStats(): Promise<RecruiterStats> {
    const response = await api.get("/stats/me");
    return response.data;
  },

  async getRecentApplications(limit: number = 5) {
    const response = await api.get("/applications/recruiter");
    // Sort by createdAt descending and take top N
    const apps = response.data.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return apps.slice(0, limit);
  }
};
