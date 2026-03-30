"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import api from "@/services/api";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      await api.post("/auth/forgot-password", { email });
      setIsSent(true);
      toast.success("Email envoyé ! Vérifiez votre boîte mail ✨");
    } catch (error: any) {
      const message = error.response?.data?.message || "Une erreur est survenue";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] px-4 py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[100px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass p-10 rounded-[40px] border border-white/5 relative bg-white/[0.01]">
          <Link 
            href="/auth/login" 
            className="absolute top-8 left-8 text-muted-foreground hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>

          <div className="text-center mt-12 mb-10">
            <div className="inline-flex p-4 rounded-[24px] bg-blue-500/10 border border-blue-500/20 mb-6 group hover:scale-110 transition-transform duration-500">
              {isSent ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : (
                <Mail className="w-8 h-8 text-blue-400" />
              )}
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">
              {isSent ? "Email Envoyé" : "Mot de passe oublié"}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">
              {isSent 
                ? "Un lien de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception."
                : "Entrez votre adresse email pour recevoir un lien de réinitialisation sécurisé."
              }
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Adresse Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 rounded-[22px] bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-sm transition-all placeholder:text-muted-foreground/30"
                    placeholder="votre@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_40px_rgba(37,99,235,0.2)] flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer le lien
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center pt-4">
               <Link 
                href="/auth/login"
                className="inline-flex px-10 py-5 rounded-[24px] bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all"
              >
                Retour à la connexion
              </Link>
            </div>
          )}

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
