import React, { useEffect, useState } from 'react';
import { Search, MapPin, UserPlus, GraduationCap, Filter, X, ArrowRight } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { StagiaireDetailModal } from '@/components/profile/StagiaireDetailModal';


interface Stagiaire {
  id: string;
  name: string;
  title?: string;
  location?: string;
  avatar_url?: string;
  skills?: string[];
  is_premium?: boolean;
  education?: string;
  bio?: string;
}

const Candidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Stagiaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedStagiaireId, setSelectedStagiaireId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, userRole } = useAuth();


  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stagiaires')
        .select('*')
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des candidats:', error);
      toast.error('Impossible de charger les candidats');
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = locationFilter === '' || 
                           (candidate.location || '').toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto pt-32 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Découvrez nos talents</h1>
          <p className="text-gray-600">Trouvez le stagiaire idéal parmi des milliers de profils qualifiés.</p>
        </div>

        {/* Zone de recherche */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Rechercher par nom, métier ou compétence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-100 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Ville ou région"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-100 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              <Button className="h-12 px-8 rounded-xl bg-secondary hover:bg-secondary/90 shadow-md transition-all active:scale-95">
                Filtrer
              </Button>
            </div>
          </div>
        </div>

        {/* Conteneur principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[380px] flex flex-col items-center">
                <Skeleton className="w-24 h-24 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <div className="flex gap-2 mb-8">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl mt-auto" />
              </div>
            ))
          ) : filteredCandidates.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
              <UserPlus className="mx-auto h-16 w-16 text-gray-200" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Aucun candidat trouvé</h3>
              <p className="mt-1 text-gray-500 max-w-xs mx-auto">
                Essayez d'ajuster vos critères de recherche ou de retirer les filtres.
              </p>
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white group rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                {/* Header with Premium Badge */}
                <div className="relative pt-8 pb-4 flex flex-col items-center">
                  {candidate.is_premium && (
                    <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 border-0 text-white shadow-sm">
                        PREMIUM
                      </Badge>
                    </div>
                  )}
                  
                  <div className="w-24 h-24 rounded-full p-1 border-2 border-muted bg-white shadow-sm overflow-hidden group-hover:border-primary/50 transition-colors">
                    <img
                      src={candidate.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=random`}
                      alt={candidate.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 flex flex-col flex-grow text-center">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{candidate.name}</h3>
                  <p className="text-sm font-medium text-muted-foreground mt-1 line-clamp-1">{candidate.title || "Étudiant"}</p>
                  
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-3">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{candidate.location || "Non spécifié"}</span>
                  </div>

                  {/* Skills Tags */}
                  <div className="mt-5 flex flex-wrap justify-center gap-1.5 h-[64px] overflow-hidden">
                    {(candidate.skills || []).slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/5 text-primary text-[10px] py-0 border-primary/10">
                        {skill}
                      </Badge>
                    ))}
                    {(candidate.skills || []).length === 0 && (
                      <span className="text-xs text-muted-foreground italic mt-2">Aucune compétence listée</span>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="mt-auto pt-6">
                    <Button 
                      onClick={() => {
                        setSelectedStagiaireId(candidate.id);
                        setIsModalOpen(true);
                      }}
                      className="w-full h-11 rounded-xl bg-primary shadow-sm group-hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                      Voir le profil <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <StagiaireDetailModal 
        stagiaireId={selectedStagiaireId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContact={(id) => {
          navigate(`/messagerie?user=${id}`);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};


export default Candidates;

