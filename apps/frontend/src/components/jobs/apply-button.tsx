"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Send } from "lucide-react";
import { applicationService } from "@/services/application.service";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { AuthPromptModal } from "@/components/auth/auth-prompt-modal";

interface ApplyButtonProps {
  jobId: string;
  initiallyApplied?: boolean;
}

export function ApplyButton({ jobId, initiallyApplied = false }: ApplyButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(initiallyApplied);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleApply = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (user.role !== "CANDIDATE") {
      return;
    }

    setLoading(true);
    try {
      await applicationService.apply({ jobOfferId: jobId });
      setApplied(true);
      toast.success("Candidature envoyée avec succès !");
    } catch (error: unknown) {
      console.error("Apply error:", error);
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Une erreur est survenue";
      if (typeof message === "string" && message.includes("already")) {
        setApplied(true);
        toast.info("Vous avez déjà postulé à cette offre");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Hide button for Recruiter/Admin
  if (user && user.role !== "CANDIDATE") {
    return null;
  }

  if (applied) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold text-sm"
      >
        <Check className="w-4 h-4" /> Postulé
      </motion.div>
    );
  }

  return (
    <>
      <button
        onClick={handleApply}
        disabled={loading}
        className="relative overflow-hidden group px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" /> Envoi...
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Postuler
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectPath="/jobs"
      />
    </>
  );
}
