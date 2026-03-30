"use client";

import { useState, useEffect } from "react";
import { adminService, GlobalStats, GrowthData } from "@/services/admin.service";
import { jobService } from "@/services/job.service";
import { companyService, Company, CreateCompanyDto } from "@/services/company.service";
import { applicationService } from "@/services/application.service";
import { candidateService, CreateCandidateDto, Candidate } from "@/services/candidate.service";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Users, 
  Briefcase, 
  Building2, 
  FileText, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  Loader2,
  Plus,
  X,
  UserPlus,
  RefreshCw,
  Clock,
  Trophy,
  ShieldAlert,
  UserCheck,
  Globe,
  MapPin,
  Sparkles
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { toast } from "sonner";

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

const EMPTY_FORM: CreateCandidateDto = {
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  title: "",
  summary: "",
  location: "",
  skills: [],
  linkedinUrl: "",
  cvUrl: "",
};

const EMPTY_JOB_FORM = {
  companyId: "",
  title: "",
  description: "",
  location: "",
  contractType: "CDI",
  salaryMin: 0,
  salaryMax: 0,
  skills: [] as string[],
};

const EMPTY_APPLICATION_FORM = {
  jobOfferId: "",
  candidateId: "",
  coverLetter: "",
  status: "PENDING",
};

const EMPTY_COMPANY_FORM: CreateCompanyDto = {
  name: "",
  industry: "",
  location: "",
  website: "",
  description: "",
  logoUrl: "",
};

const MOCK_ACTIVITIES = [
  {
    id: "1",
    type: "CANDIDATE",
    title: "Nouveau candidat inscrit",
    description: "Elouan Nasse vient de rejoindre la plateforme",
    time: "Il y a 2 minutes",
    icon: UserPlus,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    id: "2",
    type: "JOB",
    title: "Nouvelle offre publiée",
    description: "Développeur Fullstack @ Google (Mountain View)",
    time: "Il y a 15 minutes",
    icon: Briefcase,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    id: "3",
    type: "APPLICATION",
    title: "Statut de candidature mis à jour",
    description: "Jean Dupont -> Entretien (Développeur React)",
    time: "Il y a 1 heure",
    icon: RefreshCw,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    id: "4",
    type: "COMPANY",
    title: "Nouvelle entreprise partenaire",
    description: "Airbus Defence & Space a rejoint le réseau",
    time: "Il y a 3 heures",
    icon: Building2,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
];

const MOCK_TOP_COMPANIES = [
  { name: "Google", sector: "Technologie", offers: 42, color: "from-blue-600 to-blue-400" },
  { name: "Airbus", sector: "Aéronautique", offers: 35, color: "from-blue-900 to-blue-700" },
  { name: "LVMH", sector: "Luxe", offers: 28, color: "from-gray-900 to-gray-600" },
  { name: "Société Générale", sector: "Banque", offers: 21, color: "from-red-600 to-red-400" },
  { name: "Capgemini", sector: "Conseil", offers: 18, color: "from-blue-500 to-cyan-400" },
];

const MOCK_ALERTS = [
  { id: 1, type: "PENDING", title: "Candidatures", count: 12, text: "à réviser", icon: FileText, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { id: 2, type: "INACTIVE", title: "Offres", count: 5, text: "inactives", icon: Briefcase, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
  { id: 3, type: "NEW", title: "Inscriptions", count: 8, text: "aujourd'hui", icon: UserPlus, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
];

const CONTRACT_TYPES = ["CDI", "CDD", "INTERNSHIP", "FREELANCE", "PART_TIME"];
const APPLICATION_STATUSES = ["PENDING", "REVIEWING", "INTERVIEWED", "ACCEPTED", "REJECTED"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [growth, setGrowth] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("6 derniers mois");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateCandidateDto>(EMPTY_FORM);
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Job Modal state
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);
  const [jobSkillInput, setJobSkillInput] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);

  // Application Modal state
  const [isAddApplicationModalOpen, setIsAddApplicationModalOpen] = useState(false);
  const [applicationForm, setApplicationForm] = useState(EMPTY_APPLICATION_FORM);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  // Company Modal state
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyForm, setCompanyForm] = useState<CreateCompanyDto>(EMPTY_COMPANY_FORM);

  // Recruiter Modal state (UI only for now)
  const [isAddRecruiterModalOpen, setIsAddRecruiterModalOpen] = useState(false);
  const [pendingRecruiters, setPendingRecruiters] = useState<any[]>([]);
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isApprovingJob, setIsApprovingJob] = useState<string | null>(null);

  // Real data for widgets
  const [topCompanies, setTopCompanies] = useState<{ name: string; sector: string; offers: number }[]>([]);
  const [recentActivities, setRecentActivities] = useState<{ id: string; icon: any; bg: string; color: string; title: string; description: string; time: string }[]>([]);
  const [perfPrecision, setPerfPrecision] = useState(0);
  const [perfImpact, setPerfImpact] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, companiesData, candidatesData, jobsData, growthData, pendingData, pendingJobsData] = await Promise.all([
          adminService.getGlobalStats(),
          companyService.getAll(),
          candidateService.getAll(),
          jobService.getAllJobsAdmin(),
          adminService.getGrowthData(),
          adminService.getUsersByRole("RECRUITER", false),
          adminService.getPendingJobs(),
        ]);
        setStats(statsData);
        setCompanies(companiesData);
        setCandidates(candidatesData);
        setJobs(jobsData);
        setGrowth(growthData);
        setPendingRecruiters(pendingData);
        setPendingJobs(pendingJobsData);

        console.log("📈 Growth Data (Users per month):", growthData);
        console.log("📊 Global Stats:", statsData);

        // --- TOP COMPANIES: count jobs per company ---
        const companiesWithOffers = companiesData
          .map((c: Company) => ({
            name: c.name,
            sector: c.industry || "Non renseigné",
            offers: (jobsData as any[]).filter((j: any) => j.companyId === c.id || j.company?.id === c.id).length,
          }))
          .sort((a: any, b: any) => b.offers - a.offers)
          .slice(0, 5);
        setTopCompanies(companiesWithOffers);

        // --- RECENT ACTIVITIES: mix candidates + jobs + applications ---
        const allApplications: any[] = await applicationService.getAllApplicationsAdmin().catch(() => []);

        const activities: typeof recentActivities = [];

        // Recent candidates (last 5)
        const recentCandidates = [...candidatesData]
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        recentCandidates.forEach((c: any) => {
          activities.push({
            id: `cand-${c.id}`,
            icon: UserPlus,
            bg: "bg-blue-400/10",
            color: "text-blue-400",
            title: "Nouveau candidat inscrit",
            description: `${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""} a rejoint la plateforme`,
            time: new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
          });
        });

        // Recent jobs (last 3)
        const recentJobs = [...(jobsData as any[])]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        recentJobs.forEach((j: any) => {
          activities.push({
            id: `job-${j.id}`,
            icon: Briefcase,
            bg: "bg-purple-400/10",
            color: "text-purple-400",
            title: "Nouvelle offre publiée",
            description: `${j.title} @ ${j.company?.name ?? "Entreprise"}`,
            time: new Date(j.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
          });
        });

        // Recent applications (last 3)
        const recentApps = [...allApplications]
          .sort((a: any, b: any) => new Date(b.createdAt ?? b.updatedAt).getTime() - new Date(a.createdAt ?? a.updatedAt).getTime())
          .slice(0, 3);
        recentApps.forEach((app: any) => {
          activities.push({
            id: `app-${app.id}`,
            icon: RefreshCw,
            bg: "bg-orange-400/10",
            color: "text-orange-400",
            title: "Candidature mise à jour",
            description: `${app.candidate?.user?.firstName ?? "Candidat"} → ${app.status} (${app.jobOffer?.title ?? "Offre"})`,
            time: new Date(app.updatedAt ?? app.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
          });
        });

        // Sort all activities by ISO date desc and keep top 5
        setRecentActivities(activities.slice(0, 5));

        // --- PERFORMANCE: compute from application scores ---
        if (allApplications.length > 0) {
          const jobSkillsMap: Record<string, string[]> = {};
          (jobsData as any[]).forEach(j => {
            jobSkillsMap[j.id] = j.skills || [];
          });

          const scores = allApplications.map((app: any) => {
            let score = Number(app.score ?? 0);
            
            // Recalculate if score is 0
            if (score === 0) {
              const candSkills = app.candidate?.skills || [];
              const jobSkills = jobSkillsMap[app.jobOfferId] || app.jobOffer?.skills || [];
              
              if (candSkills.length > 0 && jobSkills.length > 0) {
                const matches = candSkills.filter((s: string) => 
                  jobSkills.some((js: string) => js.toLowerCase() === s.toLowerCase())
                ).length;
                score = Math.round((matches / jobSkills.length) * 100);
              }
            }
            return score;
          });

          const totalScore = scores.reduce((acc, s) => acc + s, 0);
          const precision = Math.round(totalScore / allApplications.length);
          
          const impactCount = allApplications.filter((a: any) => 
            ["ACCEPTED", "INTERVIEW", "INTERVIEWED"].includes(a.status)
          ).length;
          
          const impact = Math.round((impactCount / allApplications.length) * 100);
          
          setPerfPrecision(precision);
          setPerfImpact(impact);
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // We only support real '6 derniers mois' for now based on backend logic
    adminService.getGrowthData().then(data => {
      setGrowth(data);
      console.log("🔄 Chart Refreshed:", data);
    }).catch(console.error);
  }, [selectedPeriod]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skills?.includes(trimmed)) {
      setForm(prev => ({ ...prev, skills: [...(prev.skills || []), trimmed] }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setForm(prev => ({ ...prev, skills: prev.skills?.filter(s => s !== skill) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await candidateService.create(form);
      toast.success("Candidat créé avec succès !");
      setShowModal(false);
      setForm(EMPTY_FORM);
      setSkillInput("");
      // Refresh stats
      const statsData = await adminService.getGlobalStats();
      setStats(statsData);
    } catch {
      toast.error("Erreur lors de la création du candidat");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.companyId) {
      toast.error("Veuillez sélectionner une entreprise");
      return;
    }
    setSubmitting(true);
    try {
      await jobService.createJob(jobForm);
      toast.success("Offre créée avec succès !");
      setShowJobModal(false);
      setJobForm(EMPTY_JOB_FORM);
      setJobSkillInput("");
      // Refresh stats
      const statsData = await adminService.getGlobalStats();
      setStats(statsData);
    } catch (error: any) {
      const message = error.response?.data?.message || "Erreur lors de la création de l'offre";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await companyService.create(companyForm);
      toast.success("Entreprise créée avec succès !");
      setShowCompanyModal(false);
      setCompanyForm(EMPTY_COMPANY_FORM);
      // Refresh stats and companies list
      const [statsData, companiesData] = await Promise.all([
        adminService.getGlobalStats(),
        companyService.getAll(),
      ]);
      setStats(statsData);
      setCompanies(companiesData);
    } catch {
      toast.error("Erreur lors de la création de l'entreprise");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationForm.candidateId || !applicationForm.jobOfferId) {
      toast.error("Veuillez sélectionner un candidat et une offre");
      return;
    }
    setSubmitting(true);
    try {
      await applicationService.apply(applicationForm);
      toast.success("Candidature créée avec succès !");
      setIsAddApplicationModalOpen(false);
      setApplicationForm(EMPTY_APPLICATION_FORM);
      // Refresh stats
      const statsData = await adminService.getGlobalStats();
      setStats(statsData);
    } catch (error: any) {
      const message = error.response?.data?.message || "Erreur lors de la création de la candidature";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddJobSkill = () => {
    const trimmed = jobSkillInput.trim();
    if (trimmed && !jobForm.skills.includes(trimmed)) {
      setJobForm(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setJobSkillInput("");
    }
  };

  const handleRemoveJobSkill = (skill: string) => {
    setJobForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleApproveRecruiter = async (userId: string) => {
    setIsApproving(userId);
    try {
      await adminService.approveRecruiter(userId);
      toast.success("Recruteur approuvé !");
      // Refresh data
      setPendingRecruiters(prev => prev.filter(r => r.id !== userId));
      const statsData = await adminService.getGlobalStats();
      setStats(statsData);
    } catch {
      toast.error("Erreur lors de l'approbation");
    } finally {
      setIsApproving(null);
    }
  };

  const handleRejectRecruiter = async (userId: string) => {
    const reason = window.prompt("Raison du refus :");
    if (reason === null) return;

    setIsApproving(userId);
    try {
      await adminService.rejectRecruiter(userId, reason || "Non spécifié");
      toast.success("Recruteur refusé");
      // Refresh data
      setPendingRecruiters(prev => prev.filter(r => r.id !== userId));
      const statsData = await adminService.getGlobalStats();
      setStats(statsData);
    } catch {
      toast.error("Erreur lors du refus");
    } finally {
      setIsApproving(null);
    }
  };

  const handleApproveJob = async (id: string) => {
    setIsApprovingJob(id);
    try {
      await adminService.approveJob(id);
      toast.success("Offre approuvée !");
      setPendingJobs(prev => prev.filter(j => j.id !== id));
      const statsData = await adminService.getGlobalStats();
      setStats(statsData);
    } catch {
      toast.error("Erreur lors de l'approbation");
    } finally {
      setIsApprovingJob(null);
    }
  };

  const handleRejectJob = async (id: string) => {
    const reason = window.prompt("Raison du refus :");
    if (reason === null) return;

    setIsApprovingJob(id);
    try {
      await adminService.rejectJob(id, reason || "Non spécifié");
      toast.success("Offre refusée");
      setPendingJobs(prev => prev.filter(j => j.id !== id));
      const statsData = await adminService.getGlobalStats();
      setStats(statsData);
    } catch {
      toast.error("Erreur lors du refus");
    } finally {
      setIsApprovingJob(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const statCards = [
    { 
      label: `Candidats: ${(stats?.totalCandidates || 0).toLocaleString()}`, 
      value: stats?.totalCandidates, 
      icon: Users, 
      trend: "+12%", 
      color: "text-blue-400",
      manage: "/dashboard/admin/candidates",
      action: { label: "Ajouter", onClick: () => setShowModal(true) },
    },
    { 
      label: `Offres: ${(stats?.totalJobs || 0).toLocaleString()}`, 
      value: stats?.totalJobs, 
      icon: Briefcase, 
      trend: "+5%", 
      color: "text-purple-400", 
      manage: "/dashboard/admin/jobs",
      action: { label: "Ajouter", onClick: () => setShowJobModal(true) },
    },
    { 
      label: `Candidatures: ${(stats?.totalApplications || 0).toLocaleString()}`, 
      value: stats?.totalApplications, 
      icon: FileText, 
      trend: "+18%", 
      color: "text-pink-400", 
      manage: "/dashboard/admin/applications",
      action: { label: "Ajouter", onClick: () => setIsAddApplicationModalOpen(true) },
    },
    { 
      label: `Entreprises: ${(stats?.totalCompanies || 0).toLocaleString()}`, 
      value: stats?.totalCompanies, 
      icon: Building2, 
      trend: "+2%", 
      color: "text-orange-400", 
      manage: "/dashboard/admin/companies",
      action: { label: "Ajouter", onClick: () => setShowCompanyModal(true) },
    },
    { 
      label: `Recruteurs: ${(stats?.totalRecruiters || 0).toLocaleString()}`, 
      value: stats?.totalRecruiters || 0, 
      icon: Briefcase, 
      trend: "+8%", 
      color: "text-purple-400", 
      manage: "/dashboard/admin/recruteurs",
      action: { label: "Ajouter", onClick: () => setIsAddRecruiterModalOpen(true) },
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-4">
            Plateforme <span className="text-primary italic">Overview</span>
          </h1>
          <p className="text-muted-foreground font-medium">Analyse globale de l&apos;écosystème JobMatchn</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
          <Activity className="w-5 h-5 text-green-400 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Système Opérationnel</span>
        </div>
      </div>

      {/* Alerts Ribbon */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-4 mb-10"
      >
        {stats?.totalPendingRecruiters && stats.totalPendingRecruiters > 0 ? (
          <div 
            className={`flex-1 min-w-[250px] glass px-6 py-4 rounded-3xl border border-amber-400/50 bg-amber-400/5 flex items-center justify-between group cursor-pointer hover:bg-amber-400/10 transition-all`}
            onClick={() => {
              const el = document.getElementById('pending-recruiters');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-amber-400/20 text-amber-400 group-hover:scale-110 transition-transform`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Recruteurs</p>
                <p className="text-sm font-bold">
                  <span className="text-amber-400">{stats.totalPendingRecruiters}</span> en attente
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-amber-500 animate-bounce" />
          </div>
        ) : null}
        {stats?.totalPendingJobs && stats.totalPendingJobs > 0 ? (
          <div 
            className={`flex-1 min-w-[250px] glass px-6 py-4 rounded-3xl border border-orange-400/50 bg-orange-400/5 flex items-center justify-between group cursor-pointer hover:bg-orange-400/10 transition-all`}
            onClick={() => {
              const el = document.getElementById('pending-jobs');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-orange-400/20 text-orange-400 group-hover:rotate-12 transition-transform`}>
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Offres</p>
                <p className="text-sm font-bold">
                  <span className="text-orange-400">{stats.totalPendingJobs}</span> en validation
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-orange-500 animate-bounce" />
          </div>
        ) : null}
        {MOCK_ALERTS.map((alert) => (
          <div 
            key={alert.id}
            className={`flex-1 min-w-[250px] glass px-6 py-4 rounded-3xl border ${alert.border} flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${alert.bg} ${alert.color} group-hover:scale-110 transition-transform`}>
                <alert.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{alert.title}</p>
                <p className="text-sm font-bold">
                  <span className={alert.color}>{alert.count}</span> {alert.text}
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </div>
        ))}
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 rounded-[40px] border border-white/5 group hover:border-primary/20 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-green-400 text-sm font-bold">
                {card.trend} <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">{card.label}</h3>
            <p className="text-4xl font-black tracking-tighter mb-4">{card.value}</p>
            <div className="flex gap-2">
              {"manage" in card && card.manage && (
                <Link
                  href={card.manage as string}
                  className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all w-full"
                >
                  Gérer →
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass p-8 rounded-[48px] border border-white/5"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              Croissance Utilisateurs
            </h2>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold outline-none cursor-pointer hover:bg-white/10 transition-colors"
            >
              <option value="6 derniers mois" className="bg-[#0a0a0a]">6 derniers mois</option>
              <option disabled value="" className="bg-[#0a0a0a]">Autres périodes bientôt...</option>
            </select>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }} />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={4} dot={{ r: 6, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 8, stroke: 'rgba(59,130,246,0.5)', strokeWidth: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-[48px] border border-white/5 flex flex-col"
        >
          <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-tighter italic">Distribution Statuts</h2>
          <div className="flex-1 min-h-[300px] w-full mb-8 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="count"
                  stroke="none"
                >
                  {stats?.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black">{stats?.statusDistribution?.reduce((acc, curr) => acc + curr.count, 0)}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {stats?.statusDistribution.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">{item.status}</span>
                </div>
                <span className="text-xs font-black tracking-tighter">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer Widgets */}
      {pendingRecruiters.length > 0 && (
        <motion.div
          id="pending-recruiters"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 glass p-10 rounded-[48px] border border-amber-400/20 bg-amber-400/[0.02]"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Recruteurs en attente</h2>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Vérification manuelle requise</p>
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest leading-none">
              {pendingRecruiters.length} Nouveau{pendingRecruiters.length > 1 ? 'x' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRecruiters.map((recruiter) => (
              <div key={recruiter.id} className="glass p-6 rounded-[32px] border border-white/5 hover:border-amber-400/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-amber-500/20">
                      {recruiter.firstName.charAt(0)}{recruiter.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-sm">{recruiter.firstName} {recruiter.lastName}</h3>
                      <p className="text-[10px] text-muted-foreground font-medium">{recruiter.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Entreprise</p>
                      <p className="text-sm font-black text-primary">{recruiter.recruiterProfile?.company?.name || "Non renseigné"}</p>
                    </div>
                    {recruiter.recruiterProfile?.company?.website && (
                      <a 
                        href={recruiter.recruiterProfile.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <Sparkles className="w-2 h-2" /> Secteur
                      </p>
                      <p className="text-[10px] font-bold truncate">{recruiter.recruiterProfile?.company?.industry || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <MapPin className="w-2 h-2" /> Ville
                      </p>
                      <p className="text-[10px] font-bold truncate">{recruiter.recruiterProfile?.company?.location || "N/A"}</p>
                    </div>
                  </div>
                  
                  {recruiter.recruiterProfile?.company?.description && (
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Description</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{recruiter.recruiterProfile.company.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveRecruiter(recruiter.id)}
                    disabled={isApproving === recruiter.id}
                    className="flex-1 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                  >
                    {isApproving === recruiter.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                    Approuver
                  </button>
                  <button
                    onClick={() => handleRejectRecruiter(recruiter.id)}
                    disabled={isApproving === recruiter.id}
                    className="flex-1 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                  >
                    {isApproving === recruiter.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pending Jobs Section */}
      {pendingJobs.length > 0 && (
        <motion.div
          id="pending-jobs"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 glass p-10 rounded-[48px] border border-orange-400/20 bg-orange-400/[0.02]"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Offres en attente</h2>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Contrôle qualité requis</p>
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-black uppercase tracking-widest leading-none">
              {pendingJobs.length} Offre{pendingJobs.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Offre / Entreprise</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recruteur</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Détails</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                           <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{job.title}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase">{job.company?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-medium">
                      {job.recruiter?.user?.firstName} {job.recruiter?.user?.lastName}
                    </td>
                    <td className="px-6 py-6 text-[10px] font-bold text-muted-foreground">
                      {job.contractType} • {job.location}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApproveJob(job.id)}
                          disabled={isApprovingJob === job.id}
                          className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2"
                        >
                          {isApprovingJob === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approuver ✅"}
                        </button>
                        <button
                          onClick={() => handleRejectJob(job.id)}
                          disabled={isApprovingJob === job.id}
                          className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all flex items-center gap-2"
                        >
                          {isApprovingJob === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Rejeter ❌"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Performance Metrics */}
        <div className="glass p-8 rounded-[40px] border border-white/5 flex flex-col justify-between h-full group hover:border-primary/20 transition-all">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-black italic uppercase tracking-tighter">Performance</h3>
            </div>
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                <circle cx="64" cy="64" r="56" stroke="#3B82F6" strokeWidth="12" fill="transparent" 
                  strokeDasharray={351.8} strokeDashoffset={351.8 * (1 - perfPrecision / 100)}
                  strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{perfPrecision}%</span>
                <span className="text-[8px] font-black uppercase text-muted-foreground">Matching</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
            <div className="flex-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
               <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Précision</p>
               <p className="text-sm font-black text-gradient">{perfPrecision}%</p>
            </div>
            <div className="flex-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
               <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Impact</p>
               <p className="text-sm font-black text-gradient">{perfImpact}%</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="glass p-8 rounded-[40px] border border-white/5 group hover:border-orange-400/20 transition-all">
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 group-hover:rotate-12 transition-transform">
                 <Clock className="w-5 h-5 text-orange-400" />
               </div>
               <h3 className="text-lg font-black italic uppercase tracking-tighter">Activités</h3>
             </div>
             <button className="text-[8px] font-black uppercase tracking-widest text-primary hover:underline">Tout voir</button>
           </div>
           <div className="space-y-3">
             {recentActivities.length > 0 ? recentActivities.map((activity) => (
               <div key={activity.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all">
                  <div className={`w-10 h-10 rounded-xl ${activity.bg} flex items-center justify-center ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[11px] truncate">{activity.title}</h4>
                    <p className="text-[9px] text-muted-foreground truncate font-medium">{activity.description}</p>
                    <p className="text-[8px] text-muted-foreground/50 mt-0.5 font-medium">{activity.time}</p>
                  </div>
               </div>
             )) : (
               <p className="text-center text-muted-foreground text-xs py-8">Aucune activité récente</p>
             )}
           </div>
        </div>

        {/* Top Companies */}
        <div className="glass p-8 rounded-[40px] border border-white/5 group hover:border-blue-400/20 transition-all">
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform">
                 <Building2 className="w-5 h-5 text-blue-400" />
               </div>
               <h3 className="text-lg font-black italic uppercase tracking-tighter">Top Entreprises</h3>
             </div>
             <Trophy className="w-4 h-4 text-yellow-500" />
           </div>
           <div className="space-y-3">
             {topCompanies.length > 0 ? topCompanies.map((company, i) => {
               const gradients = [
                 "from-blue-600 to-blue-400",
                 "from-purple-600 to-purple-400",
                 "from-pink-600 to-pink-400",
                 "from-orange-600 to-orange-400",
                 "from-green-600 to-green-400",
               ];
               return (
                 <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all group/item">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white text-[10px] font-black shadow-lg`}>
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-[11px]">{company.name}</h4>
                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">{company.sector}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black group-hover/item:text-blue-400 transition-colors">{company.offers}</div>
                      <div className="text-[7px] font-black uppercase text-muted-foreground">Offres</div>
                    </div>
                 </div>
               );
             }) : (
               <p className="text-center text-muted-foreground text-xs py-8">Aucune entreprise</p>
             )}
           </div>
        </div>
      </div>

      {/* Add Candidate Modal */}
      <AnimatePresence>
        {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass border border-white/10 rounded-[40px] w-full max-w-[550px] max-h-[90vh] overflow-y-auto relative hidden-scrollbar z-[998]"
              >
              {/* Header */}
              <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-xl p-8 pb-4 border-b border-white/5 flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <UserPlus className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Nouveau Candidat</h2>
                    <p className="text-muted-foreground text-sm">Créer un profil candidat</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 pt-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        required
                        value={form.firstName}
                        onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                        placeholder="ex: Jean"
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        required
                        value={form.lastName}
                        onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                        placeholder="ex: Dupont"
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="candidat@email.com"
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Titre */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Titre / Poste
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="ex: Développeur Full Stack"
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Résumé */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Résumé
                    </label>
                    <textarea
                      value={form.summary}
                      onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
                      placeholder="Présentation du candidat..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-400/50 outline-none transition-all placeholder:text-muted-foreground/40 resize-none"
                    />
                  </div>

                  {/* Localisation */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Localisation
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                      placeholder="ex: Marrakech, Maroc"
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Compétences */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Compétences
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                        placeholder="ex: React, TypeScript..."
                        className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all font-bold"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.skills?.map(skill => (
                        <span
                          key={skill}
                          className="flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold"
                        >
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkill(skill)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={form.linkedinUrl}
                      onChange={e => setForm(p => ({ ...p, linkedinUrl: e.target.value }))}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* CV URL */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      CV URL
                    </label>
                    <input
                      type="url"
                      value={form.cvUrl}
                      onChange={e => setForm(p => ({ ...p, cvUrl: e.target.value }))}
                      placeholder="https://mon-cv.com/..."
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      {submitting ? "Création..." : "Créer"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Job Modal */}
      <AnimatePresence>
        {showJobModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={(e) => e.target === e.currentTarget && setShowJobModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass border border-white/10 rounded-[40px] w-full max-w-[550px] max-h-[90vh] overflow-y-auto relative hidden-scrollbar z-[998]"
              >
              <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-xl p-8 pb-4 border-b border-white/5 flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Nouvelle Offre</h2>
                    <p className="text-muted-foreground text-sm">Publier une offre d&apos;emploi</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 pt-0">
                <form onSubmit={handleSubmitJob} className="space-y-5">
                  {/* Entreprise */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Entreprise
                    </label>
                    <select
                      required
                      value={jobForm.companyId}
                      onChange={e => setJobForm(p => ({ ...p, companyId: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-400/50 outline-none transition-all cursor-pointer"
                    >
                      <option value="" className="bg-[#111]">Sélectionner une entreprise</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id} className="bg-[#111]">{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Titre */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Titre du poste
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.title}
                      onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="ex: Senior React Developer"
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      required
                      value={jobForm.description}
                      onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Détails du poste..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-400/50 outline-none transition-all placeholder:text-muted-foreground/40 resize-none"
                    />
                  </div>

                  {/* Localisation & Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Localisation
                      </label>
                      <input
                        type="text"
                        required
                        value={jobForm.location}
                        onChange={e => setJobForm(p => ({ ...p, location: e.target.value }))}
                        placeholder="ex: Casa / Remote"
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Type de contrat
                      </label>
                      <select
                        value={jobForm.contractType}
                        onChange={e => setJobForm(p => ({ ...p, contractType: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-400/50 outline-none transition-all cursor-pointer"
                      >
                        {CONTRACT_TYPES.map(type => (
                          <option key={type} value={type} className="bg-[#111]">{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Salaire */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Salaire Min
                      </label>
                      <input
                        type="number"
                        value={jobForm.salaryMin}
                        onChange={e => setJobForm(p => ({ ...p, salaryMin: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-400/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Salaire Max
                      </label>
                      <input
                        type="number"
                        value={jobForm.salaryMax}
                        onChange={e => setJobForm(p => ({ ...p, salaryMax: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-400/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Compétences */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Compétences requises
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={jobSkillInput}
                        onChange={e => setJobSkillInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddJobSkill())}
                        placeholder="ex: React, Node..."
                        className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                      />
                      <button
                        type="button"
                        onClick={handleAddJobSkill}
                        className="px-4 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all font-bold"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {jobForm.skills.map(skill => (
                        <span
                          key={skill}
                          className="flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold"
                        >
                          {skill}
                          <button type="button" onClick={() => handleRemoveJobSkill(skill)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowJobModal(false)}
                      className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {submitting ? "Publication..." : "Publier"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Application Modal */}
      <AnimatePresence>
        {isAddApplicationModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={(e) => e.target === e.currentTarget && setIsAddApplicationModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass border border-white/10 rounded-[40px] w-full max-w-[550px] max-h-[90vh] overflow-y-auto relative hidden-scrollbar z-[998]"
              >
              <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-xl p-8 pb-4 border-b border-white/5 flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20">
                    <FileText className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Nouvelle Candidature</h2>
                    <p className="text-muted-foreground text-sm">Inscrire un candidat à une offre</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddApplicationModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 pt-0">
                <form onSubmit={handleSubmitApplication} className="space-y-5">
                  {/* Candidat */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Candidat
                    </label>
                    <select
                      required
                      value={applicationForm.candidateId}
                      onChange={e => setApplicationForm(p => ({ ...p, candidateId: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-pink-400/50 outline-none transition-all cursor-pointer"
                    >
                      <option value="" className="bg-[#111]">Sélectionner un candidat</option>
                      {candidates.map(c => (
                        <option key={c.id} value={c.id} className="bg-[#111]">
                          {c.user?.firstName} {c.user?.lastName} ({c.user?.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Offre */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Offre d&apos;emploi
                    </label>
                    <select
                      required
                      value={applicationForm.jobOfferId}
                      onChange={e => setApplicationForm(p => ({ ...p, jobOfferId: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-pink-400/50 outline-none transition-all cursor-pointer"
                    >
                      <option value="" className="bg-[#111]">Sélectionner une offre</option>
                      {jobs.map(j => (
                        <option key={j.id} value={j.id} className="bg-[#111]">
                          {j.title} - {j.company?.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Statut initial
                    </label>
                    <select
                      value={applicationForm.status}
                      onChange={e => setApplicationForm(p => ({ ...p, status: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-pink-400/50 outline-none transition-all cursor-pointer"
                    >
                      {APPLICATION_STATUSES.map(status => (
                        <option key={status} value={status} className="bg-[#111]">{status}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lettre de motivation */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Lettre de motivation (optionnel)
                    </label>
                    <textarea
                      value={applicationForm.coverLetter}
                      onChange={e => setApplicationForm(p => ({ ...p, coverLetter: e.target.value }))}
                      placeholder="Motivation du candidat..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-pink-400/50 outline-none transition-all placeholder:text-muted-foreground/40 resize-none"
                    />
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddApplicationModalOpen(false)}
                      className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {submitting ? "Création..." : "Créer"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Enterprise Modal */}
      <AnimatePresence>
        {showCompanyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={(e) => e.target === e.currentTarget && setShowCompanyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass border border-white/10 rounded-[40px] w-full max-w-[550px] max-h-[90vh] overflow-y-auto relative hidden-scrollbar z-[998]"
            >
              {/* Header */}
              <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-xl p-8 pb-4 border-b border-white/5 flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                    <Building2 className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Nouvelle Entreprise</h2>
                    <p className="text-muted-foreground text-sm">Référencer une nouvelle société</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCompanyModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 pt-0">
                <form onSubmit={handleSubmitCompany} className="space-y-5">
                  {/* Nom */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Nom de l&apos;entreprise
                    </label>
                    <input
                      type="text"
                      required
                      value={companyForm.name}
                      onChange={e => setCompanyForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="ex: Google"
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-orange-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Secteur & Localisation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Secteur d&apos;activité
                      </label>
                      <input
                        type="text"
                        value={companyForm.industry}
                        onChange={e => setCompanyForm(p => ({ ...p, industry: e.target.value }))}
                        placeholder="ex: Technologie"
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-orange-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Localisation
                      </label>
                      <input
                        type="text"
                        value={companyForm.location}
                        onChange={e => setCompanyForm(p => ({ ...p, location: e.target.value }))}
                        placeholder="ex: Paris, FR"
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-orange-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Site Web
                    </label>
                    <input
                      type="url"
                      value={companyForm.website}
                      onChange={e => setCompanyForm(p => ({ ...p, website: e.target.value }))}
                      placeholder="https://www.exemple.com"
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-orange-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Logo URL */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={companyForm.logoUrl}
                      onChange={e => setCompanyForm(p => ({ ...p, logoUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-orange-400/50 outline-none transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={companyForm.description}
                      onChange={e => setCompanyForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Présentation de l'entreprise..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-orange-400/50 outline-none transition-all placeholder:text-muted-foreground/40 resize-none"
                    />
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCompanyModal(false)}
                      className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {submitting ? "Création..." : "Créer"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recruiter Modal Placeholder */}
      {isAddRecruiterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass p-10 rounded-[40px] border border-white/10 max-w-sm text-center">
            <h3 className="text-xl font-black mb-4 uppercase tracking-tight text-gradient">Redirection</h3>
            <p className="text-muted-foreground text-sm mb-6 font-medium">
              Pour ajouter un recruteur, veuillez utiliser la page de gestion dédiée.
            </p>
            <button 
              onClick={() => {
                setIsAddRecruiterModalOpen(false);
                window.location.href = "/dashboard/admin/recruteurs";
              }}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Aller à la gestion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
