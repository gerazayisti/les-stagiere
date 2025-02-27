
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { CVAnalyzer } from "@/components/CVAnalyzer";
import { AvatarUpload } from "@/components/AvatarUpload";
import { Portfolio } from "@/components/profile/Portfolio";
import { Recommendations } from "@/components/profile/Recommendations";
import { useToast } from "@/components/ui/use-toast";
import { Lock, ChevronUp, Shield, Star, Award, Robot } from "lucide-react";

export default function ProfilEnrichi() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"cv" | "portfolio" | "recommendations">("cv");
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);

  const handleUpgradeToPremium = () => {
    setIsPremium(true);
    toast({
      title: "Félicitations",
      description: "Vous êtes maintenant un utilisateur premium !",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Boostez votre profil</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Utilisez nos outils avancés pour améliorer votre CV, créer un portfolio professionnel et obtenir des recommandations de qualité.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Robot className="w-5 h-5 mr-2 text-primary" />
              Analyse IA de CV
            </CardTitle>
            <CardDescription>
              Obtenez une analyse détaillée de votre CV avec des suggestions d'amélioration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPremium ? (
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("cv")}>
                Analyser mon CV
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                <Lock className="w-4 h-4 mr-2" />
                Fonctionnalité premium
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-primary" />
              Portfolio professionnel
            </CardTitle>
            <CardDescription>
              Mettez en valeur vos projets dans un portfolio interactif et attrayant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => setActiveTab("portfolio")}>
              Gérer mon portfolio
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-primary" />
              Recommandations vérifiées
            </CardTitle>
            <CardDescription>
              Recevez et affichez des recommandations vérifiées de vos employeurs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setActiveTab("recommendations")}
            >
              Voir mes recommandations
            </Button>
          </CardContent>
        </Card>
      </div>

      {!isPremium && (
        <Card className="mb-10 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-6 h-6 mr-2 text-primary" />
              Passez à la version premium
            </CardTitle>
            <CardDescription>
              Débloquez toutes les fonctionnalités avancées pour maximiser vos chances de trouver le stage idéal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <ChevronUp className="w-4 h-4 mr-2 text-green-600" />
                Analyse IA complète de votre CV
              </li>
              <li className="flex items-center">
                <ChevronUp className="w-4 h-4 mr-2 text-green-600" />
                Portfolio professionnel illimité
              </li>
              <li className="flex items-center">
                <ChevronUp className="w-4 h-4 mr-2 text-green-600" />
                Mise en avant de votre profil auprès des recruteurs
              </li>
              <li className="flex items-center">
                <ChevronUp className="w-4 h-4 mr-2 text-green-600" />
                Statistiques détaillées sur vos candidatures
              </li>
            </ul>
            <Button className="w-full" onClick={handleUpgradeToPremium}>
              Passer à la version premium
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value: "cv" | "portfolio" | "recommendations") => setActiveTab(value)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="cv">Analyse de CV</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        <TabsContent value="cv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse de CV avec IA</CardTitle>
              <CardDescription>
                Notre technologie d'IA analyse votre CV et vous propose des améliorations ciblées.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <CVAnalyzer />
              ) : (
                <div className="text-center py-10">
                  <Lock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">Fonctionnalité premium</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    Passez à la version premium pour accéder à l'analyse IA de votre CV et augmenter
                    vos chances d'obtenir le stage de vos rêves.
                  </p>
                  <Button
                    onClick={handleUpgradeToPremium}
                    className="mt-6"
                  >
                    Passer à la version premium
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Portfolio
            projects={[]}  // Ajout des props manquantes
            isOwner={true}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Recommendations
            recommendations={[]}
            isOwner={true}
            stagiaireId={user?.id || ""}
            isPremium={isPremium}  // Assurez-vous que cette prop est correctement typée dans le composant Recommendations
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
