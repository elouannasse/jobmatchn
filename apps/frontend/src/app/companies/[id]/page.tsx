"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { profileService } from "@/services/profile.service";
import { CompanyProfile, Company } from "@/components/company/company-profile";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CompanyPage() {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (typeof id === 'string') {
          const data = await profileService.getPublicCompany(id);
          setCompany(data);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Une erreur est survenue lors du chargement de l'entreprise";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-primary" />
        </motion.div>
        <p className="text-muted-foreground animate-pulse font-medium">Chargement du profil...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="glass p-8 rounded-3xl text-center space-y-6 max-w-md w-full border border-red-500/10">
          <div className="inline-flex p-4 rounded-2xl bg-red-500/10 text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Entreprise non trouvée</h1>
            <p className="text-muted-foreground">
              {error || "Nous n'avons pas pu trouver les informations de cette entreprise."}
            </p>
          </div>
          <Link 
            href="/"
            className="block w-full py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-medium transition-all"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <CompanyProfile company={company} />
    </motion.main>
  );
}
