"use client";

import { useEffect, useState } from "react";
import { profileService, UserProfile } from "@/services/profile.service";
import { companyService, CreateCompanyDto } from "@/services/company.service";
import { CompanyProfile } from "@/components/company/company-profile";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  AlertCircle, 
  Plus, 
  Building2, 
  Briefcase, 
  MapPin, 
  Globe, 
  FileText,
  Save,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function MyCompanyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateCompanyDto>({
    name: "",
    industry: "",
    location: "",
    website: "",
    description: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      
      if (!data.recruiterProfile?.companyId) {
        setShowCreateForm(true);
      }
    } catch (err: any) {
      toast.error("Erreur lors du chargement de votre profil");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      // 1. Create company
      const newCompany = await companyService.create(formData);
      
      // 2. Link to recruiter profile
      await profileService.updateProfile({ companyId: newCompany.id });
      
      toast.success("Entreprise créée et associée avec succès ! 🚀");
      setShowCreateForm(false);
      fetchData(); // Refresh
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la création de l'entreprise");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-primary" />
        </motion.div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing with workspace...</p>
      </div>
    );
  }

  const company = profile?.recruiterProfile?.company;

  if (showCreateForm || !company) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-10 md:p-14 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
            
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gradient uppercase tracking-tight">Votre Entreprise</h1>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Configurez le profil de votre organisation</p>
              </div>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 flex items-center gap-2">
                    <Building2 className="w-3 h-3" /> Nom de l'entreprise
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-8 py-5 rounded-[28px] bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm transition-all"
                    placeholder="ex: TechNova Global"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> Secteur d'activité
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    className="w-full px-8 py-5 rounded-[28px] bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm transition-all"
                    placeholder="ex: Technologie, Santé..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Localisation
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-8 py-5 rounded-[28px] bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm transition-all"
                    placeholder="Ville, Pays"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 flex items-center gap-2">
                    <Globe className="w-3 h-3" /> Site internet (Optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-8 py-5 rounded-[28px] bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Description de l'entreprise
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={6}
                  className="w-full px-8 py-6 rounded-[32px] bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium text-sm transition-all resize-none"
                  placeholder="Décrivez votre entreprise, sa mission, sa culture..."
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-6 rounded-[32px] bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-[0_12px_40px_rgba(var(--primary-rgb),0.3)] disabled:opacity-50 disabled:grayscale"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {submitting ? "Création en cours..." : "Enregistrer mon entreprise"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  // If company exists, show profile
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between mb-8 px-8">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shadow-lg shadow-green-500/10">
               <CheckCircle2 className="w-4 h-4" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-green-500/70">Profil Entreprise Actif</p>
           </div>
           {/* Maybe add an "Edit" button later */}
        </div>
      </div>
      <CompanyProfile company={company as any} />
    </motion.main>
  );
}
