"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { LogOut, LayoutDashboard, Sparkles, Building2, Search, Briefcase, History as HistoryIcon, User as UserIcon } from "lucide-react";
import { NotificationCenter } from "../notifications/notification-center";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass border border-white/10 rounded-[32px] px-8 py-4 flex items-center justify-between shadow-2xl backdrop-blur-3xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter">
              JobMatch<span className="text-primary">n</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/jobs" className="text-sm font-bold text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" /> Explorer
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  href={user?.role === "RECRUITER" ? "/dashboard/recruiter" : user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/candidat"} 
                  className="text-sm font-bold text-muted-foreground hover:text-white transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                {user?.role === "CANDIDATE" && (
                  <>
                    <Link href="/dashboard/candidat/offres" className="text-sm font-bold text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Offres
                    </Link>
                    <Link href="/dashboard/candidat/candidatures" className="text-sm font-bold text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
                      <HistoryIcon className="w-4 h-4" /> Candidatures
                    </Link>
                    <Link href="/dashboard/candidat/profil" className="text-sm font-bold text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
                      <UserIcon className="w-4 h-4" /> Profil
                    </Link>
                  </>
                )}
                {user?.role === "RECRUITER" && (
                  <>
                    <Link href="/dashboard/recruiter/offres" className="text-sm font-bold text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Mes Offres
                    </Link>
                    <Link href="/companies/me" className="text-sm font-bold text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Entreprise
                    </Link>
                    <Link href="/dashboard/recruiter/profil" className="text-sm font-bold text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
                      <UserIcon className="w-4 h-4" /> Profil
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <div className="w-px h-6 bg-white/10 mx-2" />
                <div className="flex items-center gap-4">
                  <div className="hidden lg:block text-right">
                    <p className="text-sm font-bold truncate max-w-[150px]">{user?.email}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                      {user?.role === "ADMIN" ? "Admin" : user?.role === "RECRUITER" ? "Recruteur" : user?.role === "CANDIDATE" ? "Candidat" : "Utilisateur"}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all group"
                  >
                    <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/auth/login" className="text-sm font-bold hover:text-primary transition-colors">
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-3 bg-white text-black rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-white/5"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
