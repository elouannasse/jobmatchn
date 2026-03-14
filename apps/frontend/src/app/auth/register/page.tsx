"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { registerSchema, RegisterInput } from "@/lib/validations/auth.schema";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, User, Mail, Lock, UserCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "CANDIDATE",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterInput) => {
    try {
      await authService.register(data);
      toast.success("Inscription réussie ! Connectez-vous maintenant.");
      router.push("/auth/login");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Une erreur est survenue lors de l&apos;inscription";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[100px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 rounded-[32px] shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Créer un compte</h1>
            <p className="text-muted-foreground">Rejoignez JobMatchn aujourd&apos;hui</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4 text-muted-foreground" /> Prénom
                </label>
                <input
                  {...register("firstName")}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-foreground"
                  placeholder="Jean"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-400">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4 text-muted-foreground" /> Nom
                </label>
                <input
                  {...register("lastName")}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-foreground"
                  placeholder="Dupont"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4 text-muted-foreground" /> Email
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-foreground"
                placeholder="jean@exemple.com"
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Lock className="w-4 h-4 text-muted-foreground" /> Mot de passe
              </label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-foreground"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <UserCircle className="w-4 h-4 text-muted-foreground" /> Je suis un...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`cursor-pointer flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    selectedRole === "CANDIDATE" 
                    ? "bg-primary/10 border-primary text-white" 
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    value="CANDIDATE"
                    {...register("role")}
                    className="hidden"
                  />
                  <span className="font-medium text-sm">Candidat</span>
                </label>
                <label
                  className={`cursor-pointer flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    selectedRole === "RECRUITER" 
                    ? "bg-primary/10 border-primary text-white" 
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    value="RECRUITER"
                    {...register("role")}
                    className="hidden"
                  />
                  <span className="font-medium text-sm">Recruteur</span>
                </label>
              </div>
              {errors.role && (
                <p className="text-xs text-red-400 text-center">{errors.role.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 mt-4"
            >
              {isSubmitting ? "Création du compte..." : "S'inscrire"}
            </button>

            <p className="text-center text-sm text-muted-foreground pt-4">
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Connectez-vous
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
