"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CandidateOnboarding } from "@/components/profile/candidate-onboarding";
import { RecruiterOnboarding } from "@/components/profile/recruiter-onboarding";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            Bienvenue, {user.email.split('@')[0]} !
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Complétez votre profil pour commencer à utiliser JobMatchn.
          </motion.p>
        </header>

        {user.role === "CANDIDATE" ? (
          <CandidateOnboarding />
        ) : (
          <RecruiterOnboarding />
        )}
      </div>
    </div>
  );
}
