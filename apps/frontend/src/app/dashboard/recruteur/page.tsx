"use client";

import { useEffect, useState } from "react";
import { 
  Briefcase, 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  Loader2,
  Calendar,
  Building2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { recruiterService, RecruiterStats } from "@/services/recruiter.service";
import Link from "next/link";

export default function RecruiterDashboard() {
  const [stats, setStats] = useState<RecruiterStats | null>(null);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, appsData] = await Promise.all([
          recruiterService.getStats(),
          recruiterService.getRecentApplications(5)
        ]);
        setStats(statsData);
        setRecentApps(appsData);
      } catch (error) {
        console.error("Failed to fetch recruiter data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const pendingCount = stats?.statusDistribution.find(s => s.status === 'PENDING')?.count || 0;
  const acceptedCount = stats?.statusDistribution.find(s => s.status === 'ACCEPTED')?.count || 0;
  const acceptanceRate = stats?.totalApplicationsReceived && stats.totalApplicationsReceived > 0 
    ? Math.round((acceptedCount / stats.totalApplicationsReceived) * 100) 
    : 0;

  const statCards = [
    { 
      label: "Offres Actives", 
      value: stats?.myJobs || 0, 
      icon: Briefcase, 
      color: "text-blue-400", 
      bg: "bg-blue-400/10",
      link: "/dashboard/recruteur/offres"
    },
    { 
      label: "Candidatures Reçues", 
      value: stats?.totalApplicationsReceived || 0, 
      icon: Users, 
      color: "text-purple-400", 
      bg: "bg-purple-400/10",
      link: "/dashboard/recruteur/candidatures"
    },
    { 
      label: "À Réviser", 
      value: pendingCount, 
      icon: Clock, 
      color: "text-orange-400", 
      bg: "bg-orange-400/10",
      link: "/dashboard/recruteur/candidatures?status=PENDING"
    },
    { 
      label: "Taux d'Acceptation", 
      value: `${acceptanceRate}%`, 
      icon: CheckCircle, 
      color: "text-green-400", 
      bg: "bg-green-400/10",
      link: "/dashboard/recruteur/candidatures?status=ACCEPTED"
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Tableau de Bord</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Espace Recruteur</span>
          </div>
        </div>
        <div className="flex gap-4">
           <Link href="/dashboard/recruteur/offres/new" className="px-6 py-3 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-primary/20">
             + Publier une Offre
           </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-[32px] border border-white/5 relative group hover:border-white/10 transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{card.label}</p>
            <h3 className="text-3xl font-black tabular-nums tracking-tighter">{card.value}</h3>
            <Link href={card.link} className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass p-8 rounded-[48px] border border-white/5"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              Volume de Candidatures
            </h2>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthlyApplications}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '24px', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)', 
                    backdropFilter: 'blur(10px)' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#3B82F6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#3B82F6', strokeWidth: 0 }} 
                  activeDot={{ r: 8, stroke: 'rgba(59,130,246,0.5)', strokeWidth: 10 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-[48px] border border-white/5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold italic uppercase tracking-tighter">Récentes</h2>
            <Link href="/dashboard/recruteur/candidatures" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Voir tout</Link>
          </div>
          <div className="flex-1 space-y-4">
            {recentApps.length > 0 ? (
              recentApps.map((app) => (
                <div key={app.id} className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center font-black">
                      {app.candidate.user.firstName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{app.candidate.user.firstName} {app.candidate.user.lastName}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-black truncate">{app.jobOffer.title}</p>
                    </div>
                    <div className="text-right">
                       <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${
                         app.status === 'PENDING' ? 'bg-orange-500/10 text-orange-400' :
                         app.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-400' :
                         'bg-white/5 text-muted-foreground'
                       }`}>
                         {app.status}
                       </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1 text-[9px] font-black text-white/20">
                      <Calendar className="w-3 h-3" />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] font-black text-primary group-hover:translate-x-1 transition-transform cursor-pointer">
                      DÉTAILS →
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileText className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Aucune candidature</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
