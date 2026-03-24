"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Download,
  MessageSquare,
  CheckCircle2,
  Clock,
  Eye,
  XCircle,
  Loader2,
  Star,
} from "lucide-react";
import { useState } from "react";
import { RecruiterApplication } from "@/services/application.service";
import { toast } from "sonner";

interface CandidateProfileModalProps {
  application: RecruiterApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: string) => void;
}

const STATUS_ACTIONS = [
  { status: "REVIEWED", label: "Marquer Examiné", icon: Eye, color: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20" },
  { status: "INTERVIEW", label: "Inviter Entretien", icon: MessageSquare, color: "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20" },
  { status: "ACCEPTED", label: "Accepter", icon: CheckCircle2, color: "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20" },
  { status: "REJECTED", label: "Refuser", icon: XCircle, color: "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En Attente",
  REVIEWED: "Examiné",
  INTERVIEW: "Entretien",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
};

export function CandidateProfileModal({
  application,
  isOpen,
  onClose,
  onStatusChange,
}: CandidateProfileModalProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  if (!application) return null;

  const { candidate, score, coverLetter, status } = application;
  const { user } = candidate;

  const getScoreColor = (s: number) => {
    if (s >= 70) return { bar: "bg-green-400", text: "text-green-400" };
    if (s >= 40) return { bar: "bg-yellow-400", text: "text-yellow-400" };
    return { bar: "bg-red-400", text: "text-red-400" };
  };

  const scoreColors = getScoreColor(score || 0);

  const handleStatusAction = async (newStatus: string) => {
    try {
      setUpdating(newStatus);
      await onStatusChange(application.id, newStatus);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-[40px] border border-white/10 shadow-2xl"
          >
            {/* Header gradient */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/10 to-transparent rounded-t-[40px] pointer-events-none" />

            <div className="relative p-10 space-y-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-8 right-8 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-muted-foreground hover:text-white z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Candidate Header */}
              <div className="flex items-center gap-6 pr-16">
                <div className="w-20 h-20 rounded-[26px] bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] shrink-0">
                  <User className="w-10 h-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-black tracking-tight truncate">
                    {user.firstName} {user.lastName}
                  </h2>
                  {candidate.title && (
                    <p className="text-primary font-bold text-sm mt-1">{candidate.title}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Mail className="w-3.5 h-3.5" /> {user.email}
                    </span>
                    {candidate.location && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <MapPin className="w-3.5 h-3.5" /> {candidate.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Status + Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Statut actuel</p>
                  <p className="text-sm font-black text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> {STATUS_LABEL[status] || status}
                  </p>
                </div>
                <div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Score d'adéquation</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score || 0}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${scoreColors.bar}`}
                      />
                    </div>
                    <span className={`text-sm font-black ${scoreColors.text}`}>{score || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {candidate.summary && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-primary" /> Résumé professionnel
                  </h3>
                  <div className="p-6 rounded-[24px] bg-white/[0.03] border border-white/5 relative">
                    <span className="text-4xl text-white/5 absolute -top-4 left-4 font-serif leading-none">"</span>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
                      {candidate.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-primary" /> Compétences ({candidate.skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-wider"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {coverLetter && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" /> Lettre de motivation
                  </h3>
                  <div className="p-6 rounded-[24px] bg-white/[0.03] border border-white/5">
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {/* CV Download */}
              {candidate.cvUrl && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-primary" /> Curriculum Vitae
                  </h3>
                  <a
                    href={candidate.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 rounded-[24px] bg-white/[0.03] border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-white">Télécharger le CV</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">PDF</p>
                    </div>
                    <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                </div>
              )}

              {/* Status Actions */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Changer le statut</h3>
                <div className="grid grid-cols-2 gap-3">
                  {STATUS_ACTIONS.filter(a => a.status !== status).map(({ status: s, label, icon: Icon, color }) => (
                    <button
                      key={s}
                      onClick={() => handleStatusAction(s)}
                      disabled={!!updating}
                      className={`flex items-center justify-center gap-3 py-4 px-5 rounded-[22px] border font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${color}`}
                    >
                      {updating === s ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
