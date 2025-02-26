import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Navigation } from "../components/Navigation";
import { ServiceCard } from "../components/ServiceCard";
import { CategoryCard } from "../components/CategoryCard";
import { TargetAudience } from "../components/TargetAudience";
import { Pricing } from "../components/Pricing";
import Footer from "@/components/Footer";

const Index = () => {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const stats = [
    { icon: Users2, label: "Stagiaires inscrits", value: "10,000+" },
    { icon: Building2, label: "Entreprises partenaires", value: "500+" },
    { icon: TrendingUp, label: "Taux de recrutement", value: "85%" },
  ];

  const services = [
    {
      title: "Offres de Stage",
      description: "Publiez une offre d'emploi. Faites-le savoir en publiant votre offre d'emploi sur notre plateforme. Trouvez le profil dont vous avez besoin parmi nos nombreux visiteurs.",
      icon: Briefcase,
    },
    {
      title: "Recrutement",
      description: "Vous cherchez le candidat parfait ? Publiez votre offre d'emploi sur notre plateforme et accédez à un bassin de talents qualifiés.",
      icon: Search,
    },
    {
      title: "Hire the Best One",
      description: "Vous cherchez le meilleur talent pour votre entreprise ? Publiez votre offre d'emploi sur notre site et accédez aux candidats les plus qualifiés.",
      icon: UserPlus,
    },
  ];

  const categories = [
    { title: "Engineering", vacancies: 0 },
    { title: "Construction", vacancies: 0 },
    { title: "Sales", vacancies: 0 },
    { title: "Banking & Finance", vacancies: 0 },
    { title: "Manufacturing & Industrialization", vacancies: 0 },
    { title: "Telecommunications", vacancies: 0 },
    { title: "Education & Training", vacancies: 0 },
    { title: "Health, Safety & Environment", vacancies: 0 },
    { title: "Hospitality & Tourism", vacancies: 0 },
    { title: "Agriculture & Agribusiness", vacancies: 0 },
    { title: "Mining & Natural Resources", vacancies: 0 },
    { title: "Energy & Renewable", vacancies: 0 },
  ];

  const pricing = [
    {
      title: "Pack Standard - Gratuit",
      price: "Gratuit",
      features: ["Accès aux offres d'emploi"],
      type: "stagiaire"
    },
    {
      title: "Pack Premium - 10 000 FCFA",
      price: "10 000 FCFA",
      features: [
        "Mise en avant du profil",
        "Accès aux offres exclusives",
        "Notifications en temps réel",
        "Optimisation du CV",
        "Statistiques de visibilité",
        "Accès aux ressources et conseils"
      ],
      isPopular: true,
      type: "stagiaire"
    },
    {
      title: "Abonnement Annuel Entreprise",
      price: "50 000 FCFA",
      features: [
        "Accès illimité aux profils",
        "Visibilité accrue",
        "Alertes personnalisées",
        "Support prioritaire"
      ],
      type: "entreprise"
    },
    {
      title: "Paiement à la Demande",
      price: "Sur devis",
      features: [
        "Recrutement de stagiaires occasionnels",
        "Stages de vacances ou professionnels",
        "Campagnes marketing",
        "Campagnes publicitaires",
        "Sondages d'entreprise"
      ],
      type: "entreprise"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 z-0">
          <img src="/hero1.webp" alt="Hero Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-display font-bold text-white mb-6"
          >
            Trouvez le stage parfait pour votre avenir
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-200 max-w-2xl mx-auto mb-8"
          >
            La plateforme qui connecte les étudiants talentueux aux meilleures opportunités de stages.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            <Link
              to="/stages"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-colors font-semibold"
            >
              Je cherche un stage
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/inscription"
              className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-secondary bg-transparent hover:bg-secondary/10 text-secondary-foreground transition-colors font-semibold"
            >
              Je recrute un stagiaire
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Notre Objectif Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-foreground mb-8"
          >
            Notre Objectif
          </motion.h2>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-8"
          >
            Bienvenue sur notre plateforme de recherche d'emploi et de stage dans votre région. Nous nous engageons à vous aider à trouver l'opportunité de carrière idéale en un rien de temps.
          </motion.p>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-muted-foreground"
          >
            On vous propose une vaste sélection d'offres d'emploi et de stage. Parcourez des milliers d'opportunités dans différents secteurs et localités. Grâce à une recherche personnalisée, trouvez des offres correspondant à vos critères spécifiques.
          </motion.p>
        </div>
      </section>

      {/* Public Cible Section */}
      <section className="py-16 bg-muted px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-foreground mb-8 text-center"
          >
            Notre Public Cible
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 rounded-lg bg-background border border-border"
            >
              <h3 className="text-xl font-semibold mb-4">Entreprises</h3>
              <p className="text-muted-foreground">
                Des startups aux grandes entreprises, nous accompagnons tous types d'organisations dans leur recherche de talents.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="p-6 rounded-lg bg-background border border-border"
            >
              <h3 className="text-xl font-semibold mb-4">Institutions Étatiques</h3>
              <p className="text-muted-foreground">
                Mairies, ministères et autres institutions gouvernementales peuvent trouver les stagiaires qualifiés dont ils ont besoin.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="p-6 rounded-lg bg-background border border-border"
            >
              <h3 className="text-xl font-semibold mb-4">Organismes Internationaux</h3>
              <p className="text-muted-foreground">
                ONGs et organisations internationales peuvent recruter des stagiaires locaux pour leurs projets.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <TargetAudience />
      
      {/* Services Proposés Section */}
      <section className="py-16 bg-muted px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-foreground mb-8 text-center"
          >
            Services Proposés
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={service.title}
                title={service.title}
                description={service.description}
                icon={service.icon}
                delay={0.2 * index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stages par Catégorie Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-foreground mb-8 text-center"
          >
            Stages par Catégorie
          </motion.h2>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-8 text-center"
          >
            A better career is out there. We'll help you find it. We're your first step to becoming everything you want to be.
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <CategoryCard key={category.title} title={category.title} vacancies={category.vacancies} delay={0.1 * index} />
            ))}
          </div>
        </div>
      </section>

      {/* Les Services Que Nous Proposons Section */}
      <section className="py-16 bg-muted px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-foreground mb-8 text-center"
          >
            Les Services Que Nous Proposons
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-4 rounded-lg border border-border bg-background hover:border-primary transition-colors"
            >
              Offre de stage
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="p-4 rounded-lg border border-border bg-background hover:border-primary transition-colors"
            >
              Insertion professionnelle
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="p-4 rounded-lg border border-border bg-background hover:border-primary transition-colors"
            >
              Placement du personnel
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="p-4 rounded-lg border border-border bg-background hover:border-primary transition-colors"
            >
              Répétition à domicile
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ duration: 0.6, delay: 1 }}
              className="p-4 rounded-lg border border-border bg-background hover:border-primary transition-colors"
            >
              Campagne publicitaire
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="p-4 rounded-lg border border-border bg-background hover:border-primary transition-colors"
            >
              Marketing
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="p-4 rounded-lg border border-border bg-background hover:border-primary transition-colors"
            >
              Bodyguard
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="p-4 rounded-lg border border-border bg-background hover:border-primary transition-colors"
            >
              Événementiel
            </motion.div>
          </div>
        </div>
      </section>

      <Pricing />

      {/* Job Search Section */}
      <section className="py-16 bg-muted px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-foreground mb-8"
          >
            Job Search
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <motion.h3
                initial="hidden"
                animate="visible"
                variants={slideUp}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl font-semibold text-foreground mb-4"
              >
                Pour les chercheurs d'emploi
              </motion.h3>
              <motion.p
                initial="hidden"
                animate="visible"
                variants={slideUp}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-muted-foreground mb-4"
              >
                Vous cherchez un emploi qui vous correspond ? Quelle que soit votre formation ou votre expérience, notre plateforme d'emploi vous permettra de trouver l'opportunité qui vous convient.
              </motion.p>
              <Link
                to="/inscription"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-colors font-semibold"
              >
                S'inscrire en tant qu'étudiant
              </Link>
            </div>
            <div>
              <motion.h3
                initial="hidden"
                animate="visible"
                variants={slideUp}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-2xl font-semibold text-foreground mb-4"
              >
                Pour les recruteurs
              </motion.h3>
              <motion.p
                initial="hidden"
                animate="visible"
                variants={slideUp}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-lg text-muted-foreground mb-4"
              >
                Vous recherchez les meilleurs talents pour votre entreprise ? Inscrivez-vous dès maintenant sur notre plateforme dédiée au recrutement. Que vous soyez une startup, une PME ou une grande entreprise, vous trouverez ici les profils qualifiés dont vous avez besoin.
              </motion.p>
              <Link
                to="/inscription"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-colors font-semibold"
              >
                S'inscrire en tant que recruteur
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-foreground mb-8"
          >
            Blog : Nos Articles à la Une
          </motion.h2>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Plongez dans l'univers captivant de nos articles exclusifs. Élargissez vos horizons avec nos articles vibrants et pertinents.
          </motion.p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
