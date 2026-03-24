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
  MoreVertical,
  X,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jobService } from "@/services/job.service";
import { companyService } from "@/services/company.service";
import { toast } from "sonner";

const CONTRACT_TYPES = ["CDI", "CDD", "INTERNSHIP", "FREELANCE", "PART_TIME"];
const EMPTY_FORM = {
  title: "",
  description: "",
  location: "",
  contractType: "CDI",
  salaryMin: 0,
  salaryMax: 0,
  skills: [] as string[],
  companyId: "",
  isPublished: false,
};

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsData, companiesData] = await Promise.all([
        jobService.getRecruiterJobs(),
        companyService.getAll()
      ]);
      setJobs(jobsData);
      setCompanies(companiesData);
      if (companiesData.length > 0 && !form.companyId) {
        setForm(prev => ({ ...prev, companyId: companiesData[0].id }));
      }
    } catch (error) {
      toast.error("Erreur lors de la récupération des données");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingJob(null);
    setForm({ ...EMPTY_FORM, companyId: companies[0]?.id || "" });
    setShowModal(true);
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      description: job.description,
      location: job.location,
      contractType: job.contractType,
      salaryMin: job.salaryMin || 0,
      salaryMax: job.salaryMax || 0,
      skills: job.skills || [],
      companyId: job.companyId,
      isPublished: job.isPublished,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await jobService.deleteJob(id);
      toast.success("Offre supprimée");
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
      toast.success(updated.isPublished ? "Offre publiée" : "Offre retirée");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingJob) {
        await jobService.updateJob(editingJob.id, form);
        toast.success("Offre mise à jour");
      } else {
        await jobService.createJob(form);
        toast.success("Offre créée");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills.filter(s => s !== skill) });
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && jobs.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0a0a0a] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Mes Offres d'Emploi</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-1">Gérer vos publications et candidatures</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Publier une Offre
        </button>
      </div>

      {/* Filters/Search */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Rechercher une offre ou un lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-[32px] border border-white/5 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Offre</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type/Lieu</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Candidatures</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm uppercase font-bold text-center">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black tracking-tight">{job.title}</p>
                        <p className="text-[10px] text-muted-foreground">{job.company.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-left">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {job.contractType}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-left">
                    <button 
                      onClick={() => handleTogglePublish(job)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                        job.isPublished 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}
                    >
                      {job.isPublished ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {job.isPublished ? 'PUBLIÉE' : 'BROUILLON'}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                       <span className="text-xl font-black text-primary">{job._count?.applications || 0}</span>
                       <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(job)} className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setShowDeleteConfirm(job.id)} className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic normal-case">
                   Aucune offre trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    {editingJob ? "Modifier l'Offre" : "Nouvelle Offre"}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Titre de l'Offre</label>
                      <input 
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all font-bold"
                        placeholder="ex: Développeur Fullstack React/Node"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Lieu</label>
                       <input 
                         required
                         value={form.location}
                         onChange={(e) => setForm({ ...form, location: e.target.value })}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all font-bold"
                         placeholder="ex: Paris, Remote..."
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type de Contrat</label>
                    <select 
                      value={form.contractType}
                      onChange={(e) => setForm({ ...form, contractType: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all font-bold appearance-none"
                    >
                      {CONTRACT_TYPES.map(t => <option key={t} value={t} className="bg-[#111]">{t}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Salaire Min (€)</label>
                      <input 
                        type="number"
                        value={form.salaryMin}
                        onChange={(e) => setForm({ ...form, salaryMin: Number(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Salaire Max (€)</label>
                      <input 
                        type="number"
                        value={form.salaryMax}
                        onChange={(e) => setForm({ ...form, salaryMax: Number(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Compétences</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {form.skills.map(s => (
                        <span key={s} className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-xl border border-primary/20 flex items-center gap-2">
                          {s}
                          <button type="button" onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all font-bold"
                        placeholder="Ajouter une compétence..."
                      />
                      <button type="button" onClick={addSkill} className="px-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                         <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                    <textarea 
                      required
                      rows={5}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all font-bold resize-none"
                      placeholder="Décrivez les missions et le profil recherché..."
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                     <input 
                       type="checkbox"
                       id="publish"
                       checked={form.isPublished}
                       onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                       className="w-5 h-5 rounded-lg accent-primary cursor-pointer"
                     />
                     <label htmlFor="publish" className="text-xs font-bold uppercase tracking-widest cursor-pointer">Publier immédiatement</label>
                  </div>

                  <button 
                    disabled={submitting}
                    className="w-full bg-primary text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingJob ? "Enregistrer les modifications" : "Créer l'Offre"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-[40px] p-8 shadow-2xl text-center"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Suppression</h2>
              <p className="text-muted-foreground text-sm font-bold mb-8">Voulez-vous vraiment supprimer cette offre d'emploi ? Cette action est irréversible.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 hover:scale-105 transition-all"
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
