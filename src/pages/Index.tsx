import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Users2, Building2, TrendingUp, Briefcase, Search, UserPlus, MapPin, ChevronLeft, ChevronRight, Clock, Calendar, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { Article } from "@/components/Article";
import { useAuth } from "@/hooks/useAuth";

// Animations
const slideUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

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
}

interface Stagiaire {
  id: string;
  name: string;
  title?: string;
  location?: string;
  avatar_url?: string;
  skills?: string[];
  is_premium?: boolean;
}

interface Entreprise {
  id: string;
  name: string;
  logo_url?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [jobListings, setJobListings] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [nearbyLocationsFromDB, setNearbyLocationsFromDB] = useState<{ location: string; count: number }[]>([]);
  const [premiumCandidates, setPremiumCandidates] = useState<Stagiaire[]>([]);
  const [totalStagiairesCount, setTotalStagiairesCount] = useState<number>(0);
  const [allStagiairesForAvatarsDisplay, setAllStagiairesForAvatarsDisplay] = useState<Stagiaire[]>([]);

  useEffect(() => {
    fetchJobListings();
    fetchNearbyLocationsFromDB();
    fetchStagiairesForAvatarsDisplay();
    fetchPremiumCandidates();
  }, [searchTerm, locationFilter, jobTypeFilter]);

  const fetchJobListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('stages')
        .select(`
          *,
          entreprises (name, logo_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      if (locationFilter) {
        query = query.ilike('location', `%{locationFilter}%`);
      }
      if (jobTypeFilter) {
        query = query.eq('type', jobTypeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobListings(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des stages:', error);
      toast.error('Impossible de charger les stages');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyLocationsFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from('stages')
        .select('location');

      if (error) throw error;

      const locationCounts: { [key: string]: number } = {};
      data.forEach(item => {
        if (item.location) {
          locationCounts[item.location] = (locationCounts[item.location] || 0) + 1;
        }
      });

      const formattedLocations = Object.keys(locationCounts).map(location => ({
        location,
        count: locationCounts[location],
      }));

      setNearbyLocationsFromDB(formattedLocations);
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux:', error);
      toast.error('Impossible de charger les lieux à proximité');
    }
  };

  const fetchStagiairesForAvatarsDisplay = async () => {
    try {
      const { data, count, error } = await supabase
        .from('stagiaires')
        .select('id, name, title, location, avatar_url, skills', { count: 'exact' });

      if (error) throw error;

      setAllStagiairesForAvatarsDisplay(data || []);
      setTotalStagiairesCount(count || 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des candidats pour les avatars:', error);
      toast.error('Impossible de charger les candidats pour les avatars');
    }
  };

  const fetchPremiumCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('stagiaires')
        .select('id, name, title, location, avatar_url, skills')
        .eq('is_premium', true)
        .limit(4);

      if (error) throw error;

      setPremiumCandidates(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des candidats premium:', error);
      toast.error('Impossible de charger les candidats à la une');
    }
  };

  const handleProfileClick = (id: string, type: 'candidate' | 'entreprise') => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour voir les profils");
      navigate('/connexion');
      return;
    }
    
    if (type === 'candidate') {
      navigate(`/stagiaires/${id}`);
    } else {
      navigate(`/entreprises/${id}`);
    }
  };

  // Début du composant Index - Test de modification
  // Données pour la section "Catégories populaires"
  const popularCategories = [
    { title: "Développement Web", icon: "code", count: 0 },
    { title: "Marketing Digital", icon: "briefcase", count: 0 },
    { title: "Design & UX/UI", icon: "art", count: 0 },
    { title: "Finance & Comptabilité", icon: "finance", count: 0 },
    { title: "Ressources Humaines", icon: "building", count: 0 },
    { title: "Gestion de Projet", icon: "briefcase", count: 0 },
  ];

  // Données pour les articles de blog
  const blogPosts = [
    {
      id: 1,
      title: "Comment réussir son stage : Guide complet pour les étudiants",
      description: "Découvrez les meilleures pratiques pour réussir votre stage et faire une bonne impression auprès de votre employeur. Des conseils pratiques pour les étudiants.",
      image: "/blog-post-1.webp",
      author: "Marie Dupont",
      date: "14 Mars 2024",
      readTime: "5 min",
      slug: "comment-reussir-son-stage",
      tags: ["Conseils", "Stage", "Étudiants"]
    },
    {
      id: 2,
      title: "Les compétences les plus recherchées en 2024",
      description: "Une analyse approfondie des compétences les plus demandées par les employeurs en 2024. Restez compétitif sur le marché du travail.",
      image: "/blog-post-2.webp",
      author: "Pierre Martin",
      date: "12 Mars 2024",
      readTime: "7 min",
      slug: "competences-recherchees-2024",
      tags: ["Carrière", "Compétences", "2024"]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-primary to-primary/90">
        <div className="absolute inset-0 bg-[url('/les-stagiere.jpg')] bg-cover bg-center opacity-30"></div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
          
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white max-w-4xl leading-tight"
          >
            Débloquez votre potentiel <br /> Trouvez le stage idéal
          </motion.h1>
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-xl text-white max-w-3xl"
          >
            Connectez-vous avec les meilleures entreprises et démarrez votre carrière dès aujourd'hui.
          </motion.p>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col items-center w-full max-w-3xl"
          >
            {/* les Stagiere Toggle */}
            <div className="flex bg-white dark:bg-gray-800 p-1 rounded-full mb-6 shadow-lg">
              <button className="px-6 py-2 rounded-full font-semibold text-white bg-primary hover:bg-primary/90 transition-colors">
                Je suis un Candidat
              </button>
              <button className="px-6 py-2 rounded-full font-semibold text-gray-700 dark:text-gray-200 hover:text-secondary transition-colors">
                Je suis une Entreprise
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col md:flex-row items-center w-full bg-white dark:bg-gray-800 p-2 md:p-2 rounded-2xl shadow-lg gap-2 md:gap-0">
              <div className="flex items-center w-full md:flex-grow bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-2">
                <MapPin className="text-gray-400 dark:text-gray-500 mr-2" size={20} />
                <input
                  type="text"
                  placeholder="Localisation"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="flex-grow py-2 outline-none text-gray-800 dark:text-gray-200 bg-transparent placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-600 h-8 mx-2"></div>
              <div className="flex items-center w-full md:flex-grow bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-2">
                <Briefcase className="text-gray-400 dark:text-gray-500 mr-2" size={20} />
                <select
                  className="flex-grow py-2 outline-none text-gray-800 dark:text-gray-200 bg-transparent"
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                >
                  <option value="">Type de poste</option>
                  <option value="full-time">Temps plein</option>
                  <option value="part-time">Temps partiel</option>
                  <option value="internship">Stage</option>
                  <option value="contract">Contrat</option>
                </select>
              </div>
              <button 
                className="w-full md:w-auto bg-secondary text-white px-6 py-3 rounded-full font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
                onClick={fetchJobListings}
              >
                <Search className="w-5 h-5" /> 
                <span>Rechercher</span>
              </button>
            </div>

            {/* Avatars */}
            <div className="mt-8 text-white flex flex-col items-center mb-10">
              <p className="text-lg font-medium mb-4">Plus de {totalStagiairesCount}+ étudiants ont déjà trouvé leur stage grâce à nous !</p>
              <div className="flex -space-x-3 overflow-hidden">
                {allStagiairesForAvatarsDisplay.slice(0, 5).map((candidate, index) => (
                  <div key={candidate.id || index} className="inline-block h-12 w-12 rounded-full ring-2 ring-white bg-gray-300 flex items-center justify-center text-gray-800 font-bold text-xl overflow-hidden">
                    {candidate.avatar_url ? (
                      <img
                        className="w-full h-full object-cover"
                        src={candidate.avatar_url}
                        alt={candidate.name}
                      />
                    ) : (
                      candidate.name.charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
                {totalStagiairesCount > 5 && (
                  <div className="inline-block h-12 w-12 rounded-full ring-2 ring-white bg-gray-700 flex items-center justify-center text-white font-bold text-base">
                    +{totalStagiairesCount - 5}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Job Listings Section */}
      <section className="py-16 bg-white dark:bg-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Offres récentes</h2>
            <Link to="/stages" className="text-secondary hover:text-secondary/80 font-semibold flex items-center">
              Voir tout <ArrowRight className="ml-2" size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : jobListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Aucune offre trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobListings.map((job) => (
                <Link
                  key={job.id}
                  to={`/stages/${job.id}`}
                  className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      {job.entreprises?.logo_url ? (
                        <img
                          src={job.entreprises.logo_url}
                          alt={job.entreprises.name}
                          className="w-12 h-12 rounded-lg object-cover cursor-pointer"
                          onClick={(e) => { e.preventDefault(); handleProfileClick(job.entreprise_id, 'entreprise'); }}
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center cursor-pointer"
                          onClick={(e) => { e.preventDefault(); handleProfileClick(job.entreprise_id, 'entreprise'); }}
                        >
                          <Building2 className="text-primary" size={24} />
                        </div>
                      )}
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                        <p 
                          className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-secondary"
                          onClick={(e) => { e.preventDefault(); handleProfileClick(job.entreprise_id, 'entreprise'); }}
                        >
                          {job.entreprises?.name}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin size={16} className="mr-2" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock size={16} className="mr-2" />
                        {job.duration}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar size={16} className="mr-2" />
                        {new Date(job.start_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.required_skills?.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-sm bg-primary/10 text-primary rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Explore Nearby Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold text-foreground mb-2"
          >
            Explorez à proximité avec Les Stagiaires
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground mb-12"
          >
            À la recherche de votre prochaine opportunité de carrière ? Ne cherchez plus.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyLocationsFromDB.map((locationItem) => {
              // Déterminer l'image de fond en fonction du lieu
              let backgroundImage = '/default-city.webp';
              const locationLower = locationItem.location.toLowerCase();
              
              if (locationLower.includes('maroua')) {
                backgroundImage = '/ville/maroua.jpeg';
              } else if (locationLower.includes('buea')) {
                backgroundImage = '/ville/Buea.jpg';
              } else if (locationLower.includes('douala')) {
                backgroundImage = '/ville/Douala.jpg';
              } else if (locationLower.includes('yaounde') || locationLower.includes('yaoundé')) {
                backgroundImage = '/ville/yaounde.jpg';
              }

              return (
          <motion.div
                  key={locationItem.location}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative w-full h-64 rounded-lg overflow-hidden shadow-md group"
                >
                  <img
                    src={backgroundImage}
                    alt={locationItem.location}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
                    <h3 className="text-xl font-semibold mb-1">{locationItem.location}</h3>
                    <p className="text-sm text-gray-200">{locationItem.count} Offres</p>
            </div>
          </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-white mb-2">{totalStagiairesCount}+</h3>
              <p className="text-white/80">Stagiaires inscrits</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white mb-2">{jobListings.length}+</h3>
              <p className="text-white/80">Offres disponibles</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white mb-2">{nearbyLocationsFromDB.length}+</h3>
              <p className="text-white/80">Villes couvertes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories Populaires Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Catégories populaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCategories.map((category, index) => (
                  <CategoryCard
                key={index}
                    title={category.title}
                icon={category.icon}
                    count={category.count}
                  />
            ))}
          </div>
        </div>
      </section>

      {/* Premium Candidates Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Candidats à la une</h2>
            <Link to="/candidates" className="text-secondary hover:text-secondary/80 font-semibold flex items-center">
              Voir tout <ArrowRight className="ml-2" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {candidate.avatar_url ? (
                      <a 
                        href={`/stagiaires/${candidate.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 h-16 rounded-full object-cover shadow-md block cursor-pointer"
                      >
                        <img
                          src={candidate.avatar_url}
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ) : (
                      <a 
                        href={`/stagiaires/${candidate.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-md cursor-pointer"
                      >
                        <UserPlus size={32} />
                      </a>
                    )}
                    <div className="ml-4">
                      <h3 
                        className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-secondary"
                      >
                        <a 
                          href={`/stagiaires/${candidate.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {candidate.name}
                        </a>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{candidate.title}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin size={16} className="mr-2" />
                      {candidate.location}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {candidate.skills?.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-sm bg-primary/10 text-primary rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`/stagiaires/${candidate.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 block w-full text-center py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                  >
                    Voir le profil
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Derniers articles</h2>
            <Link to="/blog" className="text-secondary hover:text-secondary/80 font-semibold flex items-center">
              Voir tout <ArrowRight className="ml-2" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <Article
                key={post.id}
                title={post.title}
                description={post.description}
                image={post.image}
                author={post.author}
                date={post.date}
                readTime={post.readTime}
                slug={post.slug}
                tags={post.tags}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
