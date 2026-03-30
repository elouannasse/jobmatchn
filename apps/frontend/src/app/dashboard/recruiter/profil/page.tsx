"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Save, 
  Loader2, 
  Lock, 
  BadgeCheck,
  Building,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/services/api";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  recruiterProfile?: {
    company?: {
      name: string;
      logoUrl?: string;
    }
  };
}

export default function RecruiterProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  
  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/profile");
      const data = res.data;
      setProfile(data);
      
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setEmail(data.email || "");
    } catch (error) {
      toast.error("Erreur lors de la récupération du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put("/profile", {
        firstName,
        lastName,
        email
      });
      toast.success("Informations personnelles mises à jour ! ✨");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    
    toast.info("Le changement de mot de passe sera disponible prochainement");
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="relative group">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-[40px] bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.1)] group-hover:scale-105 transition-all duration-500">
             <User className="w-16 h-16 text-blue-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center border-4 border-[#0A0A0B] text-white">
            <BadgeCheck className="w-5 h-5" />
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            {firstName} <span className="text-blue-500">{lastName}</span>
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
            <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
              Recruteur Vérifié
            </span>
            {profile?.recruiterProfile?.company && (
              <span className="px-3 py-1 rounded-lg bg-white/5 text-muted-foreground border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Building className="w-3 h-3" /> {profile.recruiterProfile.company.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info Form */}
          <div className="glass p-10 rounded-[40px] border border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Paramètres du Compte</h2>
                <p className="text-xs font-bold text-white mt-0.5">Informations Personnelles</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Prénom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none font-bold text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Adresse Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-10 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Soumettre
                </button>
              </div>
            </form>
          </div>

          {/* Password Change Section */}
          <div className="glass p-10 rounded-[40px] border border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sécurité</h2>
                <p className="text-xs font-bold text-white mt-0.5">Changer le mot de passe</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-amber-500/50 outline-none font-bold text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-amber-500/50 outline-none font-bold text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-amber-500/50 outline-none font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full md:w-auto px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                >
                  Mettre à jour le mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-8">
           <div className="glass p-8 rounded-[40px] border border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Statut Recruteur</h2>
              </div>
              <p className="text-sm font-bold text-white mb-2">Compte Entreprise Actif</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Votre profil de recruteur est rattaché à une entreprise vérifiée. Vous pouvez publier des offres et gérer les candidatures.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
