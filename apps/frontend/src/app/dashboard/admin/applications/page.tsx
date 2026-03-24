"use client";

import { useState } from "react";
import { Plus, Search, FileText } from "lucide-react";
import { ApplicationManagementTable } from "@/components/dashboard/application-management-table";
import { ApplicationModal } from "@/components/dashboard/application-modal";
import { DeleteConfirmationModal } from "@/components/dashboard/delete-confirmation-modal";

interface Application {
  id: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  applyDate: string;
  status: string;
}

const MOCK_APPLICATIONS: Application[] = [
  { id: "1", candidateName: "Jean Dupont", jobTitle: "Senior Frontend Dev", company: "TechNova", applyDate: "2024-03-10", status: "PENDING" },
  { id: "2", candidateName: "Marie Curie", jobTitle: "Product Designer", company: "CreativeFlow", applyDate: "2024-03-12", status: "INTERVIEW" },
  { id: "3", candidateName: "Alan Turing", jobTitle: "Data Scientist", company: "Algorithmics", applyDate: "2024-03-14", status: "ACCEPTED" },
  { id: "4", candidateName: "Sophie Germain", jobTitle: "Backend Engineer", company: "SecureBank", applyDate: "2024-03-05", status: "REJECTED" },
  { id: "5", candidateName: "Thomas Pesquet", jobTitle: "Embedded Dev", company: "SpaceX", applyDate: "2024-03-18", status: "PENDING" },
  { id: "6", candidateName: "Ada Lovelace", jobTitle: "Algorithme Specialist", company: "DeepMind", applyDate: "2024-03-20", status: "INTERVIEW" },
  { id: "7", candidateName: "Nikola Tesla", jobTitle: "Electrical Engineer", company: "Tesla", applyDate: "2024-03-01", status: "ACCEPTED" },
  { id: "8", candidateName: "Grace Hopper", jobTitle: "System Analyst", company: "IBM", applyDate: "2024-03-08", status: "PENDING" },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApplications = applications.filter(a => 
    a.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (app: Application) => {
    setSelectedApplication(app);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedApplication(null);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setApplicationToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSaveApplication = (updatedApp: Application) => {
    if (updatedApp.id) {
      setApplications(applications.map(a => a.id === updatedApp.id ? updatedApp : a));
    } else {
      const newApp = {
        ...updatedApp,
        id: Math.random().toString(36).substr(2, 9),
      };
      setApplications([...applications, newApp]);
    }
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (applicationToDelete) {
      setApplications(applications.filter(a => a.id !== applicationToDelete));
      setApplicationToDelete(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Administration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gradient uppercase tracking-tighter">
            Candidatures
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md font-medium">
            Gérez les candidatures reçues, modifiez leur statut ou retirez-les de la plateforme.
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
            Ajouter Candidature
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total", value: applications.length, color: "primary" },
          { label: "Acceptées", value: applications.filter(a => a.status === "ACCEPTED").length, color: "green-400" },
          { label: "Entretiens", value: applications.filter(a => a.status === "INTERVIEW").length, color: "purple-400" },
          { label: "En Attente", value: applications.filter(a => a.status === "PENDING").length, color: "blue-400" },
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
          <h2 className="text-xl font-black uppercase tracking-tight">Liste des candidatures</h2>
        </div>
        <ApplicationManagementTable 
          applications={filteredApplications} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick} 
        />
      </div>

      {/* Modals */}
      <ApplicationModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveApplication}
        application={selectedApplication}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer la candidature ?"
        description="Cette action est irréversible. Cette candidature sera définitivement retirée de la plateforme."
      />
    </div>
  );
}
