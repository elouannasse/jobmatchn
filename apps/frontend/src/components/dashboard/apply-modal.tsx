"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageSquare, Briefcase, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/services/api";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  } | null;
  onSuccess: () => void;
}

export function ApplyModal({ isOpen, onClose, job, onSuccess }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    try {
      setSubmitting(true);
      await api.post("/applications", {
        jobOfferId: job.id,
        coverLetter: coverLetter.trim() || undefined,
      });
      toast.success("Votre candidature a été envoyée ! 🚀");
      onSuccess();
      onClose();
      setCoverLetter(""); // Reset
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi de la candidature");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && job && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass rounded-[40px] border border-white/10 p-10 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gradient uppercase tracking-tight flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-primary" /> Postuler
                </h2>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-bold">{job.company.name} — {job.title}</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-muted-foreground hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> Lettre de motivation (Optionnel)
                  </label>
                  <span className="text-[10px] text-muted-foreground/50">{coverLetter.length}/500</span>
                </div>
                <textarea
                  rows={6}
                  maxLength={500}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full px-6 py-5 rounded-[24px] bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium text-sm transition-all resize-none placeholder:text-muted-foreground/30"
                  placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
                />
              </div>

              <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/10 mb-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-2">💡 Conseil</h4>
                <p className="text-xs text-muted-foreground leading-relaxed leading-relaxed leading-relaxed font-medium"> Les recruteurs apprécient les lettres personnalisées. N'hésitez pas à mentionner vos compétences clés correspondant à l'offre.</p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-5 rounded-[24px] bg-white/5 border border-white/10 font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-5 rounded-[24px] bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(var(--primary-rgb),0.3)] disabled:opacity-50 disabled:grayscale"
                >
                  {submitting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {submitting ? "Envoi..." : "Envoyer ma candidature"}
                </button>
              </div>
            </form>

            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
