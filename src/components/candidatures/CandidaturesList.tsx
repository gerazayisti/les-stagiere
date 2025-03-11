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
  Building2 
} from "lucide-react";
import { useCandidatures } from '@/hooks/useCandidatures';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const CandidaturesList: React.FC = () => {
  const { user } = useAuth();
  const { getCandidaturesByUser, loading } = useCandidatures();
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
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Mes Candidatures</h2>
      
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
                  {format(new Date(candidature.created_at), 'dd MMMM yyyy', { locale: fr })}
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
      )}

      {/* Modal de détails de candidature */}
      <Dialog 
        open={!!selectedCandidature} 
        onOpenChange={() => setSelectedCandidature(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la candidature</DialogTitle>
          </DialogHeader>
          {selectedCandidature && (
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
                  {format(new Date(selectedCandidature.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
              {selectedCandidature.stages?.description && (
                <div>
                  <h3 className="font-semibold">Description du stage</h3>
                  <p>{selectedCandidature.stages.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
