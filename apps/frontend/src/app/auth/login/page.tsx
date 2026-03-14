"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { loginSchema, LoginInput } from "@/lib/validations/auth.schema";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const response = await authService.login(data);
      login(response.accessToken);
      toast.success("Bon retour parmi nous !");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Identifiants invalides";
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
              <LogIn className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Connexion</h1>
            <p className="text-muted-foreground">Accédez à votre espace JobMatchn</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 mt-4"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>

            <p className="text-center text-sm text-muted-foreground pt-4">
              Pas encore de compte ?{" "}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Inscrivez-vous
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
