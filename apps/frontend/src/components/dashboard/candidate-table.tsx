"use client";

import { motion } from "framer-motion";
import { User, Mail, Edit2, Trash2, MoreVertical } from "lucide-react";

import { Candidate } from "@/types/candidate";

interface CandidateTableProps {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const statusThemes: Record<string, string> = {
  ACTIVE: "text-green-400 bg-green-400/10 border-green-400/20",
  INACTIVE: "text-red-400 bg-red-400/10 border-red-400/20",
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  PENDING: "En attente",
};

export function CandidateTable({ candidates, onEdit, onDelete, loading }: CandidateTableProps) {
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
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {candidates.map((candidate) => (
              <motion.tr 
                key={candidate.id}
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
                      <h4 className="font-bold">{candidate.firstName} {candidate.lastName}</h4>
                      <p className="text-xs text-primary font-medium">{candidate.title || "Sans titre"}</p>
                      <p className="text-[10px] text-muted-foreground">ID: {candidate.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {candidate.email}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusThemes[candidate.status] || "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                    {statusLabels[candidate.status] || candidate.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onEdit(candidate)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-blue-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(candidate.id)}
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
