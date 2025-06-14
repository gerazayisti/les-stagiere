import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Building2, MapPin, Briefcase, Calendar, Clock, DollarSign, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Entreprise {
  id: string;
  name: string;
  logo_url?: string;
  description?: string; // Optional: for more details on the company profile
  website_url?: string; // Optional: company website
}

interface Stage {
  id: string;
  title: string;
  location: string;
  type: string;
  duration: string;
  start_date: string;
  compensation?: {
    amount: number;
    currency: string;
  };
}

const EntrepriseProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntrepriseAndStages = async () => {
      if (!id) {
        toast.error("ID de l'entreprise manquant.");
        setLoading(false);
        navigate('/');
        return;
      }

      // Check authentication first before fetching
      if (!isAuthenticated) {
        toast.error("Vous devez être connecté pour voir les profils d'entreprise.");
        navigate('/connexion');
        return;
      }

      try {
        // Fetch Entreprise details
        const { data: entrepriseData, error: entrepriseError } = await supabase
          .from('entreprises')
          .select('*')
          .eq('id', id)
          .single();

        if (entrepriseError) {
          if (entrepriseError.code === 'PGRST116') { // No rows found
            toast.error("Entreprise introuvable.");
            navigate('/entreprises'); // Redirect to a list of entreprises or home
          } else {
            throw entrepriseError;
          }
        }

        if (entrepriseData) {
          setEntreprise(entrepriseData);
        } else {
          toast.error("Entreprise introuvable.");
          navigate('/entreprises');
        }

        // Fetch stages created by this entreprise
        const { data: stagesData, error: stagesError } = await supabase
          .from('stages')
          .select(`
            id, title, location, type, duration, start_date, compensation
          `)
          .eq('entreprise_id', id)
          .eq('status', 'active') // Only active stages
          .order('created_at', { ascending: false });

        if (stagesError) throw stagesError;
        setStages(stagesData || []);

      } catch (error) {
        console.error('Erreur lors de la récupération du profil de l\'entreprise ou de ses stages:', error);
        toast.error('Impossible de charger le profil de l\'entreprise.');
        navigate('/entreprises');
      } finally {
        setLoading(false);
      }
    };

    fetchEntrepriseAndStages();
  }, [id, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!entreprise) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
        <p>Profil de l'entreprise non disponible.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          <div className="flex-shrink-0">
            {entreprise.logo_url ? (
              <img
                src={entreprise.logo_url}
                alt={entreprise.name}
                className="w-32 h-32 rounded-lg object-cover shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-md">
                <Building2 size={64} />
              </div>
            )}
          </div>
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{entreprise.name}</h1>
            {entreprise.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{entreprise.description}</p>
            )}
            {entreprise.website_url && (
              <a 
                href={entreprise.website_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-secondary hover:text-secondary/80 font-semibold flex items-center justify-center md:justify-start"
              >
                Visiter le site web <ExternalLink size={16} className="ml-2" />
              </a>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Offres de stage de {entreprise.name}</h2>
          {stages.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center">Aucune offre de stage active pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stages.map((stage) => (
                <Link
                  key={stage.id}
                  to={`/stages/${stage.id}`}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{stage.title}</h3>
                    <div className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2" /> {stage.location}
                      </div>
                      <div className="flex items-center">
                        <Briefcase size={16} className="mr-2" /> {stage.type}
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" /> {stage.duration}
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2" /> {new Date(stage.start_date).toLocaleDateString()}
                      </div>
                      {stage.compensation && (
                        <div className="flex items-center">
                          <DollarSign size={16} className="mr-2" /> {stage.compensation.amount} {stage.compensation.currency}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntrepriseProfile; 