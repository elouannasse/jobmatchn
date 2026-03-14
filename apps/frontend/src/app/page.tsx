"use client";

import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Zap, Shield, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-accent/10 blur-[100px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-accent">Matching intelligent par IA</span>
          </span>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-8">
            Trouvez votre <span className="text-gradient">Match Parfait</span> <br />
            en quelques secondes.
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-12">
            La plateforme de recrutement nouvelle génération qui connecte les talents aux meilleures opportunités grâce à notre algorithme de scoring avancé.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/register?role=CANDIDATE"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold hover:scale-105 transition-transform flex items-center gap-2"
            >
              Je suis un candidat <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/register?role=RECRUITER"
              className="px-8 py-4 glass rounded-2xl font-semibold hover:bg-white/5 transition-colors"
            >
              Je suis recruteur
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Scoring Intelligent",
              desc: "Notre IA analyse la compatibilité entre les compétences et les offres en temps réel.",
              color: "text-yellow-400"
            },
            {
              icon: Briefcase,
              title: "Offres Premium",
              desc: "Accédez à des opportunités exclusives dans les secteurs les plus dynamiques.",
              color: "text-primary"
            },
            {
              icon: Shield,
              title: "Trusted Platform",
              desc: "Une sécurité maximale pour vos données et une transparence totale sur les processus.",
              color: "text-accent"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-3xl glass hover:bg-white/5 transition-colors cursor-default"
            >
              <feature.icon className={`w-12 h-12 mb-6 ${feature.color}`} />
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="p-16 rounded-[40px] glass relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Prêt à transformer votre futur ?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Rejoignez des milliers de professionnels et recruteurs déjà satisfaits par notre approche innovante.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex px-10 py-5 glass bg-white text-black rounded-2xl font-bold hover:scale-105 transition-transform"
          >
            Commencer maintenant
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-12 text-center text-muted-foreground">
        <p>© 2026 JobMatchn. Fait avec passion pour le recrutement.</p>
      </footer>
    </main>
  );
}
