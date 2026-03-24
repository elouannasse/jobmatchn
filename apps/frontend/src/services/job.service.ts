import api from "./api";

export interface JobSearchFilters {
  title?: string;
  location?: string;
  contractType?: string;
  salaryMin?: number;
  skills?: string[];
}

export const jobService = {
  async getJobs(filters: JobSearchFilters = {}) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== "" && (Array.isArray(v) ? v.length > 0 : true))
    );

    const response = await api.get("/jobs", { params });
    return Array.isArray(response.data) ? response.data : [];
  },

  async getAllJobsAdmin() {
    const response = await api.get("/jobs/admin");
    return Array.isArray(response.data) ? response.data : [];
  },

  async getRecruiterJobs() {
    const response = await api.get("/jobs/recruiter");
    return Array.isArray(response.data) ? response.data : [];
  },

  async getJobById(id: string) {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  async createJob(data: any) {
    const response = await api.post("/jobs", data);
    return response.data;
  },

  async updateJob(id: string, data: any) {
    const response = await api.patch(`/jobs/${id}`, data);
    return response.data;
  },

  async deleteJob(id: string) {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  }
};
