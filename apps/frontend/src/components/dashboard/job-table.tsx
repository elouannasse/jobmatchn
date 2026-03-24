"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, Building2, Calendar, Edit2, Trash2, MoreVertical } from "lucide-react";

interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  createdAt: string;
}

interface JobTableProps {
  jobs: JobOffer[];
  onEdit: (job: JobOffer) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const statusThemes: Record<string, string> = {
  ACTIVE: "text-green-400 bg-green-400/10 border-green-400/20",
  INACTIVE: "text-red-400 bg-red-400/10 border-red-400/20",
  CLOSED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  CLOSED: "Clôturée",
};

const typeThemes: Record<string, string> = {
  CDI: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  CDD: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  STAGE: "bg-teal-400/10 text-teal-400 border-teal-400/20",
  FREELANCE: "bg-orange-400/10 text-orange-400 border-orange-400/20",
};

export function JobTable({ jobs, onEdit, onDelete, loading }: JobTableProps) {
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
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Offre</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entreprise</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Détails</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut</th>
              <th className="px-8 py-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {jobs.map((job) => (
              <motion.tr 
                key={job.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-white/[0.02] transition-all group"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">{job.title}</h4>
                      <p className="text-xs text-muted-foreground">Créée le {new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    {job.company}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${typeThemes[job.type] || "bg-white/5 text-white/60 border-white/10"}`}>
                        {job.type}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusThemes[job.status] || "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                    {statusLabels[job.status] || job.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onEdit(job)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-blue-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(job.id)}
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
