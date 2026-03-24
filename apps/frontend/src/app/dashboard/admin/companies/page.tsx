"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Building2 } from "lucide-react";
import { CompanyManagementTable } from "@/components/dashboard/company-management-table";
import { CompanyModal } from "@/components/dashboard/company-modal";
import { DeleteConfirmationModal } from "@/components/dashboard/delete-confirmation-modal";
import { companyService } from "@/services/company.service";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  sector: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  status: string;
  createdAt: string;
}

const MOCK_COMPANIES: Company[] = [
  { id: "1", name: "Google", sector: "Technologie", location: "Mountain View, USA", email: "contact@google.com", phone: "+1 650-253-0000", website: "https://google.com", description: "Search engine and cloud computing.", status: "ACTIVE", createdAt: "2024-01-15" },
  { id: "2", name: "TechNova", sector: "Logiciel", location: "Paris, France", email: "hr@technova.io", phone: "+33 1 23 45 67 89", website: "https://technova.io", description: "Innovative software solutions.", status: "ACTIVE", createdAt: "2024-02-10" },
  { id: "3", name: "CreativeFlow", sector: "Design", location: "Lyon, France", email: "hello@creativeflow.fr", phone: "+33 4 56 78 90 12", website: "https://creativeflow.fr", description: "UI/UX design agency.", status: "ACTIVE", createdAt: "2024-03-05" },
  { id: "4", name: "Algorithmics", sector: "IA & Data", location: "Casablanca, Maroc", email: "info@algorithmics.ma", phone: "+212 522-123456", website: "https://algorithmics.ma", description: "AI research and development.", status: "INACTIVE", createdAt: "2024-03-12" },
  { id: "5", name: "SecureBank", sector: "Finance", location: "Geneva, Switzerland", email: "security@securebank.ch", phone: "+41 22 123 45 67", website: "https://securebank.ch", description: "Digital banking security.", status: "ACTIVE", createdAt: "2024-02-20" },
  { id: "6", name: "CloudScale", sector: "Infrastructure", location: "Remote", email: "scaling@cloudscale.net", phone: "+1 415-123-4567", website: "https://cloudscale.net", description: "Cloud infrastructure management.", status: "ACTIVE", createdAt: "2024-01-05" },
  { id: "7", name: "EcoEnergy", sector: "Environnement", location: "Berlin, Germany", email: "info@ecoenergy.de", phone: "+49 30 1234567", website: "https://ecoenergy.de", description: "Renewable energy solutions.", status: "ACTIVE", createdAt: "2024-03-01" },
  { id: "8", name: "HealthTech", sector: "Santé", location: "London, UK", email: "jobs@healthtech.uk", phone: "+44 20 1234 5678", website: "https://healthtech.uk", description: "Healthcare technology tools.", status: "INACTIVE", createdAt: "2024-03-08" },
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getAll();
      const mapped: Company[] = data.map((c: any) => ({
        ...c,
        sector: c.industry || "N/A",
      }));
      setCompanies(mapped);
    } catch (error) {
      toast.error("Erreur lors du chargement des entreprises");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCompany(null);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCompanyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCompany = async (updatedCompany: any) => {
    try {
      const payload = {
        name: updatedCompany.name,
        industry: updatedCompany.sector,
        location: updatedCompany.location,
        website: updatedCompany.website,
        description: updatedCompany.description,
        logoUrl: updatedCompany.logoUrl
      };

      console.log("Saving company with payload:", payload);

      if (updatedCompany.id) {
        await companyService.update(updatedCompany.id, payload);
        toast.success("Entreprise mise à jour !");
      } else {
        await companyService.create(payload);
        toast.success("Entreprise créée avec succès !");
      }
      
      fetchCompanies();
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error("Save company error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleConfirmDelete = async () => {
    if (companyToDelete) {
      try {
        await companyService.delete(companyToDelete);
        toast.success("Entreprise supprimée");
        fetchCompanies();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
      setCompanyToDelete(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Administration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gradient uppercase tracking-tighter">
            Entreprises
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md font-medium">
            Gérez les entreprises partenaires, modifiez leurs informations ou retirez-les de la plateforme.
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
            Ajouter Entreprise
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Entreprises", value: companies.length, color: "primary" },
          { label: "Actives", value: companies.filter(c => c.status === "ACTIVE").length, color: "green-400" },
          { label: "Inactives", value: companies.filter(c => c.status === "INACTIVE").length, color: "red-400" },
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
          <h2 className="text-xl font-black uppercase tracking-tight">Liste des entreprises</h2>
        </div>
        <CompanyManagementTable 
          companies={filteredCompanies} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick} 
          loading={loading}
        />
      </div>

      {/* Modals */}
      <CompanyModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveCompany}
        company={selectedCompany}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'entreprise ?"
        description="Cette action est irréversible. Toutes les données associées à cette entreprise seront définitivement supprimées."
      />
    </div>
  );
}
