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
  MessageCircle,
  Calendar,
  ExternalLink
} from "lucide-react";
import { useSessionTimeout } from '@/contexts/SessionTimeoutContext';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CandidaturesListProps {
  candidatures: any[];
  loading: boolean;
}

export const CandidaturesList: React.FC<CandidaturesListProps> = ({ candidatures, loading }) => {
  const [selectedCandidature, setSelectedCandidature] = useState<any>(null);
  const { resetTimer } = useSessionTimeout();
  
  // Reset session timeout on user interaction
  const handleUserInteraction = () => {
    resetTimer();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'en_attente': { 
        label: 'En attente', 
        icon: <Clock className="mr-2 h-4 w-4" />, 
        variant: 'secondary',
        tooltip: 'Votre candidature est en cours d\'examen'
      },
      'en_discussion': { 
        label: 'En discussion', 
        icon: <MessageCircle className="mr-2 h-4 w-4 text-blue-500" />, 
        variant: 'outline',
        tooltip: 'L\'entreprise a manifesté son intérêt'
      },
      'acceptee': { 
        label: 'Acceptée', 
        icon: <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />, 
        variant: 'success',
        tooltip: 'Félicitations ! Votre candidature a été acceptée'
      },
      'refusee': { 
        label: 'Refusée', 
        icon: <XCircle className="mr-2 h-4 w-4 text-red-500" />, 
        variant: 'destructive',
        tooltip: 'Votre candidature n\'a pas été retenue'
      },
      // Compatibilité avec les anciens statuts en anglais
      'pending': { 
        label: 'En attente', 
        icon: <Clock className="mr-2 h-4 w-4" />, 
        variant: 'secondary',
        tooltip: 'Votre candidature est en cours d\'examen'
      },
      'accepted': { 
        label: 'Acceptée', 
        icon: <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />, 
        variant: 'success',
        tooltip: 'Félicitations ! Votre candidature a été acceptée'
      },
      'rejected': { 
        label: 'Refusée', 
        icon: <XCircle className="mr-2 h-4 w-4 text-red-500" />, 
        variant: 'destructive',
        tooltip: 'Votre candidature n\'a pas été retenue'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['en_attente'];
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={config.variant as any} className="flex items-center cursor-help">
              {config.icon}
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const handleViewDetails = (candidature: any) => {
    setSelectedCandidature(candidature);
    resetTimer(); // Reset session timeout when viewing details
  };

  // Format date safely
  const formatDate = (dateString: string, formatStr: string) => {
    try {
      // Try to parse the date string
      const date = parseISO(dateString);
      // Check if the date is valid
      if (isValid(date)) {
        return format(date, formatStr, { locale: fr });
      }
      return 'Date invalide';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date invalide';
    }
  };

  return (
    <div className="w-full" onClick={handleUserInteraction}>
      {loading ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos candidatures...</p>
        </div>
      ) : candidatures.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <FileSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune candidature trouvée</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Vous n'avez pas encore postulé à des offres de stage. Explorez les offres disponibles pour commencer votre recherche.</p>
          <Link to="/offres-stages">
            <Button>
              Voir les offres de stage
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidatures.map((candidature) => (
                <TableRow key={candidature.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {candidature.stages?.title || 'Stage sans titre'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {candidature.stages?.entreprises?.logo_url ? (
                        <img 
                          src={candidature.stages.entreprises.logo_url} 
                          alt={candidature.stages.entreprises.name} 
                          className="w-5 h-5 mr-2 rounded-full object-cover"
                        />
                      ) : (
                        <Building2 className="mr-2 h-4 w-4 text-gray-500" />
                      )}
                      <span className="truncate max-w-[120px]">
                        {candidature.stages?.entreprises?.name || 'Entreprise inconnue'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-gray-500 text-sm">
                    {formatDate(candidature.created_at || candidature.date_postulation || new Date().toISOString(), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(candidature.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewDetails(candidature)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Voir les détails</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal de détails de candidature */}
      <Dialog 
        open={!!selectedCandidature} 
        onOpenChange={(open) => {
          if (!open) setSelectedCandidature(null);
          resetTimer();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de la candidature</DialogTitle>
          </DialogHeader>
          {selectedCandidature && (
            <div className="space-y-6">
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <h3 className="text-sm font-semibold col-span-1">Stage</h3>
                  <div className="col-span-3">
                    <p className="font-medium">{selectedCandidature.stages?.title || 'Stage sans titre'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <h3 className="text-sm font-semibold col-span-1">Entreprise</h3>
                  <div className="col-span-3 flex items-center">
                    {selectedCandidature.stages?.entreprises?.logo_url ? (
                      <img 
                        src={selectedCandidature.stages.entreprises.logo_url} 
                        alt={selectedCandidature.stages.entreprises.name} 
                        className="w-6 h-6 mr-2 rounded-full object-cover"
                      />
                    ) : (
                      <Building2 className="mr-2 h-5 w-5" />
                    )}
                    <p>{selectedCandidature.stages?.entreprises?.name || 'Entreprise inconnue'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <h3 className="text-sm font-semibold col-span-1">Statut</h3>
                  <div className="col-span-3">
                    {getStatusBadge(selectedCandidature.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <h3 className="text-sm font-semibold col-span-1">Postuléé le</h3>
                  <div className="col-span-3 flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <p className="text-sm">
                      {formatDate(selectedCandidature.created_at || selectedCandidature.date_postulation || new Date().toISOString(), 'dd MMMM yyyy à HH:mm')}
                    </p>
                  </div>
                </div>
                
                {selectedCandidature.interview_date && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <h3 className="text-sm font-semibold col-span-1">Entretien</h3>
                    <div className="col-span-3">
                      <p className="text-sm">{formatDate(selectedCandidature.interview_date, 'dd MMMM yyyy à HH:mm')}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedCandidature.stages?.description && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-2">Description du stage</h3>
                  <p className="text-sm text-gray-600">{selectedCandidature.stages.description}</p>
                </div>
              )}
              
              {selectedCandidature.note && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedCandidature.note}</p>
                </div>
              )}
              
              <DialogFooter className="flex justify-between items-center">
                {selectedCandidature.status === 'acceptee' || selectedCandidature.status === 'accepted' ? (
                  <Badge className="bg-green-100 text-green-800 mr-auto">Candidature acceptée</Badge>
                ) : null}
                
                <div className="flex gap-2">
                  {selectedCandidature.stages?.id && (
                    <Link to={`/stages/${selectedCandidature.stages.id}`}>
                      <Button variant="outline" size="sm">
                        Voir l'offre
                      </Button>
                    </Link>
                  )}
                  <Button size="sm" onClick={() => setSelectedCandidature(null)}>Fermer</Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
