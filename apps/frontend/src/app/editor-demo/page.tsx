"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { motion } from "framer-motion";
import { FileEdit, Eye, Code2 } from "lucide-react";

export default function EditorDemoPage() {
  const [content, setContent] = useState(
    "<h2>Bienvenue dans l'éditeur de texte riche</h2><p>Commencez à taper pour rédiger une <strong>description de poste</strong> ou une <em>lettre de motivation</em> professionnelle.</p><ul><li>Gras, Italique, Souligné</li><li>Listes à puces et numérotées</li><li>Titres et citations</li><li>Liens et surlignage</li></ul>"
  );
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "html">("editor");

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-3"
          >
            Éditeur de Texte Riche
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Composant réutilisable basé sur <span className="text-primary font-semibold">TipTap</span> — utilisé pour les offres d&apos;emploi et les lettres de motivation.
          </motion.p>
        </header>

        <div className="glass rounded-[32px] overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {[
              { id: "editor", label: "Éditeur", icon: FileEdit },
              { id: "preview", label: "Aperçu", icon: Eye },
              { id: "html", label: "HTML", icon: Code2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "editor" | "preview" | "html")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "editor" && (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-sm text-muted-foreground mb-4">
                  💡 Conseil : Sélectionnez du texte pour voir le menu contextuel flottant.
                </p>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Décrivez le poste, les responsabilités, les prérequis..."
                />
              </motion.div>
            )}

            {activeTab === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-white/10 bg-white/5 p-6 min-h-[300px]"
              >
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Rendu final</h3>
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </motion.div>
            )}

            {activeTab === "html" && (
              <motion.div
                key="html"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <pre className="rounded-xl border border-white/10 bg-white/5 p-6 min-h-[300px] text-sm text-accent overflow-x-auto whitespace-pre-wrap break-all">
                  {content}
                </pre>
              </motion.div>
            )}
          </div>
        </div>

        {/* Usage info */}
        <div className="mt-8 glass rounded-2xl p-6">
          <h2 className="font-bold mb-4 text-lg">Intégration avec React Hook Form</h2>
          <pre className="text-xs text-accent overflow-x-auto bg-white/5 rounded-xl p-4">
{`import { Controller } from "react-hook-form";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

// Dans votre formulaire :
<Controller
  name="description"
  control={control}
  render={({ field }) => (
    <RichTextEditor
      content={field.value}
      onChange={field.onChange}
      placeholder="Description du poste..."
    />
  )}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
