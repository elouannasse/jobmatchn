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
  User as UserIcon
} from "lucide-react";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { ApplicationTable } from "@/components/dashboard/application-table";
import { toast } from "sonner";

export default function RecruiterDashboard() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await applicationService.updateStatus(id, newStatus);
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
      toast.success("Statut mis à jour");
    } catch (error) {
      toast.error("Échec de la mise à jour");
    }
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
                onStatusChange={handleStatusUpdate}
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
    </div>
  );
}
