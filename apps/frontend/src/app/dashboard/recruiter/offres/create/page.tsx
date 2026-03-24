"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Briefcase, 
  MapPin, 
  Plus, 
  X, 
  Loader2, 
  ArrowLeft,
  ChevronRight,
  Send,
  Save,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jobService } from "@/services/job.service";
import { companyService } from "@/services/company.service";
import { profileService } from "@/services/profile.service";
import { toast } from "sonner";
import Link from "next/link";

const CONTRACT_TYPES = ["CDI", "CDD", "INTERNSHIP", "FREELANCE", "PART_TIME"];

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    contractType: "CDI",
    salaryMin: 0,
    salaryMax: 0,
    skills: [] as string[],
    companyId: "",
    isPublished: true,
  });

  useEffect(() => {
    const initPage = async () => {
      try {
        setProfileLoading(true);
        const profile = await profileService.getProfile();
        
        if (profile.recruiterProfile?.company) {
          setHasCompany(true);
          setCompanyName(profile.recruiterProfile.company.name);
          setForm(prev => ({ ...prev, companyId: profile.recruiterProfile!.companyId }));
        } else {
          setHasCompany(false);
          toast.error("Vous n'avez pas d'entreprise assignée. Contactez l'administrateur.");
        }
      } catch (error) {
        toast.error("Échec du chargement du profil");
      } finally {
        setProfileLoading(false);
      }
    };
    initPage();
  }, []);

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills.filter(s => s !== skill) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyId) {
      toast.error("Veuillez sélectionner une entreprise");
      return;
    }
    setLoading(true);
    try {
      await jobService.createJob(form);
      toast.success("Offre d'emploi publiée !");
      router.push("/dashboard/recruiter");
    } catch (error) {
      toast.error("Erreur lors de la création de l'offre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-8">
          <Link href="/dashboard/recruiter" className="hover:text-white transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white">Nouvelle Offre</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <Link 
              href="/dashboard/recruiter" 
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Créer une Offre</h1>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Publiez votre prochain talent</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass p-8 rounded-[40px] border border-white/5 space-y-6">
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  <Briefcase className="w-3 h-3" /> Titre de l'Offre
                </label>
                <input 
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ex: Designer Produit Senior"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-bold text-lg placeholder:text-white/10"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Description de l'Offre
                </label>
                <textarea 
                  required
                  rows={10}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Quelles seront les missions principales ? Quel profil recherchez-vous ? (Minimum 50 caractères)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-medium resize-none placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="glass p-8 rounded-[40px] border border-white/5 space-y-8">
               <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black uppercase tracking-widest">Compétences Requises</h3>
                 <span className="text-[10px] font-bold text-muted-foreground px-3 py-1 bg-white/5 rounded-full">
                   {form.skills.length} ajoutée{form.skills.length > 1 ? 's' : ''}
                 </span>
               </div>
               <div className="flex flex-wrap gap-2">
                 <AnimatePresence>
                   {form.skills.map(skill => (
                     <motion.span 
                      key={skill}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-black uppercase tracking-tight"
                     >
                       {skill}
                       <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">
                         <X className="w-3 h-3" />
                       </button>
                     </motion.span>
                   ))}
                 </AnimatePresence>
                 {form.skills.length === 0 && (
                   <p className="text-xs text-muted-foreground italic normal-case">Aucune compétence ajoutée pour le moment.</p>
                 )}
               </div>
               <div className="flex gap-2">
                 <input 
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="ex: React, Node.js, UI/UX..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-bold text-sm"
                 />
                 <button 
                  type="button" 
                  onClick={addSkill}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                 >
                   <Plus className="w-5 h-5" />
                 </button>
               </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-[40px] border border-white/5 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest border-b border-white/5 pb-4 mb-6">Paramètres</h3>
              
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  <MapPin className="w-3 h-3" /> Localisation
                </label>
                <input 
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="ex: Paris, Remote"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-bold text-sm"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Type de Contrat
                </label>
                <select 
                  value={form.contractType}
                  onChange={(e) => setForm({ ...form, contractType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-bold text-sm appearance-none cursor-pointer"
                >
                  {CONTRACT_TYPES.map(type => (
                    <option key={type} value={type} className="bg-[#111]">{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Rémunération (€ / an)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => setForm({ ...form, salaryMin: Number(e.target.value) })}
                    placeholder="Min"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-bold text-sm text-center"
                  />
                  <input 
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => setForm({ ...form, salaryMax: Number(e.target.value) })}
                    placeholder="Max"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-bold text-sm text-center"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Entreprise
                </label>
                <div className="relative">
                  <input 
                    readOnly
                    value={hasCompany ? companyName : "Aucune entreprise assignée"}
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none font-bold text-sm ${!hasCompany ? 'text-red-400 border-red-400/20' : 'text-blue-400 border-blue-400/20'}`}
                  />
                  {hasCompany ? (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  ) : (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  )}
                </div>
                {!hasCompany && !profileLoading && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-2 items-start mt-2">
                    <Info className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-black uppercase tracking-tighter text-red-400 leading-tight">
                      Action requise : Contactez l'administrateur pour lier votre compte à une entreprise.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-8 rounded-[40px] border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest">Publication</span>
                  <span className="text-[10px] text-muted-foreground font-bold italic">Mettre en ligne maintenant</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
                  className={`w-14 h-8 rounded-full transition-all relative ${form.isPublished ? 'bg-blue-600' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: form.isPublished ? 24 : 1 }}
                    className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-lg" 
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                  En publiant cette offre, vous acceptez nos conditions d'utilisation et certifiez la véracité des informations fournies.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  type="submit"
                  disabled={loading || !hasCompany || profileLoading}
                  className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                >
                  {loading || profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {form.isPublished ? "Publier l'Offre" : "Enregistrer Brouillon"}
                </button>
                <button 
                  type="button"
                  onClick={() => router.back()}
                  className="w-full py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
                >
                  <Save className="w-4 h-4 opacity-50" />
                  Annuler
                </button>
                <Link 
                  href="/dashboard/recruiter"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center mt-2 hover:text-white transition-colors"
                >
                  Retour au dashboard
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
