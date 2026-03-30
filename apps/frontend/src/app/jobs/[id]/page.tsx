"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobService } from "@/services/job.service";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  MapPin, 
  Euro, 
  Clock, 
  Building2, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  Globe,
  Loader2,
  Calendar,
  Send,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { AuthPromptModal } from "@/components/auth/auth-prompt-modal";
import { ApplyModal } from "@/components/dashboard/apply-modal";
import { applicationService } from "@/services/application.service";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  contractType: string;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  matchScore?: number;
  companyId: string;
  company: {
     name: string;
     logoUrl?: string;
     industry?: string;
     website?: string;
     description?: string;
  };
  createdAt: string;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const jobData = await jobService.getJobById(id as string);
      setJob(jobData);

      // Check if already applied (if candidate)
      if (user?.role === "CANDIDATE") {
         const apps = await applicationService.getMyApplications();
         const ids = new Set(apps.map(a => a.jobOfferId));
         setHasApplied(ids.has(id as string));
      }

      // Fetch similar jobs (same company or contract)
      const jobs = await jobService.getJobs({ contractType: jobData.contractType });
      setSimilarJobs(jobs.filter((j: any) => j.id !== id).slice(0, 3));
      
    } catch (error) {
      toast.error("Offre introuvable.");
      router.push("/jobs");
    } finally {
      setLoading(false);
    }
  }, [id, user, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplyClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (user.role !== "CANDIDATE") {
      toast.info("Seuls les candidats peuvent postuler aux offres.");
      return;
    }
    setIsApplyModalOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-400 bg-green-400/10 border-green-400/20";
    if (score >= 40) return "text-orange-400 bg-orange-400/10 border-orange-400/20";
    return "text-red-400 bg-red-400/10 border-red-400/20";
  };

  const formatSalary = (min?: number, max?: number) => {
    const minK = min ? Math.round(min / 1000) : 0;
    const maxK = max ? Math.round(max / 1000) : 0;
    if (minK === 0 && maxK === 0) return "Non précisé";
    if (minK > 0 && maxK > 0) return `${minK}K — ${maxK}K € / an`;
    if (minK > 0) return `À partir de ${minK}K € / an`;
    return `Jusqu'à ${maxK}K € / an`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Loader2 className="w-12 h-12 text-primary" />
        </motion.div>
        <p className="font-black uppercase tracking-widest text-xs opacity-50 underline-offset-4 animate-pulse">Chargement de l'aventure...</p>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20">
      <div className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-accent/5 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-6">
          <button 
            onClick={() => router.push("/jobs")}
            className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-12 font-bold uppercase tracking-widest text-[10px] group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour aux offres
          </button>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
             {/* Main Hero Header */}
             <div className="flex-1 space-y-8">
                <div className="flex items-center gap-6">
                   <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 p-4 flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-105 transition-all">
                      {job.company.logoUrl ? (
                         <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-contain" />
                      ) : (
                         <Building2 className="w-12 h-12 text-primary/40" />
                      )}
                   </div>
                   <div className="space-y-2">
                       <div className="flex items-center gap-3">
                         <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest leading-none">
                            {job.contractType}
                         </span>
                         {job.matchScore !== undefined && (
                            <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest leading-none ${getScoreColor(job.matchScore)}`}>
                               {job.matchScore}% Match
                            </span>
                         )}
                       </div>
                       <h1 className="text-4xl md:text-6xl font-black text-gradient uppercase tracking-tight leading-none truncate max-w-2xl">
                          {job.title}
                       </h1>
                       <div className="flex items-center gap-3 text-white/50 text-sm font-bold">
                          <Building className="w-4 h-4" />
                          {job.company.name} • {job.company.industry}
                       </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <div className="glass p-6 rounded-[32px] border border-white/5 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Localisation</p>
                      <div className="flex items-center gap-2 font-bold text-sm">
                         <MapPin className="w-4 h-4 text-primary" /> {job.location}
                      </div>
                   </div>
                   <div className="glass p-6 rounded-[32px] border border-white/5 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rémunération</p>
                      <div className="flex items-center gap-2 font-bold text-sm text-primary">
                         <Euro className="w-4 h-4 text-primary" /> {formatSalary(job.salaryMin, job.salaryMax)}
                      </div>
                   </div>
                   <div className="glass p-6 rounded-[32px] border border-white/5 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contrat</p>
                      <div className="flex items-center gap-2 font-bold text-sm">
                         <Briefcase className="w-4 h-4 text-accent" /> {job.contractType}
                      </div>
                   </div>
                   <div className="glass p-6 rounded-[32px] border border-white/5 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Publiée</p>
                      <div className="flex items-center gap-2 font-bold text-sm">
                         <Clock className="w-4 h-4 text-muted-foreground" /> {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                   </div>
                </div>
             </div>

             {/* Action Sidebar (Desktop Only) */}
             <div className="w-full lg:w-80">
                <div className="glass p-10 rounded-[48px] border border-white/10 space-y-8 sticky top-32 bg-white/[0.02] shadow-2xl">
                   <div className="text-center space-y-2">
                      <p className="text-xs font-bold text-muted-foreground">Prêt pour l'aventure ?</p>
                      <h3 className="text-xl font-black uppercase tracking-widest">Rejoignez-les</h3>
                   </div>
                   
                   {hasApplied ? (
                      <div className="w-full py-6 rounded-[32px] bg-green-500/10 border border-green-500/20 text-green-500 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3">
                         <CheckCircle2 className="w-5 h-5" /> Candidature envoyée
                      </div>
                   ) : user?.role !== "RECRUITER" && user?.role !== "ADMIN" && (
                      <button
                        onClick={handleApplyClick}
                        className="w-full py-6 rounded-[32px] bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_12px_40px_rgba(var(--primary-rgb),0.3)]"
                      >
                        <Send className="w-4 h-4" /> Postuler Maintenant
                      </button>
                   )}

                   <div className="p-6 rounded-[28px] bg-white/5 border border-white/5 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                         <Sparkles className="w-4 h-4 text-primary" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 italic">AI MATCHING</span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed font-medium">L'IA analyse vos compétences pour estimer votre réussite dans ce poste.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 grid grid-cols-1 lg:grid-cols-3 gap-20">
         <div className="lg:col-span-2 space-y-20">
            {/* Description */}
            <section className="space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_20px_var(--primary)]" />
                  <h2 className="text-3xl font-black uppercase tracking-tight">Mission & Responsabilités</h2>
               </div>
               <div className="prose prose-invert max-w-none">
                  <p className="text-white/70 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                     {job.description}
                  </p>
               </div>
            </section>

            {/* Skills */}
            <section className="space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-accent rounded-full shadow-[0_0_20px_var(--accent)]" />
                  <h2 className="text-3xl font-black uppercase tracking-tight">Compétences attendues</h2>
               </div>
               <div className="flex flex-wrap gap-4">
                  {job.skills.map((skill, index) => (
                     <span 
                       key={index}
                       className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/80 font-bold hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default"
                     >
                       {skill}
                     </span>
                  ))}
               </div>
            </section>
         </div>

         {/* Extra Info: About Company & Similar Jobs */}
         <div className="space-y-16">
            <section className="glass p-10 rounded-[48px] border border-white/5 space-y-8">
               <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">À propos de l&apos;entreprise</h3>
               <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary/60">
                         <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="font-black text-sm">{job.company.name}</p>
                         <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{job.company.industry}</p>
                      </div>
                   </div>
                   <p className="text-xs text-white/50 leading-relaxed font-medium italic">
                      {job.company.description || "Une entreprise innovante à la recherche de nouveaux talents pour rejoindre ses équipes."}
                   </p>
                   {job.company.website && (
                      <a 
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                      >
                         <Globe className="w-3 h-3" /> Visiter le site web
                      </a>
                   )}
               </div>
            </section>

            {similarJobs.length > 0 && (
               <section className="space-y-8">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-6">Offres similaires</h3>
                  <div className="space-y-4">
                     {similarJobs.map(sj => (
                        <div 
                           key={sj.id}
                           onClick={() => {
                             router.push(`/jobs/${sj.id}`);
                             window.scrollTo(0, 0);
                           }}
                           className="glass p-6 rounded-[32px] border border-white/5 hover:border-primary/20 transition-all cursor-pointer group"
                        >
                           <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{sj.title}</h4>
                           <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                              <span>{sj.contractType}</span>
                              <span className="text-primary">{sj.location}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            )}
         </div>
      </div>

      {/* Modals */}
      <AuthPromptModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectPath={`/jobs/${job.id}`}
      />

      <ApplyModal 
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        job={job}
        onSuccess={() => {
           setHasApplied(true);
           fetchData();
        }}
      />
    </div>
  );
}
