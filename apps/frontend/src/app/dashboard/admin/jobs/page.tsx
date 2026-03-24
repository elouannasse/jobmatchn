"use client";

import { useState } from "react";
import { Plus, Search, Briefcase } from "lucide-react";
import { JobTable } from "@/components/dashboard/job-table";
import { JobModal } from "@/components/dashboard/job-modal";
import { DeleteConfirmationModal } from "@/components/dashboard/delete-confirmation-modal";

interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  description: string;
  skills: string[];
  createdAt: string;
}

const MOCK_JOBS: JobOffer[] = [
  { 
    id: "1", 
    title: "Senior Frontend Developer", 
    company: "TechNova", 
    location: "Paris / Remote", 
    type: "CDI", 
    status: "ACTIVE", 
    description: "Nous recherchons un expert React pour rejoindre notre équipe core.",
    skills: ["React", "TypeScript", "Next.js"],
    createdAt: "2024-03-10T10:00:00Z" 
  },
  { 
    id: "2", 
    title: "Product Designer UI/UX", 
    company: "CreativeFlow", 
    location: "Lyon", 
    type: "CDI", 
    status: "ACTIVE", 
    description: "Conception d'interfaces innovantes pour nos clients internationaux.",
    skills: ["Figma", "Adobe XD", "User Research"],
    createdAt: "2024-03-12T14:30:00Z" 
  },
  { 
    id: "3", 
    title: "Stagiaire Développeur Backend", 
    company: "StartUpGo", 
    location: "Casablanca", 
    type: "STAGE", 
    status: "PENDING", 
    description: "Apprenez Node.js et NestJS au sein d'une équipe dynamique.",
    skills: ["Node.js", "PostgreSQL"],
    createdAt: "2024-03-15T09:00:00Z" 
  },
  { 
    id: "4", 
    title: "DevOps Engineer", 
    company: "CloudScale", 
    location: "Remote", 
    type: "FREELANCE", 
    status: "INACTIVE", 
    description: "Optimisation de nos pipelines CI/CD et infrastructure AWS.",
    skills: ["Docker", "Kubernetes", "AWS"],
    createdAt: "2024-03-05T11:20:00Z" 
  },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobOffer[]>(MOCK_JOBS);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (job: JobOffer) => {
    setSelectedJob(job);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedJob(null);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setJobToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSaveJob = (updatedJob: JobOffer) => {
    if (updatedJob.id) {
      setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
    } else {
      const newJob = {
        ...updatedJob,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      setJobs([...jobs, newJob]);
    }
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (jobToDelete) {
      setJobs(jobs.filter(j => j.id !== jobToDelete));
      setJobToDelete(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Administration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gradient uppercase tracking-tighter">
            Offres
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md font-medium">
            Gérez les offres d'emploi publiées, modifiez les détails ou supprimez les offres obsolètes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none w-full md:w-64 font-bold text-sm transition-all"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-4 rounded-[20px] bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_32px_rgba(var(--primary-rgb),0.3)]"
          >
            <Plus className="w-4 h-4" />
            Ajouter Offre
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Offres", value: jobs.length, color: "primary" },
          { label: "Actives", value: jobs.filter(j => j.status === "ACTIVE").length, color: "green-400" },
          { label: "Inactives", value: jobs.filter(j => j.status === "INACTIVE").length, color: "red-400" },
        ].map((stat, i) => (
          <div key={i} className="glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
             <div className="relative z-10">
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
               <h3 className="text-3xl font-black">{stat.value}</h3>
             </div>
             <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-${stat.color}/5 blur-2xl group-hover:bg-${stat.color}/10 transition-all`} />
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-xl font-black uppercase tracking-tight">Liste des offres</h2>
        </div>
        <JobTable 
          jobs={filteredJobs} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick} 
        />
      </div>

      {/* Modals */}
      <JobModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveJob}
        job={selectedJob}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'offre ?"
        description="Cette action est irréversible. Toutes les données associées à cette offre seront définitivement supprimées."
      />
    </div>
  );
}
