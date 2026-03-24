"use client";

import { useState, useEffect } from "react";
import { applicationService, RecruiterApplication } from "@/services/application.service";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  List, 
  Search, 
  Filter, 
  Settings,
  CheckCircle2,
  Clock,
  ArrowRight,
  User as UserIcon,
  Plus,
  X,
  Briefcase,
  MapPin,
  Loader2,
  AlertCircle
} from "lucide-react";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { ApplicationTable } from "@/components/dashboard/application-table";
import { CandidateProfileModal } from "@/components/dashboard/candidate-profile-modal";
import { InterviewScheduleModal } from "@/components/dashboard/interview-schedule-modal";
import { toast } from "sonner";
import { jobService } from "@/services/job.service";
import { companyService } from "@/services/company.service";
import Link from "next/link";

export default function RecruiterDashboard() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<RecruiterApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Interview modal states
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [pendingInterviewChange, setPendingInterviewChange] = useState<{ id: string; status: string } | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getRecruiterApplications();
      setApplications(data);
    } catch (error) {
      toast.error("Échec du chargement des candidatures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const data = await companyService.getAll();
    setCompanies(data);
  };

  const handleStatusUpdate = async (id: string, newStatus: string, detail?: { date?: string; time?: string; message?: string }) => {
    const previousApplications = [...applications];
    const interviewDate = detail?.date && detail?.time ? `${detail.date}T${detail.time}:00` : undefined;
    
    // Optimistic Update
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus, interviewDate, interviewMessage: detail?.message } : app
    ));
    setSelectedApplication(prev => prev && prev.id === id ? { ...prev, status: newStatus, interviewDate, interviewMessage: detail?.message } : prev);

    try {
      await applicationService.updateStatus(id, newStatus, interviewDate, detail?.message);
      toast.success(newStatus === 'INTERVIEW' ? "Entretien planifié ✨" : "Statut mis à jour ✨");
      setIsInterviewModalOpen(false);
      setPendingInterviewChange(null);
    } catch (error) {
      // Revert if error
      setApplications(previousApplications);
      setSelectedApplication(previousApplications.find(a => a.id === id) || null);
      toast.error("Échec de la mise à jour");
    } finally {
      setIsScheduling(false);
    }
  };

  const onStatusChangeRequest = (id: string, newStatus: string) => {
    if (newStatus === "INTERVIEW") {
      setPendingInterviewChange({ id, status: newStatus });
      setIsInterviewModalOpen(true);
    } else {
      handleStatusUpdate(id, newStatus);
    }
  };

  const handleCardClick = (app: RecruiterApplication) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  const filteredApplications = applications.filter(app => {
    const fullName = `${app.candidate.user.firstName} ${app.candidate.user.lastName}`.toLowerCase();
    const jobTitle = app.jobOffer.title.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || jobTitle.includes(searchLower);
  });

  const stats = [
    { label: "Total Candidats", value: applications.length, icon: UserIcon, color: "text-blue-400" },
    { label: "En Attente", value: applications.filter(a => a.status === "PENDING").length, icon: Clock, color: "text-yellow-400" },
    { label: "Entretiens", value: applications.filter(a => a.status === "INTERVIEW").length, icon: ArrowRight, color: "text-purple-400" },
    { label: "Acceptés", value: applications.filter(a => a.status === "ACCEPTED").length, icon: CheckCircle2, color: "text-green-400" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white pb-20">
      {/* Header Section */}
      <div className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Tableau de bord</h1>
              <p className="text-muted-foreground">Gérez vos candidatures et recrues au même endroit.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setView("kanban")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  view === "kanban" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Kanban
              </button>
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  view === "list" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                }`}
              >
                <List className="w-4 h-4" /> Liste
              </button>
            </div>

            <Link
              href="/dashboard/recruiter/offres/create"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Créer une Offre
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-[32px] border border-white/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-black mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un candidat ou un poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-sm">
              <Filter className="w-4 h-4" /> Filtres
            </button>
            <button className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === "kanban" ? (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <KanbanBoard 
                applications={filteredApplications} 
                onStatusChange={onStatusChangeRequest}
                onCardClick={handleCardClick}
                loading={loading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <ApplicationTable 
                applications={filteredApplications} 
                onStatusChange={handleStatusUpdate}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Candidate Profile Modal */}
      <CandidateProfileModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={onStatusChangeRequest}
      />

      {/* Interview Schedule Modal */}
      <InterviewScheduleModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onConfirm={(date, time, message) => {
          if (pendingInterviewChange) {
            setIsScheduling(true);
            handleStatusUpdate(pendingInterviewChange.id, pendingInterviewChange.status, { date, time, message });
          }
        }}
        loading={isScheduling}
        candidateName={
          (() => {
            const app = applications.find(a => a.id === pendingInterviewChange?.id);
            return app ? `${app.candidate.user.firstName} ${app.candidate.user.lastName}` : "";
          })()
        }
      />
    </div>
  );
}
