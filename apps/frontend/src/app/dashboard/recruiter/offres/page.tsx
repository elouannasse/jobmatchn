"use client";

import { useEffect, useState } from "react";
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  MoreVertical,
  Calendar,
  AlertCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jobService } from "@/services/job.service";
import { toast } from "sonner";
import Link from "next/link";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getRecruiterJobs();
      setJobs(data);
    } catch (error) {
      toast.error("Échec de la récupération des offres");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await jobService.deleteJob(id);
      toast.success("Offre supprimée avec succès");
      setJobs(jobs.filter(j => j.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleTogglePublish = async (job: any) => {
    try {
      const updated = await jobService.updateJob(job.id, { isPublished: !job.isPublished });
      setJobs(jobs.map(j => j.id === job.id ? { ...j, isPublished: updated.isPublished } : j));
      toast.success(updated.isPublished ? "Offre publiée" : "Offre retirée des publications");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && jobs.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0a0a0a] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Mes Offres d'Emploi</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Gérez vos publications et suivez l'activité</p>
        </div>
        <Link 
          href="/dashboard/recruiter/offres/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Créer une Offre
        </Link>
      </div>

      {/* Info Message */}
      <div className="mb-8 glass p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center gap-4 text-blue-400">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-xs font-bold uppercase tracking-widest">
          Les offres publiées nécessitent une validation par l'administrateur avant d'être visibles pour les candidats.
        </p>
      </div>

      {/* Filters/Search */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Rechercher par titre ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-blue-500/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="glass rounded-[32px] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Titre / Rôle</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Infos</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Publication</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Approbation</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Candidats</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm tracking-tight truncate mb-0.5">{job.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black truncate">{job.company.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {job.contractType}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground opacity-60">
                      <Calendar className="w-3 h-3" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-6 font-bold uppercase tracking-widest">
                    <button 
                      onClick={() => handleTogglePublish(job)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black transition-all ${
                        job.isPublished 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-white/5 text-muted-foreground border border-white/10'
                      }`}
                    >
                      {job.isPublished ? <CheckCircle2 className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                      {job.isPublished ? 'PUBLIÉE' : 'BROUILLON'}
                    </button>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      {job.approvalStatus === 'PENDING' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> En attente ⏳
                        </span>
                      )}
                      {job.approvalStatus === 'APPROVED' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-black uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> Approuvée ✅
                        </span>
                      )}
                      {job.approvalStatus === 'REJECTED' && (
                        <div className="relative group/reason">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-black uppercase tracking-widest cursor-help">
                            <XCircle className="w-3 h-3" /> Rejetée ❌
                          </span>
                          {job.rejectedReason && (
                            <div className="absolute left-0 bottom-full mb-2 w-48 p-3 rounded-xl bg-[#111] border border-white/10 shadow-2xl opacity-0 group-hover/reason:opacity-100 transition-opacity pointer-events-none z-10">
                              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Raison du refus :</p>
                              <p className="text-[10px] font-bold text-white leading-relaxed">{job.rejectedReason}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col items-center">
                       <span className="text-xl font-black text-blue-400">{job._count?.applications || 0}</span>
                       <span className="text-[8px] font-black uppercase opacity-40">Candidats</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/dashboard/recruiter/candidatures?jobId=${job.id}`}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 transition-all tooltip"
                        title="Voir les candidatures"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => toast.info("Édition bientôt disponible sur cette page")}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(job.id)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground opacity-20">
                      <Briefcase className="w-16 h-16" />
                      <p className="text-sm font-black uppercase tracking-widest">Aucune offre trouvée</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-[40px] p-8 shadow-2xl text-center"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Suppression</h2>
              <p className="text-muted-foreground text-sm font-bold mb-8 leading-relaxed">Voulez-vous vraiment supprimer cette offre ? Tous les candidats liés ne pourront plus y accéder.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
