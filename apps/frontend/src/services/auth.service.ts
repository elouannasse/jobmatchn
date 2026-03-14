import axios from "axios";
import { RegisterInput, LoginInput } from "../lib/validations/auth.schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
