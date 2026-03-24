"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User, Briefcase, Building2, Calendar, Shield } from "lucide-react";
import { useState, useEffect } from "react";

interface Application {
  id: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  applyDate: string;
  status: string;
}

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: Application) => void;
  application: Application | null;
}

const STATUSES = ["PENDING", "INTERVIEW", "ACCEPTED", "REJECTED"];

export function ApplicationModal({ isOpen, onClose, onSave, application }: ApplicationModalProps) {
  const [formData, setFormData] = useState<Application>({
    id: "",
    candidateName: "",
    jobTitle: "",
    company: "",
    applyDate: new Date().toISOString().split('T')[0],
    status: "PENDING",
  });

  useEffect(() => {
    if (application) {
      setFormData(application);
    } else {
      setFormData({
        id: "",
        candidateName: "",
        jobTitle: "",
        company: "",
        applyDate: new Date().toISOString().split('T')[0],
        status: "PENDING",
      });
    }
  }, [application]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass rounded-[40px] border border-white/10 p-10 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gradient uppercase tracking-tight">
                  {formData.id ? "Modifier Candidature" : "Nouvelle Candidature"}
                </h2>
                <p className="text-muted-foreground text-sm">Gérez les détails de la candidature.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Candidat</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={formData.candidateName}
                    onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                    placeholder="Nom du candidat"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Poste</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder="ex: Fullstack Dev"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Entreprise</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder="Nom de l'entreprise"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Date de candidature</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    required
                    value={formData.applyDate.split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, applyDate: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Statut</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm appearance-none cursor-pointer transition-all"
                  >
                    <option value="PENDING" className="bg-[#0A0A0B]">En Attente</option>
                    <option value="INTERVIEW" className="bg-[#0A0A0B]">Entretien</option>
                    <option value="ACCEPTED" className="bg-[#0A0A0B]">Acceptée</option>
                    <option value="REJECTED" className="bg-[#0A0A0B]">Refusée</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-5 rounded-[24px] bg-primary text-primary-foreground font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(var(--primary-rgb),0.3)]"
                >
                  <Save className="w-5 h-5" />
                  {formData.id ? "Enregistrer les modifications" : "Créer Candidature"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
