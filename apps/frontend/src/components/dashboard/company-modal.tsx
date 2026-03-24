"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Building2, MapPin, Mail, Phone, Globe, FileText, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

interface Company {
  id: string;
  name: string;
  sector: string;
  location: string;
  website: string;
  description: string;
  logoUrl?: string;
}

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: Company) => void;
  company: Company | null;
}

export function CompanyModal({ isOpen, onClose, onSave, company }: CompanyModalProps) {
  const [formData, setFormData] = useState<Company>({
    id: "",
    name: "",
    sector: "",
    location: "",
    website: "",
    description: "",
    logoUrl: "",
  });

  useEffect(() => {
    if (company) {
      setFormData(company);
    } else {
      setFormData({
        id: "",
        name: "",
        sector: "",
        location: "",
        website: "",
        description: "",
        logoUrl: "",
      });
    }
  }, [company]);

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
                  {formData.id ? "Modifier l'entreprise" : "Nouvelle Entreprise"}
                </h2>
                <p className="text-muted-foreground text-sm">Complétez les informations de l'entreprise.</p>
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Nom de l'entreprise</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder="ex: Google"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Secteur d'activité</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder="ex: Technologie, Finance..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">URL du Logo (Image)</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder="https://.../logo.png"
                    />
                  </div>
                </div>

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
                      placeholder="ex: Paris, France"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Site Web</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>


              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all resize-none"
                  placeholder="Présentation de l'entreprise..."
                />
              </div>


              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-5 rounded-[24px] bg-primary text-primary-foreground font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(var(--primary-rgb),0.3)]"
                >
                  <Save className="w-5 h-5" />
                  {formData.id ? "Enregistrer les modifications" : "Ajouter l'entreprise"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
