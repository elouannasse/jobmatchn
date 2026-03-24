"use client";

import { motion } from "framer-motion";
import { Clock, ShieldAlert, Mail, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("accessToken");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass p-12 rounded-[48px] border border-white/5 text-center"
      >
        <div className="w-20 h-20 rounded-[32px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-8 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>

        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Compte en attente</h1>
        <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
          Votre compte recruteur est en cours de vérification par nos administrateurs. 
          Un email vous sera envoyé dès que votre accès sera validé.
        </p>

        <div className="space-y-4 mb-10">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-normal">
              La vérification prend généralement moins de 24 heures.
            </p>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
            <Mail className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-normal">
              Besoin d&apos;aide ? Contactez-nous à support@jobmatchn.com
            </p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-black uppercase tracking-[0.2em] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </motion.div>
    </div>
  );
}
