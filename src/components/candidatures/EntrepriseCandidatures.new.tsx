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
  Star,
  Eye,
  BookOpen,
  Briefcase,
  GraduationCap,
  BarChart,
  Lightbulb,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Loader2,
  Download
} from "lucide-react";
import { useCandidatures } from '@/hooks/useCandidatures';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from 'sonner';
import { sendEmail } from '@/lib/emailService'; 
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormattedText } from '@/components/FormattedText';
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CVAnalysisResult, MotivationLetterAnalysisResult } from '@/lib/aiHelpers';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

export const EntrepriseCandidatures: React.FC = () => {
  const { user } = useAuth();
  const { resetTimer } = useSessionTimeout();
  const { 
    getCandidaturesByEntreprise, 
    updateCandidatureStatus,
    analyseCompetences,
    getDocumentContent,
    analyzeCVForJob,
    analyzeMotivationLetterForJob,
    getCandidatureDetails,
    loading 
  } = useCandidatures();
  const [stages, setStages] = useState<any[]>([]);
  const [selectedCandidature, setSelectedCandidature] = useState<any>(null);
  const [candidateAnalysis, setCandidateAnalysis] = useState<any>(null);
  const [statusChangeReason, setStatusChangeReason] = useState<string>('');
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState<boolean>(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    candidatureId: string;
    status: 'accepted' | 'rejected';
  } | null>(null);
  
  // Nouveaux états pour la visualisation des documents et l'analyse
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [cvContent, setCvContent] = useState<string | null>(null);
  const [motivationLetterContent, setMotivationLetterContent] = useState<string | null>(null);
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysisResult | null>(null);
  const [letterAnalysis, setLetterAnalysis] = useState<MotivationLetterAnalysisResult | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    const fetchCandidatures = async () => {
      if (user) {
        resetTimer(); // Réinitialiser le timer lors du chargement des données
        const entrepriseCandidatures = await getCandidaturesByEntreprise(user.id);
        setStages(entrepriseCandidatures);
      }
    };

    fetchCandidatures();
  }, [user, resetTimer]);

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
    resetTimer(); // Réinitialiser le timer lors de la mise à jour du statut
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
          body: `Nous sommes désolés de vous informer que votre candidature pour le stage "${candidature.stages.title}" n'a pas été retenue.`
        }
      };

      const message = statusMessages[status];

      // Envoyer un email de notification
      if (candidature.stagiaires?.email) {
        await sendEmail({
          to: candidature.stagiaires.email,
          subject: message.subject,
          text: message.body + (statusChangeReason ? `\n\nMotif : ${statusChangeReason}` : ''),
          html: `<p>${message.body}</p>${statusChangeReason ? `<p><strong>Motif :</strong> ${statusChangeReason}</p>` : ''}`
        });
      }

      toast.success(`Candidature ${status === 'accepted' ? 'acceptée' : 'rejetée'} avec succès`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut', error);
      toast.error('Impossible de mettre à jour le statut de la candidature');
    }
  };

  const handleStatusChangeWithReason = () => {
    resetTimer(); // Réinitialiser le timer lors du changement de statut
    if (!pendingStatusChange) return;
    
    const { candidatureId, status } = pendingStatusChange;
    
    // Mettre à jour le statut avec la raison
    updateCandidatureStatus(
      candidatureId, 
      status, 
      { 
        status_change_reason: statusChangeReason,
        status_changed_by: 'entreprise'
      }
    ).then(() => {
      // Mettre à jour la liste des stages
      const updatedStages = stages.map(stage => ({
        ...stage,
        candidatures: stage.candidatures.map((candidature: any) => 
          candidature.id === candidatureId 
            ? { ...candidature, status, status_change_reason: statusChangeReason } 
            : candidature
        )
      }));
      
      setStages(updatedStages);
      
      // Réinitialiser les états
      setPendingStatusChange(null);
      setStatusChangeReason('');
      setStatusChangeModalOpen(false);
      
      toast.success(`Candidature ${status === 'accepted' ? 'acceptée' : 'rejetée'} avec succès`);
    }).catch(error => {
      console.error('Erreur lors de la mise à jour du statut', error);
      toast.error('Impossible de mettre à jour le statut de la candidature');
    });
  };

  const openStatusChangeModal = (candidatureId: string, status: 'accepted' | 'rejected') => {
    resetTimer(); // Réinitialiser le timer lors de l'ouverture de la modal
    setPendingStatusChange({ candidatureId, status });
    setStatusChangeModalOpen(true);
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
      return globalAnalysis;
    } catch (error) {
      console.error('Erreur lors de l\'analyse du candidat', error);
      setCandidateAnalysis(null);
      return null;
    }
  };

  const calculateReadabilityScore = (text: string): number => {
    if (!text) return 0;
    
    // Calcul simple de la lisibilité basé sur la longueur du texte
    const words = text.split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    
    return sentences.length > 0 && words.length > 0 
      ? Math.min(100, Math.round((words.length / sentences.length) * 10))
      : 0;
  };

  const handleViewDetails = async (candidature: any) => {
    resetTimer(); // Réinitialiser le timer lors de l'affichage des détails
    try {
      // Réinitialiser les états
      setCvContent(null);
      setMotivationLetterContent(null);
      setCvAnalysis(null);
      setLetterAnalysis(null);
      setActiveTab('profile');
      setIsLoadingDocuments(true);
      
      // Récupérer les détails complets de la candidature
      const detailedCandidature = await getCandidatureDetails(candidature.id);
      
      if (!detailedCandidature) {
        throw new Error('Impossible de récupérer les détails de la candidature');
      }
      
      // Vérification et récupération des compétences requises
      const stageSkills = 
        detailedCandidature.stages?.required_skills || 
        detailedCandidature.stages?.skills || 
        stages.find(s => s.id === detailedCandidature.stage_id)?.required_skills || 
        [];

      // Vérification sécurisée des compétences du candidat
      const candidatSkills = 
        detailedCandidature.stagiaires?.skills || 
        [];
      
      // Analyse des compétences avec des valeurs par défaut
      const competenceAnalysis = analyseCompetences(
        stageSkills.filter(Boolean), 
        candidatSkills.filter(Boolean)
      );
      
      // Lancer l'analyse du candidat avec des vérifications
      const candidateAnalysisResult = await analyseCandidate(detailedCandidature);
      
      // Mise à jour sécurisée de l'état
      setSelectedCandidature({
        ...detailedCandidature,
        competenceAnalysis: competenceAnalysis || { 
          matched_skills: [], 
          missing_skills: stageSkills,
          match_percentage: 0 
        },
        analysis: candidateAnalysisResult || null
      });
      
      // Récupérer les URLs des documents
      const cvUrl = detailedCandidature.cv?.[0]?.file_url;
      const letterUrl = detailedCandidature.lettre?.[0]?.file_url;
      
      // Récupérer le contenu des documents (simulé pour l'instant)
      if (cvUrl) {
        const content = await getDocumentContent(cvUrl);
        setCvContent(content);
      }
      
      if (letterUrl) {
        const content = await getDocumentContent(letterUrl);
        setMotivationLetterContent(content);
      }
      
      setIsLoadingDocuments(false);
      
      // Lancer l'analyse des documents avec Gemini
      if (cvUrl || letterUrl) {
        setIsAnalyzing(true);
        
        // Analyser le CV si disponible
        if (cvUrl && detailedCandidature.stages?.description) {
          const analysis = await analyzeCVForJob(
            cvUrl,
            detailedCandidature.stages.description,
            stageSkills
          );
          setCvAnalysis(analysis);
        }
        
        // Analyser la lettre de motivation si disponible
        if (letterUrl && detailedCandidature.stages?.description) {
          const analysis = await analyzeMotivationLetterForJob(
            letterUrl,
            detailedCandidature.stages.description
          );
          setLetterAnalysis(analysis);
        }
        
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Erreur lors de la visualisation des détails', error);
      setIsLoadingDocuments(false);
      setIsAnalyzing(false);
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
                                  variant="outline" 
                                  size="sm"
                                  className="bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
                                  onClick={() => openStatusChangeModal(candidature.id, 'accepted')}
                                >
                                  Accepter
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => openStatusChangeModal(candidature.id, 'rejected')}
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
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCandidature(null);
            setCandidateAnalysis(null);
            setCvContent(null);
            setMotivationLetterContent(null);
            setCvAnalysis(null);
            setLetterAnalysis(null);
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Détails de la candidature</DialogTitle>
          </DialogHeader>
          {selectedCandidature && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" /> Profil
                </TabsTrigger>
                <TabsTrigger value="cv">
                  <FileCode className="mr-2 h-4 w-4" /> CV
                </TabsTrigger>
                <TabsTrigger value="letter">
                  <FileText className="mr-2 h-4 w-4" /> Lettre de motivation
                </TabsTrigger>
                <TabsTrigger value="analysis">
                  <BarChart className="mr-2 h-4 w-4" /> Analyse IA
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4">
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
                          {selectedCandidature.cv_url && (
                            <Button 
                              variant="outline"
                              className="w-full"
                              onClick={() => window.open(selectedCandidature.cv_url, '_blank')}
                            >
                              <FileCode className="mr-2 h-4 w-4" /> Voir le CV
                            </Button>
                          )}
                          {selectedCandidature.lettre_motivation_url && (
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

                  {/* Compétences et Analyse */}
                  <div className="col-span-2 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Building2 className="mr-2 h-6 w-6" />
                          Détails de l'offre
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Titre :</strong> {selectedCandidature.stages?.title || 'Non renseigné'}</p>
                          <p><strong>Entreprise :</strong> {selectedCandidature.stages?.entreprises?.name || 'Non renseigné'}</p>
                          <p><strong>Compétences requises :</strong></p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedCandidature.stages?.required_skills?.map((skill: string, index: number) => (
                              <Badge key={index} variant="outline">{skill}</Badge>
                            )) || 'Aucune compétence spécifiée'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Star className="mr-2 h-6 w-6 text-amber-500" />
                          Correspondance des compétences
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span>Taux de correspondance</span>
                              <span className="font-semibold">
                                {selectedCandidature.competenceAnalysis?.match_percentage || 0}%
                              </span>
                            </div>
                            <Progress 
                              value={selectedCandidature.competenceAnalysis?.match_percentage || 0} 
                              className="h-2"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Compétences correspondantes</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedCandidature.competenceAnalysis?.matched_skills?.map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline" className="bg-green-50">
                                    <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                                    {skill}
                                  </Badge>
                                )) || 'Aucune correspondance'}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Compétences manquantes</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedCandidature.competenceAnalysis?.missing_skills?.map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline" className="bg-red-50">
                                    <XCircle className="mr-1 h-3 w-3 text-red-500" />
                                    {skill}
                                  </Badge>
                                )) || 'Aucune compétence manquante'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="cv" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileCode className="mr-2 h-6 w-6" /> CV du candidat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDocuments ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : cvContent ? (
                      <div className="space-y-4">
                        <ScrollArea className="h-[60vh] border rounded-md p-4">
                          <FormattedText text={cvContent} highlightKeywords={true} />
                        </ScrollArea>
                        
                        {selectedCandidature.cv_url && (
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => window.open(selectedCandidature.cv_url, '_blank')}
                          >
                            <Download className="mr-2 h-4 w-4" /> Télécharger le CV
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">Aucun CV disponible pour ce candidat</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="letter" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-6 w-6" /> Lettre de motivation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDocuments ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : motivationLetterContent ? (
                      <div className="space-y-4">
                        <ScrollArea className="h-[60vh] border rounded-md p-4">
                          <FormattedText text={motivationLetterContent} highlightKeywords={true} />
                        </ScrollArea>
                        
                        {selectedCandidature.lettre_motivation_url && (
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => window.open(selectedCandidature.lettre_motivation_url, '_blank')}
                          >
                            <Download className="mr-2 h-4 w-4" /> Télécharger la lettre
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">Aucune lettre de motivation disponible pour ce candidat</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Analyse du CV */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileCode className="mr-2 h-6 w-6" /> Analyse du CV
                      </CardTitle>
                      <CardDescription>
                        Correspondance avec l'offre de stage
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                          <p>Analyse en cours...</p>
                        </div>
                      ) : cvAnalysis ? (
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-2">Score de correspondance</h4>
                            <div className="flex items-center gap-4">
                              <Progress value={cvAnalysis.matchScore} className="h-2" />
                              <span className="font-semibold">{cvAnalysis.matchScore}%</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Compétences correspondantes</h4>
                              <div className="flex flex-wrap gap-2">
                                {cvAnalysis.matchedSkills.map((skill, index) => (
                                  <Badge key={index} variant="outline" className="bg-green-50">
                                    <ThumbsUp className="mr-1 h-3 w-3 text-green-500" />
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Compétences manquantes</h4>
                              <div className="flex flex-wrap gap-2">
                                {cvAnalysis.missingSkills.map((skill, index) => (
                                  <Badge key={index} variant="outline" className="bg-red-50">
                                    <ThumbsDown className="mr-1 h-3 w-3 text-red-500" />
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Points forts</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {cvAnalysis.keyStrengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Suggestions pour l'entretien</h4>
                            <p className="text-sm">{cvAnalysis.suggestions}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Évaluation globale</h4>
                            <p className="text-sm">{cvAnalysis.overallAssessment}</p>
                          </div>
                        </div>
                      ) : !cvContent ? (
                        <div className="text-center py-8">
                          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600">Aucun CV disponible pour analyse</p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Button 
                            onClick={() => {
                              setIsAnalyzing(true);
                              analyzeCVForJob(
                                selectedCandidature.cv_url,
                                selectedCandidature.stages?.description || "",
                                selectedCandidature.stages?.required_skills || []
                              ).then(result => {
                                setCvAnalysis(result);
                                setIsAnalyzing(false);
                              });
                            }}
                          >
                            <Sparkles className="mr-2 h-4 w-4" /> Analyser le CV
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Analyse de la lettre de motivation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-6 w-6" /> Analyse de la lettre
                      </CardTitle>
                      <CardDescription>
                        Évaluation de la lettre de motivation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                          <p>Analyse en cours...</p>
                        </div>
                      ) : letterAnalysis ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-1">Clarté</h4>
                              <div className="flex items-center gap-2">
                                <Progress value={letterAnalysis.clarity} className="h-2" />
                                <span className="text-sm">{letterAnalysis.clarity}%</span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-1">Pertinence</h4>
                              <div className="flex items-center gap-2">
                                <Progress value={letterAnalysis.relevance} className="h-2" />
                                <span className="text-sm">{letterAnalysis.relevance}%</span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-1">Enthousiasme</h4>
                              <div className="flex items-center gap-2">
                                <Progress value={letterAnalysis.enthusiasm} className="h-2" />
                                <span className="text-sm">{letterAnalysis.enthusiasm}%</span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-1">Personnalisation</h4>
                              <div className="flex items-center gap-2">
                                <Progress value={letterAnalysis.personalTouch} className="h-2" />
                                <span className="text-sm">{letterAnalysis.personalTouch}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Score global</h4>
                            <div className="flex items-center gap-4">
                              <Progress value={letterAnalysis.overallScore} className="h-2" />
                              <span className="font-semibold">{letterAnalysis.overallScore}%</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Points forts</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {letterAnalysis.strengths.map((strength, index) => (
                                  <li key={index}>{strength}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Points à améliorer</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {letterAnalysis.weaknesses.map((weakness, index) => (
                                  <li key={index}>{weakness}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Résumé</h4>
                            <p className="text-sm">{letterAnalysis.summary}</p>
                          </div>
                        </div>
                      ) : !motivationLetterContent ? (
                        <div className="text-center py-8">
                          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600">Aucune lettre disponible pour analyse</p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Button 
                            onClick={() => {
                              setIsAnalyzing(true);
                              analyzeMotivationLetterForJob(
                                selectedCandidature.lettre_motivation_url,
                                selectedCandidature.stages?.description || ""
                              ).then(result => {
                                setLetterAnalysis(result);
                                setIsAnalyzing(false);
                              });
                            }}
                          >
                            <Sparkles className="mr-2 h-4 w-4" /> Analyser la lettre
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de changement de statut avec raison */}
      <Dialog 
        open={statusChangeModalOpen} 
        onOpenChange={(open) => {
          setStatusChangeModalOpen(open);
          if (!open) {
            setPendingStatusChange(null);
            setStatusChangeReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingStatusChange?.status === 'accepted' 
                ? 'Accepter la candidature' 
                : 'Rejeter la candidature'}
            </DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison de votre décision
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Label htmlFor="status-change-reason">
              Motif de la décision
            </Label>
            <Textarea
              id="status-change-reason"
              placeholder={
                pendingStatusChange?.status === 'accepted'
                  ? 'Expliquez pourquoi vous acceptez ce candidat...'
                  : 'Expliquez pourquoi vous rejetez ce candidat...'
              }
              value={statusChangeReason}
              onChange={(e) => setStatusChangeReason(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setStatusChangeModalOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant={pendingStatusChange?.status === 'accepted' ? 'default' : 'destructive'}
              onClick={handleStatusChangeWithReason}
              disabled={!statusChangeReason.trim()}
            >
              {pendingStatusChange?.status === 'accepted' ? 'Accepter' : 'Rejeter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EntrepriseCandidatures;
