"use client";

import { RecruiterApplication } from "@/services/application.service";
import { motion } from "framer-motion";
import { User, Mail, Briefcase, MapPin, Star, GripVertical } from "lucide-react";

interface KanbanCardProps {
  application: RecruiterApplication;
  onStatusChange: (id: string, status: string) => void;
  onCardClick: (application: RecruiterApplication) => void;
  onDragStart: (e: React.DragEvent, application: RecruiterApplication) => void;
}

export function KanbanCard({ application, onCardClick, onDragStart }: KanbanCardProps) {
  const scoreColor = (score: number) => {
    if (score >= 70) return "text-green-400 bg-green-400/10 border-green-400/20";
    if (score >= 40) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    return "text-red-400 bg-red-400/10 border-red-400/20";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, application)}
      onClick={() => onCardClick(application)}
      className="glass p-5 rounded-3xl border border-white/5 hover:border-primary/30 hover:bg-white/[0.03] transition-all cursor-grab active:cursor-grabbing active:opacity-60 active:scale-95 group select-none"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors truncate">
              {application.candidate.user.firstName} {application.candidate.user.lastName}
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1 truncate">
              <Mail className="w-3 h-3 shrink-0" /> 
              <span className="truncate">{application.candidate.user.email}</span>
            </div>
          </div>
        </div>
        <GripVertical className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors shrink-0 mt-1" />
      </div>

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Briefcase className="w-3.5 h-3.5 text-primary/60 shrink-0" />
          <span className="truncate">{application.jobOffer.title}</span>
        </div>
        {application.candidate.location && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary/60 shrink-0" />
            <span className="truncate">{application.candidate.location}</span>
          </div>
        )}
        {application.candidate.skills && application.candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {application.candidate.skills.slice(0, 3).map((skill: string, i: number) => (
              <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-muted-foreground uppercase tracking-wide">
                {skill}
              </span>
            ))}
            {application.candidate.skills.length > 3 && (
              <span className="text-[9px] font-bold text-muted-foreground/40">+{application.candidate.skills.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${scoreColor(application.score || 0)}`}>
          <Star className="w-3 h-3 fill-current" />
          {application.score || 0}%
        </div>
        <div className="text-[10px] text-muted-foreground font-medium">
          {new Date(application.createdAt).toLocaleDateString("fr-FR")}
        </div>
      </div>
    </motion.div>
  );
}
