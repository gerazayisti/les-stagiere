import React, { useState, useEffect } from 'react';
import { CandidaturesList } from '@/components/candidatures/CandidaturesList';
import { useAuth } from '@/hooks/useAuth';
import { useSessionTimeout } from '@/contexts/SessionTimeoutContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  FileSearch, 
  ArrowRight, 
  BarChart4, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  RefreshCw 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCandidatures } from '@/hooks/useCandidatures';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const MesCandidatures: React.FC = () => {
  const { user } = useAuth();
  const { resetTimer } = useSessionTimeout();
  const { getCandidaturesByUser, loading } = useCandidatures();
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Reset session timeout on component mount
  useEffect(() => {
    resetTimer();
  }, [resetTimer]);

  // Charger les candidatures
  useEffect(() => {
    if (user) {
      fetchCandidatures();
    }
  }, [user]);

  const fetchCandidatures = async () => {
    if (user) {
      const userCandidatures = await getCandidaturesByUser(user.id);
      setCandidatures(userCandidatures);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCandidatures();
    setTimeout(() => setRefreshing(false), 800);
    resetTimer(); // Reset session timeout on manual refresh
  };

  // Filtrer les candidatures par statut
  const filteredCandidatures = statusFilter === 'all' 
    ? candidatures 
    : candidatures.filter(c => c.status === statusFilter);

  // Calculer les statistiques
  const stats = {
    total: candidatures.length,
    pending: candidatures.filter(c => c.status === 'pending' || c.status === 'en_attente').length,
    accepted: candidatures.filter(c => c.status === 'accepted' || c.status === 'acceptee').length,
    rejected: candidatures.filter(c => c.status === 'rejected' || c.status === 'refusee').length,
    inDiscussion: candidatures.filter(c => c.status === 'en_discussion').length
  };

  const successRate = stats.total > 0 
    ? Math.round((stats.accepted / stats.total) * 100) 
    : 0;

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mes Candidatures</h1>
            <p className="text-gray-500 mt-1">Suivez et gérez vos candidatures aux offres de stage</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Link to="/offres-stages">
              <Button>
                Voir les offres de stage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {user.role === 'stagiaire' ? (
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="list">Liste des candidatures</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Filtrer par statut:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="en_discussion">En discussion</SelectItem>
                    <SelectItem value="acceptee">Acceptée</SelectItem>
                    <SelectItem value="refusee">Refusée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <CandidaturesList candidatures={filteredCandidatures} loading={loading} />
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total des candidatures</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">En attente</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-amber-500" />
                    <div className="text-3xl font-bold">{stats.pending}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Acceptées</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                    <div className="text-3xl font-bold">{stats.accepted}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Refusées</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center">
                    <XCircle className="h-5 w-5 mr-2 text-red-500" />
                    <div className="text-3xl font-bold">{stats.rejected}</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart4 className="h-5 w-5 mr-2" />
                    Taux de réussite
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{successRate}%</span>
                      <span className="text-sm text-gray-500">{stats.accepted} acceptée(s) sur {stats.total} candidature(s)</span>
                    </div>
                    <Progress value={successRate} className="h-2" />
                    
                    <div className="pt-4 text-sm text-gray-500">
                      {stats.total === 0 ? (
                        <p>Vous n'avez pas encore de candidatures. Commencez à postuler pour voir vos statistiques.</p>
                      ) : successRate > 50 ? (
                        <p>Excellent taux de réussite ! Continuez ainsi.</p>
                      ) : successRate > 20 ? (
                        <p>Bon taux de réussite. Pensez à personnaliser davantage vos candidatures.</p>
                      ) : (
                        <p>Améliorez votre taux de réussite en mettant à jour votre CV et en ciblant mieux les offres.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FileSearch className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
            <p className="text-gray-600 mb-4">
              Seuls les stagiaires peuvent accéder à la liste des candidatures.
            </p>
            <Link to="/">
              <Button>Retour à l'accueil</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MesCandidatures;
