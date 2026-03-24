"use client";

import { useState, useEffect } from "react";
import { Plus, Search, UserCheck, Loader2 } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { RecruiterManagementTable } from "@/components/dashboard/recruiter-management-table";
import { RecruiterModal } from "@/components/dashboard/recruiter-modal";
import { DeleteConfirmationModal } from "@/components/dashboard/delete-confirmation-modal";
import { AssignCompanyModal } from "@/components/dashboard/assign-company-modal";

interface Recruiter {
  id: string;
  name: string;
  email: string;
  company: string;
  companyId?: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
}

const MOCK_RECRUITERS: Recruiter[] = [
  { id: "1", name: "Marc Lefebvre", email: "marc@technova.io", company: "TechNova", phone: "+33 6 12 34 56 78", role: "Manager", status: "ACTIVE", createdAt: "2024-01-20" },
  { id: "2", name: "Alice Dupont", email: "alice@google.com", company: "Google", phone: "+1 650-253-1111", role: "Lead Recruiter", status: "ACTIVE", createdAt: "2024-02-15" },
  { id: "3", name: "Julien Martin", email: "j.martin@creativeflow.fr", company: "CreativeFlow", phone: "+33 7 89 01 23 45", role: "HRBP", status: "ACTIVE", createdAt: "2024-03-01" },
  { id: "4", name: "Sarah Connor", email: "sarah@algorithmics.ma", company: "Algorithmics", phone: "+212 661-123456", role: "Recruiter", status: "INACTIVE", createdAt: "2024-03-10" },
  { id: "5", name: "Pierre Durand", email: "pierre@securebank.ch", company: "SecureBank", phone: "+41 78 123 45 67", role: "Head of Talent", status: "ACTIVE", createdAt: "2024-02-25" },
  { id: "6", name: "Elena Rossi", email: "elena@cloudscale.net", company: "CloudScale", phone: "+1 415-987-6543", role: "HR Manager", status: "ACTIVE", createdAt: "2024-01-10" },
  { id: "7", name: "Karim Benani", email: "karim@startalgo.io", company: "StartAlgo", phone: "+212 662-987654", role: "CEO / Recruiter", status: "ACTIVE", createdAt: "2024-03-05" },
  { id: "8", name: "Emma Watson", email: "emma@ecoenergy.de", company: "EcoEnergy", phone: "+49 176 1234567", role: "TA Partner", status: "INACTIVE", createdAt: "2024-03-15" },
];

export default function RecruitersPage() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);
  const [recruiterToDelete, setRecruiterToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const [data, statsData, companiesData] = await Promise.all([
        adminService.getUsersByRole("RECRUITER"),
        adminService.getGlobalStats(),
        adminService.getCompanies()
      ]);
      
      console.log("Fetched recruiters data:", data);
      console.log("Fetched global stats:", statsData);
      console.log("Fetched companies:", companiesData);
      
      setStats(statsData);
      setCompanies(companiesData);
      
      const mapped: Recruiter[] = data.map((u: any) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        company: u.recruiterProfile?.company?.name || "Non assigné",
        companyId: u.recruiterProfile?.companyId,
        phone: u.recruiterProfile?.phone || "N/A",
        role: "Recruteur",
        status: u.recruiterProfile?.isApproved ? "ACTIVE" : "INACTIVE",
        createdAt: u.createdAt.split('T')[0]
      }));
      setRecruiters(mapped);
    } catch (error) {
      toast.error("Erreur lors du chargement des recruteurs");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecruiters = recruiters.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (recruiter: Recruiter) => {
    setSelectedRecruiter(recruiter);
    setIsEditModalOpen(true);
  };

  const handleAssignClick = (recruiter: Recruiter) => {
    setSelectedRecruiter(recruiter);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignment = async (companyId: string) => {
    if (!selectedRecruiter) return;
    try {
      await adminService.updateUser(selectedRecruiter.id, { companyId });
      toast.success("Entreprise assignée avec succès !");
      fetchRecruiters();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'assignation");
      throw error;
    }
  };

  const handleAdd = () => {
    setSelectedRecruiter(null);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setRecruiterToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSaveRecruiter = async (updatedRecruiter: any) => {
    try {
      const payload = {
        ...updatedRecruiter,
        role: "RECRUITER",
        firstName: updatedRecruiter.name.split(' ')[0] || "Prénom",
        lastName: updatedRecruiter.name.split(' ').slice(1).join(' ') || "Nom",
      };

      if (updatedRecruiter.id) {
        await adminService.updateUser(updatedRecruiter.id, payload);
        toast.success("Recruteur mis à jour !");
      } else {
        await adminService.createUser(payload);
        toast.success("Recruteur créé avec succès !");
      }
      // Refresh the list
      fetchRecruiters();
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleConfirmDelete = () => {
    if (recruiterToDelete) {
      setRecruiters(recruiters.filter(r => r.id !== recruiterToDelete));
      setRecruiterToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/70">Administration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gradient uppercase tracking-tighter">
            Recruteurs
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md font-medium">
            Gérez les accès des recruteurs, modifiez leurs informations ou suspendez leurs comptes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-purple-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 rounded-[20px] bg-white/5 border border-white/10 focus:border-purple-400/50 focus:ring-4 focus:ring-purple-400/10 outline-none w-full md:w-64 font-bold text-sm transition-all"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-4 rounded-[20px] bg-purple-600 text-white font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_32px_rgba(139,92,246,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Ajouter Recruteur
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Recruteurs", value: stats?.totalRecruiters || 0, color: "purple-400" },
          { label: "Approuvés", value: (stats?.totalRecruiters || 0) - (stats?.totalPendingRecruiters || 0), color: "green-400" },
          { label: "En attente", value: stats?.totalPendingRecruiters || 0, color: "orange-400" },
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
          <h2 className="text-xl font-black uppercase tracking-tight">Liste des recruteurs</h2>
        </div>
        <RecruiterManagementTable 
          recruiters={filteredRecruiters} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick} 
          onAssignCompany={handleAssignClick}
        />
      </div>

      {/* Modals */}
      <RecruiterModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveRecruiter}
        recruiter={selectedRecruiter}
        companies={companies}
      />

      <AssignCompanyModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onConfirm={handleConfirmAssignment}
        currentCompanyId={selectedRecruiter?.companyId}
        recruiterName={selectedRecruiter?.name || ""}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer le recruteur ?"
        description="Cette action est irréversible. Toutes les données associées à ce compte recruteur seront supprimées."
      />
    </div>
  );
}
