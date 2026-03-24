"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Users, Loader2 } from "lucide-react";
import { CandidateTable } from "@/components/dashboard/candidate-table";
import { CandidateModal } from "@/components/dashboard/candidate-modal";
import { DeleteConfirmationModal } from "@/components/dashboard/delete-confirmation-modal";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";

import { Candidate } from "@/types/candidate";

interface CandidatePageState {
  candidates: Candidate[];
  // ... (keeping other state interfaces if needed)
}


export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCandidates();
      const mapped: Candidate[] = data.map((cp: any) => ({
        id: cp.id,
        userId: cp.user?.id || "",
        firstName: cp.user?.firstName || "",
        lastName: cp.user?.lastName || "",
        email: cp.user?.email || "",
        title: cp.title || "",
        summary: cp.summary || "",
        location: cp.location || "",
        skills: cp.skills || [],
        cvUrl: cp.cvUrl || "",
        status: "ACTIVE",
        createdAt: cp.user?.createdAt ? cp.user.createdAt.split('T')[0] : ""
      }));
      setCandidates(mapped);
    } catch (error) {
      toast.error("Erreur lors du chargement des candidats");
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCandidate(null);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCandidateToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCandidate = async (formData: any) => {
    try {
      if (formData.id) {
        // UPDATE FLOW
        // 1. Update User info
        await adminService.updateUser(formData.userId, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        });

        // 2. Update Profile info
        const profilePayload = {
          title: formData.title,
          summary: formData.summary,
          location: formData.location,
          skills: formData.skills,
          cvUrl: formData.cvUrl,
        };
        await adminService.updateCandidate(formData.id, profilePayload);
        
        toast.success("Candidat mis à jour ! ✅");
      } else {
        // CREATE FLOW (Two Steps as requested)
        // 1. Register User
        const registerPayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: "CANDIDATE",
        };
        
        const userResponse = await adminService.createUser(registerPayload);
        const userId = userResponse.id;

        // 2. Update Profile (if there are profile fields)
        if (formData.title || formData.summary || formData.location || formData.skills?.length > 0 || formData.cvUrl) {
          // We need the profileId. Let's find it by re-fetching or fetching current user's profile
          // Since we are admin, we can fetch all and find the one with this userId
          const allCandidates = await adminService.getCandidates();
          const newProfile = allCandidates.find((c: any) => c.user.id === userId);
          
          if (newProfile) {
            const profilePayload = {
              title: formData.title,
              summary: formData.summary,
              location: formData.location,
              skills: formData.skills,
              cvUrl: formData.cvUrl,
            };
            await adminService.updateCandidate(newProfile.id, profilePayload);
          }
        }
        
        toast.success("Candidat créé avec succès ! ✅");
      }
      setIsEditModalOpen(false);
      fetchCandidates();
    } catch (error: any) {
      const message = error.response?.data?.message;
      if (Array.isArray(message)) {
        toast.error(message.join(", "));
      } else {
        toast.error(message || "Erreur lors de l'enregistrement");
      }
      throw error; // Keep modal open
    }
  };

  const handleConfirmDelete = async () => {
    if (candidateToDelete) {
      try {
        await adminService.deleteCandidate(candidateToDelete);
        toast.success("Candidat supprimé !");
        setCandidates(candidates.filter(c => c.id !== candidateToDelete));
        setCandidateToDelete(null);
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
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
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Administration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gradient uppercase tracking-tighter">
            Candidats
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md font-medium">
            Gérez l'ensemble des candidats inscrits sur la plateforme, modifiez leurs informations ou supprimez-les.
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
            Ajouter
          </button>
        </div>
      </div>

      {/* Stats (Optional but would look nice) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Candidats", value: candidates.length, color: "primary" },
          { label: "Actifs", value: candidates.filter(c => c.status === "ACTIVE").length, color: "green-400" },
          { label: "En Attente", value: candidates.filter(c => c.status === "PENDING").length, color: "yellow-400" },
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
          <h2 className="text-xl font-black uppercase tracking-tight">Liste des candidats</h2>
        </div>
        <CandidateTable 
          candidates={filteredCandidates} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick} 
        />
      </div>

      {/* Modals */}
      <CandidateModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveCandidate}
        candidate={selectedCandidate}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer le candidat ?"
        description="Cette action est irréversible. Toutes les données associées à ce candidat seront définitivement supprimées."
      />
    </div>
  );
}
