"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { candidateProfileSchema, CandidateProfileInput } from "@/lib/validations/profile.schema";
import { profileService } from "@/services/profile.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin, Code, Link as LinkIcon, ChevronRight, ChevronLeft, Check } from "lucide-react";

const steps = [
  { id: 1, title: "Mission", icon: Briefcase },
  { id: 2, title: "Compétences", icon: Code },
  { id: 3, title: "Liens", icon: LinkIcon },
];

export function CandidateOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CandidateProfileInput>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: {
      skills: [],
    },
  });

  const skills = watch("skills");
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setValue("skills", [...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue("skills", skills.filter(s => s !== skillToRemove));
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof CandidateProfileInput)[] = [];
    if (currentStep === 1) fieldsToValidate = ["title", "summary"];
    if (currentStep === 2) fieldsToValidate = ["location", "skills"];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const onSubmit = async (data: CandidateProfileInput) => {
    try {
      await profileService.updateCandidateProfile(data);
      toast.success("Profil complété avec succès !");
      router.push("/dashboard/candidate");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du profil");
    }
  };

  return (
    <div className="glass p-8 rounded-[32px] shadow-2xl relative">
      {/* Stepper */}
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
                <label className="text-sm font-medium">Votre titre professionnel</label>
                <input
                  {...register("title")}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                  placeholder="ex: Développeur Fullstack React / NestJS"
                />
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Résumé de votre parcours</label>
                <textarea
                  {...register("summary")}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none resize-none"
                  placeholder="Parlez-nous de vos expériences et de ce que vous recherchez..."
                />
                {errors.summary && <p className="text-xs text-red-400">{errors.summary.message}</p>}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Localisation</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("location")}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                    placeholder="Ville, Pays ou Télétravail"
                  />
                </div>
                {errors.location && <p className="text-xs text-red-400">{errors.location.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Compétences</label>
                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                    placeholder="Ajouter une compétence (ex: Typescript)"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-3 bg-secondary rounded-xl hover:bg-secondary/80 font-medium"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {skills.map((skill) => (
                    <span 
                      key={skill}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 text-primary rounded-full text-sm"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
                {errors.skills && <p className="text-xs text-red-400">{errors.skills.message}</p>}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Lien LinkedIn</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("linkedinUrl")}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                {errors.linkedinUrl && <p className="text-xs text-red-400">{errors.linkedinUrl.message}</p>}
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-sm text-center text-muted-foreground">
                  Vous pourrez uploader votre CV plus tard dans votre espace candidat.
                </p>
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
            {currentStep < 3 ? (
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
                {isSubmitting ? "Finalisation..." : "Terminer mon profil"} <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
