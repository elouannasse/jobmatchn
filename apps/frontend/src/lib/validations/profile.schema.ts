import { z } from "zod";

// --- Candidate Profile Schema ---
export const candidateProfileSchema = z.object({
  // Step 1: Basic Info
  title: z.string().min(2, "Le titre est requis (ex: Développeur Fullstack)"),
  summary: z.string().min(10, "Le résumé doit faire au moins 10 caractères"),
  
  // Step 2: Location & Skills
  location: z.string().min(2, "La localisation est requise"),
  skills: z.array(z.string()).min(1, "Ajoutez au moins une compétence"),
  
  // Step 3: Links
  linkedinUrl: z.string().url("URL LinkedIn invalide").optional().or(z.literal("")),
  cvUrl: z.string().optional(),
});

export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;

// --- Recruiter / Company Schema ---
export const recruiterOnboardingSchema = z.object({
  // Step 1: Company Basic Info
  name: z.string().min(2, "Le nom de l'entreprise est requis"),
  industry: z.string().min(2, "Le secteur d'activité est requis"),
  size: z.string().min(1, "La taille de l'entreprise est requise"),
  
  // Step 2: Location & Details
  location: z.string().min(2, "La localisation est requise"),
  website: z.string().url("URL du site web invalide").optional().or(z.literal("")),
  description: z.string().min(20, "La description doit faire au moins 20 caractères"),
});

export type RecruiterOnboardingInput = z.infer<typeof recruiterOnboardingSchema>;
