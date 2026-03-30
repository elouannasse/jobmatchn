"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Briefcase, 
  Building2, 
  MapPin, 
  Euro, 
  Clock, 
  CheckCircle2, 
  Building,
  Globe,
  Loader2,
  Sparkles,
  Send
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/services/api";

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

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  onApply: (job: any) => void;
}

export function JobDetailsModal({ isOpen, onClose, jobId, onApply }: JobDetailsModalProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobDetails();
    } else {
      setJob(null);
    }
  }, [isOpen, jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${jobId}`);
      setJob(res.data);
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-400 bg-green-400/10 border-green-400/20";
    if (score >= 40) return "text-orange-400 bg-orange-400/10 border-orange-400/20";
    return "text-red-400 bg-red-400/10 border-red-400/20";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-4xl glass rounded-[48px] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header / Banner */}
            <div className="relative h-40 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-white/5 p-10 flex items-end">
              <div className="absolute top-8 right-8 z-20">
                <button 
                  onClick={onClose}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-6 relative z-10 w-full">
                <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-xl p-4 flex items-center justify-center shadow-xl group-hover:scale-105 transition-all">
                  {job?.company.logoUrl ? (
                    <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-12 h-12 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-1">
                     <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest leading-none">
                       {job?.contractType}
                     </span>
                     {job?.matchScore !== undefined && (
                        <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest leading-none ${getScoreColor(job.matchScore)}`}>
                          {job.matchScore}% Match
                        </span>
                     )}
                   </div>
                   <h1 className="text-3xl md:text-4xl font-black text-gradient uppercase tracking-tight truncate leading-none mb-2">
                     {job?.title}
                   </h1>
                   <div className="flex flex-wrap items-center gap-4 text-white/50 text-sm font-bold">
                     <div className="flex items-center gap-2">
                       <Building className="w-4 h-4" />
                       {job?.company.name}
                     </div>
                     <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4" />
                       {job?.location}
                     </div>
                     {(() => {
                       const minK = job?.salaryMin ? Math.round(job.salaryMin / 1000) : 0;
                       const maxK = job?.salaryMax ? Math.round(job.salaryMax / 1000) : 0;
                       let salaryText = "Non précisé";
                       if (minK > 0 && maxK > 0) salaryText = `${minK}K — ${maxK}K`;
                       else if (minK > 0) salaryText = `À partir de ${minK}K`;
                       else if (maxK > 0) salaryText = `Jusqu'à ${maxK}K`;

                       return (
                         <div className="flex items-center gap-2 text-primary">
                           <Euro className="w-4 h-4" />
                           {salaryText} {minK > 0 || maxK > 0 ? "€ / an" : ""}
                         </div>
                       );
                     })()}
                   </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto hidden-scrollbar p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {loading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 grayscale opacity-50">
                   <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                   <p className="font-black uppercase tracking-widest text-xs">Chargement des détails...</p>
                </div>
              ) : (
                <>
                  {/* Left Column: Description & Skills */}
                  <div className="lg:col-span-2 space-y-12">
                     <section>
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5" /> Description du poste
                        </h3>
                        <div className="prose prose-invert max-w-none">
                          <p className="text-white/70 text-base leading-relaxed font-medium whitespace-pre-wrap">
                            {job?.description}
                          </p>
                        </div>
                      </section>

                     <section>
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-3">
                          <Sparkles className="w-5 h-5" /> Compétences recherchées
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {job?.skills.map((skill, i) => (
                            <span 
                              key={i} 
                              className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/80 text-xs font-bold hover:border-primary/50 hover:bg-primary/5 transition-all"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </section>
                  </div>

                  {/* Right Column: Company Info & Action */}
                  <div className="space-y-8">
                     <div className="glass p-8 rounded-[40px] border border-white/5 bg-white/[0.02]">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">À propos de l'entreprise</h3>
                        <div className="space-y-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                 <Building2 className="w-6 h-6" />
                              </div>
                              <div>
                                 <p className="text-sm font-black">{job?.company.name}</p>
                                 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{job?.company.industry}</p>
                              </div>
                           </div>

                           {job?.company.description && (
                             <p className="text-xs text-white/50 leading-relaxed font-medium line-clamp-4 italic">
                               "{job.company.description}"
                             </p>
                           )}

                           {job?.company.website && (
                              <a 
                                href={job.company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                              >
                                 <Globe className="w-3 h-3" /> Voir le site web
                              </a>
                           )}
                        </div>
                     </div>

                     <div className="p-8 rounded-[40px] bg-primary/[0.03] border border-primary/20 space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                             <Clock className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Publiée le</p>
                              <p className="text-xs font-bold">{job ? new Date(job.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ""}</p>
                           </div>
                        </div>

                        <button
                          onClick={() => {
                            onApply(job);
                            onClose();
                          }}
                          className="w-full py-5 rounded-[28px] bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_12px_40px_rgba(var(--primary-rgb),0.3)]"
                        >
                          <Send className="w-4 h-4" />
                          Postuler maintenant
                        </button>
                     </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
