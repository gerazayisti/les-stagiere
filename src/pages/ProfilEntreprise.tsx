
import Navigation from "@/components/Navigation";
import { Building2, MapPin, Users, Globe, Mail, Phone } from "lucide-react";

const ProfilEntreprise = () => {
  const entreprise = {
    nom: "TechCorp",
    logo: "https://via.placeholder.com/150",
    description: "TechCorp est une entreprise innovante spécialisée dans le développement de solutions web...",
    secteur: "Technologies de l'information",
    taille: "50-200 employés",
    localisation: "Paris, France",
    site: "https://techcorp.fr",
    email: "contact@techcorp.fr",
    telephone: "01 23 45 67 89",
    stagesActifs: [
      {
        id: 1,
        titre: "Développeur Full-Stack",
        duree: "6 mois",
        date: "Début : Mars 2024",
      },
      {
        id: 2,
        titre: "UX Designer",
        duree: "4 mois",
        date: "Début : Avril 2024",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Company Header */}
            <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in">
              <div className="flex items-center gap-6">
                <img
                  src={entreprise.logo}
                  alt={entreprise.nom}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div>
                  <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    {entreprise.nom}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-gray">
                    <span className="flex items-center gap-1">
                      <Building2 size={16} />
                      {entreprise.secteur}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={16} />
                      {entreprise.localisation}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      {entreprise.taille}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Description */}
            <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">À propos de l'entreprise</h2>
              <p className="text-gray">{entreprise.description}</p>
            </div>

            {/* Active Internships */}
            <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Stages actifs</h2>
              <div className="space-y-4">
                {entreprise.stagesActifs.map((stage) => (
                  <div
                    key={stage.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                  >
                    <h3 className="font-semibold">{stage.titre}</h3>
                    <div className="flex gap-4 mt-2 text-gray text-sm">
                      <span>{stage.duree}</span>
                      <span>{stage.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <div className="space-y-3">
                <a
                  href={entreprise.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray hover:text-primary transition-colors"
                >
                  <Globe size={16} />
                  Site web
                </a>
                <a
                  href={`mailto:${entreprise.email}`}
                  className="flex items-center gap-2 text-gray hover:text-primary transition-colors"
                >
                  <Mail size={16} />
                  {entreprise.email}
                </a>
                <a
                  href={`tel:${entreprise.telephone}`}
                  className="flex items-center gap-2 text-gray hover:text-primary transition-colors"
                >
                  <Phone size={16} />
                  {entreprise.telephone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilEntreprise;
