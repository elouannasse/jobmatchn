"use client";

import { useState, useEffect, useCallback } from "react";
import { FilterSidebar } from "@/components/jobs/filter-sidebar";
import { JobList, Job } from "@/components/jobs/job-list";
import { jobService, JobSearchFilters } from "@/services/job.service";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobSearchFilters>({});

  const fetchJobs = useCallback(async (currentFilters: JobSearchFilters) => {
    setLoading(true);
    try {
      const data = await jobService.getJobs(currentFilters);
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(filters);
  }, [filters, fetchJobs]);

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
            <FilterSidebar onFilterChange={setFilters} />
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex justify-between items-center bg-white/5 py-4 px-8 rounded-[32px] border border-white/5">
              <p className="text-sm font-medium text-muted-foreground">
                <span className="text-foreground font-bold">{jobs.length}</span> offres trouvées
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground italic">Actualisé à l&apos;instant</span>
              </div>
            </div>

            <JobList jobs={jobs} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
