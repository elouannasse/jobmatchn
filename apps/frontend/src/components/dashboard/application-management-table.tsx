"use client";

import { motion } from "framer-motion";
import { User, Briefcase, Building2, Calendar, Edit2, Trash2, MoreVertical } from "lucide-react";

interface Application {
  id: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  applyDate: string;
  status: string;
}

interface ApplicationTableProps {
  applications: Application[];
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const statusThemes: Record<string, string> = {
  PENDING: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  INTERVIEW: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  ACCEPTED: "text-green-400 bg-green-400/10 border-green-400/20",
  REJECTED: "text-red-400 bg-red-400/10 border-red-400/20",
};

const statusLabels: Record<string, string> = {
  PENDING: "En Attente",
  INTERVIEW: "Entretien",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
};

export function ApplicationManagementTable({ applications, onEdit, onDelete, loading }: ApplicationTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
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
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Candidat / Poste</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entreprise</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut</th>
              <th className="px-8 py-6 text-right"></th>
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
                      <h4 className="font-bold text-sm">{app.candidateName}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {app.jobTitle}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    {app.company}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(app.applyDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusThemes[app.status] || "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                    {statusLabels[app.status] || app.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onEdit(app)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-blue-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(app.id)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
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
