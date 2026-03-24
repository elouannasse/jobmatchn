"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Check, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  industry?: string;
  location?: string;
}

interface AssignCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (companyId: string) => void;
  currentCompanyId?: string;
  recruiterName: string;
}

export function AssignCompanyModal({ isOpen, onClose, onConfirm, currentCompanyId, recruiterName }: AssignCompanyModalProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedId, setSelectedId] = useState<string>(currentCompanyId || "");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      setSelectedId(currentCompanyId || "");
    }
  }, [isOpen, currentCompanyId]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCompanies();
      setCompanies(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des entreprises");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedId) {
      toast.error("Veuillez sélectionner une entreprise");
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(selectedId);
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
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
            className="relative w-full max-w-md glass rounded-[40px] border border-white/10 p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Assigner Entreprise</h3>
                  <p className="text-xs text-muted-foreground font-medium">Pour {recruiterName}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Sélectionner une entreprise</label>
                <div className="relative group">
                  {loading ? (
                    <div className="w-full py-4 flex items-center justify-center bg-white/5 rounded-[20px] border border-white/10">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <select 
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="w-full pl-6 pr-12 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none font-bold text-sm transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#0A0A0B]">Choisir une entreprise...</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id} className="bg-[#0A0A0B]">
                            {company.name} ({company.location || "N/A"})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                    </>
                  )}
                </div>
              </div>

              {selectedId && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Entreprise sélectionnée</p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      Le recruteur sera désormais lié à {companies.find(c => c.id === selectedId)?.name}.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="mt-8 flex gap-3 text-right">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-[20px] bg-white/5 border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedId || submitting}
                className="flex-[2] py-4 rounded-[20px] bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                Confirmer l'assignation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
