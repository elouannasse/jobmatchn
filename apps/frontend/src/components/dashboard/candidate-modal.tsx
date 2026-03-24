"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User, Mail, Shield } from "lucide-react";
import { useState, useEffect } from "react";

import { Candidate } from "@/types/candidate";

// Modal specific candidate with password for creation
interface CandidateFormValues extends Candidate {
  password?: string;
}

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (candidate: CandidateFormValues) => void;
  candidate: Candidate | null;
}

export function CandidateModal({ isOpen, onClose, onSave, candidate }: CandidateModalProps) {
  const [formData, setFormData] = useState<CandidateFormValues>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    title: "",
    summary: "",
    location: "",
    skills: [],
    cvUrl: "",
    status: "ACTIVE",
  });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (candidate) {
      setFormData(candidate);
    } else {
      setFormData({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        title: "",
        summary: "",
        location: "",
        skills: [],
        cvUrl: "",
        status: "ACTIVE",
      });
    }
  }, [candidate]);

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
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
            className="relative w-full max-w-lg glass rounded-[40px] border border-white/10 p-10 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gradient uppercase tracking-tight">
                  {candidate ? "Modifier Candidat" : "Ajouter Candidat"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {candidate ? "Mettez à jour les informations du profil." : "Créez un nouveau compte candidat."}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder="Prénom"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Nom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder="Nom"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder="E-mail"
                    />
                  </div>
                </div>
                {!candidate && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Mot de passe</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Titre / Poste</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                    placeholder="ex: Développeur Full Stack"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Localisation</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                    placeholder="ex: Paris, France"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Résumé / Bio</label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all resize-none"
                  placeholder="Résumé du parcours..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Compétences (Skills)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold flex items-center gap-2 group"
                    >
                      {skill}
                      <button 
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className="w-full px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                    placeholder="Ajouter une compétence... (Appuyez sur Entrée)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">URL du CV</label>
                  <input
                    type="text"
                    value={formData.cvUrl}
                    onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
                    className="w-full px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                    placeholder="Lien vers le CV (Drive, Dropbox...)"
                  />
                </div>
                {candidate && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Statut</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm appearance-none cursor-pointer transition-all"
                    >
                      <option value="ACTIVE" className="bg-[#0A0A0B]">Actif</option>
                      <option value="INACTIVE" className="bg-[#0A0A0B]">Inactif</option>
                      <option value="PENDING" className="bg-[#0A0A0B]">En attente</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-5 rounded-[24px] bg-primary text-primary-foreground font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(var(--primary-rgb),0.3)]"
                >
                   <Save className="w-5 h-5" />
                   {candidate ? "Enregistrer les modifications" : "Créer le compte candidat"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
