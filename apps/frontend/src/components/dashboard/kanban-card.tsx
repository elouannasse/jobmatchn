"use client";

import { RecruiterApplication } from "@/services/application.service";

interface KanbanCardProps {
  application: RecruiterApplication;
  onStatusChange: (id: string, status: string) => void;
}

export function KanbanCard({ application }: KanbanCardProps) {
  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-400 bg-green-400/10 border-green-400/20";
    if (score >= 50) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    return "text-red-400 bg-red-400/10 border-red-400/20";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-5 rounded-3xl border border-white/5 hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm leading-tight">
              {application.candidate.user.firstName} {application.candidate.user.lastName}
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">
              <Mail className="w-3 h-3" /> {application.candidate.user.email}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Briefcase className="w-3.5 h-3.5 text-primary/60" />
          <span className="truncate">{application.jobOffer.title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary/60" />
          <span>{application.candidate.location || "N/A"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${scoreColor(application.score || 0)}`}>
          <Star className="w-3 h-3 fill-current" />
          Score: {application.score || 0}%
        </div>
        <div className="text-[10px] text-muted-foreground font-medium italic">
          {new Date(application.createdAt).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
}
