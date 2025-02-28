
import AdminPanel from "@/components/admin/AdminPanel";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier l'accès admin
    if (!loading && isAuthenticated && user?.role !== 'admin') {
      toast.error("Accès refusé", {
        description: "Vous n'avez pas les droits d'accès à cette page"
      });
      navigate('/');
    }
  }, [user, loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              <CardTitle>Accès refusé</CardTitle>
            </div>
            <CardDescription>
              Vous n'avez pas les droits nécessaires pour accéder à cette page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Cette page est réservée aux administrateurs du site. Si vous pensez
              que c'est une erreur, veuillez contacter le support.
            </p>
            <Button onClick={() => navigate('/')}>
              Retourner à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Administration</h1>
      <AdminPanel />
    </div>
  );
}
