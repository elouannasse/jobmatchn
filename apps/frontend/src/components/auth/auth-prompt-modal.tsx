"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, Briefcase, Sparkles } from "lucide-react";
import Link from "next/link";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  redirectPath?: string;
}

export function AuthPromptModal({ 
  isOpen, 
  onClose, 
  title = "Rejoignez JobMatchn pour postuler",
  message = "Connectez-vous ou créez un compte pour postuler à cette offre",
  redirectPath = "/jobs"
}: AuthPromptModalProps) {
  
  const handleRedirect = () => {
    localStorage.setItem("redirectAfterLogin", redirectPath);
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="flex justify-between items-start mb-8">
              <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-muted-foreground hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-10">
              <h2 className="text-3xl font-black text-gradient uppercase tracking-tight">
                {title}
              </h2>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                {message}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href={`/auth/login?redirect=${redirectPath}`}
                onClick={handleRedirect}
                className="flex items-center justify-center gap-2 py-5 rounded-[24px] bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_32px_rgba(var(--primary-rgb),0.3)]"
              >
                <LogIn className="w-4 h-4" /> Se connecter
              </Link>
              <Link
                href={`/auth/register?redirect=${redirectPath}`}
                onClick={handleRedirect}
                className="flex items-center justify-center gap-2 py-5 rounded-[24px] bg-white/5 border border-white/10 font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 active:scale-[0.98] transition-all"
              >
                <UserPlus className="w-4 h-4" /> Créer un compte
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-3 text-muted-foreground">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-primary/20 flex items-center justify-center text-[10px] font-bold overflow-hidden ring-1 ring-white/5">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                    </div>
                  ))}
               </div>
               <p className="text-xs font-medium italic flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent" />
                  Rejoignez 2,000+ candidats déjà actifs
               </p>
            </div>

            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
