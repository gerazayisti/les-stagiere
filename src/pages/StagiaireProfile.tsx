import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Briefcase, Calendar, Mail, Phone, UserPlus } from 'lucide-react';

interface Stagiaire {
  id: string;
  name: string;
  title?: string;
  location?: string;
  avatar_url?: string;
  skills?: string[];
  availability?: string; // e.g., 'Immédiatement', 'À partir de [date]'
  contact_email?: string;
  contact_phone?: string;
  is_premium?: boolean;
  recommendations?: string[];
}

const StagiaireProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [stagiaire, setStagiaire] = useState<Stagiaire | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStagiaire = async () => {
      if (!id) {
        toast.error("ID du stagiaire manquant.");
        setLoading(false);
        navigate('/');
        return;
      }

      // Check authentication first before fetching
      if (!isAuthenticated) {
        toast.error("Vous devez être connecté pour voir les profils.");
        navigate('/connexion');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('stagiaires')
          .select('id, name, avatar_url, skills, availability, contact_email, contact_phone, is_premium, recommendations')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // No rows found
            toast.error("Stagiaire introuvable.");
            navigate('/stagiaires'); // Redirect to a list of stagiaires or home
          } else {
            throw error;
          }
        }
        
        if (data) {
          setStagiaire(data);
        } else {
            toast.error("Stagiaire introuvable.");
            navigate('/stagiaires');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du stagiaire:', error);
        toast.error('Impossible de charger le profil du stagiaire.');
        navigate('/stagiaires');
      } finally {
        setLoading(false);
      }
    };

    fetchStagiaire();
  }, [id, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stagiaire) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
        <p>Profil du stagiaire non disponible.</p>
      </div>
    );
  }

  const isEntreprise = user?.user_metadata?.account_type === 'entreprise';

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex-shrink-0">
            {stagiaire.avatar_url ? (
              <img
                src={stagiaire.avatar_url}
                alt={stagiaire.name}
                className="w-32 h-32 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-md">
                <UserPlus size={64} />
              </div>
            )}
          </div>
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stagiaire.name}</h1>
            
            <div className="space-y-3 mb-6">
              {stagiaire.availability && (
                <div className="flex items-center justify-center md:justify-start text-gray-700 dark:text-gray-300">
                  <Calendar size={20} className="mr-3 text-primary" />
                  <span>Disponibilité: {stagiaire.availability}</span>
                </div>
              )}
            </div>

            {stagiaire.skills && stagiaire.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Compétences</h3>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {stagiaire.skills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {stagiaire.recommendations && stagiaire.recommendations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Recommandations</h3>
                <div className="space-y-2">
                  {stagiaire.recommendations.map((recommendation, index) => (
                    <p key={index} className="text-gray-700 dark:text-gray-300">" {recommendation} "</p>
                  ))}
                </div>
              </div>
            )}

            {isEntreprise && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contacter {stagiaire.name}</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  {stagiaire.contact_email && (
                    <a 
                      href={`mailto:${stagiaire.contact_email}`} 
                      className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail size={20} />
                      Envoyer un email
                    </a>
                  )}
                  {stagiaire.contact_phone && (
                    <a 
                      href={`tel:${stagiaire.contact_phone}`} 
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone size={20} />
                      Appeler
                    </a>
                  )}
                  {!stagiaire.contact_email && !stagiaire.contact_phone && (
                      <p className="text-gray-600 dark:text-gray-400">Informations de contact non disponibles.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StagiaireProfile; 