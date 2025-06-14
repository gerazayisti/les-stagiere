import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users2, Building2, TrendingUp, Briefcase, Search, UserPlus, MapPin, ChevronLeft, ChevronRight, Clock, Calendar, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";

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
  const [jobListings, setJobListings] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [nearbyLocationsFromDB, setNearbyLocationsFromDB] = useState<{ location: string; count: number }[]>([]);
  const [premiumCandidates, setPremiumCandidates] = useState<Stagiaire[]>([]);

  useEffect(() => {
    fetchJobListings();
    fetchNearbyLocationsFromDB();
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

  const fetchPremiumCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('stagiaires')
        .select('id, name, title, location, avatar_url, skills')
        .eq('is_premium', true)
        .limit(4); // Limit to 4 for the featured section

      if (error) throw error;

      setPremiumCandidates(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des candidats premium:', error);
      toast.error('Impossible de charger les candidats à la une');
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
      title: "Job Tips How to Become a Business Man to Intelligence Analyst in 6 Simple Steps",
      author: "Jack Mua",
      date: "March 14, 2014",
      image: "/blog-post-1.webp", // Placeholder image
      description: "Que vous soyez un professionnel expérimenté ou un jeune diplômé, nos experts vous accompagnent. Nous avons quelque chose pour tout le monde. Des experts en technologie aux génies du marketing, des gourous de la finance aux esprits créatifs, notre large éventail d'emplois répond à toutes les compétences et intérêts.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-primary/80 to-primary">
        <div className="absolute inset-0 bg-[url('/hero1.webp')] bg-cover bg-center opacity-30"></div>
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
            <div className="flex bg-white p-1 rounded-full mb-6 shadow-lg">
              <button className="px-6 py-2 rounded-full font-semibold text-primary bg-primary-foreground">
                Je suis un Candidat
              </button>
              <button className="px-6 py-2 rounded-full font-semibold text-muted-foreground hover:text-primary transition-colors">
                Je suis une Entreprise
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center w-full bg-white p-2 rounded-full shadow-lg">
              <div className="flex items-center flex-grow">
                <MapPin className="text-gray-400 ml-3 mr-2" size={20} />
                <input
                  type="text"
                  placeholder="Localisation"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="flex-grow py-2 outline-none text-gray-800"
                />
              </div>
              <div className="w-px bg-gray-200 h-8 mx-2"></div> {/* Separator */}
              <div className="flex items-center flex-grow">
                <Briefcase className="text-gray-400 ml-3 mr-2" size={20} />
                <select
                  className="flex-grow py-2 outline-none text-gray-800 bg-white"
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
                className="bg-primary text-white px-6 py-3 rounded-full font-semibold ml-2 hover:bg-primary-dark transition-colors flex items-center justify-center"
                onClick={fetchJobListings} // Re-fetch on search button click
              >
                <Search className="w-5 h-5 mr-2" /> Rechercher
              </button>
            </div>

            {/* Avatars */}
            <div className="mt-8 text-white flex flex-col items-center">
              <p className="text-lg font-medium mb-4">Plus de 1000 étudiants ont déjà trouvé leur stage grâce à nous !</p>
              <div className="flex -space-x-3 overflow-hidden">
                <img
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1491528323818-fdd1faba65f8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
                <img
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
                <img
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                  alt=""
                />
                <img
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
                <img
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1517365850252-b88e17812224?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Job Listings Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold text-foreground mb-2"
          >
            Plus de 1000+ offres d'emploi sur les Stagiere
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground mb-12"
          >
            Parcourez des postes de débutants aux rôles les plus complexes.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Chargement des offres d'emploi...</p>
              </div>
            ) : jobListings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune offre d'emploi trouvée</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aucune offre d'emploi ne correspond à vos critères de recherche.
                </p>
              </div>
            ) : (
              jobListings.map((job) => (
                <motion.div
                  key={job.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={slideUp}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-md text-left flex flex-col"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 font-bold text-xl mr-4">
                      {job.entreprises?.name ? job.entreprises.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.entreprises?.name || 'Entreprise inconnue'}</p>
                    </div>
                    <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{job.type}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" /> {job.location}
                    <span className="mx-2">•</span>
                    <Clock className="w-4 h-4 mr-1" /> {new Date(job.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  <p className="text-gray-700 text-sm mb-2 line-clamp-2">{job.description}</p>
                  <Link to={`/jobs/${job.id}`} className="text-primary hover:underline text-sm font-medium mt-auto flex items-center gap-1">
                    Voir les détails <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))
            )}
          </div>
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
            {nearbyLocationsFromDB.map((locationItem) => (
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
                  src="/default-city.webp" // Placeholder image for dynamic locations
                  alt={locationItem.location}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
                  <h3 className="text-xl font-semibold mb-1">{locationItem.location}</h3>
                  <p className="text-sm text-gray-200">{locationItem.count} Offres</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center bg-yellow-50 rounded-lg p-6 shadow-md"
          >
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <Users2 className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">20K</h3>
            <p className="text-center text-gray-700">Employeurs satisfaits</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center bg-yellow-50 rounded-lg p-6 shadow-md"
          >
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">91K</h3>
            <p className="text-center text-gray-700">Postes ouverts</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center bg-yellow-50 rounded-lg p-6 shadow-md"
          >
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">1M</h3>
            <p className="text-center text-gray-700">Utilisateurs actifs quotidiens</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col items-center bg-yellow-50 rounded-lg p-6 shadow-md"
          >
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">100+</h3>
            <p className="text-center text-gray-700">Entreprises recruteuses</p>
          </motion.div>
        </div>
      </section>

      {/* Catégories Populaires Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5 }}
              className="text-3xl font-semibold text-foreground"
          >
              Parcourir les catégories de Job
          </motion.h2>
            <div className="flex space-x-4">
              <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
              <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><ChevronRight className="w-5 h-5 text-gray-700" /></button>
            </div>
          </div>
          <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hidden">
            {popularCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-64"
              >
                <Link to={`/stages?category=${encodeURIComponent(category.title)}`}>
                  <CategoryCard
                    title={category.title}
                    count={category.count}
                    icon={category.icon}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <Link
              to="/stages"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Voir toutes les catégories <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Candidates Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold text-foreground mb-2"
          >
            Candidats à la une
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground mb-12"
          >
            Découvrez les profils des stagiaires les plus prometteurs.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumCandidates.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
                <Users2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun candidat premium trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Il n'y a pas encore de candidats à la une.
                </p>
              </div>
            ) : (
              premiumCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={slideUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center"
                >
                  {candidate.avatar_url ? (
                    <img src={candidate.avatar_url} alt={candidate.name} className="w-20 h-20 rounded-full mb-4 object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 font-bold text-3xl mb-4">
                      {candidate.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{candidate.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{candidate.title || 'Non spécifié'}</p>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1" /> {candidate.location || 'Non spécifié'}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {candidate.skills && candidate.skills.length > 0 ? (
                      candidate.skills.slice(0, 3).map((tag) => (
                        <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{tag}</span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">Aucune compétence</span>
                    )}
                  </div>
                  <Link to={`/stagiaires/${candidate.id}`} className="text-primary hover:underline font-medium mt-auto">Voir le profil</Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Our Latest Blog Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
              transition={{ duration: 0.5 }}
              className="text-3xl font-semibold text-foreground"
            >
              Notre dernier blog
            </motion.h2>
            <div className="flex space-x-4">
              <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
              <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><ChevronRight className="w-5 h-5 text-gray-700" /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <motion.div
                key={post.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideUp}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row"
              >
                <img src={post.image} alt={post.title} className="w-full md:w-1/2 h-64 object-cover" />
                <div className="p-6 flex flex-col justify-between md:w-1/2">
                  <div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 inline-block">Conseils d'emploi</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-4">{post.description}</p>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <img src="https://randomuser.me/api/portraits/men/36.jpg" alt={post.author} className="w-8 h-8 rounded-full mr-2" />
                    <span>{post.author}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="w-4 h-4 mr-1" /> <span>{post.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
