"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { recruiterOnboardingSchema, RecruiterOnboardingInput } from "@/lib/validations/profile.schema";
import { profileService } from "@/services/profile.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Building2, Globe, Info, MapPin, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { RichTextEditorField } from "@/components/ui/rich-text-editor";

const steps = [
  { id: 1, title: "L'Entreprise", icon: Building2 },
  { id: 2, title: "Détails", icon: Info },
];

export function RecruiterOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RecruiterOnboardingInput>({
    resolver: zodResolver(recruiterOnboardingSchema),
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof RecruiterOnboardingInput)[] = [];
    if (currentStep === 1) fieldsToValidate = ["name", "industry", "size"];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const onSubmit = async (data: RecruiterOnboardingInput) => {
    try {
      await profileService.createCompany(data);
      toast.success("Entreprise créée avec succès !");
      router.push("/dashboard/recruiter");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de la création de l&apos;entreprise";
      toast.error(message);
    }
  };

  return (
    <div className="glass p-8 rounded-[32px] shadow-2xl relative">
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 -z-10" />
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-2">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentStep >= step.id 
                ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" 
                : "bg-secondary text-muted-foreground"
              }`}
            >
              {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-medium ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="min-h-[350px] flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom de l&apos;entreprise</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("name")}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                    placeholder="ex: Google, TechFlow, etc."
                  />
                </div>
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Secteur d&apos;activité</label>
                  <input
                    {...register("industry")}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                    placeholder="ex: Informatique"
                  />
                  {errors.industry && <p className="text-xs text-red-400">{errors.industry.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Taille</label>
                  <select
                    {...register("size")}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none appearance-none"
                  >
                    <option value="" disabled className="bg-secondary">Sélectionnez...</option>
                    <option value="1-10" className="bg-secondary">1-10 employés</option>
                    <option value="11-50" className="bg-secondary">11-50 employés</option>
                    <option value="51-200" className="bg-secondary">51-200 employés</option>
                    <option value="201-500" className="bg-secondary">201-500 employés</option>
                    <option value="500+" className="bg-secondary">500+ employés</option>
                  </select>
                  {errors.size && <p className="text-xs text-red-400">{errors.size.message}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Localisation</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...register("location")}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                      placeholder="Paris, France"
                    />
                  </div>
                  {errors.location && <p className="text-xs text-red-400">{errors.location.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Site Web</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...register("website")}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                      placeholder="https://exemple.com"
                    />
                  </div>
                  {errors.website && <p className="text-xs text-red-400">{errors.website.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description de l&apos;entreprise</label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditorField
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Décrivez la mission de votre entreprise..."
                    />
                  )}
                />
                {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-auto pt-12">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 font-medium transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>
          )}
          
          <div className="ml-auto">
            {currentStep < 2 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-10 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? "Création..." : "Créer l'entreprise"} <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
