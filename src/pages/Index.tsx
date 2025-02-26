
import Navigation from "@/components/Navigation";
import { ArrowRight, Users, Building2, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const stats = [
    { icon: Users, label: "Stagiaires inscrits", value: "10,000+" },
    { icon: Building2, label: "Entreprises partenaires", value: "500+" },
    { icon: TrendingUp, label: "Taux de recrutement", value: "85%" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-6 animate-fade-in">
            Trouvez le stage parfait pour votre avenir
          </h1>
          <p className="text-xl text-gray max-w-2xl mx-auto mb-8 animate-slide-up">
            La plateforme qui connecte les étudiants talentueux aux meilleures opportunités de stages.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
            <Link
              to="/stages"
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              Je cherche un stage
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/entreprises"
              className="px-8 py-3 bg-white text-primary border-2 border-primary rounded-lg hover:bg-gray-light transition-colors flex items-center justify-center gap-2"
            >
              Je recrute un stagiaire
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className="w-12 h-12 text-primary mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray">{stat.label}</div>
              </div>
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
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-100 hover:border-primary transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-sm text-primary mb-2">Stage - 6 mois</div>
                <h3 className="text-xl font-semibold mb-2">Développeur Full-Stack</h3>
                <p className="text-gray mb-4">Une opportunité unique de rejoindre une équipe dynamique...</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray">Paris, France</span>
                  <Link
                    to="/stages"
                    className="text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                  >
                    Voir plus
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
