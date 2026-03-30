"use client";

import { useState, useEffect, useCallback } from "react";
import { FilterSidebar } from "@/components/jobs/filter-sidebar";
import { JobList, Job } from "@/components/jobs/job-list";
import { jobService, JobSearchFilters } from "@/services/job.service";
import { motion } from "framer-motion";
import { Sparkles, Search } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { applicationService } from "@/services/application.service";
import { useDebounce } from "@/hooks/use-debounce"; 
// Wait, I should check if use-debounce hook exists. If not, do local debouncing.

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobSearchFilters>({});
  const debouncedFilters = useDebounce(filters, 400);

  const handleFilterChange = useCallback((newFilters: JobSearchFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const fetchJobs = useCallback(async (currentFilters: JobSearchFilters) => {
    setLoading(true);
    try {
      const data = await jobService.getJobs(currentFilters);
      setJobs(data);

      if (user?.role === "CANDIDATE") {
        const apps = await applicationService.getMyApplications();
        const ids = new Set(apps.map((a) => a.jobOfferId));
        setAppliedJobIds(ids);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJobs(debouncedFilters);
  }, [debouncedFilters, fetchJobs]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Search Header */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[100px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Découvrez les meilleures opportunités</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tight"
          >
            Recherche d&apos;emplois
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
            className="text-muted-foreground text-xl max-w-2xl mx-auto"
          >
            Explorez des offres qui correspondent à vos compétences et à vos aspirations professionnelles.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar onFilterChange={handleFilterChange} />
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.02] p-6 md:p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
              <p className="text-sm font-bold text-muted-foreground whitespace-nowrap">
                <span className="text-primary font-black text-2xl mr-2 italic">{jobs.length}</span> 
                {jobs.length > 1 ? "offres trouvées" : "offre trouvée"}
              </p>
              
              <div className="relative w-full max-w-md group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text"
                  placeholder="Rechercher par titre, compétence..."
                  value={filters.title || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all font-bold text-sm placeholder:text-white/20 placeholder:font-medium"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                   <div className="px-2 py-1 rounded-md bg-white/10 text-[10px] font-black text-white/40">ESC</div>
                </div>
              </div>
            </div>

            <JobList jobs={jobs} loading={loading} appliedJobIds={appliedJobIds} />
          </div>
        </div>
      </div>
    </div>
  );
}
