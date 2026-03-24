"use client";

import { motion } from "framer-motion";
import { User, Mail, Building2, Phone, Shield, Edit2, Trash2, MoreVertical } from "lucide-react";

interface Recruiter {
  id: string;
  name: string;
  email: string;
  company: string;
  companyId?: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
}

interface RecruiterTableProps {
  recruiters: Recruiter[];
  onEdit: (recruiter: Recruiter) => void;
  onDelete: (id: string) => void;
  onAssignCompany: (recruiter: Recruiter) => void;
  loading?: boolean;
}

const statusThemes: Record<string, string> = {
  ACTIVE: "text-green-400 bg-green-400/10 border-green-400/20",
  INACTIVE: "text-red-400 bg-red-400/10 border-red-400/20",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
};

export function RecruiterManagementTable({ recruiters, onEdit, onDelete, onAssignCompany, loading }: RecruiterTableProps) {
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
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recruteur</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entreprise</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rôle / Statut</th>
              <th className="px-8 py-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recruiters.map((recruiter) => (
              <motion.tr 
                key={recruiter.id}
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
                      <h4 className="font-bold text-sm">{recruiter.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {recruiter.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    {recruiter.company}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Phone className="w-3 h-3 text-primary" />
                    {recruiter.phone}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground">
                      <Shield className="w-3 h-3 text-purple-400" />
                      {recruiter.role}
                    </div>
                    <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusThemes[recruiter.status] || "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                      {statusLabels[recruiter.status] || recruiter.status}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onAssignCompany(recruiter)}
                      className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-all text-primary"
                      title="Assigner une entreprise"
                    >
                      <Building2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onEdit(recruiter)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-blue-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(recruiter.id)}
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
