"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Linkedin, 
  FileText, 
  Plus, 
  X, 
  Loader2, 
  Save, 
  Upload, 
  Download,
  Trash2,
  CheckCircle2,
  Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  candidateProfile?: {
    id: string;
    title?: string;
    summary?: string;
    location?: string;
    linkedinUrl?: string;
    skills: string[];
    cvUrl?: string;
  };
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/profile");
      const data = res.data;
      setProfile(data);
      
      // Initialize form
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      if (data.candidateProfile) {
        setTitle(data.candidateProfile.title || "");
        setSummary(data.candidateProfile.summary || "");
        setLocation(data.candidateProfile.location || "");
        setLinkedinUrl(data.candidateProfile.linkedinUrl || "");
        setSkills(data.candidateProfile.skills || []);
      }
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
        title,
        summary,
        location,
        linkedinUrl,
        skills
      });
      toast.success("Profil mis à jour avec succès ! ✨");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Veuillez uploader un fichier PDF uniquement.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/profile/cv", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setProfile(res.data);
      toast.success("CV uploadé avec succès ! 📑");
    } catch (error) {
      toast.error("Erreur lors de l'upload du CV");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-12">
      {/* Header Profile Info */}
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)] group-hover:scale-105 transition-all duration-500 overflow-hidden">
             <User className="w-20 h-20 text-primary" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-primary flex items-center justify-center border-4 border-[#0A0A0B] text-primary-foreground group-hover:rotate-12 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            {firstName} <span className="text-gradient">{lastName}</span>
          </h1>
          <p className="text-xl font-bold text-muted-foreground mt-2 flex items-center justify-center md:justify-start gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> {title || "Développeur"}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
            <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground flex items-center gap-2">
              <Mail className="w-3 h-3" /> {profile?.email}
            </span>
            <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground flex items-center gap-2">
              <MapPin className="w-3 h-3" /> {location || "Non renseigné"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Col: Main Info Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-10 rounded-[48px] border border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-10">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Informations Générales</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Prénom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Titre Professionnel</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Lead Developer React"
                  className="w-full px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Résumé / Bio</label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Présentez-vous en quelques lignes..."
                  className="w-full px-6 py-4 rounded-[24px] bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none font-medium text-sm transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Localisation</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Paris, France"
                      className="w-full pl-14 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">LinkedIn Profile</label>
                  <div className="relative">
                    <Linkedin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full pl-14 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-12 py-5 rounded-[22px] bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_15px_40px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Skills & CV */}
        <div className="space-y-10">
          {/* Skills Management */}
          <div className="glass p-10 rounded-[48px] border border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Mes Compétences</h2>
            </div>
            
            <p className="text-xs text-muted-foreground mb-8 font-medium leading-relaxed">
              Ajoutez des tags pour vos compétences techniques et interpersonnelles afin d'augmenter votre score de matching.
            </p>

            <div className="space-y-6">
              <div className="relative group">
                <Plus className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Appuyez sur Entrée..."
                  className="w-full pl-14 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary/50 outline-none font-bold text-sm transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-2.5">
                <AnimatePresence>
                  {skills.map((skill) => (
                    <motion.span
                      key={skill}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group"
                    >
                      {skill}
                      <button 
                        onClick={() => removeSkill(skill)}
                        className="hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* CV Upload */}
          <div className="glass p-10 rounded-[48px] border border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Curriculum Vitae</h2>
            </div>

            {profile?.candidateProfile?.cvUrl ? (
              <div className="space-y-6">
                <div className="p-6 rounded-[32px] bg-white/5 border border-white/10 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                     <FileText className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate">Mon_CV_Actualisé.pdf</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Format PDF</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <a
                    href={profile.candidateProfile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-[20px] flex items-center justify-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <Download className="w-4 h-4" /> Voir
                  </a>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-[2] bg-primary text-primary-foreground py-4 rounded-[20px] flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Modifier
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-white/10 hover:border-primary/50 rounded-[40px] p-10 flex flex-col items-center justify-center text-center gap-4 cursor-pointer transition-all bg-white/[0.01] hover:bg-primary/[0.02]"
              >
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Plus className="w-8 h-8" />}
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-white">Importer votre CV</p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">PDF uniquement • Max 5Mo</p>
                </div>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCvUpload}
              accept=".pdf"
              className="hidden"
            />
          </div>

          <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 flex gap-5">
             <Info className="w-6 h-6 text-primary shrink-0" />
             <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                Un profil complet multiplie par <span className="text-primary font-bold">3.5</span> vos chances d'être contacté par un recruteur. Prenez le temps de soigner votre résumé !
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
