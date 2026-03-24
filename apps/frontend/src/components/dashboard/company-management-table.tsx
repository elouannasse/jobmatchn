"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, Mail, Phone, Globe, Edit2, Trash2, MoreVertical } from "lucide-react";

interface Company {
  id: string;
  name: string;
  sector: string;
  location: string;
  website: string;
  description: string;
  logoUrl?: string;
  createdAt: string;
}

interface CompanyTableProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const statusThemes: Record<string, string> = {
  ACTIVE: "text-green-400 bg-green-400/10 border-green-400/20",
  INACTIVE: "text-red-400 bg-red-400/10 border-red-400/20",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export function CompanyManagementTable({ companies, onEdit, onDelete, loading }: CompanyTableProps) {
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
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entreprise / Secteur</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Localisation</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {companies.map((company) => (
              <motion.tr 
                key={company.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-white/[0.02] transition-all group"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{company.name}</h4>
                      <p className="text-xs text-muted-foreground">{company.sector}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <MapPin className="w-4 h-4" />
                    {company.location}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onEdit(company)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-blue-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(company.id)}
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
