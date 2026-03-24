"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Briefcase, Building2, MapPin, Tag, FileText, Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  skills: string[];
  status: string;
}

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobOffer) => void;
  job: JobOffer | null;
}

const CONTRACT_TYPES = ["CDI", "CDD", "STAGE", "FREELANCE", "PART_TIME"];

export function JobModal({ isOpen, onClose, onSave, job }: JobModalProps) {
  const [formData, setFormData] = useState<JobOffer>({
    id: "",
    title: "",
    company: "",
    location: "",
    type: "CDI",
    description: "",
    skills: [],
    status: "ACTIVE",
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (job) {
      setFormData(job);
    } else {
      setFormData({
        id: "",
        title: "",
        company: "",
        location: "",
        type: "CDI",
        description: "",
        skills: [],
        status: "ACTIVE",
      });
    }
  }, [job]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({ ...formData, skills: [...formData.skills, trimmed] });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

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
            className="relative w-full max-w-2xl glass rounded-[40px] border border-white/10 p-10 overflow-y-auto max-h-[90vh] hidden-scrollbar"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gradient uppercase tracking-tight">
                  {formData.id ? "Modifier l'offre" : "Nouvelle Offre"}
                </h2>
                <p className="text-muted-foreground text-sm">Complétez les détails de l'offre d'emploi.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Titre du poste</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder="ex: Senior React Developer"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Localisation</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder="Ville, Pays ou Remote"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Type de contrat</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm appearance-none cursor-pointer transition-all"
                    >
                      {CONTRACT_TYPES.map(t => <option key={t} value={t} className="bg-[#0A0A0B]">{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Description</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all resize-none"
                    placeholder="Détails de l'offre..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Compétences Requises</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    className="flex-1 px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                    placeholder="ex: React, Node.js..."
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="p-4 rounded-[20px] bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map(skill => (
                    <span 
                      key={skill}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs font-bold"
                    >
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)}>
                        <X className="w-3 h-3 hover:text-white transition-colors" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm appearance-none cursor-pointer transition-all"
                >
                  <option value="ACTIVE" className="bg-[#0A0A0B]">Active</option>
                  <option value="INACTIVE" className="bg-[#0A0A0B]">Inactive</option>
                  <option value="CLOSED" className="bg-[#0A0A0B]">Clôturée</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-5 rounded-[24px] bg-primary text-primary-foreground font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(var(--primary-rgb),0.3)]"
                >
                  <Save className="w-5 h-5" />
                  {formData.id ? "Enregistrer les modifications" : "Publier l'offre"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
