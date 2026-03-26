import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { MapPin, Building2, Calendar, ArrowLeft, Mail, Phone, Globe, Clock, Briefcase, GraduationCap, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import CandidatureModal from "@/components/CandidatureModal";
import FormattedText from "@/components/FormattedText";
import { useSessionTimeout } from "@/contexts/SessionTimeoutContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

const DetailStage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [showCandidatureModal, setShowCandidatureModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<any>(null);
  const { resetTimer } = useSessionTimeout();
  
  useEffect(() => {
    if (id) {
      fetchStageData();
      incrementViews();
    }
    
    // Réinitialiser le timer d'inactivité lors des interactions utilisateur
    const handleUserActivity = () => resetTimer();
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    
    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [id, resetTimer]);

  const fetchStageData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stages')
        .select(`
          *,
          entreprise:entreprises (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setStage(data);
    } catch (error) {
      console.error('Erreur de chargement du stage:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les détails de l'offre.",
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      // Utiliser le RPC pour une incrémentation atomique
      await supabase.rpc('increment_stage_views', { target_stage_id: id });
    } catch (error) {
      // Ignorer silencieusement les erreurs d'incrémentation pour ne pas bloquer l'utilisateur
      console.warn('Erreur lors de l\'incrémentation des vues:', error);
    }
  };

  const handlePostuler = () => {
    resetTimer();
    setShowCandidatureModal(true);
  };

  const handleCandidatureClose = () => {
    setShowCandidatureModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto pt-32 px-4 flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Chargement de l'offre...</p>
        </div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="min-h-screen bg-gray-50 text-center pt-32">
        <Navigation />
        <h1 className="text-2xl font-bold">Offre introuvable</h1>
        <Link to="/stages" className="text-primary mt-4 inline-block hover:underline">
          Retour aux offres
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
        <Link 
          to="/stages" 
          className="inline-flex items-center text-gray hover:text-primary mb-8"
          onClick={() => resetTimer()}
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux offres
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in border dark:bg-zinc-900 dark:border-zinc-800">
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-4 dark:text-white">
                {stage.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-gray dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Building2 size={16} />
                  {stage.entreprise?.name || "Entreprise"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {stage.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {stage.duration}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {stage.required_skills?.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="px-3 py-1 bg-gray-light text-gray rounded-full text-sm dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in border dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-semibold dark:text-white">Détails de l'offre</h2>
                <Badge className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100">
                  {stage.type === 'temps_plein' ? 'Temps plein' : stage.type === 'alternance' ? 'Alternance' : 'Stage'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Début: {stage.start_date ? new Date(stage.start_date).toLocaleDateString() : 'Dès que possible'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
                  <Clock size={16} className="text-gray-400" />
                  <span>Durée: {stage.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
                  <GraduationCap size={16} className="text-gray-400" />
                  <span>Niveau: {stage.education_level || 'Non spécifié'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 font-medium dark:text-zinc-300">
                  <Briefcase size={16} className="text-gray-400" />
                  <span>Rémunération: {stage.compensation || 'À discuter'}</span>
                </div>
              </div>
              
              <div className="mb-8 dark:text-zinc-300">
                <FormattedText text={stage.description} highlightKeywords={true} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Company Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm animate-fade-in border dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <Building2 size={22} className="text-primary" />
                <h2 className="text-xl font-semibold dark:text-white">{stage.entreprise?.name}</h2>
              </div>
              
              {stage.entreprise?.sector && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
                    {stage.entreprise.sector}
                  </Badge>
                </div>
              )}
              
              <div className="mb-6 dark:text-zinc-400 text-sm">
                <FormattedText text={stage.entreprise?.description || "Aucune description disponible pour cette entreprise."} highlightKeywords={false} />
              </div>
              
              <div className="space-y-3">
                {stage.entreprise?.website && (
                  <a
                    href={stage.entreprise.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray hover:text-primary transition-colors text-sm dark:text-zinc-400"
                    onClick={() => resetTimer()}
                  >
                    <Globe size={16} />
                    Site web
                  </a>
                )}
                {stage.entreprise?.email && (
                  <a
                    href={`mailto:${stage.entreprise.email}`}
                    className="flex items-center gap-2 text-gray hover:text-primary transition-colors text-sm dark:text-zinc-400"
                    onClick={() => resetTimer()}
                  >
                    <Mail size={16} />
                    {stage.entreprise.email}
                  </a>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handlePostuler}
              className="w-full bg-primary text-white px-6 py-4 rounded-xl hover:bg-primary/90 transition-all transform hover:scale-[1.02] shadow-lg font-bold flex items-center justify-center gap-2"
            >
              Postuler à cette offre
              <ArrowLeft size={20} className="rotate-180" />
            </button>
            <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock size={12} />
              {stage.views_count || 0} vues • {stage.applications_count || 0} candidatures
            </div>
          </div>
        </div>
      </div>

      <CandidatureModal
        isOpen={showCandidatureModal}
        onClose={() => {
          handleCandidatureClose();
          resetTimer();
        }}
        stageId={Number(id)}
        stageTitre={stage.title}
      />
    </div>
  );
};

export default DetailStage;
