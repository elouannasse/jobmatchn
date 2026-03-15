"use client";

import { KanbanCard } from "./kanban-card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { RecruiterApplication } from "@/services/application.service";

interface KanbanBoardProps {
  applications: RecruiterApplication[];
  onStatusChange: (id: string, status: string) => void;
  loading: boolean;
}

const COLUMNS = [
  { id: "PENDING", label: "En Attente", color: "bg-blue-500" },
  { id: "REVIEWED", label: "Examiné", color: "bg-yellow-500" },
  { id: "INTERVIEW", label: "Entretien", color: "bg-purple-500" },
  { id: "ACCEPTED", label: "Accepté", color: "bg-green-500" },
  { id: "REJECTED", label: "Refusé", color: "bg-red-500" },
];

export function KanbanBoard({ applications, onStatusChange, loading }: KanbanBoardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 min-h-[700px] scrollbar-hide">
      {COLUMNS.map((column) => {
        const columnApps = applications.filter(app => app.status === column.id);

        return (
          <div key={column.id} className="min-w-[320px] max-w-[320px] flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${column.color}`} />
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  {column.label}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-muted-foreground">
                  {columnApps.length}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4 p-2 rounded-3xl bg-white/[0.02] border border-white/5">
              {columnApps.map((app) => (
                <KanbanCard 
                  key={app.id} 
                  application={app} 
                  onStatusChange={onStatusChange}
                />
              ))}
              
              {columnApps.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center text-muted-foreground/20 border-2 border-dashed border-white/5 rounded-3xl">
                  <span className="text-xs font-medium uppercase tracking-widest">Vide</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
