import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InteractiveCV } from "@/components/profile/InteractiveCV";
import { Portfolio } from "@/components/profile/Portfolio";
import { Recommendations } from "@/components/profile/Recommendations";
import { CVManager } from "@/components/profile/CVManager";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { Badge } from "@/components/profile/Badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Briefcase, ThumbsUp, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";

interface StagiaireData {
  id: string;
  name: string;
  avatar: string;
  title: string;
  location: string;
  bio: string;
  email: string;
  phone: string;
  education: string;
  disponibility: string;
  isPremium: boolean;
  cvs: Array<{
    id: string;
    name: string;
    url: string;
    uploadDate: string;
  }>;
}

export default function ProfilStagiaire() {
  const [activeTab, setActiveTab] = useState<"profile" | "cv" | "portfolio" | "recommendations">("profile");
  const [isEditing, setIsEditing] = useState(false);
  
  // Simuler les données du stagiaire (à remplacer par les vraies données)
  const [stagiaire, setStagiaire] = useState<StagiaireData>({
    id: "1",
    name: "Jean Dupont",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean",
    title: "Développeur Full Stack Junior",
    location: "Yaoundé, Cameroun",
    bio: "Passionné par le développement web et mobile, je suis à la recherche de nouvelles opportunités pour développer mes compétences.",
    email: "jean.dupont@email.com",
    phone: "+237 6XX XX XX XX",
    education: "Master en Informatique",
    disponibility: "immediate",
    isPremium: true,
    cvs: [],
  });

  const tabs = [
    { id: "profile" as const, label: "Profil", icon: User },
    { id: "cv" as const, label: "CV", icon: FileText },
    { id: "portfolio" as const, label: "Portfolio", icon: Briefcase },
    { id: "recommendations" as const, label: "Recommandations", icon: ThumbsUp },
  ];

  const handleProfileUpdate = (data: Omit<StagiaireData, "id" | "avatar" | "isPremium" | "cvs">) => {
    setStagiaire((prev) => ({
      ...prev,
      ...data,
    }));
    setIsEditing(false);
  };

  const handleCVUpload = (file: File) => {
    const newCV = {
      id: Date.now().toString(),
      name: file.name,
      url: URL.createObjectURL(file),
      uploadDate: new Date().toLocaleDateString(),
    };
    setStagiaire((prev) => ({
      ...prev,
      cvs: [...prev.cvs, newCV],
    }));
  };

  const handleCVDelete = (cvId: string) => {
    setStagiaire((prev) => ({
      ...prev,
      cvs: prev.cvs.filter((cv) => cv.id !== cvId),
    }));
  };

  const PremiumOverlay = () => (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
      <Lock className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">Fonctionnalité Premium</h3>
      <p className="text-muted-foreground mb-4">
        Passez à un abonnement premium pour accéder à toutes les fonctionnalités avancées
      </p>
      <Link to="/abonnement">
        <Button>Voir les abonnements</Button>
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête du profil */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={stagiaire.avatar} />
            <AvatarFallback>{stagiaire.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-2xl font-bold">{stagiaire.name}</h1>
              {stagiaire.isPremium && <Badge type="premium" />}
            </div>
            <p className="text-xl text-muted-foreground mb-2">{stagiaire.title}</p>
            <p className="text-muted-foreground">{stagiaire.location}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Annuler" : "Modifier le profil"}
          </Button>
        </div>
        <p className="mt-4 text-center md:text-left">{stagiaire.bio}</p>
      </Card>

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

      {/* Contenu */}
      <div className="max-w-4xl mx-auto relative">
        {activeTab === "profile" && (
          isEditing ? (
            <Card className="p-6">
              <EditProfileForm
                initialData={stagiaire}
                onSubmit={handleProfileUpdate}
                onCancel={() => setIsEditing(false)}
              />
            </Card>
          ) : (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Contact</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Email: {stagiaire.email}</p>
                      <p>Téléphone: {stagiaire.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Formation</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>{stagiaire.education}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Disponibilité</h3>
                  <p className="text-muted-foreground">
                    {stagiaire.disponibility === "immediate"
                      ? "Immédiate"
                      : `Dans ${stagiaire.disponibility.replace("months", " mois")}`}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">À propos</h3>
                  <p className="text-muted-foreground">{stagiaire.bio}</p>
                </div>
              </div>
            </Card>
          )
        )}
        
        {activeTab === "cv" && (
          <CVManager
            isPremium={stagiaire.isPremium}
            cvs={stagiaire.cvs}
            onUpload={handleCVUpload}
            onDelete={handleCVDelete}
          />
        )}

        {activeTab === "portfolio" && (
          <>
            <Portfolio />
            {!stagiaire.isPremium && <PremiumOverlay />}
          </>
        )}

        {activeTab === "recommendations" && (
          <Recommendations isPremium={stagiaire.isPremium} />
        )}
      </div>
    </div>
  );
}
