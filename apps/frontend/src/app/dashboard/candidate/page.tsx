"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Clock,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Building2,
  Eye,
  XCircle,
  Sparkles,
  TrendingUp,
  Briefcase,
  User,
  History,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/services/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CandidateStats {
  totalApplications: number;
  statusDistribution: { status: string; count: number }[];
  recentApplications: {
    id: string;
    status: string;
    createdAt: string;
    score: number;
    jobOffer: {
      title: string;
      location: string;
      company: { name: string; logoUrl?: string };
    };
  }[];
}

interface ProfileData {
  firstName: string;
  lastName: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  PENDING:   { label: "En attente",  color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/20",  icon: Clock },
  REVIEWED:  { label: "Consulté",    color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    icon: Eye },
  INTERVIEW: { label: "Entretien",   color: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/20",  icon: MessageSquare },
  ACCEPTED:  { label: "Accepté",     color: "text-green-400",   bg: "bg-green-400/10",   border: "border-green-400/20",   icon: CheckCircle2 },
  REJECTED:  { label: "Refusé",      color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20",     icon: XCircle },
};

const QUICK_LINKS = [
  { href: "/dashboard/candidat/offres",        label: "Explorer les offres",  icon: Briefcase,   desc: "Trouvez votre prochain poste" },
  { href: "/dashboard/candidat/candidatures",  label: "Mes candidatures",     icon: History,     desc: "Suivez vos postulations" },
  { href: "/dashboard/candidat/profil",        label: "Mon profil",           icon: User,        desc: "Gérez vos informations" },
];

function getStatusCount(distribution: { status: string; count: number }[], status: string) {
  return distribution.find((d) => d.status === status)?.count ?? 0;
}

export default function CandidateDashboardPage() {
  const [stats, setStats] = useState<CandidateStats | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, profileRes] = await Promise.all([
          api.get("/stats/me/candidate"),
          api.get("/profile"),
        ]);
        setStats(statsRes.data);
        setProfile(profileRes.data);
      } catch {
        // silently fail — page still renders
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const totalApps    = stats?.totalApplications ?? 0;
  const distribution = stats?.statusDistribution ?? [];
  const recent       = stats?.recentApplications ?? [];

  const statCards = [
    {
      label:  "Candidatures envoyées",
      value:  totalApps,
      icon:   Send,
      color:  "text-primary",
      bg:     "bg-primary/10",
      border: "border-primary/20",
      glow:   "shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]",
    },
    {
      label:  "En attente",
      value:  getStatusCount(distribution, "PENDING"),
      icon:   Clock,
      color:  "text-yellow-400",
      bg:     "bg-yellow-400/10",
      border: "border-yellow-400/20",
      glow:   "shadow-[0_0_30px_rgba(234,179,8,0.08)]",
    },
    {
      label:  "Entretiens planifiés",
      value:  getStatusCount(distribution, "INTERVIEW"),
      icon:   MessageSquare,
      color:  "text-purple-400",
      bg:     "bg-purple-400/10",
      border: "border-purple-400/20",
      glow:   "shadow-[0_0_30px_rgba(168,85,247,0.08)]",
    },
    {
      label:  "Acceptées",
      value:  getStatusCount(distribution, "ACCEPTED"),
      icon:   CheckCircle2,
      color:  "text-green-400",
      bg:     "bg-green-400/10",
      border: "border-green-400/20",
      glow:   "shadow-[0_0_30px_rgba(34,197,94,0.08)]",
    },
  ];

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-primary/70">Tableau de bord</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            Bonjour,{" "}
            <span className="text-gradient">
              {profile?.firstName ?? "Candidat"}&nbsp;!
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 font-medium text-lg">
            Voici un résumé de votre activité sur JobMatchN.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 px-6 py-4 rounded-[20px] bg-white/[0.03] border border-white/10"
        >
          <TrendingUp className="w-5 h-5 text-primary" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Taux de réponse</p>
            <p className="text-2xl font-black text-white">
              {totalApps > 0
                ? `${Math.round(((totalApps - getStatusCount(distribution, "PENDING")) / totalApps) * 100)}%`
                : "—"}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`glass p-8 rounded-[32px] border ${card.border} ${card.glow}`}
            >
              <div className={`w-14 h-14 rounded-2xl ${card.bg} border ${card.border} flex items-center justify-center mb-6`}>
                <Icon className={`w-7 h-7 ${card.color}`} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">{card.label}</p>
              <p className={`text-5xl font-black ${card.color}`}>{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ── Recent Applications ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 glass rounded-[40px] border border-white/5 p-10"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Dernières candidatures</h2>
            </div>
            <Link
              href="/dashboard/candidat/candidatures"
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
            >
              Tout voir <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <Send className="w-10 h-10 text-muted-foreground/20 mb-4" />
              <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">Aucune candidature</p>
              <Link
                href="/dashboard/candidat/offres"
                className="mt-6 px-6 py-3 rounded-[18px] bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Explorer les offres
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recent.map((app, i) => {
                const statusCfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.PENDING;
                const StatusIcon = statusCfg.icon;
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                    className="flex items-center gap-5 p-5 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group"
                  >
                    {/* Company Logo / Placeholder */}
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                      {app.jobOffer.company.logoUrl ? (
                        <img src={app.jobOffer.company.logoUrl} alt={app.jobOffer.company.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Building2 className="w-6 h-6 text-muted-foreground/40" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-white truncate group-hover:text-primary transition-colors">
                        {app.jobOffer.title}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                        {app.jobOffer.company.name} · {format(new Date(app.createdAt), "dd MMM yyyy", { locale: fr })}
                      </p>
                    </div>

                    {/* Score */}
                    {app.score != null && (
                      <div className="hidden sm:flex flex-col items-center shrink-0 w-14">
                        <span className={`text-lg font-black ${app.score >= 70 ? "text-green-400" : app.score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                          {app.score}%
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">match</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{statusCfg.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Quick Links ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground px-2 mb-6">Accès rapide</h2>
          {QUICK_LINKS.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-5 p-7 rounded-[28px] glass border border-white/5 hover:border-primary/30 hover:bg-white/[0.03] transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-white group-hover:text-primary transition-colors">{link.label}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{link.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            );
          })}

          {/* Profile completion tip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mt-6 p-7 rounded-[28px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/10"
          >
            <Sparkles className="w-6 h-6 text-primary mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-white mb-2">Conseil du jour</p>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Un profil complet avec skills et résumé multiplie par <span className="text-primary font-black">3.5×</span> vos chances d'être contacté&nbsp;!
            </p>
            <Link
              href="/dashboard/candidat/profil"
              className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
            >
              Compléter mon profil <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
