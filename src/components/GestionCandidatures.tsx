// Définition de l'interface Candidat compatible avec le reste du code
// en utilisant des string pour les IDs
export interface Candidat {
  id: string;
  stagiaire_id: string;
  stage_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'interview';
  application_date: string;
  message?: string;
  stagiaire?: {
    name: string;
    avatar_url?: string;
    title?: string;
    location?: string;
  };
  stage?: {
    title: string;
    entreprise_name?: string;
  };
}

// Ajoutez ici le reste du contenu du fichier
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, Building, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

interface GestionCandidaturesProps {
  entrepriseId?: string;
  stagiaireId?: string;
  limit?: number;
  showViewAll?: boolean;
}

export function GestionCandidatures({ 
  entrepriseId, 
  stagiaireId, 
  limit = 5,
  showViewAll = true 
}: GestionCandidaturesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [candidatures, setCandidatures] = useState<Candidat[]>([]);
  const [filteredCandidatures, setFilteredCandidatures] = useState<Candidat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidature, setSelectedCandidature] = useState<Candidat | null>(null);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Déterminer si l'utilisateur est une entreprise ou un stagiaire
  const isEntreprise = user?.role === 'entreprise';
  const isStagiaire = user?.role === 'stagiaire';

  // Déterminer si l'utilisateur consulte ses propres candidatures
  const isOwner = (isEntreprise && entrepriseId === user?.id) || 
                 (isStagiaire && stagiaireId === user?.id);

  useEffect(() => {
    fetchCandidatures();
  }, [entrepriseId, stagiaireId]);

  useEffect(() => {
    filterCandidatures(activeTab);
  }, [activeTab, candidatures]);

  const fetchCandidatures = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('candidatures')
        .select(`
          *,
          stagiaires (
            id,
            name,
            avatar_url,
            title,
            location
          ),
          stages (
            id,
            title,
            entreprises (
              id,
              name
            )
          )
        `)
        .order('application_date', { ascending: false });

      // Filtrer selon le contexte (entreprise ou stagiaire)
      if (entrepriseId) {
        query = query.eq('stages.entreprises.id', entrepriseId);
      } else if (stagiaireId) {
        query = query.eq('stagiaire_id', stagiaireId);
      }

      // Limiter le nombre de résultats si demandé
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Formater les données pour faciliter l'accès
      const formattedData = data.map((candidature: any) => ({
        ...candidature,
        stagiaire: candidature.stagiaires,
        stage: {
          ...candidature.stages,
          entreprise_name: candidature.stages?.entreprises?.name
        }
      }));

      setCandidatures(formattedData);
      filterCandidatures(activeTab, formattedData);
    } catch (error) {
      console.error("Erreur lors de la récupération des candidatures:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les candidatures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCandidatures = (status: string, data = candidatures) => {
    if (status === "all") {
      setFilteredCandidatures(data);
    } else {
      setFilteredCandidatures(data.filter(c => c.status === status));
    }
  };

  const updateCandidatureStatus = async (candidatureId: string, newStatus: 'pending' | 'accepted' | 'rejected' | 'interview') => {
    try {
      const { error } = await supabase
        .from('candidatures')
        .update({ status: newStatus })
        .eq('id', candidatureId);

      if (error) throw error;

      // Mettre à jour l'état local
      setCandidatures(candidatures.map(c => 
        c.id === candidatureId ? { ...c, status: newStatus } : c
      ));

      toast({
        title: "Succès",
        description: `Statut de la candidature mis à jour`,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const handleReply = (candidature: Candidat) => {
    setSelectedCandidature(candidature);
    setShowReplyDialog(true);
  };

  const sendReply = async () => {
    if (!selectedCandidature || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      // Créer un nouveau message dans la table messages
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          receiver_id: isEntreprise ? selectedCandidature.stagiaire_id : selectedCandidature.stage?.entreprise_id,
          content: replyMessage,
          candidature_id: selectedCandidature.id,
          is_read: false
        });

      if (error) throw error;

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      });

      setShowReplyDialog(false);
      setReplyMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Acceptée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refusée</Badge>;
      case 'interview':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Entretien</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: fr
      });
    } catch (e) {
      return "Date inconnue";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isEntreprise ? "Candidatures reçues" : "Mes candidatures"}
        </h2>
        {showViewAll && candidatures.length > limit && (
          <Button 
            variant="outline" 
            onClick={() => navigate(isEntreprise ? "/entreprises/candidatures" : "/stagiaires/candidatures")}
          >
            Voir tout
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="interview">Entretien</TabsTrigger>
          <TabsTrigger value="accepted">Acceptées</TabsTrigger>
          <TabsTrigger value="rejected">Refusées</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredCandidatures.length === 0 ? (
            <Card className="text-center p-6">
              <CardContent className="pt-10 pb-10">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Aucune candidature</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeTab === "all" 
                    ? "Vous n'avez pas encore de candidatures." 
                    : `Vous n'avez pas de candidatures avec le statut "${activeTab}".`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCandidatures.map((candidature) => (
                <Card key={candidature.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {isEntreprise ? (
                          // Afficher le stagiaire si c'est une entreprise qui consulte
                          <>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={candidature.stagiaire?.avatar_url || ""} alt={candidature.stagiaire?.name || ""} />
                              <AvatarFallback>{getInitials(candidature.stagiaire?.name || "")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {candidature.stagiaire?.name || "Candidat"}
                              </CardTitle>
                              <CardDescription>
                                {candidature.stagiaire?.title || "Étudiant"}
                                {candidature.stagiaire?.location && (
                                  <span className="flex items-center mt-1 text-xs">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {candidature.stagiaire.location}
                                  </span>
                                )}
                              </CardDescription>
                            </div>
                          </>
                        ) : (
                          // Afficher l'offre de stage si c'est un stagiaire qui consulte
                          <>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Building className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {candidature.stage?.title || "Offre de stage"}
                              </CardTitle>
                              <CardDescription>
                                {candidature.stage?.entreprise_name || "Entreprise"}
                              </CardDescription>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(candidature.status)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    {candidature.message && (
                      <div className="mb-4 text-sm text-muted-foreground">
                        <p className="font-medium mb-1">Message de candidature :</p>
                        <p className="whitespace-pre-wrap">{candidature.message}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Candidature envoyée {formatDate(candidature.application_date)}</span>
                    </div>
                  </CardContent>
                  
                  {isOwner && (
                    <CardFooter className="bg-muted/50 pt-3 pb-3">
                      <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                          {isEntreprise && candidature.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => updateCandidatureStatus(candidature.id, 'interview')}
                              >
                                Proposer un entretien
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => updateCandidatureStatus(candidature.id, 'accepted')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accepter
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => updateCandidatureStatus(candidature.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Refuser
                              </Button>
                            </>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReply(candidature)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Répondre
                        </Button>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Répondre à la candidature</DialogTitle>
            <DialogDescription>
              Envoyez un message concernant cette candidature.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Votre message</label>
              <Textarea
                placeholder="Écrivez votre message ici..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              Annuler
            </Button>
            <Button onClick={sendReply} disabled={!replyMessage.trim() || sendingReply}>
              {sendingReply ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
