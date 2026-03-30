"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Search, 
  Sparkles, 
  Filter, 
  Loader2,
  Euro,
  Navigation,
  CheckCircle2,
  X,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { toast } from "sonner";
import { ApplyModal } from "@/components/dashboard/apply-modal";
import { JobDetailsModal } from "@/components/dashboard/job-details-modal";

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
  company: {
    name: string;
    logoUrl?: string;
    industry?: string;
  };
  createdAt: string;
}

const contractTypeConfig = {
  CDI: { label: "CDI", color: "bg-green-400/10 text-green-400 border-green-400/20" },
  CDD: { label: "CDD", color: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
  INTERNSHIP: { label: "Stage", color: "bg-purple-400/10 text-purple-400 border-purple-400/20" },
  FREELANCE: { label: "Freelance", color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
  PART_TIME: { label: "Temps Partiel", color: "bg-pink-400/10 text-pink-400 border-pink-400/20" },
};

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [contractFilter, setContractFilter] = useState<string>("");
  const [salaryMinFilter, setSalaryMinFilter] = useState<number>(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/jobs", {
        params: {
          title: search || undefined,
          location: locationFilter || undefined,
          contractType: contractFilter || undefined,
          salaryMin: salaryMinFilter > 0 ? salaryMinFilter : undefined,
        }
      });
      setJobs(res.data);
    } catch (error) {
      toast.error("Erreur lors de la récupération des offres");
    } finally {
      setLoading(false);
    }
  }, [search, locationFilter, contractFilter, salaryMinFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const toggleApply = (job: Job) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const viewDetails = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsDetailsModalOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-400 bg-green-400/10 border-green-400/20";
    if (score >= 40) return "text-orange-400 bg-orange-400/10 border-orange-400/20";
    return "text-red-400 bg-red-400/10 border-red-400/20";
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Main Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-gradient uppercase tracking-tighter">
             Tableau des Offres
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md font-medium">
            Trouvez les offres d'emploi qui correspondent à votre profil et vos ambitions.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Poste, compétences..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none w-full md:w-64 font-bold text-sm transition-all"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-6 py-4 rounded-[20px] font-black uppercase tracking-widest text-[10px] transition-all border ${
              isFilterOpen ? 'bg-primary text-primary-foreground border-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="glass p-8 rounded-[32px] border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Localisation</label>
                <div className="relative">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none font-bold text-xs"
                    placeholder="Ville, Pays..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Contrat</label>
                <select
                  value={contractFilter}
                  onChange={(e) => setContractFilter(e.target.value)}
                  className="w-full px-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none font-bold text-xs appearance-none"
                >
                  <option value="" className="bg-[#0A0A0B]">Tout type</option>
                  <option value="CDI" className="bg-[#0A0A0B]">CDI</option>
                  <option value="CDD" className="bg-[#0A0A0B]">CDD</option>
                  <option value="INTERNSHIP" className="bg-[#0A0A0B]">Stage</option>
                  <option value="FREELANCE" className="bg-[#0A0A0B]">Freelance</option>
                  <option value="PART_TIME" className="bg-[#0A0A0B]">Temps Partiel</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Salaire Min (€)</label>
                <div className="relative">
                  <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="number"
                    step={1000}
                    value={salaryMinFilter || ""}
                    onChange={(e) => setSalaryMinFilter(Number(e.target.value))}
                    className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none font-bold text-xs"
                    placeholder="ex: 40000"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-8 rounded-[40px] border border-white/5 group hover:border-primary/30 transition-all flex flex-col h-full relative overflow-hidden"
            >
              {/* Score Badge */}
              <div className={`absolute top-6 right-6 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest backdrop-blur-md z-10 ${getScoreColor(job.matchScore || 0)}`}>
                {job.matchScore || 0}% Match
              </div>

              {/* Job Info */}
              <div className="flex items-start gap-4 mb-6 pt-2">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-3 group-hover:scale-105 transition-transform group-hover:bg-primary/5 group-hover:border-primary/20">
                  {job.company.logoUrl ? (
                    <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-black truncate group-hover:text-primary transition-colors leading-tight">
                    {job.title}
                  </h3>
                  <p className="text-muted-foreground text-sm font-bold flex items-center gap-2 mt-1 truncate">
                     {job.company.name} {job.company.industry && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-widest">{job.company.industry}</span>}
                  </p>
                </div>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2 mb-8">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${contractTypeConfig[job.contractType as keyof typeof contractTypeConfig]?.color}`}>
                   {contractTypeConfig[job.contractType as keyof typeof contractTypeConfig]?.label}
                </span>
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-muted-foreground flex items-center gap-1.5">
                   <MapPin className="w-3 h-3" /> {job.location}
                </span>
                {(() => {
                  const minK = job.salaryMin ? Math.round(job.salaryMin / 1000) : 0;
                  const maxK = job.salaryMax ? Math.round(job.salaryMax / 1000) : 0;
                  let salaryText = "Non précisé";
                  if (minK > 0 && maxK > 0) salaryText = `${minK}K — ${maxK}K`;
                  else if (minK > 0) salaryText = `À partir de ${minK}K`;
                  else if (maxK > 0) salaryText = `Jusqu'à ${maxK}K`;

                  return (
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/5 border border-primary/20 text-primary flex items-center gap-1.5">
                       <Euro className="w-3 h-3" /> {salaryText}
                    </span>
                  );
                })()}
              </div>

              {/* Skills Previews */}
              <div className="flex flex-wrap gap-1.5 mb-8">
                {job.skills.slice(0, 4).map((skill, si) => (
                  <span key={si} className="text-[10px] font-bold text-muted-foreground/60 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/5">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 4 && (
                  <span className="text-[10px] font-bold text-muted-foreground/40 px-2 py-1">
                    +{job.skills.length - 4}
                  </span>
                )}
              </div>

              {/* Action */}
              <div className="mt-auto pt-6 flex gap-3">
                <button 
                  onClick={() => toggleApply(job)}
                  className="flex-[2] py-4 rounded-[22px] bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_32px_rgba(var(--primary-rgb),0.3)] shadow-lg"
                >
                  Postuler maintenant
                </button>
                <button 
                  onClick={() => viewDetails(job.id)}
                  className="flex-1 py-4 rounded-[22px] bg-white/5 border border-white/10 font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer"
                >
                   Details
                </button>
              </div>

              {/* Sparkle effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-[40px] border border-dashed border-white/10">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground mb-6">
            <Briefcase className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold mb-2">Aucune offre trouvée</h3>
          <p className="text-muted-foreground max-w-sm font-medium">
            Essayez de modifier vos filtres ou revenez plus tard.
          </p>
          <button 
            onClick={() => {
              setSearch("");
              setLocationFilter("");
              setContractFilter("");
              setSalaryMinFilter(0);
            }}
            className="mt-6 text-primary font-bold text-sm uppercase tracking-widest hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Modals */}
      <ApplyModal 
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        job={selectedJob}
        onSuccess={() => {
          // Maybe refresh stats or list if needed
        }}
      />
      <JobDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        jobId={selectedJobId}
        onApply={(job) => toggleApply(job)}
      />
    </div>
  );
}
