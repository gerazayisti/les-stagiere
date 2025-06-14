import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCandidatures } from '@/hooks/useCandidatures';
import { PostulerModal } from '@/components/candidatures/PostulerModal';
import { MapPin, Briefcase, Calendar, Clock, DollarSign, Building2, ExternalLink, Users2, LineChart, Award, Bookmark, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Stage {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string; // 'full-time', 'part-time', 'internship', 'contract'
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
  external_link?: string;
  // Champs supplémentaires pour correspondre au design du mockup
  job_deadline?: string; // Date limite de candidature
  vacancies?: number; // Nombre de postes disponibles
  experience_level?: string; // Niveau d'expérience requis
  qualification?: string; // Qualification requise (e.g., 'Bachelor Degree')
  gender_preference?: string; // Préférence de genre (e.g., 'Both')
  // Pour les onglets, si la description doit être découpée
  responsibilities?: string[];
  requirements?: string[];
  salary_benefits?: string[];
}

const JobOfferDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCandidature } = useCandidatures();
  const [stage, setStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPostulerModalOpen, setIsPostulerModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchStage = async () => {
      if (!id) {
        console.error("JobOfferDetails: ID de l'offre manquant.");
        toast.error("ID de l'offre manquant.");
        setLoading(false);
        navigate('/jobs');
        return;
      }

      console.log(`JobOfferDetails: Tentative de récupération de l'offre avec l'ID: ${id}`);

      try {
        const { data, error } = await supabase
          .from('stages')
          .select(`
            *,
            entreprises (name, logo_url)
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('JobOfferDetails: Erreur Supabase lors de la récupération de l\'offre:', error);
          if (error.code === 'PGRST116') {
            toast.error("Offre introuvable.");
            navigate('/jobs');
          } else {
            throw error;
          }
        }

        if (data) {
          console.log('JobOfferDetails: Données de l\'offre récupérées:', data);
          // Simuler des données pour les onglets et la barre latérale qui ne sont pas dans Supabase actuellement
          const simulatedData: Stage = {
            ...data,
            job_deadline: '01 Juillet 2024',
            vacancies: 5,
            experience_level: '5 Ans',
            qualification: 'Licence',
            gender_preference: 'Hommes & Femmes',
            responsibilities: [
              "Concevoir et construire des applications web et d\'entreprise en utilisant ReactJS/Next JS/.Net Core.",
              "Collaborer avec des équipes inter-fonctionnelles pour analyser, concevoir et implémenter de nouvelles fonctionnalités.",
              "Suivre les règles et conventions de codage définies par l\'entreprise.",
              "Effectuer des tests unitaires et garantir une couverture de test appropriée selon les normes organisationnelles.",
              "Préparer la conception de base, la conception détaillée, exécuter les tests d\'acceptation de base.",
              "Suivre le processus de révision par les pairs pour la livraison du code.",
              "Participer aux réunions définies par la politique de l\'entreprise.",
              "L\'ingénieur logiciel senior doit avoir l\'état d\'esprit et la capacité de diriger une petite équipe.",
            ],
            requirements: [
              "Excellente connaissance des bases de données relationnelles MySQL et des technologies ORM (JPA, Hibernate).",
              "Forte compréhension de l\'analyse et de la conception orientées objet en utilisant des modèles de conception courants.",
              "Besoin de connaissances avancées en ReactJS/Next JS/.Net Core.",
              "Expérience pratique des services web REST et RESTful.",
              "Maîtrise de Maven, Gradle build tools.",
              "Suivre le processus de révision par les pairs pour la livraison du code.",
              "Participer aux réunions définies par la politique de l\'entreprise.",
              "L\'ingénieur logiciel senior doit avoir l\'état d\'esprit et la capacité de diriger une petite équipe.",
            ],
            salary_benefits: [
              "Facilités de déjeuner: Subvention complète.",
              "Révision salariale: Annuelle.",
              "Bonus de festival: 2.",
              "Il s\'agira d\'un travail de nuit – L\'horaire sera de 23h00 à 07h00 du matin.",
              "Week-end: Deux jours.",
              "Paiement mensuel garanti à temps.",
              "Congés annuels acquis anticipés, congés de maladie et congés occasionnels.",
            ],
          };
          setStage(simulatedData);
        } else {
          console.warn('JobOfferDetails: Aucune donnée trouvée pour l\'ID:', id);
          toast.error("Offre introuvable.");
          navigate('/jobs');
        }
      } catch (error) {
        console.error('JobOfferDetails: Erreur inattendue lors de la récupération de l\'offre:', error);
        toast.error('Impossible de charger les détails de l\'offre.');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchStage();
  }, [id, navigate]);

  const handleApplyClick = () => {
    if (stage?.external_link) {
      window.open(stage.external_link, '_blank');
    } else {
      setIsPostulerModalOpen(true);
    }
  };

  const isCandidat = user?.user_metadata?.account_type === 'candidat';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold mb-2">Description du poste</h3>
            <p>{stage?.description}</p>
          </div>
        );
      case 'responsibilities':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold mb-2">Responsabilités</h3>
            {stage?.responsibilities && stage.responsibilities.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {stage.responsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>Aucune responsabilité spécifiée.</p>
            )}
          </div>
        );
      case 'requirements':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold mb-2">Exigences</h3>
            {stage?.requirements && stage.requirements.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {stage.requirements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>Aucune exigence spécifiée.</p>
            )}
          </div>
        );
      case 'skills-experience':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold mb-2">Compétences et Expérience</h3>
            {stage?.required_skills && stage.required_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stage.required_skills.map((skill, index) => (
                  <Badge key={index} className="bg-primary/10 text-primary hover:bg-primary/20">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p>Aucune compétence requise spécifiée.</p>
            )}
            {stage?.experience_level && (
              <p className="mt-4">Niveau d'expérience: {stage.experience_level}</p>
            )}
          </div>
        );
      case 'salary-benefits':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold mb-2">Salaires et avantages</h3>
            {stage?.compensation && stage.compensation.amount ? (
              <p>Salaire offert: {stage.compensation.amount} {stage.compensation.currency}</p>
            ) : (
              <p>Informations sur le salaire non disponibles.</p>
            )}
            {stage?.salary_benefits && stage.salary_benefits.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 mt-4">
                {stage.salary_benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4">Aucun avantage spécifié.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
        <p>Détails de l'offre non disponibles.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-12">
      {/* En-tête de l'offre */}
      <div className="bg-white dark:bg-gray-800 shadow-sm pt-28 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {stage.entreprises?.logo_url ? (
              <img
                src={stage.entreprises.logo_url}
                alt={stage.entreprises.name}
                className="w-20 h-20 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-md">
                <Building2 size={36} />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{stage.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">{stage.entreprises?.name}</p>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-2 gap-4">
                <span className="flex items-center"><MapPin size={16} className="mr-1" /> {stage.location}</span>
                <span className="flex items-center"><Clock size={16} className="mr-1" /> {stage.duration}</span>
                {stage.compensation && (
                  <span className="flex items-center"><DollarSign size={16} className="mr-1" /> {stage.compensation.amount} {stage.compensation.currency} Mensuel</span>
                )}
                <span className="flex items-center"><Calendar size={16} className="mr-1" /> {new Date(stage.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          {isCandidat && (
            <Button 
              onClick={handleApplyClick} 
              className="bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              {stage.external_link ? (
                <><ExternalLink size={20} /> Postuler via site entreprise</>
              ) : (
                <>Postuler cette offre</>
              )}
            </Button>
          )}
          {!isCandidat && (
            <Button onClick={() => navigate('/connexion')} className="bg-primary hover:bg-primary/90 text-white py-3 px-6">
              Se connecter pour postuler
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale - Détails de l'offre */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Onglets */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button 
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'description' ? 'border-b-2 border-primary text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
            >
              Description du poste
            </button>
            <button 
              onClick={() => setActiveTab('responsibilities')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'responsibilities' ? 'border-b-2 border-primary text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
            >
              Responsabilités
            </button>
            <button 
              onClick={() => setActiveTab('requirements')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'requirements' ? 'border-b-2 border-primary text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
            >
              Exigences
            </button>
            <button 
              onClick={() => setActiveTab('skills-experience')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'skills-experience' ? 'border-b-2 border-primary text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
            >
              Compétences et Expérience
            </button>
            <button 
              onClick={() => setActiveTab('salary-benefits')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'salary-benefits' ? 'border-b-2 border-primary text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
            >
              Salaires et avantages
            </button>
          </div>
          {renderTabContent()}
        </div>

        {/* Colonne latérale - Aperçu et actions */}
        <div className="lg:col-span-1 space-y-8">
          {/* Job Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Aperçu du poste</h2>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <Calendar size={20} className="mr-3 text-primary" />
                <span>Date de publication: {new Date(stage.created_at).toLocaleDateString()}</span>
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <Users2 size={20} className="mr-3 text-primary" />
                <span>Postes vacants: {stage.vacancies || 'N/A'}</span>
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <Briefcase size={20} className="mr-3 text-primary" />
                <span>Expérience: {stage.experience_level || 'N/A'}</span>
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <DollarSign size={20} className="mr-3 text-primary" />
                <span>Salaire offert: {stage.compensation?.amount ? `${stage.compensation.amount} ${stage.compensation.currency} Mensuel` : 'N/A'}</span>
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <Calendar size={20} className="mr-3 text-primary" />
                <span>Date limite: {stage.job_deadline || 'N/A'}</span>
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <Award size={20} className="mr-3 text-primary" />
                <span>Qualification: {stage.qualification || 'N/A'}</span>
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <MapPin size={20} className="mr-3 text-primary" />
                <span>Lieu: {stage.location || 'N/A'}</span>
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <Users2 size={20} className="mr-3 text-primary" />
                <span>Sexe: {stage.gender_preference || 'N/A'}</span>
              </li>
            </ul>
          </div>

          {/* Job Apply Process video - Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Vidéo du processus de candidature</h2>
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
              <p>Placeholder vidéo</p>
            </div>
          </div>

          {/* Contact Section - Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contacter {stage.entreprises?.name || 'l\'entreprise'}</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Votre Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input type="email" id="email" placeholder="Entrez votre email" className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input type="tel" id="phone" placeholder="(+237) 6xx-xxx-xxx" className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Votre Message</label>
                <textarea id="message" placeholder="Message" rows={4} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Envoyer un Message
              </Button>
            </div>
          </div>

          {/* Recent Job Post - Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Postes Récents</h2>
            <div className="space-y-4">
              {/* Exemple de poste récent */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <img src="/apple-logo.png" alt="Apple" className="w-12 h-12 rounded-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Senior UI Designer, Apple</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Newyork, USA</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Briefcase size={14} className="mr-1" /> Full Time</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <img src="/amazon-logo.png" alt="Amazon" className="w-12 h-12 rounded-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Analysis, Amazon</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Newyork, USA</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Briefcase size={14} className="mr-1" /> Full Time</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <img src="/udemy-logo.png" alt="Udemy" className="w-12 h-12 rounded-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Online Trainer, Udemy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Newyork, USA</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Briefcase size={14} className="mr-1" /> Full Time</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      {stage && !stage.external_link && (
        <PostulerModal 
          open={isPostulerModalOpen} 
          onOpenChange={setIsPostulerModalOpen}
          stageId={stage.id}
        />
      )}
    </div>
  );
};

export default JobOfferDetails; 