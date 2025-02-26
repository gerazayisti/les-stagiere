import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InteractiveCV } from "@/components/profile/InteractiveCV";
import { Portfolio } from "@/components/profile/Portfolio";
import { Recommendations } from "@/components/profile/Recommendations";
import { FileText, Briefcase, ThumbsUp } from "lucide-react";

export default function ProfilEnrichi() {
  const [activeTab, setActiveTab] = useState<"cv" | "portfolio" | "recommendations">("cv");
  const isPremium = true; // À connecter avec l'état réel de l'abonnement

  const tabs = [
    { id: "cv" as const, label: "CV Interactif", icon: FileText },
    { id: "portfolio" as const, label: "Portfolio", icon: Briefcase },
    { id: "recommendations" as const, label: "Recommandations", icon: ThumbsUp },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Profil Professionnel
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Mettez en valeur vos compétences, expériences et réalisations pour
          attirer l'attention des recruteurs.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "outline"}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {activeTab === "cv" && <InteractiveCV />}
        {activeTab === "portfolio" && <Portfolio />}
        {activeTab === "recommendations" && (
          <Recommendations isPremium={isPremium} />
        )}
      </div>
    </div>
  );
}
