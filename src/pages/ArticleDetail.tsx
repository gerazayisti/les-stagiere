import { useParams } from "react-router-dom";
import { CalendarDays, Clock, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simulated articles database
const articlesData = {
  "stages-cameroun-guide": {
    title: "Les opportunités de stage au Cameroun : Un guide complet",
    description:
      "Découvrez les meilleures opportunités de stage au Cameroun, les secteurs porteurs, et comment postuler efficacement.",
    image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    author: "Dr. Samuel Eto'o",
    date: "26 Février 2025",
    readTime: "8 min",
    tags: ["Cameroun", "Stages", "Emploi", "Afrique Centrale"],
    content: `
      <h2>Introduction</h2>
      <p>Le Cameroun, souvent appelé "l'Afrique en miniature", offre une diversité d'opportunités de stage incomparable. Ce guide complet vous aidera à naviguer dans le paysage des stages au Cameroun, des secteurs les plus prometteurs aux conseils pratiques pour décrocher le stage de vos rêves.</p>

      <h2>Les secteurs porteurs</h2>
      <p>Le marché des stages au Cameroun est particulièrement dynamique dans plusieurs secteurs :</p>
      <ul>
        <li>Technologies de l'information</li>
        <li>Télécommunications</li>
        <li>Énergie renouvelable</li>
        <li>Agro-industrie</li>
        <li>Finance et banque</li>
      </ul>

      <h2>Comment postuler efficacement</h2>
      <p>Pour maximiser vos chances de décrocher un stage au Cameroun, voici quelques conseils essentiels :</p>
      <ol>
        <li>Préparez un CV adapté au marché local</li>
        <li>Utilisez les réseaux professionnels locaux</li>
        <li>Maîtrisez les langues officielles (français et anglais)</li>
        <li>Développez votre réseau professionnel</li>
      </ol>

      <h2>Les défis et opportunités</h2>
      <p>Bien que le marché des stages au Cameroun présente certains défis, il offre également des opportunités uniques pour développer ses compétences et construire une carrière solide en Afrique.</p>

      <h2>Conclusion</h2>
      <p>Le Cameroun offre un environnement propice pour les stages, avec des opportunités diverses et enrichissantes. Avec la bonne préparation et une compréhension approfondie du marché local, vous pourrez tirer le meilleur parti de votre expérience de stage au Cameroun.</p>
    `,
  },
  "avenir-stages-afrique": {
    title: "L'avenir des stages en Afrique : Tendances et perspectives",
    description:
      "Une analyse approfondie des tendances actuelles et futures du marché des stages en Afrique.",
    image: "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    author: "Prof. Acha Leke",
    date: "25 Février 2025",
    readTime: "10 min",
    tags: ["Afrique", "Innovation", "Technologie", "Futur du travail"],
    content: `
      <h2>Introduction</h2>
      <p>L'Afrique est en pleine transformation numérique, et le marché des stages évolue rapidement pour répondre aux nouveaux besoins des entreprises et des stagiaires.</p>

      <h2>La révolution numérique</h2>
      <p>La digitalisation transforme profondément le paysage des stages en Afrique :</p>
      <ul>
        <li>Stages à distance et hybrides</li>
        <li>Nouvelles compétences recherchées</li>
        <li>Plateformes de recrutement innovantes</li>
        <li>Formation continue en ligne</li>
      </ul>

      <h2>Les secteurs émergents</h2>
      <p>Plusieurs secteurs sont en pleine croissance et offrent des opportunités prometteuses :</p>
      <ol>
        <li>Intelligence artificielle et données</li>
        <li>Énergies renouvelables</li>
        <li>E-commerce et fintech</li>
        <li>Santé numérique</li>
      </ol>

      <h2>Les défis à relever</h2>
      <p>Malgré les progrès, certains défis persistent :</p>
      <ul>
        <li>Accès à internet</li>
        <li>Formation technique</li>
        <li>Reconnaissance des compétences</li>
      </ul>

      <h2>Conclusion</h2>
      <p>L'avenir des stages en Afrique est prometteur, porté par l'innovation technologique et l'entrepreneuriat. Les opportunités se multiplient pour les jeunes talents africains.</p>
    `,
  },
};

export default function ArticleDetail() {
  const { slug } = useParams();
  const article = articlesData[slug as keyof typeof articlesData];

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Article non trouvé</h1>
        <p className="text-muted-foreground">
          Désolé, l'article que vous recherchez n'existe pas.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Article Header */}
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 flex-wrap mb-4">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">{article.title}</h1>
        <p className="text-xl text-muted-foreground mb-8">{article.description}</p>
        
        {/* Article Meta */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
          <div className="flex items-center gap-2">
            <User size={18} />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={18} />
            <span>{article.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={18} />
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>

      {/* Article Image */}
      <div className="max-w-4xl mx-auto mb-12 rounded-xl overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-[400px] object-cover"
        />
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto">
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">Partager cet article</h3>
          <div className="flex gap-4">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
