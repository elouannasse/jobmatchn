export interface Candidate {
  id: string; // Profile ID
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  summary?: string;
  location?: string;
  skills: string[];
  cvUrl?: string;
  status: string;
  createdAt?: string;
}
