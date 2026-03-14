"use client";

import { motion } from "framer-motion";
import { MapPin, Globe, Building2, Users, Briefcase, Calendar } from "lucide-react";
import Image from "next/image";

interface JobOffer {
  id: string;
  title: string;
  location: string;
  contractType: string;
  salaryMin?: number;
  salaryMax?: number;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
  size?: string;
  jobs: JobOffer[];
}

export function CompanyProfile({ company }: { company: Company }) {
  const activeJobsCount = company.jobs?.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[40px] glass p-8 md:p-12">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2 -z-10" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative shadow-2xl"
          >
            {company.logoUrl ? (
              <Image 
                src={company.logoUrl} 
                alt={company.name} 
                fill 
                className="object-cover"
              />
            ) : (
              <Building2 className="w-16 h-16 text-primary/40" />
            )}
          </motion.div>

          <div className="flex-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                {company.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-primary" /> {company.industry || "Secteur non spécifié"}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" /> {company.location || "Distance / Remote"}
                </span>
                {company.website && (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline transition-all"
                  >
                    <Globe className="w-4 h-4" /> Site web
                  </a>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              className="flex flex-wrap justify-center md:justify-start gap-3 mt-6"
            >
              <div className="px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold flex items-center gap-2">
                <Users className="w-5 h-5" /> {company.size || "Taille inconnue"}
              </div>
              <div className="px-5 py-2.5 rounded-2xl bg-secondary border border-white/5 text-foreground font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5" /> {activeJobsCount} Offre{activeJobsCount > 1 ? 's' : ''} active{activeJobsCount > 1 ? 's' : ''}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-12">
        {/* About Section */}
        <div className="md:col-span-2 space-y-8 text-foreground">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-2 h-8 bg-primary rounded-full" />
              À propos de nous
            </h2>
            <div 
              className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ __html: company.description || "Aucune description disponible pour le moment." }}
            />
          </section>
        </div>

        {/* Sidebar / Jobs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full" />
            Offres en cours
          </h2>
          <div className="space-y-4">
            {activeJobsCount > 0 ? (
              company.jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group block glass p-5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all hover:translate-x-1 cursor-pointer"
                >
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors mb-2">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary/80">
                      {job.contractType}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-medium text-foreground">Voir l&apos;offre</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-muted-foreground">
                <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>Aucune offre publiée pour le moment.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
