
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Portfolio from "@/components/profile/Portfolio";

export default function ProfilEnrichi() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Vérifier l'authentification
    if (loaded && !isAuthenticated) {
      navigate('/connexion');
      toast.error("Vous devez être connecté pour accéder à cette page");
    }
    setLoaded(true);
  }, [isAuthenticated, navigate, loaded]);
  
  if (!loaded || !isAuthenticated || !user) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }
  
  const handleRedirectToProfile = () => {
    if (user.role === 'stagiaire') {
      navigate(`/stagiaires/${user.id}`);
    } else if (user.role === 'entreprise') {
      navigate(`/entreprises/${user.id}`);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Enrichir votre profil</h1>
        <Button onClick={handleRedirectToProfile}>
          Retour au profil principal
        </Button>
      </div>
      
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="experiences">Expériences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="portfolio">
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
            <Portfolio />
          </div>
        </TabsContent>
        
        <TabsContent value="certifications">
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Vos certifications</h2>
            <p className="text-muted-foreground">
              Cette fonctionnalité sera bientôt disponible.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="experiences">
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Vos expériences professionnelles</h2>
            <p className="text-muted-foreground">
              Cette fonctionnalité sera bientôt disponible.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
