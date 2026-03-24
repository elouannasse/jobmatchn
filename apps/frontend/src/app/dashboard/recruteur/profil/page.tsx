"use client";

import { useEffect, useState } from "react";
import { 
  User, 
  Building2, 
  Mail, 
  MapPin, 
  Globe, 
  Briefcase, 
  Camera, 
  Loader2, 
  CheckCircle2,
  Save,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { profileService, UserProfile } from "@/services/profile.service";
import { toast } from "sonner";

export default function RecruiterProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    description: "",
    industry: "",
    location: "",
    logoUrl: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      
      setPersonalInfo({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      });

      if (data.recruiterProfile?.company) {
        const c = data.recruiterProfile.company;
        setCompanyInfo({
          name: c.name || "",
          description: c.description || "",
          industry: c.industry || "",
          location: c.location || "",
          logoUrl: c.logoUrl || ""
        });
      }
    } catch (error) {
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await profileService.updateProfile({
        ...personalInfo,
        companyName: companyInfo.name,
        companyDescription: companyInfo.description,
        companyIndustry: companyInfo.industry,
        companyLocation: companyInfo.location
      });
      toast.success("Profil mis à jour avec succès");
      fetchProfile();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const updated = await profileService.uploadLogo(file);
      setCompanyInfo(prev => ({ ...prev, logoUrl: updated.recruiterProfile?.company?.logoUrl || "" }));
      toast.success("Logo mis à jour");
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Mon Profil Recruteur</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-primary" />
           Gérez vos informations personnelles et celles de votre entreprise
        </p>
      </div>

      <form onSubmit={handleUpdateProfile} className="max-w-4xl space-y-8">
        {/* Personal Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[40px] border border-white/5"
        >
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <User className="w-6 h-6" />
             </div>
             <h2 className="text-xl font-black uppercase tracking-tight">Informations Personnelles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Prénom</label>
                <input 
                  type="text"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all font-bold"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom</label>
                <input 
                  type="text"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all font-bold"
                />
             </div>
             <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                <div className="relative group">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <input 
                     type="email"
                     value={personalInfo.email}
                     onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary transition-all font-bold"
                   />
                </div>
             </div>
          </div>
        </motion.div>

        {/* Company Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass p-8 rounded-[40px] border border-white/5"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
               </div>
               <h2 className="text-xl font-black uppercase tracking-tight">Mon Entreprise</h2>
            </div>
            
            {/* Logo Upload */}
            <div className="relative group">
               <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/10 overflow-hidden relative group">
                  {companyInfo.logoUrl ? (
                    <img src={companyInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                       <Building2 className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                       <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                     <Camera className="w-6 h-6 text-white" />
                     <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                  </label>
               </div>
               <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Modifier Logo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom de l'Entreprise</label>
                <input 
                  type="text"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all font-bold text-lg"
                  placeholder="ex: Google, JobMatchn..."
                />
             </div>
             
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secteur d'Activité</label>
                <div className="relative">
                   <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <input 
                     type="text"
                     value={companyInfo.industry}
                     onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary transition-all font-bold"
                     placeholder="ex: Technologie, Finance..."
                   />
                </div>
             </div>
             
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Siège Social / Lieu</label>
                <div className="relative">
                   <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <input 
                     type="text"
                     value={companyInfo.location}
                     onChange={(e) => setCompanyInfo({ ...companyInfo, location: e.target.value })}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary transition-all font-bold"
                     placeholder="ex: Paris, Remote..."
                   />
                </div>
             </div>

             <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                <textarea 
                  rows={4}
                  value={companyInfo.description}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all font-bold resize-none"
                  placeholder="Décrivez votre entreprise en quelques lignes..."
                />
             </div>
          </div>
        </motion.div>

        {/* Submit */}
        <div className="flex items-center justify-between p-8 glass rounded-[32px] border border-white/5 mb-20">
           <div className="flex items-center gap-3 text-muted-foreground">
              <Info className="w-5 h-5" />
              <p className="text-[10px] font-black uppercase tracking-widest">Toutes les modifications sont immédiates</p>
           </div>
           <button 
             disabled={submitting}
             className="bg-primary text-white font-black uppercase tracking-widest text-xs px-10 py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
           >
             {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             Enregistrer les modifications
           </button>
        </div>
      </form>
    </div>
  );
}
