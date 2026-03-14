"use client";

import { motion } from "framer-motion";
import { MapPin, Briefcase, Calendar, Building2, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface Job {
  id: string;
  title: string;
  location: string;
  contractType: string;
  salaryMin?: number;
  salaryMax?: number;
  createdAt: string;
  company: {
    name: string;
    logoUrl?: string;
    location?: string;
    industry?: string;
  };
}

export interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative glass p-6 rounded-[32px] border border-white/5 hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer"
    >
      <div className="flex gap-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
          {job.company.logoUrl ? (
            <Image 
              src={job.company.logoUrl} 
              alt={job.company.name} 
              fill 
              className="object-cover"
            />
          ) : (
            <Building2 className="w-8 h-8 text-primary/40" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-muted-foreground font-medium">{job.company.name}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              {job.contractType}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary/60" /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-primary/60" /> {job.company.industry || "Secteur non spécifié"}
            </span>
            {job.salaryMin && (
              <span className="font-semibold text-foreground">
                {Math.round(job.salaryMin / 1000)}k€ - {job.salaryMax ? Math.round(job.salaryMax / 1000) : '?'}k€
              </span>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center self-center pl-4">
          <div className="p-3 rounded-full bg-secondary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          Publié le {new Date(job.createdAt).toLocaleDateString()}
        </span>
        <Link 
          href={`/jobs/${job.id}`}
          className="text-primary font-bold hover:underline"
        >
          Détails de l&apos;offre
        </Link>
      </div>
    </motion.div>
  );
}

export function JobList({ jobs, loading }: { jobs: Job[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass p-6 rounded-[32px] animate-pulse h-[180px]">
            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5" />
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-white/5 rounded w-1/3" />
                <div className="h-4 bg-white/5 rounded w-1/4" />
                <div className="pt-4 flex gap-4">
                  <div className="h-4 bg-white/5 rounded w-20" />
                  <div className="h-4 bg-white/5 rounded w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20 glass rounded-[40px] border border-white/5"
      >
        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/40">
          <Briefcase className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Aucune offre trouvée</h3>
        <p className="text-muted-foreground">Ajustez vos filtres pour trouver plus d&apos;opportunités.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
