import api from "./api";

export interface Company {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  createdAt: string;
}

export interface CreateCompanyDto {
  name: string;
  industry?: string;
  location?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
}

export const companyService = {
  async getAll(): Promise<Company[]> {
    const res = await api.get("/companies");
    return Array.isArray(res.data) ? res.data : [];
  },

  async getOne(id: string): Promise<Company> {
    const res = await api.get(`/companies/${id}`);
    return res.data;
  },

  async create(dto: CreateCompanyDto): Promise<Company> {
    const res = await api.post("/companies", dto);
    return res.data;
  },

  async update(id: string, dto: Partial<CreateCompanyDto>): Promise<Company> {
    const res = await api.patch(`/companies/${id}`, dto);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/companies/${id}`);
  }
};
