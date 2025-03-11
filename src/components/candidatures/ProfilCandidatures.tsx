import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileSearch, 
  Building2, 
  FileText 
} from "lucide-react";
import { useCandidatures } from '@/hooks/useCandidatures';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ProfilCandidatures: React.FC = () => {
  const { user } = useAuth();
  const { 
    getCandidaturesByUser, 
    loading 
  } = useCandidatures();
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [selectedCandidature, setSelectedCandidature] = useState<any>(null);

  useEffect(() => {
    const fetchCandidatures = async () => {
      if (user) {
        const userCandidatures = await getCandidaturesByUser(user.id);
        setCandidatures(userCandidatures);
      }
    };

    fetchCandidatures();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { 
        label: 'En attente', 
        icon: <Clock className="mr-2 h-4 w-4" />, 
        variant: 'secondary' 
      },
      'accepted': { 
        label: 'Accepté', 
        icon: <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />, 
        variant: 'success' 
      },
      'rejected': { 
        label: 'Rejeté', 
        icon: <XCircle className="mr-2 h-4 w-4 text-red-500" />, 
        variant: 'destructive' 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['pending'];
    
    return (
      <Badge variant={config.variant as any} className="flex items-center">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const handleViewDetails = (candidature: any) => {
    setSelectedCandidature(candidature);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mes Candidatures</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <p>Chargement de vos candidatures...</p>
        </div>
      ) : candidatures.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FileSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Vous n'avez pas encore de candidatures</p>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="accepted">Acceptées</TabsTrigger>
            <TabsTrigger value="rejected">Rejetées</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stage</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Date de candidature</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatures.map((candidature) => (
                  <TableRow key={candidature.id}>
                    <TableCell>{candidature.stages?.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4" />
                        {candidature.stages?.entreprises?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {candidature.date_postulation 
                        ? format(new Date(candidature.date_postulation), 'dd MMMM yyyy', { locale: fr }) 
                        : 'Date non disponible'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(candidature.status)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(candidature)}
                      >
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Filtres par statut */}
          {['pending', 'accepted', 'rejected'].map((status) => (
            <TabsContent key={status} value={status}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stage</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Date de candidature</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidatures
                    .filter((c) => c.status === status)
                    .map((candidature) => (
                      <TableRow key={candidature.id}>
                        <TableCell>{candidature.stages?.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4" />
                            {candidature.stages?.entreprises?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {candidature.date_postulation 
                            ? format(new Date(candidature.date_postulation), 'dd MMMM yyyy', { locale: fr }) 
                            : 'Date non disponible'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDetails(candidature)}
                          >
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Modal de détails de candidature */}
      <Dialog 
        open={!!selectedCandidature} 
        onOpenChange={() => setSelectedCandidature(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la candidature</DialogTitle>
          </DialogHeader>
          {selectedCandidature && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Stage</h3>
                  <p>{selectedCandidature.stages?.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Entreprise</h3>
                  <p>{selectedCandidature.stages?.entreprises?.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Statut</h3>
                  {getStatusBadge(selectedCandidature.status)}
                </div>
                <div>
                  <h3 className="font-semibold">Date de candidature</h3>
                  <p>
                    {selectedCandidature.date_postulation 
                      ? format(new Date(selectedCandidature.date_postulation), 'dd MMMM yyyy à HH:mm', { locale: fr }) 
                      : 'Date non disponible'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Description du stage</h3>
                  <p>{selectedCandidature.stages?.description}</p>
                </div>
                {selectedCandidature.stages?.entreprises?.logo_url && (
                  <div>
                    <h3 className="font-semibold">Logo de l'entreprise</h3>
                    <img 
                      src={selectedCandidature.stages.entreprises.logo_url} 
                      alt="Logo de l'entreprise" 
                      className="max-w-[150px] rounded-lg"
                    />
                  </div>
                )}
                {selectedCandidature.status === 'accepted' && (
                  <div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(selectedCandidature.stages?.entreprises?.contact_email, '_blank')}
                    >
                      Contacter l'entreprise
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
