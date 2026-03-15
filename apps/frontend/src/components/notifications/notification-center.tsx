"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { useNotifications } from "@/context/notification-context";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? "text-primary animate-pulse" : "text-muted-foreground group-hover:text-white"}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-[#0A0A0B]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 glass border border-white/10 rounded-[32px] shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h3 className="text-lg font-bold">Notifications</h3>
                  <p className="text-xs text-muted-foreground">{unreadCount} non lues</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={markAllAsRead}
                    className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                    title="Tout marquer comme lu"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={clearNotifications}
                    className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-red-400 transition-colors"
                    title="Effacer tout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-muted-foreground/20">
                      <Bell className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Aucune notification pour le moment</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-5 hover:bg-white/[0.03] transition-colors cursor-pointer relative group ${!notif.read ? "bg-primary/[0.02]" : ""}`}
                      >
                        {!notif.read && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                        )}
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            !notif.read ? "bg-primary/10 text-primary" : "bg-white/5 text-muted-foreground"
                          }`}>
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className={`text-sm leading-relaxed ${!notif.read ? "font-bold text-white" : "text-muted-foreground"}`}>
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                              <Clock className="w-3 h-3" />
                              {new Date(notif.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/5 bg-white/[0.01] text-center">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
