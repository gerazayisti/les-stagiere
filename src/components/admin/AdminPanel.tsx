
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle, Database, RefreshCcw, CheckCircle, AlertCircle, Info } from "lucide-react";
import { resetDatabase } from '@/lib/resetDatabase';

export default function AdminPanel() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{
    success: boolean;
    message: string;
    users?: any;
  } | null>(null);

  const handleResetDatabase = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser la base de données ? Cette action est irréversible.")) {
      try {
        setIsResetting(true);
        setResetResult(null);
        
        const result = await resetDatabase();
        setResetResult(result);
        
      } catch (error) {
        console.error("Erreur lors de la réinitialisation:", error);
        setResetResult({
          success: false,
          message: "Une erreur inattendue s'est produite"
        });
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Panneau d'administration</CardTitle>
              <CardDescription>
                Gérez la plateforme et accédez aux outils d'administration
              </CardDescription>
            </div>
            <Badge variant="outline">Version de développement</Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="database">
            <TabsList className="mb-4">
              <TabsTrigger value="database">Base de données</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="database" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Gestion de la base de données</AlertTitle>
                <AlertDescription>
                  Ces fonctionnalités sont destinées au développement et aux tests.
                  N'utilisez pas ces outils en production.
                </AlertDescription>
              </Alert>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Réinitialisation de la base de données
                  </CardTitle>
                  <CardDescription>
                    Réinitialise la base de données et crée des données de test
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Attention!</AlertTitle>
                    <AlertDescription>
                      Cette action va effacer toutes les données existantes et créer de nouvelles
                      données de test. Cette opération est irréversible.
                    </AlertDescription>
                  </Alert>
                  
                  {resetResult && (
                    <Alert
                      variant={resetResult.success ? "default" : "destructive"}
                      className="mb-4"
                    >
                      {resetResult.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {resetResult.success ? "Succès" : "Erreur"}
                      </AlertTitle>
                      <AlertDescription>{resetResult.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  {resetResult?.success && resetResult.users && (
                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <h4 className="font-medium mb-2">Utilisateurs créés:</h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <strong>Stagiaire:</strong> stagiaire@test.fr / test123
                        </li>
                        <li>
                          <strong>Entreprise:</strong> entreprise@test.fr / test123
                        </li>
                        <li>
                          <strong>Admin:</strong> admin@les-stagiaires.fr / admin123
                        </li>
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="destructive"
                    onClick={handleResetDatabase}
                    disabled={isResetting}
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Réinitialisation en cours...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Réinitialiser la base de données
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>
                    Cette fonctionnalité sera disponible prochainement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Fonctionnalité en cours de développement
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>Logs système</CardTitle>
                  <CardDescription>
                    Cette fonctionnalité sera disponible prochainement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Fonctionnalité en cours de développement
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
