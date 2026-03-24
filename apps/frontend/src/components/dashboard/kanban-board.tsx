"use client";

import { useState } from "react";
import { KanbanCard } from "./kanban-card";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { RecruiterApplication } from "@/services/application.service";

interface KanbanBoardProps {
  applications: RecruiterApplication[];
  onStatusChange: (id: string, status: string) => void;
  onCardClick: (application: RecruiterApplication) => void;
  loading: boolean;
}

const COLUMNS = [
  { id: "PENDING",   label: "En Attente", color: "bg-blue-500",   border: "border-blue-500/30",   ring: "ring-blue-500/20"   },
  { id: "REVIEWED",  label: "Examiné",    color: "bg-yellow-500", border: "border-yellow-500/30", ring: "ring-yellow-500/20" },
  { id: "INTERVIEW", label: "Entretien",  color: "bg-purple-500", border: "border-purple-500/30", ring: "ring-purple-500/20" },
  { id: "ACCEPTED",  label: "Accepté",    color: "bg-green-500",  border: "border-green-500/30",  ring: "ring-green-500/20"  },
  { id: "REJECTED",  label: "Refusé",     color: "bg-red-500",    border: "border-red-500/30",    ring: "ring-red-500/20"    },
];

export function KanbanBoard({ applications, onStatusChange, onCardClick, loading }: KanbanBoardProps) {
  const [draggingId, setDraggingId]       = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, app: RecruiterApplication) => {
    setDraggingId(app.id);
    e.dataTransfer.setData("applicationId", app.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData("applicationId");
    const app = applications.find(a => a.id === appId);

    if (app && app.status !== columnId) {
      onStatusChange(appId, columnId);
    }

    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex gap-5 overflow-x-auto pb-8 min-h-[700px] scrollbar-hide">
      {COLUMNS.map((column) => {
        const columnApps = applications.filter(app => app.status === column.id);
        const isOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className="min-w-[290px] max-w-[290px] flex flex-col gap-4"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${column.color} shadow-[0_0_8px_currentColor]`} />
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {column.label}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-muted-foreground">
                  {columnApps.length}
                </span>
              </div>
            </div>

            {/* Drop Zone */}
            <motion.div
              animate={{
                borderColor: isOver ? `rgba(255,255,255,0.15)` : `rgba(255,255,255,0.03)`,
                backgroundColor: isOver ? `rgba(255,255,255,0.04)` : `rgba(255,255,255,0.01)`,
                scale: isOver ? 1.01 : 1,
              }}
              transition={{ duration: 0.15 }}
              className={`flex-1 space-y-4 p-3 rounded-3xl border-2 transition-all ${
                isOver ? `${column.border} ring-4 ${column.ring}` : "border-white/5"
              }`}
            >
              <AnimatePresence mode="popLayout">
                {columnApps.map((app) => (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: draggingId === app.id ? 0.4 : 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onDragEnd={handleDragEnd}
                  >
                    <KanbanCard
                      application={app}
                      onStatusChange={onStatusChange}
                      onCardClick={onCardClick}
                      onDragStart={handleDragStart}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {columnApps.length === 0 && (
                <motion.div
                  animate={{ opacity: isOver ? 0.6 : 0.3 }}
                  className={`h-28 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all ${
                    isOver ? `${column.border} bg-white/[0.02]` : "border-white/5"
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                    {isOver ? "Déposer ici" : "Vide"}
                  </span>
                </motion.div>
              )}

              {/* Drop indicator when column has cards */}
              {columnApps.length > 0 && isOver && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 48 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`rounded-2xl border-2 border-dashed ${column.border} bg-white/[0.02] flex items-center justify-center`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Déposer ici
                  </span>
                </motion.div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
