import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { MapPin, Building2, Calendar, ArrowLeft, Mail, Phone, Globe, Clock, Briefcase, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import CandidatureModal from "@/components/CandidatureModal";
import FormattedText from "@/components/FormattedText";
import { useSessionTimeout } from "@/contexts/SessionTimeoutContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const DetailStage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [showCandidatureModal, setShowCandidatureModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { resetTimer } = useSessionTimeout();
  
  // Reset session timeout on component mount and user interaction
  useEffect(() => {
    resetTimer();
    setLoading(false); // Simuler un chargement (à remplacer par un vrai appel API)
    
    // Réinitialiser le timer d'inactivité lors des interactions utilisateur
    const handleUserActivity = () => resetTimer();
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    
    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [resetTimer]);

  // Exemple de données (à remplacer par des données réelles)
  const stage = {
    id: 1,
    titre: "Développeur Full-Stack",
    entreprise: "TechCorp",
    lieu: "Paris",
    duree: "6 mois",
    date_debut: "2025-09-01",
    remuneration: "1000€ / mois",
    modalite: "Hybride (3j présentiel, 2j télétravail)",
    description: `Nous recherchons un(e) développeur(se) full-stack passionné(e) pour rejoindre notre équipe dynamique et participer au développement de notre plateforme SaaS en pleine croissance.

Vous serez intégré(e) à notre équipe produit et travaillerez en étroite collaboration avec nos designers, développeurs et product managers dans un environnement agile.

Ce stage vous permettra de développer vos compétences techniques dans un contexte réel et challengeant, avec un accompagnement personnalisé par des développeurs expérimentés.

Notre stack technique principale: React, TypeScript, Node.js, PostgreSQL, et AWS.`,
    missions: [
      "Développement de nouvelles fonctionnalités front-end et back-end",
      "Maintenance et amélioration des applications existantes",
      "Participation aux réunions d'équipe et aux sessions de code review",
      "Rédaction de documentation technique",
      "Participation à la conception et à l'architecture des nouvelles fonctionnalités",
      "Tests et débogage des applications"
    ],
    profil: [
      "En cours de formation Bac+4/5 en informatique ou école d'ingénieur",
      "Première expérience en développement web (stage, projet personnel, contribution open source)",
      "Connaissance des technologies web modernes (JavaScript, HTML, CSS)",
      "Intérêt pour React et Node.js",
      "Autonomie et esprit d'équipe",
      "Curiosité et envie d'apprendre",
      "Bon niveau d'anglais technique"
    ],
    competences_techniques: [
      "JavaScript/TypeScript",
      "React",
      "Node.js",
      "Git",
      "SQL (PostgreSQL idéalement)"
    ],
    competences_appreciees: [
      "Expérience avec les API RESTful",
      "Connaissance de Docker",
      "Expérience avec les services AWS",
      "Tests automatisés (Jest, Cypress)"
    ],
    tags: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
    entrepriseInfo: {
      nom: "TechCorp",
      description: `TechCorp est une entreprise innovante spécialisée dans le développement de solutions web et mobile pour les professionnels.

Fondée en 2018, notre startup compte aujourd'hui 35 collaborateurs passionnés et continue sa croissance rapide.

Notre mission est de simplifier le quotidien des entreprises grâce à des outils digitaux performants et intuitifs.

Nous proposons un environnement de travail stimulant, avec des locaux modernes en plein cœur de Paris, et une culture d'entreprise basée sur l'innovation, la collaboration et le bien-être au travail.`,
      site: "https://techcorp.fr",
      email: "stages@techcorp.fr",
      telephone: "01 23 45 67 89",
      taille: "35 employés",
      secteur: "SaaS / Tech"
    },
  };

  const handlePostuler = () => {
    resetTimer(); // Réinitialiser le timer d'inactivité lors de l'action de postuler
    setShowCandidatureModal(true);
  };

  const handleCandidatureClose = () => {
    setShowCandidatureModal(false);
    toast({
      title: "Candidature envoyée !",
      description: "Nous vous recontacterons dès que possible.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
        <Link 
          to="/stages" 
          className="inline-flex items-center text-gray hover:text-primary mb-8"
          onClick={() => resetTimer()}
        >
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
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-xl font-semibold">Description du stage</h2>
                    <Badge className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {stage.modalite}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} className="text-gray-400" />
                      <span>Début: {stage.date_debut}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} className="text-gray-400" />
                      <span>Durée: {stage.duree}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} className="text-gray-400" />
                      <span>Lieu: {stage.lieu}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/>
                        <line x1="2" y1="20" x2="2" y2="20"/>
                      </svg>
                      <span>Rémunération: {stage.remuneration}</span>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <FormattedText text={stage.description} highlightKeywords={true} />
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Briefcase size={18} className="text-primary" />
                      Missions principales
                    </h3>
                    <ul className="list-disc list-outside ml-5 space-y-2 text-gray-700">
                      {stage.missions.map((mission, index) => (
                        <li key={index}>{mission}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap size={18} className="text-primary" />
                      Profil recherché
                    </h3>
                    <ul className="list-disc list-outside ml-5 space-y-2 text-gray-700">
                      {stage.profil.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {stage.competences_techniques && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-3">Compétences techniques</h3>
                      <div className="flex flex-wrap gap-2">
                        {stage.competences_techniques.map((comp, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {stage.competences_appreciees && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Compétences appréciées</h3>
                      <div className="flex flex-wrap gap-2">
                        {stage.competences_appreciees.map((comp, index) => (
                          <Badge key={index} variant="outline" className="border-dashed">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Company Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm animate-fade-in">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 size={22} className="text-primary" />
                    <h2 className="text-xl font-semibold">{stage.entrepriseInfo.nom}</h2>
                  </div>
                  
                  {stage.entrepriseInfo.secteur && stage.entrepriseInfo.taille && (
                    <div className="flex gap-3 mb-4">
                      <Badge variant="outline" className="bg-gray-50">
                        {stage.entrepriseInfo.secteur}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50">
                        {stage.entrepriseInfo.taille}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <FormattedText text={stage.entrepriseInfo.description} highlightKeywords={false} />
                  </div>
                  
                  <div className="space-y-3">
                    <a
                      href={stage.entrepriseInfo.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray hover:text-primary transition-colors"
                      onClick={() => resetTimer()}
                    >
                      <Globe size={16} />
                      Site web
                    </a>
                    <a
                      href={`mailto:${stage.entrepriseInfo.email}`}
                      className="flex items-center gap-2 text-gray hover:text-primary transition-colors"
                      onClick={() => resetTimer()}
                    >
                      <Mail size={16} />
                      {stage.entrepriseInfo.email}
                    </a>
                    <a
                      href={`tel:${stage.entrepriseInfo.telephone}`}
                      className="flex items-center gap-2 text-gray hover:text-primary transition-colors"
                      onClick={() => resetTimer()}
                    >
                      <Phone size={16} />
                      {stage.entrepriseInfo.telephone}
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={handlePostuler}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors animate-fade-in shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement...
                </span>
              ) : (
                "Postuler à cette offre"
              )}
            </button>
          </div>
        </div>
      </div>

      <CandidatureModal
        isOpen={showCandidatureModal}
        onClose={() => {
          handleCandidatureClose();
          resetTimer(); // Réinitialiser le timer d'inactivité lors de la fermeture du modal
        }}
        stageId={Number(id)}
        stageTitre={stage.titre}
      />
    </div>
  );
};

export default DetailStage;
