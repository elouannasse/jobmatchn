"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface InterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string, message: string) => void;
  loading: boolean;
  candidateName: string;
}

export function InterviewScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  candidateName,
}: InterviewScheduleModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    onConfirm(date, time, message);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass rounded-[32px] border border-white/10 p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white">Planifier Entretien</h2>
                  <p className="text-xs text-muted-foreground font-medium">Candidat: {candidateName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-muted-foreground hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-2">
                    <Calendar className="w-3 h-3 text-purple-400" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none text-sm font-bold text-white transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-2">
                    <Clock className="w-3 h-3 text-purple-400" /> Heure
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none text-sm font-bold text-white transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-2">
                  <MessageSquare className="w-3 h-3 text-purple-400" /> Message (Optionnel)
                </label>
                <textarea
                  maxLength={200}
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Informations complémentaires, lieu, lien visio..."
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none text-sm font-medium text-white transition-all resize-none placeholder:text-muted-foreground/30"
                />
                <div className="flex justify-end px-2">
                  <span className="text-[10px] font-bold text-muted-foreground/40">{message.length}/200</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !date || !time}
                  className="w-full py-4 rounded-[22px] bg-purple-500 hover:bg-purple-600 text-white font-black uppercase tracking-[0.2em] text-[11px] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(168,85,247,0.3)]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {loading ? "Planification..." : "Confirmer l'entretien"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
