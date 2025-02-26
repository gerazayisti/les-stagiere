
import Navigation from "@/components/Navigation";
import { Search, MapPin, Building2, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const OffresStages = () => {
  const stages = [
    {
      id: 1,
      titre: "Développeur Full-Stack",
      entreprise: "TechCorp",
      lieu: "Paris",
      duree: "6 mois",
      description: "Rejoignez notre équipe dynamique pour développer des applications web innovantes...",
      tags: ["React", "Node.js", "TypeScript"],
    },
    {
      id: 2,
      titre: "UI/UX Designer",
      entreprise: "DesignStudio",
      lieu: "Lyon",
      duree: "4 mois",
      description: "Participez à la conception d'interfaces utilisateur pour nos clients internationaux...",
      tags: ["Figma", "Adobe XD", "Prototype"],
    },
    {
      id: 3,
      titre: "Data Analyst",
      entreprise: "DataInsight",
      lieu: "Bordeaux",
      duree: "5 mois",
      description: "Analysez les données de nos clients pour en extraire des insights pertinents...",
      tags: ["Python", "SQL", "Tableau"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
        {/* Search Section */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Rechercher un stage..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-light border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray" />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Ville ou région"
                  className="w-full pl-10 pr-4 py-2 bg-gray-light border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray" />
              </div>
              <button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors">
                Rechercher
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="grid gap-6 animate-fade-in">
          {stages.map((stage) => (
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
                    {stage.titre}
                  </Link>
                  <div className="flex items-center gap-4 mt-2 text-gray">
                    <span className="flex items-center gap-1">
                      <Building2 size={16} />
                      {stage.entreprise}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={16} />
                      {stage.lieu}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {stage.duree}
                    </span>
                  </div>
                  <p className="mt-2 text-gray">{stage.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {stage.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-light text-gray rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <Link
                    to={`/stages/${stage.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Voir l'offre
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffresStages;
