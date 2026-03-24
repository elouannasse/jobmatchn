import api from "./api";
import { RegisterInput, LoginInput } from "../lib/validations/auth.schema";

export const authService = {
  async register(data: RegisterInput) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async login(data: LoginInput) {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
};
