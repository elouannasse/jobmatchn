"use client";

import { motion } from "framer-motion";
import { User, Mail, Calendar, ArrowUpRight, MoreVertical } from "lucide-react";
import { RecruiterApplication } from "@/services/application.service";

interface ApplicationTableProps {
  applications: RecruiterApplication[];
  onStatusChange: (id: string, status: string) => void;
  loading: boolean;
}

const statusThemes: Record<string, string> = {
  PENDING: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  REVIEWED: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  INTERVIEW: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  ACCEPTED: "text-green-400 bg-green-400/10 border-green-400/20",
  REJECTED: "text-red-400 bg-red-400/10 border-red-400/20",
};

const statusLabels: Record<string, string> = {
  PENDING: "En Attente",
  REVIEWED: "Examiné",
  INTERVIEW: "Entretien",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
};

export function ApplicationTable({ applications, onStatusChange, loading }: ApplicationTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 glass rounded-[20px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="glass rounded-[40px] border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Candidat</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Poste</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Match</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {applications.map((app) => (
              <motion.tr 
                key={app.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-white/[0.02] transition-all group"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">{app.candidate.user.firstName} {app.candidate.user.lastName}</h4>
                      <p className="text-xs text-muted-foreground">{app.candidate.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="font-semibold text-sm">{app.jobOffer.title}</div>
                  <p className="text-xs text-muted-foreground">ID: {app.jobOffer.id.slice(0, 8)}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${app.score || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold">{app.score || 0}%</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <select
                    value={app.status}
                    onChange={(e) => onStatusChange(app.id, e.target.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-all ${statusThemes[app.status]}`}
                  >
                    {Object.keys(statusLabels).map(s => (
                      <option key={s} value={s} className="bg-[#0A0A0B] text-white">{statusLabels[s]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
