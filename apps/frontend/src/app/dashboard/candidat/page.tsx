"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight,
  Loader2,
  Sparkles,
  Building2,
  MapPin,
  Calendar,
  MessageSquare,
  Eye,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/services/api";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Stats {
  totalApplications: number;
  statusDistribution: { status: string; count: number }[];
  recentApplications: {
    id: string;
    status: string;
    createdAt: string;
    score?: number;
    jobOffer: {
      title: string;
      location: string;
      company: { name: string; logoUrl?: string };
    };
  }[];
}

interface JobMatch {
  id: string;
  title: string;
  location: string;
  matchScore: number;
  company: { name: string; logoUrl?: string };
  salaryMin?: number;
  salaryMax?: number;
  contractType: string;
}

interface Profile {
  firstName: string;
  lastName: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  PENDING:   { label: "En attente",  color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: Clock },
  REVIEWED:  { label: "Consulté",   color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   icon: Eye },
  INTERVIEW: { label: "Entretien",  color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", icon: MessageSquare },
  ACCEPTED:  { label: "Accepté",    color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  icon: CheckCircle2 },
  REJECTED:  { label: "Refusé",     color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20",    icon: XCircle },
};

function getStatusCount(distribution: { status: string; count: number }[], status: string) {
  return distribution.find((d) => d.status === status)?.count ?? 0;
}

export default function CandidatDashboard() {
  const [stats, setStats]           = useState<Stats | null>(null);
  const [bestMatches, setBestMatches] = useState<JobMatch[]>([]);
  const [profile, setProfile]       = useState<Profile | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Run in parallel — each call is silently caught so one failure doesn't break the whole page
      const [statsResult, jobsResult, profileResult] = await Promise.allSettled([
        api.get("/stats/me/candidate"),
        api.get("/jobs"),
        api.get("/profile"),
      ]);

      if (statsResult.status === "fulfilled") {
        console.log("[Dashboard] Stats:", statsResult.value.data);
        setStats(statsResult.value.data);
      } else {
        console.error("[Dashboard] Stats error:", statsResult.reason?.response?.data ?? statsResult.reason);
      }

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value.data);
      } else {
        console.error("[Dashboard] Profile error:", profileResult.reason?.response?.data ?? profileResult.reason);
      }

      if (jobsResult.status === "fulfilled") {
        const jobs = jobsResult.value.data as JobMatch[];
        const sorted = jobs
          .filter((j) => j.matchScore !== undefined && j.matchScore > 0)
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, 3);
        console.log("[Dashboard] Top matches:", sorted);
        setBestMatches(sorted);
      } else {
        console.error("[Dashboard] Jobs error:", jobsResult.reason?.response?.data ?? jobsResult.reason);
      }

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const distribution   = stats?.statusDistribution ?? [];
  const recentApps     = stats?.recentApplications ?? [];
  const totalApps      = stats?.totalApplications ?? 0;

  const statCards = [
    { label: "Candidatures envoyées",  value: totalApps,                                    icon: Send,        color: "text-primary",    bg: "bg-primary/10",    border: "border-primary/20" },
    { label: "En attente",             value: getStatusCount(distribution, "PENDING"),       icon: Clock,       color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
    { label: "Entretiens planifiés",   value: getStatusCount(distribution, "INTERVIEW"),     icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
    { label: "Acceptées",              value: getStatusCount(distribution, "ACCEPTED"),      icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10",  border: "border-green-400/20" },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">Tableau de bord</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
          Bonjour,{" "}
          <span className="text-gradient">{profile?.firstName ?? "Candidat"}&nbsp;!</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md font-medium">
          Suivez vos candidatures et découvrez les meilleures opportunités pour vous.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass p-8 rounded-[32px] border ${stat.border} relative overflow-hidden group hover:bg-white/[0.03] transition-all`}
          >
            <div className={`w-13 h-13 w-12 h-12 rounded-2xl ${stat.bg} border ${stat.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
              {stat.label}
            </p>
            <h3 className={`text-4xl font-black ${stat.color}`}>{stat.value}</h3>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl opacity-50`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Best Matches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Top Matchings</h2>
            </div>
            <Link href="/dashboard/candidat/offres" className="flex items-center gap-1 text-xs font-bold text-primary hover:text-white transition-colors group">
              Voir tout <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {bestMatches.length > 0 ? (
              bestMatches.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="glass p-6 rounded-[32px] border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 shrink-0">
                        {job.company.logoUrl ? (
                          <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{job.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {job.company.name}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`px-4 py-2 rounded-2xl font-black text-sm mb-1 ${
                        job.matchScore >= 70 ? "bg-green-400/10 border border-green-400/20 text-green-400" :
                        job.matchScore >= 40 ? "bg-yellow-400/10 border border-yellow-400/20 text-yellow-400" :
                        "bg-primary/10 border border-primary/20 text-primary"
                      }`}>
                        {job.matchScore}% Match
                      </div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{job.contractType}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              ))
            ) : (
              <div className="glass p-10 rounded-[32px] text-center border border-dashed border-white/10">
                <Building2 className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  Complétez votre profil pour voir les meilleures opportunités.
                </p>
                <Link
                  href="/dashboard/candidat/profil"
                  className="mt-5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                >
                  Compléter mon profil <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Activité récente</h2>
            </div>
            <Link href="/dashboard/candidat/candidatures" className="text-xs font-bold text-primary hover:text-white transition-colors">
              Tout voir
            </Link>
          </div>

          <div className="glass rounded-[32px] border border-white/5 p-6 space-y-5">
            {recentApps.length > 0 ? (
              recentApps.map((app, i) => {
                const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG["PENDING"];
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.07 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">{app.jobOffer.title}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
                        {app.jobOffer.company.name} · {format(new Date(app.createdAt), "dd MMM", { locale: fr })}
                      </p>
                      <span className={`mt-1.5 inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {app.score != null && (
                      <span className={`text-sm font-black shrink-0 ${app.score >= 70 ? "text-green-400" : app.score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                        {app.score}%
                      </span>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <Send className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium italic">Aucune candidature récente.</p>
                <Link
                  href="/dashboard/candidat/offres"
                  className="mt-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                >
                  Explorer les offres <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3 pt-2">
            {[
              { href: "/dashboard/candidat/offres",       label: "Explorer les offres", icon: Briefcase },
              { href: "/dashboard/candidat/candidatures", label: "Mes candidatures",    icon: Calendar },
              { href: "/dashboard/candidat/profil",       label: "Mon profil",          icon: Sparkles },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 p-5 rounded-[22px] bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <link.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors flex-1">
                  {link.label}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
