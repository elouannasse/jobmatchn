import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(2, "Le prénom est trop court"),
  lastName: z.string().min(2, "Le nom est trop court"),
  role: z.enum(["CANDIDATE", "RECRUITER"]),
  company: z.object({
    name: z.string().min(2, "Le nom de l'entreprise est trop court").optional(),
    industry: z.string().min(2, "Le secteur d'activité est requis").optional(),
    location: z.string().min(2, "La localisation est requise").optional(),
    website: z.string().url("URL invalide").optional().or(z.literal("")),
    description: z.string().optional(),
  }).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;
