"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  TrendingUp,
  Inbox,
  ArrowLeft,
  CalendarDays,
  Send
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

function RecruiterJobApplicationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("jobId");

  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<RecruiterApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState<Candidate | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Interview modal
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewData, setInterviewData] = useState({ date: "", message: "" });
  const [pendingStatusAppId, setPendingStatusAppId] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === "PENDING" || a.status === "REVIEWED").length,
      interview: applications.filter(a => a.status === "INTERVIEW").length,
      accepted: applications.filter(a => a.status === "ACCEPTED").length,
    };
  }, [applications]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await applicationService.getRecruiterApplications(jobId || undefined);
      setApplications(data);
    } catch (error) {
      toast.error("Erreur lors de la récupération des candidatures");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (newStatus === "INTERVIEW") {
      setPendingStatusAppId(id);
      setIsInterviewModalOpen(true);
      return;
    }

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

  const handleInterviewSubmit = async () => {
    if (!pendingStatusAppId) return;
    try {
       await applicationService.updateStatus(
         pendingStatusAppId, 
         "INTERVIEW", 
         interviewData.date, 
         interviewData.message
       );
       toast.success("Entretien planifié et notifié !");
       setApplications(prev => prev.map(app => app.id === pendingStatusAppId ? { ...app, status: "INTERVIEW" } : app));
       setIsInterviewModalOpen(false);
    } catch (error) {
       toast.error("Échec de la planification de l'entretien");
    }
  };

  const handleViewProfile = async (app: RecruiterApplication) => {
    setSelectedApp(app);
    setIsModalOpen(true);
    setProfileLoading(true);
    try {
      const profile = await candidateService.getById(app.candidateId);
      setCandidateProfile(profile);
    } catch (error) {
      console.error("Failed to get profile", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const jobTitle = applications[0]?.jobOffer.title || "Toutes les candidatures";

  if (loading) {
    return (
      <div className="flex bg-[#0A0A0A] h-screen items-center justify-center">
         <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-12 h-12 text-primary animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing matching data...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header with Stats */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <button 
            onClick={() => router.push("/dashboard/recruiter/offres")}
            className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-6 font-black uppercase tracking-widest text-[10px] group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour aux offres
          </button>
          <div className="flex items-center gap-4 mb-2">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                <Inbox className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter">Candidatures</h1>
                <p className="text-sm font-bold text-muted-foreground italic truncate max-w-xl">{jobTitle}</p>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="glass px-6 py-4 rounded-[32px] border border-white/5 space-y-1 min-w-[120px]">
              <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50">Total</p>
              <p className="text-2xl font-black italic text-white">{stats.total}</p>
           </div>
           <div className="glass px-6 py-4 rounded-[32px] border border-white/5 space-y-1 min-w-[140px]">
              <p className="text-[10px] font-black text-orange-400 uppercase opacity-50">En attente</p>
              <p className="text-2xl font-black italic text-orange-400">{stats.pending}</p>
           </div>
           <div className="glass px-6 py-4 rounded-[32px] border border-white/5 space-y-1 min-w-[140px]">
              <p className="text-[10px] font-black text-purple-400 uppercase opacity-50">Entretiens</p>
              <p className="text-2xl font-black italic text-purple-400">{stats.interview}</p>
           </div>
           <div className="glass px-6 py-4 rounded-[32px] border border-white/5 space-y-1 min-w-[140px]">
              <p className="text-[10px] font-black text-green-400 uppercase opacity-50">Acceptés</p>
              <p className="text-2xl font-black italic text-green-400">{stats.accepted}</p>
           </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-[48px] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Candidat</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Score Matching</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Postulé le</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {applications.length > 0 ? (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                   <td className="px-10 py-8">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[24px] bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center font-black text-primary text-xl shadow-inner border border-primary/20">
                          {app.candidate.user.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-xl tracking-tighter leading-none mb-1">{app.candidate.user.firstName} {app.candidate.user.lastName}</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{app.candidate.user.email}</p>
                        </div>
                     </div>
                   </td>
                   <td className="px-10 py-8">
                     <div className="flex flex-col items-center gap-2">
                        <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden shadow-inner">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${app.score}%` }}
                             className={`h-full ${
                               (app.score || 0) > 80 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' :
                               (app.score || 0) > 40 ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                             }`}
                           />
                        </div>
                        <span className={`text-[10px] font-black italic tracking-widest ${
                           (app.score || 0) > 80 ? 'text-green-500' :
                           (app.score || 0) > 40 ? 'text-primary' : 'text-red-500'
                        }`}>
                          {app.score}% MATCH
                        </span>
                     </div>
                   </td>
                   <td className="px-10 py-8">
                      <div className="flex items-center gap-2 text-sm font-bold opacity-60">
                         <Calendar className="w-4 h-4" />
                         {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                   </td>
                   <td className="px-10 py-8">
                      {(() => {
                        const statusObj = STATUSES.find(s => s.value === app.status);
                        return (
                          <div className="relative group/status flex items-center gap-2">
                            <span className={`px-4 py-2 rounded-2xl text-[10px] font-black border uppercase tracking-widest flex items-center gap-2 ${statusObj?.bg} ${statusObj?.color} ${statusObj?.border}`}>
                               <div className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse`} />
                               {statusObj?.label}
                            </span>
                            
                            {/* Dropdown for quick change */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 opacity-0 group-hover/status:opacity-100 transition-all pointer-events-none group-hover/status:pointer-events-auto flex gap-1 z-20">
                               {STATUSES.map(s => (
                                 <button 
                                   key={s.value}
                                   disabled={s.value === app.status}
                                   onClick={() => handleUpdateStatus(app.id, s.value)}
                                   className={`p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 text-white/50 hover:text-white transition-all`}
                                   title={s.label}
                                 >
                                    {s.value === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                                    {s.value === 'REVIEWED' && <FileText className="w-3.5 h-3.5" />}
                                    {s.value === 'INTERVIEW' && <CalendarDays className="w-3.5 h-3.5" />}
                                    {s.value === 'ACCEPTED' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                    {s.value === 'REJECTED' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                                 </button>
                               ))}
                            </div>
                          </div>
                        );
                      })()}
                   </td>
                   <td className="px-10 py-8 text-right">
                     <button
                        onClick={() => handleViewProfile(app)}
                        className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                     >
                       Voir Profil
                     </button>
                   </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-10 py-32 text-center text-muted-foreground italic normal-case">
                   <div className="flex flex-col items-center gap-4 opacity-30">
                      <Inbox className="w-12 h-12" />
                      <p className="font-bold uppercase tracking-widest text-xs">Aucune candidature reçue pour le moment.</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {isModalOpen && selectedApp && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="relative w-full max-w-4xl bg-[#0d0d0d] border border-white/10 rounded-[64px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              >
                 <div className="w-full md:w-80 bg-gradient-to-br from-[#111] to-[#0d0d0d] border-b md:border-b-0 md:border-r border-white/10 p-12 space-y-10 flex flex-col">
                    <div className="space-y-6 text-center">
                       <div className="w-32 h-32 mx-auto rounded-[48px] bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-black text-4xl text-primary shadow-2xl">
                          {selectedApp.candidate.user.firstName.charAt(0)}
                       </div>
                       <div>
                          <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none">{selectedApp.candidate.user.firstName}</h2>
                          <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{selectedApp.candidate.user.lastName}</h2>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-4 py-1.5 px-4 bg-primary/10 rounded-full border border-primary/20">{selectedApp.score}% Compatible</p>
                       </div>
                    </div>

                    <div className="space-y-6 flex-1">
                       <div className="space-y-4">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact</h4>
                         <div className="space-y-3">
                            <div className="flex items-center gap-3 text-xs font-bold text-white/70">
                               <Mail className="w-4 h-4 text-primary" />
                               <span className="truncate">{selectedApp.candidate.user.email}</span>
                            </div>
                            {candidateProfile?.location && (
                               <div className="flex items-center gap-3 text-xs font-bold text-white/70">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  {candidateProfile.location}
                               </div>
                            )}
                         </div>
                       </div>
                       
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Social</h4>
                          <div className="flex gap-2">
                             {candidateProfile?.linkedinUrl && (
                                <a href={candidateProfile.linkedinUrl} target="_blank" className="p-3 rounded-2xl bg-[#0077b5]/10 border border-[#0077b5]/20 text-[#0077b5] hover:scale-110 transition-transform">
                                   <Linkedin className="w-5 h-5" />
                                </a>
                             )}
                             {candidateProfile?.cvUrl && (
                               <a href={candidateProfile.cvUrl} target="_blank" className="flex-1 flex items-center justify-center gap-2 p-3 bg-primary/10 border border-primary/20 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                                  <FileText className="w-4 h-4" /> Curriculum
                               </a>
                             )}
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="w-full py-4 rounded-3xl bg-white/5 border border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all mt-auto"
                    >
                      Fermer le profil
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto hidden-scrollbar p-12 space-y-12">
                    {profileLoading ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50 grayscale">
                         <Loader2 className="w-10 h-10 animate-spin text-primary" />
                         <p className="font-black text-xs uppercase tracking-widest">Hydratation du profil...</p>
                      </div>
                    ) : (
                      <>
                        <section className="space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="w-1.5 h-8 bg-primary rounded-full" />
                              <h3 className="text-2xl font-black uppercase tracking-tight">Profil Professionnel</h3>
                           </div>
                           <h4 className="text-lg font-bold text-primary">{candidateProfile?.title || "Spécialiste"}</h4>
                           <p className="text-sm font-medium leading-relaxed text-white/60 bg-white/[0.02] p-8 rounded-[32px] border border-white/5 italic whitespace-pre-wrap">
                              "{candidateProfile?.summary || "Ce candidat n'a pas encore rédigé de présentation détaillée."}"
                           </p>
                        </section>

                        <section className="space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="w-1.5 h-8 bg-accent rounded-full" />
                              <h3 className="text-2xl font-black uppercase tracking-tight">Compétences & Expertise</h3>
                           </div>
                           <div className="flex flex-wrap gap-3">
                              {candidateProfile?.skills?.map(skill => (
                                 <span key={skill} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest group hover:border-primary/50 transition-all">
                                    {skill}
                                 </span>
                              ))}
                           </div>
                        </section>

                        <section className="space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="w-1.5 h-8 bg-white rounded-full" />
                              <h3 className="text-2xl font-black uppercase tracking-tight">Lettre de Motivation</h3>
                           </div>
                           <p className="text-sm font-medium leading-relaxed text-white/50 bg-white/[0.02] p-8 rounded-[32px] border border-white/5 whitespace-pre-wrap shadow-inner">
                              {selectedApp.coverLetter || "Aucune lettre de motivation transmise avec cette candidature."}
                           </p>
                        </section>
                      </>
                    )}
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Interview Modal */}
      <AnimatePresence>
        {isInterviewModalOpen && (
           <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsInterviewModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg glass rounded-[48px] border border-white/10 p-12 overflow-hidden shadow-2xl space-y-8"
              >
                 <div className="space-y-2 text-center">
                    <div className="w-20 h-20 mx-auto rounded-[28px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 shadow-xl shadow-purple-500/10">
                       <CalendarDays className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">Planifier un entretien</h2>
                    <p className="text-muted-foreground text-sm font-bold">Fixez une date et laissez un message au candidat</p>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Date & Heure</label>
                       <input 
                         type="datetime-local" 
                         value={interviewData.date}
                         onChange={(e) => setInterviewData({...interviewData, date: e.target.value})}
                         className="w-full px-8 py-5 rounded-[24px] bg-white/5 border border-white/10 focus:border-purple-400 outline-none font-bold text-sm text-white"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Message (Lien meeting, infos...)</label>
                       <textarea
                         value={interviewData.message}
                         onChange={(e) => setInterviewData({...interviewData, message: e.target.value})}
                         rows={4}
                         className="w-full px-8 py-6 rounded-[32px] bg-white/5 border border-white/10 focus:border-purple-400 outline-none font-medium text-sm text-white resize-none"
                         placeholder="Ex: Lien Google Meet: https://meet.google.com/..."
                       />
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setIsInterviewModalOpen(false)}
                      className="flex-1 py-5 rounded-3xl bg-white/5 border border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                    >
                      Annuler
                    </button>
                    <button 
                       onClick={handleInterviewSubmit}
                       disabled={!interviewData.date}
                       className="flex-[2] py-5 rounded-3xl bg-purple-600 text-white font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
                    >
                       Confirmer l'entretien
                    </button>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RecruiterJobApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="flex bg-[#0A0A0A] h-screen items-center justify-center">
         <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-12 h-12 text-primary animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing matching data...</p>
         </div>
      </div>
    }>
      <RecruiterJobApplicationsContent />
    </Suspense>
  );
}
