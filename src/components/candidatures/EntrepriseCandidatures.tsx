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
  FileText,
  User,
  AlertCircle,
  FileCode,
  Star
} from "lucide-react";
import { useCandidatures } from '@/hooks/useCandidatures';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { sendEmail } from '@/lib/emailService'; 

export const EntrepriseCandidatures: React.FC = () => {
  const { user } = useAuth();
  const { 
    getCandidaturesByEntreprise, 
    updateCandidatureStatus,
    analyseCompetences,
    loading 
  } = useCandidatures();
  const [stages, setStages] = useState<any[]>([]);
  const [selectedCandidature, setSelectedCandidature] = useState<any>(null);
  const [candidateAnalysis, setCandidateAnalysis] = useState<any>(null);

  useEffect(() => {
    const fetchCandidatures = async () => {
      if (user) {
        const entrepriseCandidatures = await getCandidaturesByEntreprise(user.id);
        setStages(entrepriseCandidatures);
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

  const handleUpdateStatus = async (candidatureId: string, status: 'accepted' | 'rejected') => {
    try {
      // Trouver la candidature spécifique
      const candidature = stages
        .flatMap(stage => stage.candidatures)
        .find((c: any) => c.id === candidatureId);

      if (!candidature) {
        toast.error('Candidature non trouvée');
        return;
      }

      // Mettre à jour le statut
      await updateCandidatureStatus(candidatureId, status);

      // Mettre à jour la liste des stages
      const updatedStages = stages.map(stage => ({
        ...stage,
        candidatures: stage.candidatures.map((candidature: any) => 
          candidature.id === candidatureId ? { ...candidature, status } : candidature
        )
      }));
      setStages(updatedStages);

      // Préparer le message de notification
      const statusMessages = {
        'accepted': {
          subject: 'Candidature acceptée',
          body: `Félicitations ! Votre candidature pour le stage "${candidature.stages.title}" a été acceptée.`
        },
        'rejected': {
          subject: 'Candidature rejetée',
          body: `Nous regrettons de vous informer que votre candidature pour le stage "${candidature.stages.title}" n'a pas été retenue.`
        }
      };

      // Envoyer un email de notification
      await sendEmail({
        to: candidature.stagiaires.email,
        subject: statusMessages[status].subject,
        body: statusMessages[status].body
      });

      // Notification toast
      toast.success(`Candidature ${status === 'accepted' ? 'acceptée' : 'rejetée'}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut', error);
      toast.error('Impossible de mettre à jour le statut');
    }
  };

  const analyseCandidate = async (candidature: any) => {
    try {
      const profileAnalysis = {
        name: candidature.stagiaires?.name || 'Non renseigné',
        email: candidature.stagiaires?.email || 'Non renseigné',
        skills: candidature.stagiaires?.skills || [],
        education: candidature.stagiaires?.education || [],
        experience: candidature.stagiaires?.experience || []
      };

      // Récupérer les compétences requises du stage
      const requiredSkills = candidature.stages?.required_skills || 
        candidature.stages?.skills || 
        [];

      // Analyse globale
      const globalAnalysis = {
        profile: profileAnalysis,
        competence_match: analyseCompetences(
          requiredSkills, 
          profileAnalysis.skills
        )
      };

      setCandidateAnalysis(globalAnalysis);
    } catch (error) {
      console.error('Erreur lors de l\'analyse du candidat', error);
      setCandidateAnalysis(null);
    }
  };

  const calculateReadabilityScore = (text: string): number => {
    // Implémentation simple d'un score de lisibilité
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const complexWords = text.split(/\s+/).filter(word => word.length > 6).length;

    // Score de Flesch-Kincaid simplifié
    return words > 0 && sentences > 0 
      ? 206.835 - 1.015 * (words / sentences) - 84.6 * (complexWords / words)
      : 0;
  };

  const handleViewDetails = async (candidature: any) => {
    try {
      // Vérification et récupération des compétences requises
      const stageSkills = 
        candidature.stages?.required_skills || 
        candidature.stages?.skills || 
        stages.find(s => s.id === candidature.stage_id)?.required_skills || 
        [];

      // Vérification sécurisée des compétences du candidat
      const candidatSkills = 
        candidature.candidats?.cv_skills || 
        candidature.stagiaires?.skills || 
        [];
      
      // Analyse des compétences avec des valeurs par défaut
      const competenceAnalysis = analyseCompetences(
        stageSkills.filter(Boolean), 
        candidatSkills.filter(Boolean)
      );
      
      // Lancer l'analyse du candidat avec des vérifications
      const candidateAnalysisResult = await analyseCandidate(candidature);
      
      // Mise à jour sécurisée de l'état
      setSelectedCandidature({
        ...candidature,
        competenceAnalysis: competenceAnalysis || { 
          matched_skills: [], 
          missing_skills: stageSkills,
          match_percentage: 0 
        },
        analysis: candidateAnalysisResult || null
      });
    } catch (error) {
      console.error('Erreur lors de la visualisation des détails', error);
      // toast.error('Impossible de charger les détails du candidat');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Candidatures de mes offres</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <p>Chargement des candidatures...</p>
        </div>
      ) : stages.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FileSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Aucune candidature pour vos offres de stage</p>
        </div>
      ) : (
        <div className="space-y-6">
          {stages.map((stage) => (
            <Card key={stage.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{stage.title}</span>
                  <Badge variant="outline">
                    {stage.candidatures.length} candidature(s)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidat</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date de candidature</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stage.candidatures.map((candidature: any) => (
                      <TableRow key={candidature.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            {candidature.stagiaires?.name || 'Non renseigné'}
                          </div>
                        </TableCell>
                        <TableCell>{candidature.stagiaires?.email || 'Non renseigné'}</TableCell>
                        <TableCell>
                          {candidature.date_postulation 
                            ? format(new Date(candidature.date_postulation), 'dd MMMM yyyy', { locale: fr }) 
                            : 'Date non disponible'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(candidature.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewDetails(candidature)}
                            >
                              Détails
                            </Button>
                            {candidature.status === 'pending' && (
                              <>
                                <Button 
                                  variant="success" 
                                  size="sm"
                                  onClick={() => handleUpdateStatus(candidature.id, 'accepted')}
                                >
                                  Accepter
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleUpdateStatus(candidature.id, 'rejected')}
                                >
                                  Rejeter
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de détails de candidature */}
      <Dialog 
        open={!!selectedCandidature} 
        onOpenChange={() => {
          setSelectedCandidature(null);
          setCandidateAnalysis(null);
        }}
      >
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Détails de la candidature</DialogTitle>
          </DialogHeader>
          {selectedCandidature && (
            <div className="grid grid-cols-3 gap-6">
              {/* Informations de base */}
              <div className="col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-6 w-6" />
                      Informations du candidat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Nom :</strong> {selectedCandidature.stagiaires?.name || 'Non renseigné'}</p>
                      <p><strong>Email :</strong> {selectedCandidature.stagiaires?.email || 'Non renseigné'}</p>
                      <p>
                        <strong>Date de candidature :</strong> 
                        {selectedCandidature.date_postulation 
                          ? format(new Date(selectedCandidature.date_postulation), 'dd MMMM yyyy à HH:mm', { locale: fr }) 
                          : 'Date non disponible'}
                      </p>
                      <p><strong>Statut :</strong> {getStatusBadge(selectedCandidature.status)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-6 w-6" />
                      Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedCandidature.cv_id && (
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(selectedCandidature.cv_url, '_blank')}
                        >
                          <FileCode className="mr-2 h-4 w-4" /> Voir le CV
                        </Button>
                      )}
                      {selectedCandidature.lettre_motivation_id && (
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(selectedCandidature.lettre_motivation_url, '_blank')}
                        >
                          <FileText className="mr-2 h-4 w-4" /> Lettre de motivation
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analyse du candidat */}
              <div className="col-span-2 space-y-4">
                {candidateAnalysis ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Star className="mr-2 h-6 w-6 text-yellow-500" />
                          Analyse des compétences
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Correspondance avec le stage</h4>
                            <Progress 
                              value={candidateAnalysis.competence_match.match_percentage} 
                              className="w-full" 
                            />
                            <p className="text-sm mt-2">
                              {candidateAnalysis.competence_match.match_percentage}% des compétences requises correspondent
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Compétences correspondantes</h4>
                              <ul className="list-disc list-inside text-sm">
                                {candidateAnalysis.competence_match.matched_skills.map((skill: string, index: number) => (
                                  <li key={index} className="text-green-600">{skill}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Compétences manquantes</h4>
                              <ul className="list-disc list-inside text-sm">
                                {candidateAnalysis.competence_match.missing_skills.map((skill: string, index: number) => (
                                  <li key={index} className="text-red-600">{skill}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileCode className="mr-2 h-6 w-6" />
                          Analyse du CV
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Qualité du document</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p><strong>Longueur :</strong> </p>
                                <p>
                                  <strong>Lisibilité :</strong> 
                                </p>
                              </div>
                              <div>
                                <Progress 
                                  value={0} 
                                  className="w-full" 
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Mots-clés</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p><strong>Correspondance :</strong></p>
                                <ul className="list-disc list-inside text-sm">
                                </ul>
                              </div>
                              <div>
                                <p><strong>Mots-clés manquants :</strong></p>
                                <ul className="list-disc list-inside text-sm">
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p>Analyse du candidat en cours...</p>
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

export default EntrepriseCandidatures;
