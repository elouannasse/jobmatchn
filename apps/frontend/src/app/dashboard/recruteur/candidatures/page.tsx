"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  User, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Loader2, 
  ArrowUpRight,
  ExternalLink,
  Mail,
  MapPin,
  Linkedin,
  X,
  ChevronDown,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { applicationService, RecruiterApplication } from "@/services/application.service";
import { candidateService, Candidate } from "@/services/candidate.service";
import { toast } from "sonner";

const STATUSES = [
  { value: "PENDING", label: "En attente", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
  { value: "REVIEWED", label: "Révisée", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  { value: "INTERVIEW", label: "Entretien", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  { value: "ACCEPTED", label: "Acceptée", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  { value: "REJECTED", label: "Refusée", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
];

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<RecruiterApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState<Candidate | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [offerFilter, setOfferFilter] = useState("ALL");
  const [minScore, setMinScore] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getRecruiterApplications();
      setApplications(data);
    } catch (error) {
      toast.error("Erreur lors de la récupération des candidatures");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await applicationService.updateStatus(id, newStatus);
      toast.success("Statut mis à jour");
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleViewProfile = async (app: RecruiterApplication) => {
    setSelectedApp(app);
    setIsModalOpen(true);
    setProfileLoading(true);
    setCandidateProfile(null);
    try {
      // In the backend candidate ID is sometimes the user ID or profile ID. 
      // The application object has candidateId which is the profile ID.
      const profile = await candidateService.getById(app.candidateId as string);
      setCandidateProfile(profile);
    } catch (error) {
      console.error("Failed to fetch candidate profile", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const filteredApps = applications
    .filter(app => statusFilter === "ALL" || app.status === statusFilter)
    .filter(app => offerFilter === "ALL" || app.jobOffer.title === offerFilter)
    .filter(app => (app.score || 0) >= minScore)
    .filter(app => {
      const fullSearch = `${app.candidate.user.firstName} ${app.candidate.user.lastName} ${app.jobOffer.title}`.toLowerCase();
      return fullSearch.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const uniqueOffers = Array.from(new Set(applications.map(app => app.jobOffer.title)));

  if (loading && applications.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Gestion des Candidatures</h1>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Suivi du Matching & Recrutement</span>
        </div>
      </div>

      {/* Filters Overlay */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Candidat, poste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary/50 transition-all font-bold text-sm"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary/50 transition-all font-bold text-sm"
        >
          <option value="ALL">Tous les statuts</option>
          {STATUSES.map(s => <option key={s.value} value={s.value} className="bg-[#111]">{s.label}</option>)}
        </select>
        <select 
          value={offerFilter}
          onChange={(e) => setOfferFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary/50 transition-all font-bold text-sm"
        >
          <option value="ALL">Toutes les offres</option>
          {uniqueOffers.map(o => <option key={o} value={o} className="bg-[#111]">{o}</option>)}
        </select>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase text-muted-foreground">Score Min:</span>
          <input 
            type="number"
            min="0"
            max="100"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-12 bg-transparent outline-none font-black text-primary"
          />
          <span className="text-xs font-black text-primary">%</span>
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass rounded-[40px] border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Candidat</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Offre</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Score Matching</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary text-xl shadow-inner">
                        {app.candidate.user.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-lg tracking-tight">{app.candidate.user.firstName} {app.candidate.user.lastName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">{app.candidate.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                      <Briefcase className="w-4 h-4 text-primary" />
                      {app.jobOffer.title}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${app.score}%` }}
                          className={`h-full ${
                            (app.score || 0) > 80 ? 'bg-green-500' :
                            (app.score || 0) > 50 ? 'bg-primary' : 'bg-orange-500'
                          }`}
                        />
                      </div>
                      <span className={`text-[10px] font-black ${
                        (app.score || 0) > 80 ? 'text-green-500' :
                        (app.score || 0) > 50 ? 'text-primary' : 'text-orange-500'
                      }`}>
                        {app.score}% MATCH
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {(() => {
                      const statusObj = STATUSES.find(s => s.value === app.status);
                      return (
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black border ${statusObj?.bg} ${statusObj?.color} ${statusObj?.border}`}>
                          {statusObj?.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleViewProfile(app)}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-primary hover:text-white transition-all transform hover:scale-110 active:scale-95 group"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic normal-case">
                  Aucune candidature trouvée avec ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Candidate Profile Modal */}
      <AnimatePresence>
        {isModalOpen && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-[#0d0d0d] border border-white/10 rounded-[48px] shadow-2xl overflow-hidden"
            >
              {/* Profile Background & Close */}
              <div className="h-32 bg-gradient-to-r from-primary/30 to-purple-600/30 relative">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-white/10 transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Profile Main Content */}
              <div className="px-10 pb-10 -mt-16">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                  <div className="w-32 h-32 rounded-[40px] bg-[#111] border-4 border-[#0d0d0d] flex items-center justify-center text-4xl font-black text-primary shadow-2xl">
                    {selectedApp.candidate.user.firstName.charAt(0)}
                  </div>
                  <div className="flex-1 mt-16 md:mt-20">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-1 leading-none">
                      {selectedApp.candidate.user.firstName} {selectedApp.candidate.user.lastName}
                    </h2>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{candidateProfile?.title || "Candidat"}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                         <Mail className="w-3.5 h-3.5 text-primary" />
                         {selectedApp.candidate.user.email}
                      </div>
                      {candidateProfile?.location && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                           <MapPin className="w-3.5 h-3.5 text-primary" />
                           {candidateProfile.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    {/* Summary */}
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        À propos
                      </h3>
                      <p className="text-sm leading-relaxed font-bold opacity-70">
                        {candidateProfile?.summary || "Aucune description fournie par le candidat."}
                      </p>
                    </div>

                    {/* Skills */}
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Compétences
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {candidateProfile?.skills?.map((skill) => (
                          <span key={skill} className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-wider">
                            {skill}
                          </span>
                        ))}
                        {(!candidateProfile?.skills || candidateProfile.skills.length === 0) && (
                          <p className="text-[10px] font-bold opacity-30 italic">Aucune compétence listée.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Matching Context */}
                    <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Contexte Candidature</h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-muted-foreground">Matching IA</span>
                        <span className="text-2xl font-black italic text-primary">{selectedApp.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-primary" style={{ width: `${selectedApp.score}%` }} />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase text-muted-foreground">Offre</span>
                           <span className="text-[10px] font-black uppercase text-white truncate max-w-[150px]">{selectedApp.jobOffer.title}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase text-muted-foreground">Appliqué le</span>
                           <span className="text-[10px] font-black uppercase text-white">{new Date(selectedApp.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Management */}
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Gérer le Statut</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {STATUSES.map((status) => (
                          <button
                            key={status.value}
                            onClick={() => handleUpdateStatus(selectedApp.id, status.value)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black transition-all border ${
                              selectedApp.status === status.value 
                              ? `${status.bg} ${status.color} ${status.border} scale-[1.05] z-10 shadow-lg` 
                              : 'bg-white/5 text-muted-foreground border-transparent opacity-50 hover:opacity-100 hover:bg-white/10'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${status.value === 'ACCEPTED' ? 'bg-green-500' : status.value === 'REJECTED' ? 'bg-red-500' : 'bg-primary'}`} />
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* LinkedIn / CV */}
                    <div className="flex gap-4">
                       {candidateProfile?.linkedinUrl && (
                         <a href={candidateProfile.linkedinUrl} target="_blank" className="flex-1 flex items-center justify-center gap-2 p-4 bg-[#0077b5]/10 text-[#0077b5] border border-[#0077b5]/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                           <Linkedin className="w-4 h-4" /> LinkedIn
                         </a>
                       )}
                       {candidateProfile?.cvUrl && (
                         <a href={candidateProfile.cvUrl} target="_blank" className="flex-1 flex items-center justify-center gap-2 p-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                           <FileText className="w-4 h-4" /> Voir CV
                         </a>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
