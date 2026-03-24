"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User, Mail, Building2, Phone, Key, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

interface Recruiter {
  id: string;
  name: string;
  email: string;
  company: string;
  companyId?: string;
  phone: string;
  password?: string;
  status: string;
}

interface RecruiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recruiter: Recruiter) => void;
  recruiter: Recruiter | null;
  companies: any[];
}

export function RecruiterModal({ isOpen, onClose, onSave, recruiter, companies }: RecruiterModalProps) {
  const [formData, setFormData] = useState<Recruiter>({
    id: "",
    name: "",
    email: "",
    company: "",
    phone: "",
    password: "",
    status: "ACTIVE",
  });
  const [isNewCompany, setIsNewCompany] = useState(false);

  useEffect(() => {
    if (recruiter) {
      setFormData({ ...recruiter, password: "" });
      // Check if recruiter's company is in the list
      const exists = companies.some(c => c.name === recruiter.company);
      setIsNewCompany(!exists && recruiter.company !== "");
    } else {
      setFormData({
        id: "",
        name: "",
        email: "",
        company: "",
        phone: "",
        password: "",
        status: "ACTIVE",
      });
      setIsNewCompany(false);
    }
  }, [recruiter, companies]);

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
                  {formData.id ? "Modifier Recruteur" : "Nouveau Recruteur"}
                </h2>
                <p className="text-muted-foreground text-sm">Gérez les accès du recruteur.</p>
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
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Nom Complet</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                    placeholder="Nom du recruteur"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Email Professionnel</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                    placeholder="recruter@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Entreprise</label>
                <div className="space-y-3">
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <select
                      value={isNewCompany ? "NEW" : (formData.companyId || formData.company)}
                      onChange={(e) => {
                        if (e.target.value === "NEW") {
                          setIsNewCompany(true);
                          setFormData({ ...formData, company: "", companyId: "" });
                        } else {
                          setIsNewCompany(false);
                          const selectedComp = companies.find(c => c.id === e.target.value || c.name === e.target.value);
                          setFormData({ 
                            ...formData, 
                            companyId: selectedComp?.id || "", 
                            company: selectedComp?.name || e.target.value 
                          });
                        }
                      }}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm appearance-none cursor-pointer transition-all"
                    >
                      <option value="" className="bg-[#0A0A0B]">Sélectionner une entreprise</option>
                      {companies.map((c: any) => (
                        <option key={c.id} value={c.id} className="bg-[#0A0A0B]">{c.name}</option>
                      ))}
                      <option value="NEW" className="bg-[#0A0A0B]">➕ Ajouter une nouvelle entreprise</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  
                  {isNewCompany && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="relative"
                    >
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-6 py-4 rounded-[20px] bg-primary/10 border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                        placeholder="Nom de la nouvelle entreprise"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Mot de passe</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      required={!formData.id}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder={formData.id ? "Laisser vide" : "DYABLO2009..."}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-sm transition-all"
                      placeholder="+33..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-5 rounded-[24px] bg-primary text-primary-foreground font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(var(--primary-rgb),0.3)]"
                >
                  <Save className="w-5 h-5" />
                  {formData.id ? "Mettre à jour" : "Ajouter Recruteur"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
