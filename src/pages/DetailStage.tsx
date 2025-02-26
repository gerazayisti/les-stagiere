
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { MapPin, Building2, Calendar, ArrowLeft, Mail, Phone, Globe } from "lucide-react";

const DetailStage = () => {
  const { id } = useParams();

  // Exemple de données (à remplacer par des données réelles)
  const stage = {
    id: 1,
    titre: "Développeur Full-Stack",
    entreprise: "TechCorp",
    lieu: "Paris",
    duree: "6 mois",
    description: "Nous recherchons un(e) développeur(se) full-stack passionné(e) pour rejoindre notre équipe dynamique...",
    missions: [
      "Développement de nouvelles fonctionnalités",
      "Maintenance et amélioration des applications existantes",
      "Participation aux réunions d'équipe et aux sessions de code review",
      "Rédaction de documentation technique",
    ],
    profil: [
      "En cours de formation Bac+4/5 en informatique",
      "Connaissance des technologies web modernes",
      "Autonomie et esprit d'équipe",
      "Curiosité et envie d'apprendre",
    ],
    tags: ["React", "Node.js", "TypeScript"],
    entrepriseInfo: {
      nom: "TechCorp",
      description: "TechCorp est une entreprise innovante spécialisée dans le développement de solutions web...",
      site: "https://techcorp.fr",
      email: "stages@techcorp.fr",
      telephone: "01 23 45 67 89",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
        <Link to="/stages" className="inline-flex items-center text-gray hover:text-primary mb-8">
          <ArrowLeft size={20} className="mr-2" />
          Retour aux offres
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in">
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
                {stage.titre}
              </h1>
              <div className="flex flex-wrap gap-4 text-gray">
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
              <div className="flex flex-wrap gap-2 mt-4">
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

            {/* Description */}
            <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Description du stage</h2>
              <p className="text-gray mb-6">{stage.description}</p>

              <h3 className="font-semibold mb-2">Missions principales :</h3>
              <ul className="list-disc list-inside space-y-2 text-gray mb-6">
                {stage.missions.map((mission, index) => (
                  <li key={index}>{mission}</li>
                ))}
              </ul>

              <h3 className="font-semibold mb-2">Profil recherché :</h3>
              <ul className="list-disc list-inside space-y-2 text-gray">
                {stage.profil.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Company Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">L'entreprise</h2>
              <p className="text-gray mb-6">{stage.entrepriseInfo.description}</p>
              <div className="space-y-3">
                <a
                  href={stage.entrepriseInfo.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray hover:text-primary transition-colors"
                >
                  <Globe size={16} />
                  Site web
                </a>
                <a
                  href={`mailto:${stage.entrepriseInfo.email}`}
                  className="flex items-center gap-2 text-gray hover:text-primary transition-colors"
                >
                  <Mail size={16} />
                  {stage.entrepriseInfo.email}
                </a>
                <a
                  href={`tel:${stage.entrepriseInfo.telephone}`}
                  className="flex items-center gap-2 text-gray hover:text-primary transition-colors"
                >
                  <Phone size={16} />
                  {stage.entrepriseInfo.telephone}
                </a>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors animate-fade-in">
              Postuler à cette offre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailStage;
