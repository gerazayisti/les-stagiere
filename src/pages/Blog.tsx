import { Article } from "@/components/Article";

const articles = [
  {
    title: "Les opportunités de stage au Cameroun : Un guide complet",
    description:
      "Découvrez les meilleures opportunités de stage au Cameroun, les secteurs porteurs, et comment postuler efficacement. Un aperçu complet du marché des stages dans l'un des pays les plus dynamiques d'Afrique centrale.",
    image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    author: "Dr. Samuel Eto'o",
    date: "26 Février 2025",
    readTime: "8 min",
    slug: "stages-cameroun-guide",
    tags: ["Cameroun", "Stages", "Emploi", "Afrique Centrale"],
  },
  {
    title: "L'avenir des stages en Afrique : Tendances et perspectives",
    description:
      "Une analyse approfondie des tendances actuelles et futures du marché des stages en Afrique. Comment la digitalisation et les nouvelles technologies transforment le paysage des stages sur le continent.",
    image: "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    author: "Prof. Acha Leke",
    date: "25 Février 2025",
    readTime: "10 min",
    slug: "avenir-stages-afrique",
    tags: ["Afrique", "Innovation", "Technologie", "Futur du travail"],
  },
];

export default function Blog() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
          Notre Blog
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Découvrez nos derniers articles sur les stages, l'emploi et le développement professionnel en Afrique.
        </p>
      </section>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article) => (
          <Article key={article.slug} {...article} />
        ))}
      </div>

      {/* Newsletter Section */}
      <section className="mt-24 text-center bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-12">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Restez informé
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Abonnez-vous à notre newsletter pour recevoir les derniers articles et opportunités de stage.
        </p>
        <form className="flex gap-4 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Votre email"
            className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            S'abonner
          </button>
        </form>
      </section>
    </div>
  );
}
