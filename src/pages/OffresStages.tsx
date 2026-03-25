import React, { useEffect, useState } from 'react';
import { Search, MapPin, Building2, Calendar, ArrowRight, X } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useCandidatures } from '@/hooks/useCandidatures';
import { PostulerModal } from '@/components/candidatures/PostulerModal';

interface Stage {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  duration: string;
  start_date: string;
  required_skills: string[];
  entreprise_id: string;
  status: 'active' | 'expired' | 'draft';
  created_at: string;
  entreprises?: {
    name: string;
    logo_url?: string;
  };
  compensation?: {
    amount: number;
    currency: string;
  };
  match_score?: number;
}

const OffresStages = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [isPostulerModalOpen, setIsPostulerModalOpen] = useState(false);
  const [isIARecommended, setIsIARecommended] = useState(false);
  const { user } = useAuth();
  const { createCandidature } = useCandidatures();

  useEffect(() => {
    if (isIARecommended && user) {
      fetchRecommendedStages();
    } else {
      fetchStages();
    }
  }, [isIARecommended, user]);

  const fetchRecommendedStages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_recommended_stages', {
        p_stagiaire_id: user?.id,
        match_threshold: 0.50
      });

      if (error) throw error;
      
      const formattedStages = (data || []).map((s: any) => ({
        ...s,
        entreprises: {
          name: s.entreprise_name,
          logo_url: s.entreprise_logo_url,
        }
      }));
      setStages(formattedStages);
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations IA:', error);
      toast.error('Impossible de charger les recommandations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stages')
        .select(`
          *,
          entreprises (name, logo_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStages(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des stages:', error);
      toast.error('Impossible de charger les stages');
    } finally {
      setLoading(false);
    }
  };

  const filteredStages = stages.filter(stage => {
    const matchesSearch = stage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stage.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || 
                           stage.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const handlePostuler = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour postuler');
      return;
    }

    if (!selectedStage) {
      toast.error('Aucun stage sélectionné');
      return;
    }

    try {
      const result = await createCandidature({
        stage_id: selectedStage.id,
        stagiaire_id: user.id,
        status: 'en_attente'
      });

      if (result) {
        toast.success('Candidature envoyée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la candidature:', error);
      toast.error('Impossible d\'envoyer la candidature');
    }
  };

  const handleOpenPostulerModal = () => {
    setIsPostulerModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
        {/* Zone de recherche */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Rechercher un stage..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Ville ou région"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            {user && (user.user_metadata?.account_type === 'candidat' || user.user_metadata?.role === 'stagiaire') && (
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => setIsIARecommended(!isIARecommended)}
                  variant={isIARecommended ? "default" : "outline"}
                  className={`transition-all ${isIARecommended ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0' : ''}`}
                >
                  ✨ {isIARecommended ? 'Mode IA Activé' : 'Recommandé pour moi (IA)'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Conteneur principal avec liste et détails */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Liste des stages */}
          <div className="md:col-span-1 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredStages.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun stage trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aucun stage ne correspond à vos critères de recherche.
                </p>
              </div>
            ) : (
              filteredStages.map((stage) => (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStage(stage)}
                  className={`bg-white p-4 rounded-lg shadow-sm cursor-pointer transition-all 
                    ${selectedStage?.id === stage.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}
                  `}
                >
                  <h3 className="text-lg font-semibold">{stage.title}</h3>
                  {stage.match_score !== undefined && (
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white mt-2 mb-1 border-0">
                      🔥 Match: {Math.round(stage.match_score * 100)}%
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Building2 size={16} />
                    <span>{stage.entreprises?.name || 'Entreprise'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <MapPin size={16} />
                    <span>{stage.location}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Détails du stage */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
            {selectedStage ? (
              <div className="relative">
                <button 
                  onClick={() => setSelectedStage(null)} 
                  className="absolute top-0 right-0 p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold mb-4">{selectedStage.title}</h2>
                
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline">
                    <Building2 className="mr-2 h-4 w-4" />
                    {selectedStage.type}
                  </Badge>
                  <Badge variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    {selectedStage.location}
                  </Badge>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{selectedStage.description}</p>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Compétences requises</h3>
                  {selectedStage.required_skills && (
                    <div className="flex flex-wrap gap-2">
                      {selectedStage.required_skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Button 
                    onClick={handleOpenPostulerModal} 
                    disabled={!user}
                    className="w-full"
                  >
                    {user ? 'Postuler' : 'Connectez-vous pour postuler'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Sélectionnez un stage pour voir les détails
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedStage && (
        <PostulerModal 
          open={isPostulerModalOpen} 
          onOpenChange={setIsPostulerModalOpen}
          stageId={selectedStage.id}
        />
      )}
    </div>
  );
};

export default OffresStages;
