"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Supprimer cet élément ?",
  description = "Cette action est irréversible. Toutes les données associées seront définitivement supprimées."
}: DeleteConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass rounded-[40px] border border-white/10 p-10 overflow-hidden"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-red-400/10 border border-red-400/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-10 h-10" />
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">{title}</h2>
              <p className="text-muted-foreground text-sm">
                {description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={onClose}
                className="py-4 rounded-[20px] bg-white/5 border border-white/10 text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="py-4 rounded-[20px] bg-red-500 text-white text-sm font-black uppercase tracking-widest hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(239,68,68,0.3)]"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 transition-all text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
