"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Building2, 
  MapPin, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  XCircle,
  History as HistoryIcon,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Application {
  id: string;
  status: 'PENDING' | 'REVIEWED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
  coverLetter?: string;
  score: number;
  createdAt: string;
  interviewDate?: string;
  interviewMessage?: string;
  jobOffer: {
    id: string;
    title: string;
    location: string;
    company: {
      name: string;
      logoUrl?: string;
    };
  };
}

const statusConfig = {
  PENDING: { label: "En attente", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: Clock },
  REVIEWED: { label: "Consulté", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: Eye },
  INTERVIEW: { label: "Entretien", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", icon: MessageSquare },
  ACCEPTED: { label: "Accepté", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", icon: CheckCircle2 },
  REJECTED: { label: "Refusé", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: XCircle },
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/applications/my");
      setApplications(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement de vos candidatures");
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => 
    app.jobOffer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.jobOffer.company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">Mes Postulations</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Suivi des <span className="text-gradient">Candidatures</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl font-medium leading-relaxed">
            Consultez l'historique de vos demandes et suivez votre progression dans le processus de recrutement de chaque entreprise.
          </p>
        </div>

        <div className="relative group min-w-[320px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher par poste ou entreprise..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-8 py-5 rounded-[24px] bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm transition-all shadow-xl"
          />
        </div>
      </div>

      {/* List of Applications */}
      <div className="grid grid-cols-1 gap-6">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
              className={`glass rounded-[40px] border transition-all cursor-pointer overflow-hidden group ${
                selectedApp?.id === app.id ? 'border-primary/50 ring-8 ring-primary/5 bg-white/[0.03]' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="p-8">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                  {/* Job & Company Info */}
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-4 group-hover:scale-105 transition-transform shrink-0">
                      {app.jobOffer.company.logoUrl ? (
                        <img src={app.jobOffer.company.logoUrl} alt={app.jobOffer.company.name} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black group-hover:text-primary transition-colors leading-tight mb-2 uppercase tracking-tight">{app.jobOffer.title}</h3>
                      <div className="flex flex-wrap items-center gap-5 text-sm font-bold text-muted-foreground">
                        <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary/50" /> {app.jobOffer.company.name}</span>
                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary/50" /> {app.jobOffer.location}</span>
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary/50" /> {format(new Date(app.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Match Score */}
                  <div className="flex items-center justify-between xl:justify-end gap-10">
                    <div className="text-right hidden sm:block px-8 border-r border-white/5">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Score Matching</div>
                      <div className={`text-2xl font-black ${
                        app.score >= 70 ? 'text-green-400' : app.score >= 40 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {app.score}%
                      </div>
                    </div>
                    
                    <div className={`px-8 py-4 rounded-2xl flex items-center gap-4 border ${statusConfig[app.status].bg} ${statusConfig[app.status].color} ${statusConfig[app.status].border} shadow-lg shadow-black/20`}>
                      {(() => {
                        const StatusIcon = statusConfig[app.status].icon;
                        return <StatusIcon className="w-6 h-6" />;
                      })()}
                      <span className="text-xs font-black uppercase tracking-widest">
                        {statusConfig[app.status].label}
                      </span>
                    </div>
                    
                    <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-500 ${selectedApp?.id === app.id ? 'rotate-90 bg-primary/10 border-primary/20' : ''}`}>
                      <ChevronRight className={`w-6 h-6 ${selectedApp?.id === app.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                </div>

                {/* Timeline & Feedback (Expanded View) */}
                <AnimatePresence>
                  {selectedApp?.id === app.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-12 pt-12 border-t border-white/5 space-y-16">
                        {/* Status Timeline */}
                        <div className="max-w-4xl mx-auto px-10 relative">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-12 text-center">Progression du recrutement</h4>
                          
                          <div className="flex items-center justify-between relative">
                            {/* Line Background */}
                            <div className="absolute left-10 right-10 h-1.5 bg-white/5 top-[24px] -translate-y-1/2 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${
                                  app.status === 'PENDING' ? 0 :
                                  app.status === 'REVIEWED' ? 33 :
                                  app.status === 'INTERVIEW' ? 66 : 100
                                }%` }}
                                className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
                              />
                            </div>

                            {['PENDING', 'REVIEWED', 'INTERVIEW', (app.status === 'REJECTED' ? 'REJECTED' : 'ACCEPTED')].map((step, idx) => {
                              const steps = ['PENDING', 'REVIEWED', 'INTERVIEW', (app.status === 'REJECTED' ? 'REJECTED' : 'ACCEPTED')];
                              const currentIndex = steps.indexOf(app.status);
                              const isStepPast = idx < currentIndex;
                              const isStepCurrent = app.status === step || (idx === 3 && (app.status === 'ACCEPTED' || app.status === 'REJECTED'));
                              const stepInfo = statusConfig[step as keyof typeof statusConfig];
                              const StepIcon = stepInfo.icon;

                              return (
                                <div key={idx} className="relative z-10 flex flex-col items-center gap-4">
                                  <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center border-2 transition-all duration-700 shadow-2xl ${
                                    isStepCurrent ? `${stepInfo.bg} ${stepInfo.border} ${stepInfo.color} scale-125 ring-8 ring-white/5` :
                                    isStepPast ? 'bg-primary border-primary text-primary-foreground' : 'bg-[#0A0A0B] border-white/10 text-muted-foreground'
                                  }`}>
                                    <StepIcon className="w-5 h-5" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${isStepCurrent ? stepInfo.color : 'text-muted-foreground/30'}`}>
                                    {stepInfo.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Additional Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-4">

                          {/* Interview Banner — visible only when status is INTERVIEW */}
                          {app.status === 'INTERVIEW' && app.interviewDate && (
                            <div className="lg:col-span-3">
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8 rounded-[28px] bg-green-500/10 border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.08)]"
                              >
                                <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
                                  <Calendar className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-green-500/70 mb-2">Entretien Planifié</p>
                                  <p className="text-xl font-black text-green-400">
                                    📅 Le {format(new Date(app.interviewDate), 'EEEE dd MMMM yyyy', { locale: fr })} à {format(new Date(app.interviewDate), 'HH:mm', { locale: fr })}
                                  </p>
                                  {app.interviewMessage && (
                                    <p className="mt-3 text-sm text-green-300/80 font-medium leading-relaxed border-l-2 border-green-500/30 pl-4">
                                      {app.interviewMessage}
                                    </p>
                                  )}
                                </div>
                                <div className="shrink-0 px-6 py-3 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" /> Confirmé
                                </div>
                              </motion.div>
                            </div>
                          )}

                          <div className="lg:col-span-2 glass p-8 rounded-[32px] border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3 mb-6">
                              <MessageSquare className="w-4 h-4 text-primary" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Votre Message d'Accompagnement</h4>
                            </div>
                            <div className="relative pl-6 border-l-2 border-primary/20">
                              <p className="text-base text-muted-foreground leading-relaxed italic font-medium">
                                "{app.coverLetter || "Vous n'avez pas ajouté de lettre de motivation pour cette candidature."}"
                              </p>
                            </div>
                          </div>
                          
                          <div className="glass p-8 rounded-[32px] border border-white/5 bg-gradient-to-br from-primary/5 to-transparent flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5">
                               <HistoryIcon className="w-8 h-8" />
                            </div>
                            <h5 className="text-sm font-black uppercase tracking-widest text-white mb-2">Activité</h5>
                            <p className="text-xs text-muted-foreground font-bold tracking-wide">
                              Mise à jour le {format(new Date(app.createdAt), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[48px] border border-dashed border-white/10 bg-white/[0.01]">
            <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground/20 mb-8">
              <HistoryIcon className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Aucun résultat</h3>
            <p className="text-muted-foreground max-w-sm font-medium text-lg">
              Vous n'avez pas encore postulé à des offres. Explorer nos opportunités maintenant !
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-10 px-12 py-5 bg-primary text-primary-foreground rounded-[24px] font-black uppercase tracking-widest text-sm shadow-[0_10px_40px_rgba(var(--primary-rgb),0.3)] transition-all"
            >
              Voir les offres
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
