import Navigation from "@/components/Navigation";
import { ArrowRight, Users2, Building2, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const stats = [
    { icon: Users2, label: "Stagiaires inscrits", value: "10,000+" },
    { icon: Building2, label: "Entreprises partenaires", value: "500+" },
    { icon: TrendingUp, label: "Taux de recrutement", value: "85%" },
  ];

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-display font-bold text-navy mb-6"
          >
            Trouvez le stage parfait pour votre avenir
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-secondary-light max-w-2xl mx-auto mb-8"
          >
            La plateforme qui connecte les étudiants talentueux aux meilleures opportunités de stages.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              to="/stages"
              className="px-8 py-3 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors flex items-center justify-center gap-2"
            >
              Je cherche un stage
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/entreprises"
              className="px-8 py-3 bg-white text-navy border-2 border-navy rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              Je recrute un stagiaire
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <stat.icon className="w-12 h-12 text-navy mb-4" />
                <h3 className="text-lg font-semibold text-navy-dark">{stat.value}</h3>
                <p className="text-secondary">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Offers Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            Dernières offres de stages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder cards for latest offers */}
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white p-6 rounded-lg border border-gray-100 hover:border-navy transition-colors"
              >
                <div className="text-sm text-navy mb-2">Stage - 6 mois</div>
                <h3 className="text-xl font-semibold mb-2">Développeur Full-Stack</h3>
                <p className="text-gray mb-4">Une opportunité unique de rejoindre une équipe dynamique...</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray">Paris, France</span>
                  <Link
                    to="/stages"
                    className="text-navy hover:text-navy-dark transition-colors flex items-center gap-1"
                  >
                    Voir plus
                    <ArrowRight size={16} />
                  </Link>
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
