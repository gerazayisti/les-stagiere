import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users2, Building2, TrendingUp, Briefcase, Search, UserPlus } from "lucide-react";
import { TargetAudience } from "@/components/TargetAudience";
import { ServiceCard } from "@/components/ServiceCard";
import CategoryCard from "@/components/CategoryCard";

// Animations
const slideUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const Index = () => {
  // Données pour la section "Catégories populaires"
  const popularCategories = [
    { title: "Développement Web", icon: "code", count: 0 },
    { title: "Marketing Digital", icon: "briefcase", count: 0 },
    { title: "Design & UX/UI", icon: "art", count: 0 },
    { title: "Finance & Comptabilité", icon: "finance", count: 0 },
    { title: "Ressources Humaines", icon: "building", count: 0 },
    { title: "Gestion de Projet", icon: "briefcase", count: 0 },
  ];

  // Données pour les services proposés
  const services = [
    {
      key: "search",
      icon: Search,
      title: "Recherche simplifiée",
      description: "Trouvez rapidement des stages correspondant à vos critères grâce à notre système de recherche avancée.",
      delay: 0.2,
    },
    {
      key: "profile",
      icon: UserPlus,
      title: "Profil personnalisé",
      description: "Créez un profil qui vous représente et mettez en avant vos compétences et expériences.",
      delay: 0.4,
    },
    {
      key: "matching",
      icon: TrendingUp,
      title: "Matching intelligent",
      description: "Notre algorithme vous propose des offres pertinentes en fonction de votre profil et de vos préférences.",
      delay: 0.6,
    },
  ];

  // Données pour les secteurs d'activité
  const sectors = [
    { title: "Technology", vacancies: 0 },
    { title: "Healthcare", vacancies: 0 },
    { title: "Finance", vacancies: 0 },
    { title: "Education", vacancies: 0 },
    { title: "Retail", vacancies: 0 },
    { title: "Marketing", vacancies: 0 },
    { title: "Hospitality", vacancies: 0 },
    { title: "Engineering", vacancies: 0 },
    { title: "Media & Entertainment", vacancies: 0 },
    { title: "Mining & Natural Resources", vacancies: 0 },
    { title: "Energy & Renewable", vacancies: 0 },
  ];
  
  // Données pour le composant TargetAudience
  const studentItems = [
    "Étudiants en recherche de stage pratique",
    "Jeunes diplômés en quête de leur première expérience professionnelle",
    "Professionnels en reconversion cherchant de nouvelles opportunités",
    "Personnes souhaitant développer de nouvelles compétences dans un environnement professionnel"
  ];
  
  const companyItems = [
    "Entreprises à la recherche de talents motivés et compétents",
    "Startups ayant besoin de renforcer leurs équipes avec des profils juniors",
    "Grandes entreprises proposant des programmes de stages structurés",
    "Organisations souhaitant contribuer à la formation de la future génération professionnelle"
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-primary/80 to-primary">
        <div className="absolute inset-0 bg-[url('/hero1.webp')] bg-cover bg-center opacity-30"></div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white max-w-2xl"
          >
            Trouvez le stage parfait pour votre avenir professionnel
          </motion.h1>
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-xl text-white max-w-2xl"
          >
            Connectez-vous avec les meilleures entreprises et démarrez votre carrière dès aujourd'hui.
          </motion.p>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex gap-4"
          >
            <Link to="/stages" className="bg-white text-primary px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Parcourir les stages
            </Link>
            <Link to="/inscription" className="bg-primary-dark text-white px-8 py-3 rounded-md font-medium hover:bg-primary-darker transition-colors border border-white">
              S'inscrire
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">+ 500</h3>
            <p className="text-center text-muted-foreground">Stages disponibles</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">+ 200</h3>
            <p className="text-center text-muted-foreground">Entreprises partenaires</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">+ 1000</h3>
            <p className="text-center text-muted-foreground">Stagiaires placés</p>
          </motion.div>
        </div>
      </section>

      {/* Public Cible Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-foreground mb-8 text-center"
          >
            À qui s'adresse notre plateforme ?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TargetAudience 
              title="Pour les étudiants et chercheurs d'emploi" 
              items={studentItems} 
            />
            <TargetAudience 
              title="Pour les entreprises et recruteurs" 
              items={companyItems} 
            />
          </div>
        </div>
      </section>
      
      {/* Services Proposés Section */}
      <section className="py-16 bg-muted px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold text-foreground mb-8 text-center"
          >
            Nos services
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <motion.div
                key={service.key}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideUp}
                transition={{ duration: 0.5, delay: service.delay }}
              >
                <ServiceCard
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Catégories Populaires Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold text-foreground mb-8 text-center"
          >
            Catégories populaires
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {popularCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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

      {/* Call-to-Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold"
          >
            Prêt à commencer votre aventure professionnelle ?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl max-w-2xl mx-auto"
          >
            Inscrivez-vous dès aujourd'hui et accédez à des centaines d'offres de
            stage dans tous les domaines.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              to="/inscription"
              className="inline-block bg-white text-primary px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Créer un compte gratuitement
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
