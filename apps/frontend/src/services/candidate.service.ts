import api from "./api";

export interface Candidate {
  id: string;
  userId: string;
  title?: string;
  summary?: string;
  location?: string;
  skills: string[];
  linkedinUrl?: string;
  cvUrl?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateCandidateDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  title?: string;
  summary?: string;
  location?: string;
  skills?: string[];
  linkedinUrl?: string;
  cvUrl?: string;
}

export const candidateService = {
  async getAll(): Promise<Candidate[]> {
    const res = await api.get("/candidates");
    return Array.isArray(res.data) ? res.data : [];
  },

  async getById(id: string): Promise<Candidate> {
    const res = await api.get(`/candidates/${id}`);
    return res.data;
  },

  async create(dto: CreateCandidateDto): Promise<Candidate> {
    const res = await api.post("/candidates", dto);
    return res.data;
  },

  async update(id: string, dto: Partial<CreateCandidateDto>): Promise<Candidate> {
    const res = await api.put(`/candidates/${id}`, dto);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/candidates/${id}`);
  },
};
