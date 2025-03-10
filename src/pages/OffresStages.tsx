
import { useEffect, useState } from 'react';
import { Search, MapPin, Building2, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
}

const OffresStages = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      setLoading(true);
      console.log("Récupération des stages actifs...");
      
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur lors de la requête:", error);
        throw error;
      }

      console.log("Stages récupérés:", data);
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
          </div>
        </div>

        {/* Liste des stages */}
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Chargement des stages...</p>
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
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      to={`/stages/${stage.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-primary transition-colors"
                    >
                      {stage.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Building2 size={16} />
                        {stage.type}
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
                    <p className="mt-2 text-gray-600 line-clamp-2">{stage.description}</p>
                    {stage.required_skills && stage.required_skills.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {stage.required_skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Link
                      to={`/stages/${stage.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Voir l'offre
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OffresStages;
