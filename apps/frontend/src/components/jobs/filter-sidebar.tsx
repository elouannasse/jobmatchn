"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { JobSearchFilters } from "@/services/job.service";

interface FilterSidebarProps {
  onFilterChange: (filters: JobSearchFilters) => void;
}

const contractTypes = [
  { label: "CDI", value: "CDI" },
  { label: "CDD", value: "CDD" },
  { label: "Stage", value: "INTERNSHIP" },
  { label: "Freelance", value: "FREELANCE" },
  { label: "Temps Partiel", value: "PART_TIME" },
];

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState({
    title: "",
    location: "",
    contractType: "",
    salaryMin: "",
  });

  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        ...filters,
        salaryMin: filters.salaryMin ? parseInt(filters.salaryMin, 10) : undefined
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  const updateFilters = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      title: "",
      location: "",
      contractType: "",
      salaryMin: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  return (
    <aside className="glass p-8 rounded-[40px] border border-white/5 space-y-8 sticky top-24">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" /> Filtres
        </h2>
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearFilters}
              className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
            >
              <X className="w-3 h-3" /> Effacer
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-black tracking-widest text-muted-foreground mr-1">Titre ou Entreprise</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={filters.title}
              onChange={(e) => updateFilters("title", e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30"
              placeholder="ex: Frontend Developer"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Localisation</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => updateFilters("location", e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30"
              placeholder="ex: Paris, Remote"
            />
          </div>
        </div>

        {/* Contract Type */}
        <div className="space-y-3">
          <label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Type de contrat</label>
          <div className="flex flex-wrap gap-2">
            {contractTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => updateFilters("contractType", filters.contractType === type.value ? "" : type.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  filters.contractType === type.value
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Minimum Salary */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Salaire minimum</label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="number"
              value={filters.salaryMin}
              onChange={(e) => updateFilters("salaryMin", e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30"
              placeholder="ex: 45000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">€/an</span>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10">
          <p className="text-xs text-accent-foreground/60 leading-relaxed italic">
            Astuce : Les filtres sont appliqués automatiquement lors de votre saisie.
          </p>
        </div>
      </div>
    </aside>
  );
}
