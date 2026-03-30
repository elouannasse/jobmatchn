"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token de réinitialisation manquant. Veuillez utiliser le lien reçu par email.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/auth/reset-password", { token, newPassword });
      toast.success("Mot de passe modifié avec succès ! ✅");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: any) {
      const message = error.response?.data?.message || "Une erreur est survenue";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white">Lien Invalide</h1>
        <p className="text-muted-foreground">{error}</p>
        <button 
          onClick={() => router.push("/auth/login")}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm font-bold"
        >
          Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <div className="inline-flex p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
          Nouveau Mot de Passe
        </h1>
        <p className="text-sm text-muted-foreground">
          Créez un mot de passe sécurisé pour votre compte.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Nouveau mot de passe</label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-14 pr-12 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm transition-all"
              placeholder="Min. 8 caractères"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Confirmer le mot de passe</label>
          <div className="relative group">
            <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm transition-all"
              placeholder="Répétez le mot de passe"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_40px_rgba(var(--primary-rgb),0.2)] flex items-center justify-center gap-3"
          >
            {isLoading ? "Réinitialisation..." : "Réinitialiser"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] px-4 py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[100px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass p-10 rounded-[40px] border border-white/5 relative bg-white/[0.01]">
          <Suspense fallback={
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-loose">
               JobMatchn Security System <br />
               <span className="opacity-40">Protections SSL de niveau bancaire</span>
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
